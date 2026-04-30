import { ModelClient } from '../service/ModelClient';
import { ConversationHistory, Message } from '../types';

export class ApplicationEngine {
    private modelClient: ModelClient;
    private history: ConversationHistory = [];
    private readonly systemPrompt: string = "You are a highly experienced and witty senior software architect. Keep your responses concise.";

    constructor(modelClient: ModelClient) {
        this.modelClient = modelClient;
    }

    /**
     * Main method to handle the chat loop and stream output.
     */
    public async runChat(userInput: string): Promise<void> {
        console.log(`\n--- User Input: "${userInput}" ---`);

        // 1. Update state/history (User's turn)
        const userMessage: Message = { role: 'user', content: userInput };
        this.history.push(userMessage);

        // 2. Get the streamed response from the Model Client
        let fullResponseText = "";
        let generator = this.modelClient.getStreamingCompletion(this.history, this.systemPrompt);

        console.log("AI Response:");
        const outputStream = await generator; // Await the async generator iterator

        // 3. Consumption and Presentation (The Streaming Loop)
        for await (const chunk of outputStream) {
            process.stdout.write(chunk); // Print character-by-character for real-time effect
            fullResponseText += chunk;
        }
        console.log('\n--------------------------------------');

        // 4. Update state/history (Assistant's turn)
        const assistantMessage: Message = { role: 'assistant', content: fullResponseText };
        this.history.push(assistantMessage);
    }
}
