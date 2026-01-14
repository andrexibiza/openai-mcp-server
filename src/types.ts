/**
 * Type definitions for OpenAI MCP Server
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "function" | "tool";
  content: string;
  name?: string;
}

export interface ChatCompletionParams {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  user?: string;
}

export interface CreateEmbeddingParams {
  model: string;
  input: string | string[];
  encoding_format?: "float" | "base64";
  dimensions?: number;
  user?: string;
}

export interface GenerateImageParams {
  prompt: string;
  model?: "dall-e-2" | "dall-e-3";
  n?: number;
  quality?: "standard" | "hd";
  response_format?: "url" | "b64_json";
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
  style?: "vivid" | "natural";
  user?: string;
}

export interface EditImageParams {
  image: string;
  mask?: string;
  prompt: string;
  model?: "dall-e-2";
  n?: number;
  size?: "256x256" | "512x512" | "1024x1024";
  response_format?: "url" | "b64_json";
  user?: string;
}

export interface CreateImageVariationParams {
  image: string;
  model?: "dall-e-2";
  n?: number;
  response_format?: "url" | "b64_json";
  size?: "256x256" | "512x512" | "1024x1024";
  user?: string;
}

export interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface ImageResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

export interface ModelsListResponse {
  object: string;
  data: OpenAIModel[];
}