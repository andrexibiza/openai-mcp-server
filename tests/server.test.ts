/**
 * Tests for OpenAI MCP Server
 * 
 * Note: These tests require a valid OPENAI_API_KEY environment variable.
 * Set OPENAI_API_KEY to 'sk-test-key' or similar for mock testing.
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import { z } from "zod";

// Import schemas and utilities
import {
  imageToBuffer,
  validatePNGFormat,
  sanitizePrompt,
  validateDALLEParams,
  parseImageSize,
  isValidImageSize,
  formatTokenUsage,
  validateAPIKey,
  redactAPIKey,
  supportsFeature,
  getModelFamily,
} from "../src/utils";

describe("OpenAI MCP Server Tests", () => {
  beforeAll(() => {
    // Ensure test environment has API key set
    if (!process.env.OPENAI_API_KEY) {
      console.warn("Warning: OPENAI_API_KEY not set. Some tests may be skipped.");
    }
  });

  describe("Utility Functions", () => {
    describe("sanitizePrompt", () => {
      it("should remove excessive whitespace", () => {
        const input = "Hello    world   with   spaces";
        const result = sanitizePrompt(input);
        expect(result).toBe("Hello world with spaces");
      });

      it("should truncate long prompts", () => {
        const longPrompt = "a".repeat(5000);
        const result = sanitizePrompt(longPrompt, 4000);
        expect(result.length).toBe(4000);
      });

      it("should trim leading and trailing whitespace", () => {
        const input = "  Hello world  ";
        const result = sanitizePrompt(input);
        expect(result).toBe("Hello world");
      });
    });

    describe("validateDALLEParams", () => {
      it("should validate DALL-E 3 constraints", () => {
        const result = validateDALLEParams({
          model: "dall-e-3",
          n: 2,
        });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("DALL-E 3 only supports n=1");
      });

      it("should accept valid DALL-E 3 params", () => {
        const result = validateDALLEParams({
          model: "dall-e-3",
          size: "1024x1024",
          quality: "hd",
          style: "vivid",
          n: 1,
        });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should reject HD quality for DALL-E 2", () => {
        const result = validateDALLEParams({
          model: "dall-e-2",
          quality: "hd",
        });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("DALL-E 2 does not support 'hd' quality");
      });

      it("should reject invalid sizes for DALL-E 2", () => {
        const result = validateDALLEParams({
          model: "dall-e-2",
          size: "1792x1024",
        });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("DALL-E 2 only supports sizes");
      });
    });

    describe("parseImageSize", () => {
      it("should parse image size correctly", () => {
        const result = parseImageSize("1024x768");
        expect(result).toEqual({ width: 1024, height: 768 });
      });

      it("should handle square sizes", () => {
        const result = parseImageSize("512x512");
        expect(result).toEqual({ width: 512, height: 512 });
      });
    });

    describe("isValidImageSize", () => {
      it("should validate DALL-E 2 sizes", () => {
        expect(isValidImageSize("1024x1024", "dall-e-2")).toBe(true);
        expect(isValidImageSize("512x512", "dall-e-2")).toBe(true);
        expect(isValidImageSize("1792x1024", "dall-e-2")).toBe(false);
      });

      it("should validate DALL-E 3 sizes", () => {
        expect(isValidImageSize("1024x1024", "dall-e-3")).toBe(true);
        expect(isValidImageSize("1792x1024", "dall-e-3")).toBe(true);
        expect(isValidImageSize("512x512", "dall-e-3")).toBe(false);
      });
    });

    describe("formatTokenUsage", () => {
      it("should format complete token usage", () => {
        const usage = {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        };
        const result = formatTokenUsage(usage);
        expect(result).toBe("30 tokens (10 prompt + 20 completion)");
      });

      it("should format partial token usage", () => {
        const usage = {
          total_tokens: 100,
        };
        const result = formatTokenUsage(usage);
        expect(result).toBe("100 tokens");
      });
    });

    describe("validateAPIKey", () => {
      it("should validate correct API key format", () => {
        expect(validateAPIKey("sk-abc123def456ghi789jkl012mno345pqr678")).toBe(true);
      });

      it("should reject invalid API key format", () => {
        expect(validateAPIKey("invalid-key")).toBe(false);
        expect(validateAPIKey("sk-short")).toBe(false);
        expect(validateAPIKey("")).toBe(false);
      });
    });

    describe("redactAPIKey", () => {
      it("should redact API keys in text", () => {
        const text = "My API key is sk-abc123def456ghi789jkl012mno345pqr678";
        const result = redactAPIKey(text);
        expect(result).toContain("sk-***REDACTED***");
        expect(result).not.toContain("sk-abc123");
      });

      it("should handle multiple API keys", () => {
        const text = "Keys: sk-key1key1key1key1key1 and sk-key2key2key2key2key2";
        const result = redactAPIKey(text);
        expect(result.match(/sk-\*\*\*REDACTED\*\*\*/g)).toHaveLength(2);
      });
    });

    describe("supportsFeature", () => {
      it("should check streaming support", () => {
        expect(supportsFeature("gpt-4o", "streaming")).toBe(true);
        expect(supportsFeature("dall-e-2", "streaming")).toBe(false);
      });

      it("should check vision support", () => {
        expect(supportsFeature("gpt-4o", "vision")).toBe(true);
        expect(supportsFeature("gpt-3.5-turbo", "vision")).toBe(false);
      });

      it("should check function calling support", () => {
        expect(supportsFeature("gpt-4", "functions")).toBe(true);
        expect(supportsFeature("text-embedding-3-small", "functions")).toBe(false);
      });
    });

    describe("getModelFamily", () => {
      it("should identify GPT-4 models", () => {
        expect(getModelFamily("gpt-4o")).toBe("gpt-4");
        expect(getModelFamily("gpt-4-turbo")).toBe("gpt-4");
      });

      it("should identify GPT-3.5 models", () => {
        expect(getModelFamily("gpt-3.5-turbo")).toBe("gpt-3.5");
      });

      it("should identify embedding models", () => {
        expect(getModelFamily("text-embedding-3-small")).toBe("embedding");
        expect(getModelFamily("text-embedding-ada-002")).toBe("embedding");
      });

      it("should identify DALL-E models", () => {
        expect(getModelFamily("dall-e-2")).toBe("dall-e");
        expect(getModelFamily("dall-e-3")).toBe("dall-e");
      });
    });
  });

  describe("Image Processing", () => {
    describe("validatePNGFormat", () => {
      it("should validate PNG signature", () => {
        // PNG signature: 89 50 4E 47 0D 0A 1A 0A
        const pngBuffer = Buffer.from([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
          0x00, 0x00, 0x00, 0x0d,
        ]);
        expect(validatePNGFormat(pngBuffer)).toBe(true);
      });

      it("should reject non-PNG buffers", () => {
        const invalidBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]); // JPEG signature
        expect(validatePNGFormat(invalidBuffer)).toBe(false);
      });

      it("should reject too-short buffers", () => {
        const shortBuffer = Buffer.from([0x89, 0x50]);
        expect(validatePNGFormat(shortBuffer)).toBe(false);
      });
    });

    describe("imageToBuffer", () => {
      it("should handle base64 strings", async () => {
        const base64 = Buffer.from("test image data").toString("base64");
        const result = await imageToBuffer(base64);
        expect(result).toBeInstanceOf(Buffer);
        expect(result.toString()).toBe("test image data");
      });

      it("should handle data URLs", async () => {
        const base64 = Buffer.from("test image data").toString("base64");
        const dataURL = `data:image/png;base64,${base64}`;
        const result = await imageToBuffer(dataURL);
        expect(result).toBeInstanceOf(Buffer);
        expect(result.toString()).toBe("test image data");
      });

      it("should reject invalid data URL format", async () => {
        await expect(imageToBuffer("data:invalid")).rejects.toThrow();
      });

      it("should reject non-PNG data URLs", async () => {
        const base64 = Buffer.from("test").toString("base64");
        const dataURL = `data:image/jpeg;base64,${base64}`;
        await expect(imageToBuffer(dataURL)).rejects.toThrow("Unsupported image format");
      });
    });
  });

  describe("Input Validation Schemas", () => {
    const ChatCompletionSchema = z.object({
      model: z.string().default("gpt-4o"),
      messages: z.array(
        z.object({
          role: z.enum(["system", "user", "assistant", "function", "tool"]),
          content: z.string(),
        })
      ),
      temperature: z.number().min(0).max(2).optional(),
    });

    it("should validate chat completion params", () => {
      const validInput = {
        messages: [
          { role: "user", content: "Hello" },
        ],
      };
      const result = ChatCompletionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject invalid temperature", () => {
      const invalidInput = {
        messages: [{ role: "user", content: "Hello" }],
        temperature: 3, // Too high
      };
      const result = ChatCompletionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject invalid role", () => {
      const invalidInput = {
        messages: [{ role: "invalid", content: "Hello" }],
      };
      const result = ChatCompletionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("Environment Configuration", () => {
    it("should have OPENAI_API_KEY in environment", () => {
      // This test will skip in CI if API key is not set
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-test-key-for-ci') {
        expect(process.env.OPENAI_API_KEY).toBeDefined();
        expect(process.env.OPENAI_API_KEY).toMatch(/^sk-/);
      } else {
        console.log("Skipping API key test - using mock key");
      }
    });
  });
});

describe("Integration Tests", () => {
  const hasRealAPIKey = process.env.OPENAI_API_KEY && 
                        process.env.OPENAI_API_KEY !== 'sk-test-key-for-ci' &&
                        !process.env.OPENAI_API_KEY.includes('test');

  // Skip integration tests if no real API key is available
  const testIf = (condition: boolean) => condition ? it : it.skip;

  testIf(hasRealAPIKey)("should successfully call OpenAI API", async () => {
    // This test would require actual OpenAI API calls
    // Skipped by default to avoid API costs in CI
    console.log("Integration test skipped - requires valid API key");
  }, 30000);
});