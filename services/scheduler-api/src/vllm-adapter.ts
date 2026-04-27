// services/scheduler-api/src/vllm-adapter.ts
//
// Wires @lumeos/vllm-client into DispatcherDeps.callModel.
//
// Nodes:
//   spark-b  (coding worker)    — generateWithVerification(), triple_hash check
//   spark-a  (review/governance) — plain client.chat(), no overhead
//   qwen3.6  (orchestrator)     — fetch() mit chat_template_kwargs.enable_thinking=false
//
// Wichtig: Qwen3.6 MUSS enable_thinking=false bei jedem Request erhalten,
//           sonst denkt das Modell sichtbar und verbraucht massiv Tokens.

import {
  createSparkAClient,
  createSparkBClient,
  generateWithVerification,
} from '@lumeos/vllm-client'
import { NODE_PROFILES } from '@lumeos/agent-core'
import type { NodeId } from './routing'

interface ModelRoutingEntry {
  node: string
  model: string
  temperature: number
  max_context: number
  port?: number
}

// ─── Qwen3.6 Orchestrator callModel ───────────────────────────────────────────
// Verwendet fetch() direkt damit chat_template_kwargs korrekt übergeben wird.
// vllm-client unterstützt dieses Feld nicht nativ.

async function callQwen36Orchestrator(
  endpoint: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 800,
): Promise<string> {
  const response = await fetch(`${endpoint}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      // Pflicht: Verhindert sichtbares Chain-of-Thought im Output.
      // /no_think funktioniert nicht in diesem Setup.
      chat_template_kwargs: { enable_thinking: false },
      temperature: 0.0,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    throw new Error(`Qwen3.6 API Error: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as any
  const content = json.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw new Error('QWEN_EMPTY_CONTENT')
  }

  // reasoning-Feld ignorieren — nur content ist Quelle
  return content
}

// ─── Haupt-Funktion ────────────────────────────────────────────────────────────

/**
 * Build a callModel() function that targets the given NodeId.
 * The returned function matches DispatcherDeps['callModel'] exactly.
 */
export function createVllmCallModel(node: NodeId) {
  return async function callModel(
    _routing: ModelRoutingEntry,
    systemPrompt: string,
    userMessage: string,
  ): Promise<string> {

    // ── Qwen3.6 Orchestrator (Spark 1, Port 8001) ────────────────────────────
    if (node === 'qwen3.6' || node === 'spark-a') {
      const endpoint = NODE_PROFILES['spark-a']?.endpoint
        ?? process.env.SPARK_A_ENDPOINT
        ?? 'http://192.168.0.128:8001'
      const model = _routing.model ?? 'qwen3.6-35b-fp8'
      return callQwen36Orchestrator(
        endpoint,
        model,
        systemPrompt,
        userMessage,
        _routing.max_context ?? 800,
      )
    }

    // ── Coding Worker (Spark 2, Port 8001) ───────────────────────────────────
    if (node === 'spark-b') {
      const client = createSparkBClient()
      return generateWithVerification(client, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ])
    }

    // ── Nemotron (legacy — ersetzt durch Qwen3.6) ────────────────────────────
    if (node === 'nemotron') {
      const endpoint = NODE_PROFILES['nemotron']?.endpoint
        ?? 'http://192.168.0.128:8001'
      const { VLLMClient } = await import('@lumeos/vllm-client')
      const client = new VLLMClient(endpoint, 'nemotron-super-49b-nvfp4')
      const response = await client.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ])
      return response.choices[0]?.message?.content ?? ''
    }

    // ── Fallback: direkter vllm-client Aufruf ────────────────────────────────
    const client = createSparkAClient()
    const response = await client.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ])
    return response.choices[0]?.message?.content ?? ''
  }
}
