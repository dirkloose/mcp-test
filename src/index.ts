import 'dotenv/config'; // Load environment variables
import { HttpClient } from './api/HttpClient';
import { ModelClient } from './service/ModelClient';
import { ApplicationEngine } from './core/ApplicationEngine';

async function main() {

    if (!process.env.LM_API_KEY) {
        console.error("FATAL: LM_API_KEY must be set in .env file.");
        return;
    }

    try {
        // Dependency Injection setup (cleanest way to wire the system)
        const httpClient = new HttpClient(process.env.LM_BASE_URL || "http://localhost:1234/v1");
        const modelClient = new ModelClient(httpClient);
        const engine = new ApplicationEngine(modelClient);

        // Start a conversational loop (Example)
        await engine.runChat("Explain the concept of immutability in state management and give me an example.");

        // The history is now updated, ready for the next turn:
        await engine.runChat("How does this relate to React Hooks?");

        // adds custom question by d/rk
        await engine.runChat("What can you do?");

    } catch (error) {
        console.error("\nAn unrecoverable error occurred during the chat session:", (error as Error).message);
    }
}

main().catch((error) => {
    console.error("Unexpected startup error:", (error as Error).message);
});
