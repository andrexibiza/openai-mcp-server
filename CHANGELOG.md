# Changelog

All notable changes to the OpenAI MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-14

### Added
- Initial release of OpenAI MCP Server
- **Chat Completions Tool** (`chat_completion`)
  - Support for GPT-4, GPT-4 Turbo, GPT-3.5, and other OpenAI chat models
  - Full parameter support: temperature, max_tokens, top_p, frequency_penalty, presence_penalty
  - System prompts and multi-turn conversation support
  - Configurable stop sequences and user identifiers
- **Text Embeddings Tool** (`create_embedding`)
  - Support for text-embedding-3-small, text-embedding-3-large, and text-embedding-ada-002
  - Batch processing for multiple texts
  - Custom dimensions support for v3 models
  - Float and base64 encoding formats
- **Image Generation Tool** (`generate_image`)
  - DALL-E 2 and DALL-E 3 support
  - Multiple size options (256x256 to 1792x1024)
  - Quality settings (standard and HD for DALL-E 3)
  - Style options (vivid and natural for DALL-E 3)
  - Multiple image generation (DALL-E 2)
- **Image Editing Tool** (`edit_image`)
  - Edit images with masks using DALL-E 2
  - Support for URLs and base64-encoded images
  - Flexible mask specification
- **Image Variations Tool** (`create_image_variation`)
  - Generate variations of existing images using DALL-E 2
  - Multiple variations support
  - Various size options
- **Model Discovery Tool** (`list_models`)
  - List all available OpenAI models
  - Model metadata including creation dates and ownership
- **Type Safety**
  - Full TypeScript implementation
  - Zod schema validation for all inputs
  - Comprehensive type definitions
- **Error Handling**
  - Detailed validation error messages
  - OpenAI API error forwarding with status codes
  - Model-specific constraint validation
- **Image Processing Utilities**
  - URL and base64 image handling
  - PNG format validation
  - Image size validation
  - Buffer conversion utilities
- **Documentation**
  - Comprehensive README with setup instructions
  - Detailed tool documentation with parameters
  - Usage examples for all tools
  - Security best practices
  - Troubleshooting guide
- **Development Tools**
  - TypeScript configuration for ES2022
  - Build and watch scripts
  - Environment variable management
- **Testing Infrastructure**
  - Jest test suite for all tools
  - GitHub Actions CI/CD workflow
  - Automated build and test on push
- **Examples**
  - Real-world usage examples for all tools
  - Advanced patterns (RAG, semantic search)
  - Error handling examples

### Security
- Environment variable-based API key management
- API key validation and redaction utilities
- Secure handling of sensitive information
- .gitignore configured to prevent API key commits

### Developer Experience
- Clear error messages with field-level validation details
- Consistent JSON response formatting
- Helper utilities for common tasks
- Comprehensive inline documentation

### Compatibility
- Node.js 18.0.0 or higher required
- Compatible with MCP SDK 0.5.0
- OpenAI API v4.67.0 support
- Works with Claude Desktop and other MCP clients

[1.0.0]: https://github.com/andrexibiza/openai-mcp-server/releases/tag/v1.0.0