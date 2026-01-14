/**
 * Utility functions for OpenAI MCP Server
 */

import { z } from "zod";

/**
 * Image format validator
 */
export const ImageFormatSchema = z.union([
  z.string().startsWith("http://"),
  z.string().startsWith("https://"),
  z.string().startsWith("data:image/png;base64,"),
  z.string().regex(/^[A-Za-z0-9+/]+={0,2}$/), // Base64 without data URL prefix
]);

/**
 * Convert various image input formats to Buffer
 * Supports: URLs (http/https), data URLs, and base64 strings
 */
export async function imageToBuffer(imageData: string): Promise<Buffer> {
  // Handle HTTP/HTTPS URLs
  if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
    try {
      const response = await fetch(imageData);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch image from URL: ${response.status} ${response.statusText}`
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      throw new Error(`Error fetching image from URL: ${error.message}`);
    }
  }

  // Handle data URLs (e.g., data:image/png;base64,...)
  if (imageData.startsWith("data:image")) {
    const matches = imageData.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid data URL format");
    }
    const [, format, base64Data] = matches;
    if (format !== "png") {
      throw new Error(`Unsupported image format: ${format}. Only PNG is supported.`);
    }
    return Buffer.from(base64Data, "base64");
  }

  // Handle raw base64 strings
  try {
    return Buffer.from(imageData, "base64");
  } catch (error) {
    throw new Error("Invalid base64 image data");
  }
}

/**
 * Convert Buffer to base64 data URL
 */
export function bufferToDataURL(buffer: Buffer, mimeType: string = "image/png"): string {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Validate that an image is in PNG format
 */
export function validatePNGFormat(buffer: Buffer): boolean {
  // PNG files start with the signature: 89 50 4E 47 0D 0A 1A 0A
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 8) {
    return false;
  }
  return buffer.subarray(0, 8).equals(pngSignature);
}

/**
 * Calculate the size of an image buffer in megabytes
 */
export function getImageSizeMB(buffer: Buffer): number {
  return buffer.length / (1024 * 1024);
}

/**
 * Validate image size constraints
 */
export function validateImageSize(
  buffer: Buffer,
  maxSizeMB: number = 4
): { valid: boolean; sizeMB: number } {
  const sizeMB = getImageSizeMB(buffer);
  return {
    valid: sizeMB <= maxSizeMB,
    sizeMB,
  };
}

/**
 * Sanitize and truncate text for prompts
 */
export function sanitizePrompt(prompt: string, maxLength: number = 4000): string {
  // Remove excessive whitespace
  let sanitized = prompt.trim().replace(/\s+/g, " ");

  // Truncate if needed
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate DALL-E model constraints
 */
export function validateDALLEParams(params: {
  model: string;
  size?: string;
  quality?: string;
  style?: string;
  n?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (params.model === "dall-e-3") {
    // DALL-E 3 constraints
    if (params.n && params.n > 1) {
      errors.push("DALL-E 3 only supports n=1");
    }
    if (
      params.size &&
      !["1024x1024", "1792x1024", "1024x1792"].includes(params.size)
    ) {
      errors.push(
        "DALL-E 3 only supports sizes: 1024x1024, 1792x1024, 1024x1792"
      );
    }
  } else if (params.model === "dall-e-2") {
    // DALL-E 2 constraints
    if (params.quality === "hd") {
      errors.push("DALL-E 2 does not support 'hd' quality");
    }
    if (params.style) {
      errors.push("DALL-E 2 does not support 'style' parameter");
    }
    if (
      params.size &&
      !["256x256", "512x512", "1024x1024"].includes(params.size)
    ) {
      errors.push(
        "DALL-E 2 only supports sizes: 256x256, 512x512, 1024x1024"
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse size string to width and height
 */
export function parseImageSize(size: string): { width: number; height: number } {
  const [width, height] = size.split("x").map(Number);
  return { width, height };
}

/**
 * Check if a size is valid for a given model
 */
export function isValidImageSize(size: string, model: string): boolean {
  const validSizes: Record<string, string[]> = {
    "dall-e-2": ["256x256", "512x512", "1024x1024"],
    "dall-e-3": ["1024x1024", "1792x1024", "1024x1792"],
  };

  return validSizes[model]?.includes(size) ?? false;
}

/**
 * Format token usage for display
 */
export function formatTokenUsage(usage: {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens: number;
}): string {
  if (usage.prompt_tokens !== undefined && usage.completion_tokens !== undefined) {
    return `${usage.total_tokens} tokens (${usage.prompt_tokens} prompt + ${usage.completion_tokens} completion)`;
  }
  return `${usage.total_tokens} tokens`;
}

/**
 * Estimate cost for OpenAI API calls (approximate pricing)
 */
export function estimateCost(params: {
  model: string;
  tokens?: number;
  images?: number;
  imageSize?: string;
  imageQuality?: string;
}): number {
  const { model, tokens = 0, images = 0, imageSize, imageQuality } = params;

  // Pricing as of 2024 (subject to change)
  const pricing: Record<string, any> = {
    "gpt-4o": { input: 0.005 / 1000, output: 0.015 / 1000 },
    "gpt-4-turbo": { input: 0.01 / 1000, output: 0.03 / 1000 },
    "gpt-4": { input: 0.03 / 1000, output: 0.06 / 1000 },
    "gpt-3.5-turbo": { input: 0.0005 / 1000, output: 0.0015 / 1000 },
    "text-embedding-3-small": { input: 0.00002 / 1000 },
    "text-embedding-3-large": { input: 0.00013 / 1000 },
    "dall-e-3": {
      "1024x1024": { standard: 0.04, hd: 0.08 },
      "1024x1792": { standard: 0.08, hd: 0.12 },
      "1792x1024": { standard: 0.08, hd: 0.12 },
    },
    "dall-e-2": {
      "256x256": 0.016,
      "512x512": 0.018,
      "1024x1024": 0.02,
    },
  };

  let cost = 0;

  // Calculate token costs
  if (tokens > 0 && pricing[model]?.input) {
    cost += tokens * pricing[model].input;
  }

  // Calculate image costs
  if (images > 0 && model.startsWith("dall-e")) {
    if (model === "dall-e-3" && imageSize) {
      const quality = imageQuality || "standard";
      cost += images * (pricing[model][imageSize]?.[quality] || 0);
    } else if (model === "dall-e-2" && imageSize) {
      cost += images * (pricing[model][imageSize] || 0);
    }
  }

  return cost;
}

/**
 * Create a retry delay with exponential backoff
 */
export function exponentialBackoff(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 32000);
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate API key format (basic check)
 */
export function validateAPIKey(apiKey: string): boolean {
  // OpenAI keys typically start with 'sk-' and are alphanumeric
  return /^sk-[a-zA-Z0-9]{20,}$/.test(apiKey);
}

/**
 * Redact sensitive information from strings (for logging)
 */
export function redactAPIKey(text: string): string {
  return text.replace(/sk-[a-zA-Z0-9]{20,}/g, "sk-***REDACTED***");
}

/**
 * Check if a model supports a specific feature
 */
export function supportsFeature(model: string, feature: string): boolean {
  const featureSupport: Record<string, string[]> = {
    streaming: ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
    functions: ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
    vision: ["gpt-4o", "gpt-4-turbo"],
    json_mode: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  };

  return featureSupport[feature]?.includes(model) ?? false;
}

/**
 * Extract model family from model name
 */
export function getModelFamily(model: string): string {
  if (model.startsWith("gpt-4")) return "gpt-4";
  if (model.startsWith("gpt-3.5")) return "gpt-3.5";
  if (model.startsWith("text-embedding")) return "embedding";
  if (model.startsWith("dall-e")) return "dall-e";
  return "unknown";
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}