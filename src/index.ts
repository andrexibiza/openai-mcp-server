#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import dotenv from "dotenv";
import {
  ChatCompletionParams,
  CreateEmbeddingParams,
  GenerateImageParams,
  EditImageParams,
  CreateImageVariationParams,
} from "./types.js";

dotenv.config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is required");
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schemas for input validation
const ChatCompletionSchema = z.object({
  model: z.string().default("gpt-4o"),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant", "function", "tool"]),
      content: z.string(),
      name: z.string().optional(),
    })
  ),
  temperature: z.number().min(0).max(2).optional().default(1),
  max_tokens: z.number().positive().optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  n: z.number().positive().optional().default(1),
  stream: z.boolean().optional().default(false),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  user: z.string().optional(),
});

const CreateEmbeddingSchema = z.object({
  model: z.string().default("text-embedding-3-small"),
  input: z.union([z.string(), z.array(z.string())]),
  encoding_format: z.enum(["float", "base64"]).optional(),
  dimensions: z.number().positive().optional(),
  user: z.string().optional(),
});

const GenerateImageSchema = z.object({
  prompt: z.string().max(4000),
  model: z.enum(["dall-e-2", "dall-e-3"]).default("dall-e-3"),
  n: z.number().min(1).max(10).optional().default(1),
  quality: z.enum(["standard", "hd"]).optional().default("standard"),
  response_format: z.enum(["url", "b64_json"]).optional().default("url"),
  size: z.enum(["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]).optional().default("1024x1024"),
  style: z.enum(["vivid", "natural"]).optional().default("vivid"),
  user: z.string().optional(),
});

const EditImageSchema = z.object({
  image: z.string().describe("Base64 encoded PNG image or URL"),
  mask: z.string().optional().describe("Base64 encoded PNG image or URL for the mask"),
  prompt: z.string().max(4000),
  model: z.enum(["dall-e-2"]).default("dall-e-2"),
  n: z.number().min(1).max(10).optional().default(1),
  size: z.enum(["256x256", "512x512", "1024x1024"]).optional().default("1024x1024"),
  response_format: z.enum(["url", "b64_json"]).optional().default("url"),
  user: z.string().optional(),
});

const CreateImageVariationSchema = z.object({
  image: z.string().describe("Base64 encoded PNG image or URL"),
  model: z.enum(["dall-e-2"]).default("dall-e-2"),
  n: z.number().min(1).max(10).optional().default(1),
  response_format: z.enum(["url", "b64_json"]).optional().default("url"),
  size: z.enum(["256x256", "512x512", "1024x1024"]).optional().default("1024x1024"),
  user: z.string().optional(),
});

// Define MCP tools
const tools: Tool[] = [
  {
    name: "chat_completion",
    description:
      "Create a chat completion using OpenAI's chat models (GPT-4, GPT-3.5, etc.). Supports system prompts, conversation history, temperature control, and all OpenAI chat parameters.",
    inputSchema: zodToJsonSchema(ChatCompletionSchema) as any,
  },
  {
    name: "create_embedding",
    description:
      "Generate embeddings for text using OpenAI's embedding models. Useful for semantic search, clustering, and similarity comparisons. Supports text-embedding-3-small, text-embedding-3-large, and text-embedding-ada-002.",
    inputSchema: zodToJsonSchema(CreateEmbeddingSchema) as any,
  },
  {
    name: "generate_image",
    description:
      "Generate images using DALL-E 2 or DALL-E 3. Create original images from text descriptions with control over size (256x256 to 1792x1024), quality (standard/hd), and style (vivid/natural). DALL-E 3 provides higher quality and better prompt understanding.",
    inputSchema: zodToJsonSchema(GenerateImageSchema) as any,
  },
  {
    name: "edit_image",
    description:
      "Edit an existing image using DALL-E 2. Upload an image and optionally a mask to specify which areas to regenerate based on a new text prompt. The transparent areas of the mask indicate where the image should be edited. Supports PNG format only.",
    inputSchema: zodToJsonSchema(EditImageSchema) as any,
  },
  {
    name: "create_image_variation",
    description:
      "Create variations of an existing image using DALL-E 2. Upload an image and generate similar versions with different details. Useful for exploring design alternatives and creative variations. Supports PNG format only.",
    inputSchema: zodToJsonSchema(CreateImageVariationSchema) as any,
  },
  {
    name: "list_models",
    description:
      "List all available OpenAI models that you have access to, including GPT models, embedding models, DALL-E models, and others. Returns model IDs, ownership, and creation dates.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// Create MCP server
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

// Helper function to convert base64 or URL to Buffer for image operations
async function imageToBuffer(imageData: string): Promise<Buffer> {
  if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
    // Fetch image from URL
    const response = await fetch(imageData);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } else if (imageData.startsWith("data:image")) {
    // Extract base64 data from data URL
    const base64Data = imageData.split(",")[1];
    return Buffer.from(base64Data, "base64");
  } else {
    // Assume it's raw base64
    return Buffer.from(imageData, "base64");
  }
}

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "chat_completion": {
        const params = ChatCompletionSchema.parse(args);
        const completion = await openai.chat.completions.create(params as any);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(completion, null, 2),
            },
          ],
        };
      }

      case "create_embedding": {
        const params = CreateEmbeddingSchema.parse(args);
        const embedding = await openai.embeddings.create(params as any);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(embedding, null, 2),
            },
          ],
        };
      }

      case "generate_image": {
        const params = GenerateImageSchema.parse(args);
        
        // DALL-E 3 specific validations
        if (params.model === "dall-e-3") {
          if (params.n && params.n > 1) {
            throw new Error("DALL-E 3 only supports n=1");
          }
          if (params.size && !["1024x1024", "1792x1024", "1024x1792"].includes(params.size)) {
            throw new Error("DALL-E 3 only supports sizes: 1024x1024, 1792x1024, 1024x1792");
          }
        }
        
        // DALL-E 2 specific validations
        if (params.model === "dall-e-2") {
          if (params.quality === "hd") {
            throw new Error("DALL-E 2 does not support 'hd' quality");
          }
          if (params.style) {
            throw new Error("DALL-E 2 does not support 'style' parameter");
          }
          if (params.size && !["256x256", "512x512", "1024x1024"].includes(params.size)) {
            throw new Error("DALL-E 2 only supports sizes: 256x256, 512x512, 1024x1024");
          }
        }
        
        const image = await openai.images.generate(params as any);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(image, null, 2),
            },
          ],
        };
      }

      case "edit_image": {
        const params = EditImageSchema.parse(args);
        
        // Convert image and mask to buffers
        const imageBuffer = await imageToBuffer(params.image);
        const maskBuffer = params.mask ? await imageToBuffer(params.mask) : undefined;
        
        // Create File objects
        const imageFile = new File([imageBuffer], "image.png", { type: "image/png" });
        const maskFile = maskBuffer ? new File([maskBuffer], "mask.png", { type: "image/png" }) : undefined;
        
        const editParams: any = {
          image: imageFile,
          prompt: params.prompt,
          model: params.model,
          n: params.n,
          size: params.size,
          response_format: params.response_format,
          user: params.user,
        };
        
        if (maskFile) {
          editParams.mask = maskFile;
        }
        
        const image = await openai.images.edit(editParams);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(image, null, 2),
            },
          ],
        };
      }

      case "create_image_variation": {
        const params = CreateImageVariationSchema.parse(args);
        
        // Convert image to buffer
        const imageBuffer = await imageToBuffer(params.image);
        
        // Create File object
        const imageFile = new File([imageBuffer], "image.png", { type: "image/png" });
        
        const image = await openai.images.createVariation({
          image: imageFile,
          model: params.model,
          n: params.n,
          response_format: params.response_format,
          size: params.size,
          user: params.user,
        } as any);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(image, null, 2),
            },
          ],
        };
      }

      case "list_models": {
        const models = await openai.models.list();
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(models, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid input parameters: ${error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
      );
    }
    
    if (error instanceof OpenAI.APIError) {
      throw new Error(
        `OpenAI API error (${error.status}): ${error.message}`
      );
    }
    
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OpenAI MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});