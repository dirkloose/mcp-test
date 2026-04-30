import { HttpClient } from '../api/HttpClient';
import { ConversationHistory } from '../types';

/**
 * The ModelClient translates business requests into protocol-specific calls.
 */
export class ModelClient {
    private httpClient: HttpClient;
    private readonly modelEndpoint = 'v1/chat/completions'; // Assuming standard endpoint

    constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }

    /**
     * Executes a chat completion request and yields chunks as they arrive.
     */
    async getStreamingCompletion(history: ConversationHistory, systemPrompt: string): Promise<AsyncGenerator<string>> {
        const payload = {
            model: "local-lm-model", // Replace with your actual model name
            messages: [
                { role: 'system', content: systemPrompt },
                ...history,
            ],
            stream: true,
        };

        try {
            const streamGenerator = await this.httpClient.streamRequest(this.modelEndpoint, payload);

            return (async function* () {
                for await (const chunkString of streamGenerator) {
                    try {
                        const jsonObject = JSON.parse(chunkString);
                        const deltaContent = jsonObject?.choices?.[0]?.delta?.content;

                        if (deltaContent) {
                            yield deltaContent;
                        }
                    } catch {
                        // Ignore non-JSON chunks / partial stream fragments
                    }
                }
            })();
        } catch (error) {
            console.error("Error during API streaming:", error);
            throw new Error("Failed to communicate with the model endpoint.");
        }
    }
}
