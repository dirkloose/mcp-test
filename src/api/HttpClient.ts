import { StreamChunk } from '../types';

/**
 * Abstract HTTP Client designed for streaming LLM API calls.
 */
export class HttpClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Makes a POST request and returns an async generator to handle streaming.
     * @param path The endpoint segment (e.g., 'v1/chat/completions')
     * @param body The JSON payload.
     */
    async streamRequest(path: string, body: any): Promise<AsyncGenerator<string>> {
        const url = `${this.baseUrl}/${path}`;

        // In a real scenario, use a robust fetch/axios implementation here
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LM_API_KEY}` // Use env var
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        // Crucial Step: Reading the body as a ReadableStream for streaming processing
        const reader = response.body?.getReader();

        return (async function* () {
            const decoder = new TextDecoder();
            let done = false;
            while (!done) {
                const { value, done: streamDone } = await reader!.read();
                done = streamDone;
                if (value) {
                    yield decoder.decode(value);
                }
            }
        })();
    }
}
