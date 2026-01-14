#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";
import { z } from "zod";

// Validate environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is required");
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Zod schemas for input validation
const ChatCompletionArgsSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
  model: z.string().default("gpt-4o"),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  max_tokens: z.number().positive().optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
});

const GenerateEmbeddingsArgsSchema = z.object({
  input: z.union([z.string(), z.array(z.string())]),
  model: z.string().default("text-embedding-3-small"),
  encoding_format: z.enum(["float", "base64"]).optional(),
  dimensions: z.number().positive().optional(),
});

const ModerateContentArgsSchema = z.object({
  input: z.union([z.string(), z.array(z.string())]),
  model: z.string().default("omni-moderation-latest"),
});

// Initialize MCP server
const server = new Server(
  {
    name: "openai-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: chat_completion
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "chat_completion",
        description:
          "Generate chat completions using OpenAI's chat models. Supports GPT-4, GPT-3.5, and other chat models with configurable parameters.",
        inputSchema: {
          type: "object",
          properties: {
            messages: {
              type: "array",
              description: "Array of message objects with role and content",
              items: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    enum: ["system", "user", "assistant"],
                    description: "The role of the message author",
                  },
                  content: {
                    type: "string",
                    description: "The content of the message",
                  },
                },
                required: ["role", "content"],
              },
            },
            model: {
              type: "string",
              description: "The OpenAI model to use (e.g., gpt-4o, gpt-4-turbo, gpt-3.5-turbo)",
              default: "gpt-4o",
            },
            temperature: {
              type: "number",
              description: "Sampling temperature between 0 and 2. Higher values make output more random.",
              default: 0.7,
              minimum: 0,
              maximum: 2,
            },
            max_tokens: {
              type: "number",
              description: "Maximum number of tokens to generate",
            },
            top_p: {
              type: "number",
              description: "Nucleus sampling parameter",
              minimum: 0,
              maximum: 1,
            },
            frequency_penalty: {
              type: "number",
              description: "Penalty for token frequency (-2.0 to 2.0)",
              minimum: -2,
              maximum: 2,
            },
            presence_penalty: {
              type: "number",
              description: "Penalty for token presence (-2.0 to 2.0)",
              minimum: -2,
              maximum: 2,
            },
          },
          required: ["messages"],
        },
      },
      {
        name: "generate_embeddings",
        description:
          "Generate embeddings for text using OpenAI's embedding models. Useful for semantic search, clustering, and similarity tasks.",
        inputSchema: {
          type: "object",
          properties: {
            input: {
              oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } },
              ],
              description: "Text or array of texts to generate embeddings for",
            },
            model: {
              type: "string",
              description: "The embedding model to use (e.g., text-embedding-3-small, text-embedding-3-large, text-embedding-ada-002)",
              default: "text-embedding-3-small",
            },
            encoding_format: {
              type: "string",
              enum: ["float", "base64"],
              description: "The format of the embeddings",
            },
            dimensions: {
              type: "number",
              description: "Number of dimensions for the embedding (only supported for text-embedding-3 models)",
            },
          },
          required: ["input"],
        },
      },
      {
        name: "list_models",
        description:
          "List all available OpenAI models. Returns model IDs, ownership, and creation timestamps.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "moderate_content",
        description:
          "Check if content violates OpenAI's usage policies using the moderation API. Returns categories and severity scores.",
        inputSchema: {
          type: "object",
          properties: {
            input: {
              oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } },
              ],
              description: "Text or array of texts to moderate",
            },
            model: {
              type: "string",
              description: "The moderation model to use",
              default: "omni-moderation-latest",
            },
          },
          required: ["input"],
        },
      },
    ],
  };
});

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "chat_completion": {
        const validatedArgs = ChatCompletionArgsSchema.parse(args);

        try {
          const completion = await openai.chat.completions.create({
            model: validatedArgs.model,
            messages: validatedArgs.messages,
            temperature: validatedArgs.temperature,
            max_tokens: validatedArgs.max_tokens,
            top_p: validatedArgs.top_p,
            frequency_penalty: validatedArgs.frequency_penalty,
            presence_penalty: validatedArgs.presence_penalty,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message: completion.choices[0].message,
                    usage: completion.usage,
                    model: completion.model,
                    finish_reason: completion.choices[0].finish_reason,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `OpenAI API error: ${error.message}`
          );
        }
      }

      case "generate_embeddings": {
        const validatedArgs = GenerateEmbeddingsArgsSchema.parse(args);

        try {
          const embedding = await openai.embeddings.create({
            model: validatedArgs.model,
            input: validatedArgs.input,
            encoding_format: validatedArgs.encoding_format,
            dimensions: validatedArgs.dimensions,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    embeddings: embedding.data,
                    model: embedding.model,
                    usage: embedding.usage,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `OpenAI API error: ${error.message}`
          );
        }
      }

      case "list_models": {
        try {
          const models = await openai.models.list();

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    models: models.data.map((model) => ({
                      id: model.id,
                      created: model.created,
                      owned_by: model.owned_by,
                    })),
                    total: models.data.length,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `OpenAI API error: ${error.message}`
          );
        }
      }

      case "moderate_content": {
        const validatedArgs = ModerateContentArgsSchema.parse(args);

        try {
          const moderation = await openai.moderations.create({
            model: validatedArgs.model,
            input: validatedArgs.input,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    results: moderation.results,
                    model: moderation.model,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: any) {
          throw new McpError(
            ErrorCode.InternalError,
            `OpenAI API error: ${error.message}`
          );
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
      );
    }
    throw error;
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OpenAI MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
