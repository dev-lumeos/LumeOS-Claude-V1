import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  callNemotronReviewer,
  extractContentOnly,
} from '../../../services/scheduler-api/src/vllm-adapter'

describe('vLLM adapter content normalization', () => {
  it('extracts trimmed content and ignores reasoning fields', () => {
    const content = extractContentOnly({
      choices: [{
        message: {
          content: '  {"status":"ok"}  ',
          reasoning: 'hidden reasoning',
          reasoning_content: 'hidden reasoning_content',
        },
      }],
    })

    assert.equal(content, '{"status":"ok"}')
  })

  it('does not fall back to reasoning when content is empty', () => {
    const content = extractContentOnly({
      choices: [{
        message: {
          content: '   ',
          reasoning: '{"status":"ok"}',
        },
      }],
    })

    assert.equal(content, '')
  })

  it('Nemotron reviewer rejects empty normalized content', async () => {
    const oldEndpoint = process.env.NEMOTRON_REVIEW_ENDPOINT
    const oldModel = process.env.NEMOTRON_REVIEW_MODEL
    const oldFetch = globalThis.fetch

    process.env.NEMOTRON_REVIEW_ENDPOINT = 'http://127.0.0.1:18099'
    process.env.NEMOTRON_REVIEW_MODEL = 'test-nemotron'
    globalThis.fetch = (async () => new Response(JSON.stringify({
      choices: [{
        message: {
          content: ' ',
          reasoning: '{"status":"PASS"}',
        },
      }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

    try {
      await assert.rejects(
        () => callNemotronReviewer('system', 'user'),
        /NEMOTRON_EMPTY_CONTENT/,
      )
    } finally {
      if (oldEndpoint === undefined) delete process.env.NEMOTRON_REVIEW_ENDPOINT
      else process.env.NEMOTRON_REVIEW_ENDPOINT = oldEndpoint
      if (oldModel === undefined) delete process.env.NEMOTRON_REVIEW_MODEL
      else process.env.NEMOTRON_REVIEW_MODEL = oldModel
      globalThis.fetch = oldFetch
    }
  })
})
