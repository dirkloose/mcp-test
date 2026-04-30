/** Defines the expected structure of an API request body */
export interface Message {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

/** The full conversation history passed to the model */
export type ConversationHistory = Message[];

/** Interface for a single chunk of streamed data */
export interface StreamChunk {
    choices?: {
        delta: { content?: string }; // OpenAI-style delta structure
    }[];
    done: boolean;
}

/** The expected response from the ModelClient's streaming method */
type StreamResult = AsyncGenerator<{ chunk: string, done: boolean }>;
