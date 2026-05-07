# mcp-test

A TypeScript-based test application for interacting with Language Models (LLMs) via HTTP. This project demonstrates a clean architecture for managing conversational state and communicating with model APIs.

## Features

- **Clean Architecture**: Decoupled HTTP client, service layer, and core application logic.
- **State Management**: Built-in chat history handling.
- **Environment Driven**: Configuration via `.env` file.
- **TypeScript**: Fully typed for better developer experience.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dirkloose/mcp-test.git
   cd mcp-test
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory and add your configuration:

```env
LM_API_KEY=your_api_key_here
LM_BASE_URL=http://localhost:1234/v1
```

- `LM_API_KEY`: Your API key for the language model provider.
- `LM_BASE_URL`: The base URL for the model API (defaults to `http://localhost:1234/v1` if not set).

## Usage

To start the application in development mode:

```bash
npm start
```

The application will initialize the `ApplicationEngine` and run a series of sample chat queries defined in `src/index.ts`.

## Project Structure

- `src/api/`: Contains the `HttpClient` for making API requests.
- `src/service/`: Contains `ModelClient` for high-level model interactions.
- `src/core/`: Contains `ApplicationEngine`, the main logic controller.
- `src/index.ts`: The entry point of the application.

## License

This project is licensed under the ISC License.
