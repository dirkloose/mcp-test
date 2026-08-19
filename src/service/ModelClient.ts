import { HttpClient } from '../api/HttpClient';
import { ConversationHistory } from '../types';

/**
 * The ModelClient translates business requests into protocol-specific calls.
 */
export class ModelClient {
    private httpClient: HttpClient;
    private readonly modelEndpoint = 'v1/chat/completions';

    constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }

    /**
     * Executes a chat completion request and yields chunks as they arrive.
     */
    async getStreamingCompletion(history: ConversationHistory, systemPrompt: string): Promise<AsyncGenerator<string>> {
        const payload = {
            model: process.env.LM_MODEL || "local-lm-model", // Override via LM_MODEL in .env
            messages: [
                { role: 'system', content: systemPrompt },
                ...history,
            ],
            stream: true,
        };

        try {
            const streamGenerator = await this.httpClient.streamRequest(this.modelEndpoint, payload);

            return (async function* () {
                let buffer = "";

                const extractText = (payload: any): string | undefined => {
                    return payload?.choices?.[0]?.delta?.content
                        ?? payload?.choices?.[0]?.message?.content
                        ?? payload?.message?.content
                        ?? payload?.content?.[0]?.text
                        ?? payload?.output_text;
                };

                const emitDataLine = function* (data: string): Generator<string> {
                    if (data === '[DONE]') {
                        return;
                    }

                    try {
                        const jsonObject = JSON.parse(data);
                        const text = extractText(jsonObject);
                        if (text) {
                            yield text;
                        }
                    } catch {
                        // Ignore malformed JSON payloads and continue parsing the stream
                    }
                };

                for await (const chunkString of streamGenerator) {
                    buffer += chunkString;

                    const events = buffer.split('\n\n');
                    buffer = events.pop() ?? "";

                    for (const event of events) {
                        const lines = event
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line.startsWith('data:'));

                        if (lines.length > 0) {
                            for (const line of lines) {
                                const data = line.slice('data:'.length).trim();
                                for (const text of emitDataLine(data)) {
                                    yield text;
                                }
                            }
                            continue;
                        }

                        for (const line of event.split('\n').map(line => line.trim()).filter(Boolean)) {
                            for (const text of emitDataLine(line)) {
                                yield text;
                            }
                        }
                    }
                }

                const trailing = buffer.trim();
                if (trailing) {
                    for (const text of emitDataLine(trailing)) {
                        yield text;
                    }
                }
            })();
        } catch (error) {
            console.error("Error during API streaming:", error);
            throw new Error("Failed to communicate with the model endpoint.");
        }
    }
}
