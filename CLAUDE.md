# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm start         # run via ts-node (no build step needed)
npx tsc --noEmit  # type-check without emitting files
```

There is no test suite configured yet (`npm test` exits with an error).

## Configuration

Copy `.env.sample` to `.env` before running:

- `LM_API_KEY` — bearer token for the model API (can be a dummy value for local LM Studio)
- `LM_BASE_URL` — base URL for the OpenAI-compatible endpoint (default: `http://localhost:1234/v1`)
- `LM_MODEL` — model id to send in requests, as reported by `GET /v1/models` on your local server (optional; falls back to `"local-lm-model"` in `ModelClient` if unset)

`HttpClient` strips trailing slashes from `baseUrl` and leading slashes from the request path, and drops a duplicate `v1/` prefix if `baseUrl` already ends with `/v1` — so `http://localhost:1234` and `http://localhost:1234/v1` both work.

## Architecture

Three-layer dependency chain wired manually in `src/index.ts`:

```
HttpClient  →  ModelClient  →  ApplicationEngine
(transport)    (protocol)       (state + orchestration)
```

**`src/api/HttpClient`** — raw streaming transport. Issues a POST with a `ReadableStream` response and yields raw byte strings via an async generator. No protocol awareness.

**`src/service/ModelClient`** — OpenAI-compatible SSE protocol layer. Accepts a `ConversationHistory` and a system prompt, builds the payload, and parses `data:` lines out of the stream, buffering across chunk boundaries and splitting on blank-line-delimited SSE events. The `extractText` helper tries multiple response shapes (OpenAI delta, message, Anthropic `content[0].text`, `output_text`) to stay compatible with different local model servers.

**`src/core/ApplicationEngine`** — manages `ConversationHistory` across turns and streams chunks to stdout. The system prompt is hardcoded here; `history` accumulates all turns for multi-turn context.

**`src/types.ts`** — shared types: `Message`, `ConversationHistory`, `StreamChunk`.

The model name sent to the API comes from `LM_MODEL` in `.env`, falling back to the hardcoded `"local-lm-model"` in `ModelClient` if unset — set `LM_MODEL` to match a model id returned by `GET /v1/models` on your local LM server.