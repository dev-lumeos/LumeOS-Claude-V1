// vLLM Client — OpenAI-compatible
// packages/vllm-client/src/client.ts
// Connects to Spark A/B vLLM endpoints

export interface CompletionOptions {
  temperature?: number
  top_p?: number
  top_k?: number
  max_tokens?: number
  seed?: number
  stop?: string[]
}

export interface CompletionResponse {
  id: string
  model: string
  choices: {
    index: number
    text: string
    finish_reason: 'stop' | 'length' | 'error'
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionResponse {
  id: string
  model: string
  choices: {
    index: number
    message: ChatMessage
    finish_reason: 'stop' | 'length' | 'error'
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const DEFAULT_OPTIONS: CompletionOptions = {
  temperature: 0.0,
  top_p: 1.0,
  top_k: 1,
  max_tokens: 4096,
  seed: 42
}

/**
 * vLLM Client for OpenAI-compatible endpoints.
 * Used for Spark A (Governance) and Spark B (Execution).
 */
export class VLLMClient {
  private endpoint: string
  private model: string

  constructor(endpoint: string, model: string) {
    this.endpoint = endpoint.replace(/\/$/, '') // Remove trailing slash
    this.model = model
  }

  /**
   * Generate completion (legacy completions API).
   */
  async complete(
    prompt: string,
    options: CompletionOptions = {}
  ): Promise<CompletionResponse> {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    const response = await fetch(`${this.endpoint}/v1/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        temperature: opts.temperature,
        top_p: opts.top_p,
        top_k: opts.top_k,
        max_tokens: opts.max_tokens,
        seed: opts.seed,
        stop: opts.stop
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`vLLM completion failed: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Generate chat completion (chat API).
   */
  async chat(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: opts.temperature,
        top_p: opts.top_p,
        top_k: opts.top_k,
        max_tokens: opts.max_tokens,
        seed: opts.seed,
        stop: opts.stop
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`vLLM chat failed: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Check if endpoint is healthy.
   */
  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/health`)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get available models.
   */
  async models(): Promise<string[]> {
    const response = await fetch(`${this.endpoint}/v1/models`)
    if (!response.ok) return []

    const data = await response.json()
    return data.data?.map((m: { id: string }) => m.id) ?? []
  }
}

// Pre-configured clients for Spark A/B
export function createSparkAClient(): VLLMClient {
  const endpoint = process.env.SPARK_A_ENDPOINT || 'http://192.168.0.128:8001'
  return new VLLMClient(endpoint, 'qwen3.6-35b-fp8')
}

export function createSparkBClient(): VLLMClient {
  const endpoint = process.env.SPARK_B_ENDPOINT || 'http://192.168.0.188:8001'
  return new VLLMClient(endpoint, 'qwen3-coder-30b')
}
