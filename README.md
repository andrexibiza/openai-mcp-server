# OpenAI MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with OpenAI's API, enabling chat completions, embeddings generation, model listing, and content moderation through standardized MCP tools.

## Features

- **Chat Completions**: Generate responses using GPT-4, GPT-3.5, and other OpenAI chat models
- **Embeddings**: Create text embeddings for semantic search and similarity tasks
- **Model Listing**: Browse all available OpenAI models
- **Content Moderation**: Check content against OpenAI's usage policies
- **Full Type Safety**: Built with TypeScript and Zod validation
- **Production Ready**: Comprehensive error handling and validation

## Prerequisites

- Node.js 18.0.0 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/andrexibiza/openai-mcp-server.git
cd openai-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-your-api-key-here
```

5. Build the project:
```bash
npm run build
```

## Configuration

### Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key

### MCP Client Configuration

Add to your MCP client configuration file:

#### Claude Desktop (macOS)

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openai": {
      "command": "node",
      "args": ["/absolute/path/to/openai-mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-your-api-key-here"
      }
    }
  }
}
```

#### Claude Desktop (Windows)

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openai": {
      "command": "node",
      "args": ["C:\\path\\to\\openai-mcp-server\\dist\\index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-your-api-key-here"
      }
    }
  }
}
```

## Available Tools

### 1. chat_completion

Generate chat completions using OpenAI's chat models.

**Parameters:**
- `messages` (required): Array of message objects with `role` and `content`
- `model` (optional): Model to use (default: "gpt-4o")
- `temperature` (optional): Sampling temperature 0-2 (default: 0.7)
- `max_tokens` (optional): Maximum tokens to generate
- `top_p` (optional): Nucleus sampling parameter
- `frequency_penalty` (optional): Frequency penalty -2 to 2
- `presence_penalty` (optional): Presence penalty -2 to 2

**Example:**
```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is the capital of France?"}
  ],
  "model": "gpt-4o",
  "temperature": 0.7
}
```

### 2. generate_embeddings

Generate embeddings for text using OpenAI's embedding models.

**Parameters:**
- `input` (required): String or array of strings to embed
- `model` (optional): Embedding model (default: "text-embedding-3-small")
- `encoding_format` (optional): "float" or "base64"
- `dimensions` (optional): Number of dimensions (text-embedding-3 models only)

**Example:**
```json
{
  "input": "The quick brown fox jumps over the lazy dog",
  "model": "text-embedding-3-small"
}
```

### 3. list_models

List all available OpenAI models.

**Parameters:** None

**Example:**
```json
{}
```

### 4. moderate_content

Check content for policy violations using OpenAI's moderation API.

**Parameters:**
- `input` (required): String or array of strings to moderate
- `model` (optional): Moderation model (default: "omni-moderation-latest")

**Example:**
```json
{
  "input": "Sample text to check for policy violations"
}
```

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Run Directly
```bash
npm start
```

## Usage Examples

### Chat Completion with System Prompt

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a Python programming expert. Provide concise, accurate code examples."
    },
    {
      "role": "user",
      "content": "Write a function to calculate fibonacci numbers"
    }
  ],
  "model": "gpt-4o",
  "temperature": 0.3
}
```

### Generate Embeddings for Multiple Texts

```json
{
  "input": [
    "Machine learning is a subset of artificial intelligence",
    "Deep learning uses neural networks with multiple layers",
    "Natural language processing enables computers to understand text"
  ],
  "model": "text-embedding-3-large"
}
```

### Content Moderation

```json
{
  "input": [
    "This is a safe message",
    "This is another message to check"
  ]
}
```

## Error Handling

The server provides comprehensive error handling:

- **Invalid Parameters**: Returns validation errors with specific field details
- **API Errors**: Catches and reports OpenAI API errors with descriptive messages
- **Missing API Key**: Fails fast on startup if `OPENAI_API_KEY` is not set
- **Unknown Tools**: Returns appropriate error for unrecognized tool names

## Security Best Practices

1. **Never commit your API key** - Use environment variables
2. **Rotate keys regularly** - Generate new API keys periodically
3. **Use read-only keys when possible** - Limit permissions to minimum required
4. **Monitor usage** - Track API calls in OpenAI dashboard
5. **Set spending limits** - Configure budget alerts in OpenAI account

## Supported Models

### Chat Models
- `gpt-4o` (recommended)
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo`
- And more...

### Embedding Models
- `text-embedding-3-small` (recommended)
- `text-embedding-3-large`
- `text-embedding-ada-002`

### Moderation Models
- `omni-moderation-latest` (recommended)
- `text-moderation-latest`
- `text-moderation-stable`

For the complete list of available models, use the `list_models` tool.

## Troubleshooting

### "OPENAI_API_KEY environment variable is required"

Ensure your `.env` file exists and contains a valid OpenAI API key, or set the environment variable when running the server.

### "OpenAI API error: Incorrect API key provided"

Verify your API key is valid and active at https://platform.openai.com/api-keys

### "OpenAI API error: Rate limit exceeded"

You've hit OpenAI's rate limits. Wait a moment and try again, or upgrade your plan.

### "OpenAI API error: Model not found"

The specified model doesn't exist or isn't available to your account. Use `list_models` to see available models.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/andrexibiza/openai-mcp-server/issues)
- Check [OpenAI API Status](https://status.openai.com/)
- Review [OpenAI Community Forum](https://community.openai.com/)

---

Built with ❤️ using the Model Context Protocol
