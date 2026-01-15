# OpenAI MCP Server

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991.svg)](https://platform.openai.com/)

A production-ready Model Context Protocol (MCP) server that provides seamless integration with OpenAI's APIs, including GPT chat completions, text embeddings, and DALL-E image generation.

## Features

- **Chat Completions**: Access GPT-4, GPT-4 Turbo, GPT-3.5 and other OpenAI chat models
- **Text Embeddings**: Generate embeddings for semantic search and similarity analysis
- **Image Generation**: Create images with DALL-E 2 and DALL-E 3
- **Image Editing**: Edit images with masks using DALL-E 2
- **Image Variations**: Generate variations of existing images
- **Model Discovery**: List all available OpenAI models
- **Full Parameter Support**: Control temperature, tokens, quality, style, and more
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Error Handling**: Comprehensive error handling and validation

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/andrexibiza/openai-mcp-server.git
cd openai-mcp-server
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

4. **Build the project**

```bash
npm run build
```

5. **Run the server**

```bash
npm start
```

## Configuration

### MCP Client Configuration

To use this server with an MCP client (like Claude Desktop), add it to your client's configuration file:

**For Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "openai": {
      "command": "node",
      "args": ["/path/to/openai-mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-your-api-key-here"
      }
    }
  }
}
```

**For other MCP clients**, refer to their documentation for adding stdio-based MCP servers.

## Available Tools

### 1. chat_completion

Create chat completions with OpenAI's language models.

**Parameters:**
- `model` (string, default: "gpt-4o"): Model to use (gpt-4, gpt-4-turbo, gpt-3.5-turbo, etc.)
- `messages` (array): Array of message objects with `role` and `content`
- `temperature` (number, 0-2, default: 1): Sampling temperature
- `max_tokens` (number, optional): Maximum tokens to generate
- `top_p` (number, 0-1, optional): Nucleus sampling parameter
- `frequency_penalty` (number, -2 to 2, optional): Penalize frequent tokens
- `presence_penalty` (number, -2 to 2, optional): Penalize existing tokens
- `n` (number, default: 1): Number of completions to generate
- `stop` (string or array, optional): Stop sequences
- `user` (string, optional): Unique user identifier

**Example:**

```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Explain quantum computing in simple terms."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

### 2. create_embedding

Generate text embeddings for semantic analysis.

**Parameters:**
- `model` (string, default: "text-embedding-3-small"): Embedding model
  - `text-embedding-3-small`: Fast and efficient
  - `text-embedding-3-large`: Higher quality
  - `text-embedding-ada-002`: Legacy model
- `input` (string or array): Text to embed
- `encoding_format` ("float" | "base64", optional): Response format
- `dimensions` (number, optional): Number of dimensions (for v3 models)
- `user` (string, optional): Unique user identifier

**Example:**

```json
{
  "model": "text-embedding-3-small",
  "input": "The quick brown fox jumps over the lazy dog"
}
```

### 3. generate_image

Generate images using DALL-E 2 or DALL-E 3.

**Parameters:**
- `prompt` (string, max 4000 chars): Description of the image to generate
- `model` ("dall-e-2" | "dall-e-3", default: "dall-e-3"): DALL-E model
- `n` (number, 1-10, default: 1): Number of images (DALL-E 3 only supports 1)
- `quality` ("standard" | "hd", default: "standard"): Image quality (DALL-E 3 only)
- `response_format` ("url" | "b64_json", default: "url"): Response format
- `size` (string, default: "1024x1024"): Image size
  - DALL-E 2: 256x256, 512x512, 1024x1024
  - DALL-E 3: 1024x1024, 1792x1024, 1024x1792
- `style` ("vivid" | "natural", default: "vivid"): Image style (DALL-E 3 only)
- `user` (string, optional): Unique user identifier

**Example:**

```json
{
  "prompt": "A serene landscape with mountains at sunset, digital art",
  "model": "dall-e-3",
  "size": "1792x1024",
  "quality": "hd",
  "style": "vivid"
}
```

### 4. edit_image

Edit an existing image using DALL-E 2.

**Parameters:**
- `image` (string): Base64-encoded PNG image or URL
- `mask` (string, optional): Base64-encoded PNG mask or URL (transparent areas will be edited)
- `prompt` (string, max 4000 chars): Description of the desired edit
- `model` ("dall-e-2", default: "dall-e-2"): Currently only DALL-E 2 supports editing
- `n` (number, 1-10, default: 1): Number of edited images to generate
- `size` ("256x256" | "512x512" | "1024x1024", default: "1024x1024"): Output size
- `response_format` ("url" | "b64_json", default: "url"): Response format
- `user` (string, optional): Unique user identifier

**Example:**

```json
{
  "image": "https://example.com/original-image.png",
  "mask": "https://example.com/mask.png",
  "prompt": "Add a red hat to the person in the image",
  "size": "1024x1024",
  "n": 2
}
```

### 5. create_image_variation

Create variations of an existing image using DALL-E 2.

**Parameters:**
- `image` (string): Base64-encoded PNG image or URL
- `model` ("dall-e-2", default: "dall-e-2"): Currently only DALL-E 2 supports variations
- `n` (number, 1-10, default: 1): Number of variations to generate
- `response_format` ("url" | "b64_json", default: "url"): Response format
- `size` ("256x256" | "512x512" | "1024x1024", default: "1024x1024"): Output size
- `user` (string, optional): Unique user identifier

**Example:**

```json
{
  "image": "https://example.com/original-image.png",
  "n": 3,
  "size": "1024x1024"
}
```

### 6. list_models

List all available OpenAI models.

**Parameters:** None

**Example:**

```json
{}
```

**Returns:** List of available models including:
- GPT models (gpt-4, gpt-4-turbo, gpt-3.5-turbo, etc.)
- Embedding models (text-embedding-3-small, text-embedding-3-large, etc.)
- DALL-E models (dall-e-2, dall-e-3)
- Other available models

## Usage Examples

### Simple Chat Conversation

```typescript
// Tool call to chat_completion
{
  "model": "gpt-4o",
  "messages": [
    { "role": "user", "content": "What is the capital of France?" }
  ]
}
```

### Multi-turn Conversation with System Prompt

```typescript
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a knowledgeable history teacher."
    },
    {
      "role": "user",
      "content": "Tell me about the Renaissance."
    },
    {
      "role": "assistant",
      "content": "The Renaissance was a period of cultural rebirth..."
    },
    {
      "role": "user",
      "content": "What were the key artistic developments?"
    }
  ],
  "temperature": 0.7
}
```

### Generate Embeddings for Semantic Search

```typescript
{
  "model": "text-embedding-3-small",
  "input": [
    "Machine learning is a subset of artificial intelligence",
    "Deep learning uses neural networks",
    "Natural language processing enables computers to understand text"
  ]
}
```

### High-Quality Image Generation

```typescript
{
  "prompt": "A futuristic city with flying cars and neon lights, cyberpunk style, highly detailed",
  "model": "dall-e-3",
  "size": "1792x1024",
  "quality": "hd",
  "style": "vivid"
}
```

## Error Handling

The server provides detailed error messages for common issues:

- **Missing API Key**: Server will exit with an error message
- **Invalid Parameters**: Zod validation errors with specific field information
- **OpenAI API Errors**: HTTP status codes and error messages from OpenAI
- **Model-specific Constraints**: Validation for DALL-E 2/3 specific limitations

## Development

### Project Structure

```
openai-mcp-server/
├── src/
│   ├── index.ts          # Main server implementation
│   └── types.ts          # TypeScript type definitions
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled server
- `npm run dev` - Build and run in one command
- `npm run watch` - Watch for changes and recompile

### Testing

You can test the server using any MCP client or by using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Security Best Practices

1. **Never commit `.env` file** - Your API key should never be in version control
2. **Use environment variables** - Always pass sensitive data through environment variables
3. **Rotate API keys regularly** - Generate new keys periodically from OpenAI dashboard
4. **Monitor usage** - Keep track of your API usage on the OpenAI dashboard
5. **Set usage limits** - Configure spending limits in your OpenAI account settings

## Rate Limits and Costs

Be aware of OpenAI's rate limits and pricing:

- **Rate Limits**: Vary by model and account tier ([Details](https://platform.openai.com/docs/guides/rate-limits))
- **Pricing**: Different models have different costs ([Pricing](https://openai.com/pricing))
- **Token Limits**: Each model has maximum token limits for input and output

## Troubleshooting

### Server won't start

- Ensure Node.js 18+ is installed: `node --version`
- Check that `.env` file exists with valid `OPENAI_API_KEY`
- Run `npm install` to ensure all dependencies are installed
- Run `npm run build` to compile TypeScript

### API errors

- Verify your API key is valid and has credits
- Check OpenAI's status page for service issues
- Ensure you have access to the models you're trying to use
- Review rate limits and ensure you're not exceeding them

### Image operations failing

- Ensure images are in PNG format
- Check image size constraints for your chosen model
- Verify base64 encoding is correct if using encoded images
- Make sure image URLs are accessible

## License

This software is proprietary and confidential.

**Copyright © 2025-2026 Axl Ibiza, MBA. All Rights Reserved.**

This software is licensed for authorized use only. Unauthorized copying, distribution, modification, or use of this software is strictly prohibited and may result in severe civil and criminal penalties.

**Terms of Use:**
- Licensed for internal business purposes only
- No redistribution or commercial use without written permission
- No reverse engineering, decompilation, or derivative works
- All intellectual property rights reserved

For licensing inquiries, enterprise support, or custom development:
**Contact:** axl@poke.com

See the [LICENSE](LICENSE) file for complete terms and conditions.

---

## Support

- **Email Support:** axl@poke.com
- OpenAI Documentation: https://platform.openai.com/docs
- MCP Documentation: https://modelcontextprotocol.io

**Note:** This is proprietary software. For bug reports, feature requests, or technical support, please contact the author directly.

---

## Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol)
- Powered by [OpenAI API](https://platform.openai.com/)
- Developed by Axl Ibiza, MBA

---

**Copyright © 2025-2026 Axl Ibiza, MBA. All Rights Reserved.**

**Note**: This is an unofficial project and is not affiliated with or endorsed by OpenAI.
