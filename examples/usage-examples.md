# OpenAI MCP Server - Usage Examples

This document provides comprehensive, real-world examples for using each tool in the OpenAI MCP Server.

## Table of Contents

- [Chat Completions](#chat-completions)
- [Text Embeddings](#text-embeddings)
- [Image Generation](#image-generation)
- [Image Editing](#image-editing)
- [Image Variations](#image-variations)
- [Model Discovery](#model-discovery)

---

## Chat Completions

### Example 1: Simple Question and Answer

**Tool Call:**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "temperature": 0.7
}
```

**Expected Response:**
```json
{
  "id": "chatcmpl-123abc",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 14,
    "completion_tokens": 8,
    "total_tokens": 22
  }
}
```

### Example 2: Code Generation with System Prompt

**Tool Call:**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert Python developer. Provide clean, well-documented code with explanations."
    },
    {
      "role": "user",
      "content": "Write a Python function to calculate the Fibonacci sequence up to n terms using dynamic programming."
    }
  ],
  "temperature": 0.3,
  "max_tokens": 500
}
```

**Expected Response:**
```json
{
  "id": "chatcmpl-456def",
  "object": "chat.completion",
  "created": 1677652300,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here's an efficient Python function to calculate the Fibonacci sequence using dynamic programming:\n\n```python\ndef fibonacci(n):\n    \"\"\"\n    Calculate Fibonacci sequence up to n terms using dynamic programming.\n    \n    Args:\n        n (int): Number of terms to generate\n    \n    Returns:\n        list: Fibonacci sequence with n terms\n    \"\"\"\n    if n <= 0:\n        return []\n    elif n == 1:\n        return [0]\n    \n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[i-1] + fib[i-2])\n    \n    return fib\n\n# Example usage\nprint(fibonacci(10))  # Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n```\n\nThis implementation uses O(n) space and O(n) time complexity, storing all previous values for easy access."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 215,
    "total_tokens": 260
  }
}
```

### Example 3: Multi-turn Conversation

**Tool Call:**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a knowledgeable science tutor who explains complex topics simply."
    },
    {
      "role": "user",
      "content": "What is quantum entanglement?"
    },
    {
      "role": "assistant",
      "content": "Quantum entanglement is a phenomenon where two particles become connected in such a way that the state of one instantly influences the state of the other, no matter how far apart they are. It's like having two magic coins that always land on opposite sides when flipped, even if they're on opposite sides of the universe."
    },
    {
      "role": "user",
      "content": "Can we use it for faster-than-light communication?"
    }
  ],
  "temperature": 0.7
}
```

### Example 4: Creative Writing with High Temperature

**Tool Call:**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a creative fiction writer with a unique, imaginative style."
    },
    {
      "role": "user",
      "content": "Write the opening paragraph of a sci-fi story about a robot discovering emotions."
    }
  ],
  "temperature": 1.2,
  "max_tokens": 200,
  "top_p": 0.9
}
```

### Example 5: JSON Output with Low Temperature

**Tool Call:**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a data extraction assistant. Always respond with valid JSON."
    },
    {
      "role": "user",
      "content": "Extract the key information from this text into JSON format: John Smith, age 35, works as a software engineer at TechCorp in San Francisco. His email is john.smith@techcorp.com."
    }
  ],
  "temperature": 0.1,
  "max_tokens": 200
}
```

---

## Text Embeddings

### Example 1: Single Text Embedding

**Tool Call:**
```json
{
  "model": "text-embedding-3-small",
  "input": "The quick brown fox jumps over the lazy dog"
}
```

**Expected Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [
        0.0023064255,
        -0.009327292,
        -0.0028842222,
        // ... (1536 dimensions for text-embedding-3-small)
      ],
      "index": 0
    }
  ],
  "model": "text-embedding-3-small",
  "usage": {
    "prompt_tokens": 9,
    "total_tokens": 9
  }
}
```

### Example 2: Batch Embedding for Semantic Search

**Tool Call:**
```json
{
  "model": "text-embedding-3-large",
  "input": [
    "Machine learning is a subset of artificial intelligence",
    "Deep learning uses neural networks with multiple layers",
    "Natural language processing enables computers to understand human language",
    "Computer vision allows machines to interpret visual information",
    "Reinforcement learning trains agents through rewards and penalties"
  ]
}
```

**Use Case:** Create a semantic search engine by comparing cosine similarity between embeddings.

### Example 3: Custom Dimensions (text-embedding-3 models)

**Tool Call:**
```json
{
  "model": "text-embedding-3-large",
  "input": "Reduce the dimensionality for faster computation",
  "dimensions": 256
}
```

**Use Case:** Reduce embedding size from default (3072 for large) to 256 dimensions for faster processing while maintaining good quality.

---

## Image Generation

### Example 1: Simple Image Generation (DALL-E 3)

**Tool Call:**
```json
{
  "prompt": "A serene Japanese garden with a red bridge over a koi pond, cherry blossoms, mountains in the background, watercolor painting style",
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "standard",
  "style": "vivid"
}
```

**Expected Response:**
```json
{
  "created": 1677652400,
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/...",
      "revised_prompt": "A tranquil Japanese garden featuring a vibrant red bridge gracefully arching over a serene koi pond. Cherry blossom trees in full bloom frame the scene with delicate pink petals. In the distance, majestic mountains rise against the sky. The entire scene is rendered in a soft watercolor painting style with flowing brushstrokes and gentle color transitions."
    }
  ]
}
```

### Example 2: High-Quality Landscape (DALL-E 3)

**Tool Call:**
```json
{
  "prompt": "Futuristic city skyline at night with neon lights, flying cars, and holographic advertisements, cyberpunk aesthetic, highly detailed, 4K quality",
  "model": "dall-e-3",
  "size": "1792x1024",
  "quality": "hd",
  "style": "vivid"
}
```

**Use Case:** Create wide-format, high-quality images for presentations or desktop wallpapers.

### Example 3: Natural Photography Style

**Tool Call:**
```json
{
  "prompt": "A golden retriever puppy playing in a field of sunflowers at golden hour, natural lighting, professional photography",
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "hd",
  "style": "natural"
}
```

**Use Case:** Generate realistic, photographic images with natural lighting and composition.

### Example 4: Multiple Variations (DALL-E 2)

**Tool Call:**
```json
{
  "prompt": "A cute robot mascot for a tech startup, friendly and approachable, simple design",
  "model": "dall-e-2",
  "n": 4,
  "size": "512x512"
}
```

**Use Case:** Generate multiple options to choose from for logos or mascots.

### Example 5: Portrait Orientation

**Tool Call:**
```json
{
  "prompt": "A tall ancient library with endless shelves of books reaching into darkness, magical atmosphere, fantasy art",
  "model": "dall-e-3",
  "size": "1024x1792",
  "quality": "hd",
  "style": "vivid"
}
```

**Use Case:** Create portrait-oriented images for mobile wallpapers or social media stories.

---

## Image Editing

### Example 1: Add Object to Image

**Tool Call:**
```json
{
  "image": "https://example.com/room.png",
  "mask": "https://example.com/mask-table-area.png",
  "prompt": "A modern glass coffee table with a vase of fresh flowers",
  "model": "dall-e-2",
  "size": "1024x1024",
  "n": 2
}
```

**Use Case:** Add furniture or objects to interior design photos. The mask indicates where the table should appear.

### Example 2: Change Background

**Tool Call:**
```json
{
  "image": "https://example.com/product.png",
  "mask": "https://example.com/background-mask.png",
  "prompt": "Clean white studio background with soft shadows",
  "model": "dall-e-2",
  "size": "1024x1024"
}
```

**Use Case:** Replace product photo backgrounds for e-commerce listings.

### Example 3: Remove Unwanted Objects

**Tool Call:**
```json
{
  "image": "https://example.com/landscape.png",
  "mask": "https://example.com/object-to-remove-mask.png",
  "prompt": "Natural landscape with grass and trees",
  "model": "dall-e-2",
  "size": "1024x1024"
}
```

**Use Case:** Remove unwanted objects from photos by masking them and describing the desired replacement.

### Example 4: Edit with Base64 Images

**Tool Call:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
  "mask": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
  "prompt": "A red sports car",
  "model": "dall-e-2",
  "size": "512x512"
}
```

**Use Case:** Edit images directly from base64-encoded data without needing URLs.

---

## Image Variations

### Example 1: Logo Variations

**Tool Call:**
```json
{
  "image": "https://example.com/original-logo.png",
  "model": "dall-e-2",
  "n": 4,
  "size": "512x512"
}
```

**Expected Response:**
```json
{
  "created": 1677652500,
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/variation1..."
    },
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/variation2..."
    },
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/variation3..."
    },
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/variation4..."
    }
  ]
}
```

**Use Case:** Generate alternative versions of a logo design for client presentations.

### Example 2: Art Style Exploration

**Tool Call:**
```json
{
  "image": "https://example.com/original-artwork.png",
  "model": "dall-e-2",
  "n": 3,
  "size": "1024x1024"
}
```

**Use Case:** Create variations of artwork to explore different interpretations of the same concept.

### Example 3: Product Mockup Variations

**Tool Call:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
  "model": "dall-e-2",
  "n": 2,
  "size": "512x512",
  "response_format": "b64_json"
}
```

**Use Case:** Generate product mockup variations and receive them as base64 for direct embedding in applications.

---

## Model Discovery

### Example 1: List All Models

**Tool Call:**
```json
{}
```

**Expected Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 1687882410,
      "owned_by": "openai"
    },
    {
      "id": "gpt-4-turbo",
      "object": "model",
      "created": 1687882411,
      "owned_by": "openai"
    },
    {
      "id": "gpt-3.5-turbo",
      "object": "model",
      "created": 1677649963,
      "owned_by": "openai"
    },
    {
      "id": "text-embedding-3-small",
      "object": "model",
      "created": 1705948997,
      "owned_by": "openai"
    },
    {
      "id": "text-embedding-3-large",
      "object": "model",
      "created": 1705953180,
      "owned_by": "openai"
    },
    {
      "id": "dall-e-3",
      "object": "model",
      "created": 1698785189,
      "owned_by": "openai"
    },
    {
      "id": "dall-e-2",
      "object": "model",
      "created": 1698785190,
      "owned_by": "openai"
    }
  ]
}
```

**Use Case:** Discover available models before making API calls, or validate that a specific model is accessible.

---

## Advanced Patterns

### Pattern 1: Semantic Search Pipeline

1. **Generate embeddings for documents:**
```json
{
  "model": "text-embedding-3-small",
  "input": [
    "Document 1 content...",
    "Document 2 content...",
    "Document 3 content..."
  ]
}
```

2. **Store embeddings in a vector database**

3. **Generate query embedding:**
```json
{
  "model": "text-embedding-3-small",
  "input": "User search query"
}
```

4. **Calculate cosine similarity and return top results**

### Pattern 2: RAG (Retrieval Augmented Generation)

1. **Retrieve relevant documents using embeddings**
2. **Pass context to chat completion:**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant. Answer questions based on the provided context."
    },
    {
      "role": "user",
      "content": "Context: [Retrieved documents]\n\nQuestion: What is the main topic?"
    }
  ],
  "temperature": 0.3
}
```

### Pattern 3: Iterative Image Refinement

1. **Generate initial image:**
```json
{
  "prompt": "A modern office space",
  "model": "dall-e-3",
  "size": "1024x1024"
}
```

2. **Edit specific elements:**
```json
{
  "image": "[URL from step 1]",
  "mask": "[Mask for desk area]",
  "prompt": "A sleek standing desk with dual monitors",
  "model": "dall-e-2"
}
```

3. **Create variations for final selection:**
```json
{
  "image": "[URL from step 2]",
  "model": "dall-e-2",
  "n": 3
}
```

---

## Tips for Best Results

### Chat Completions
- Use lower temperature (0.1-0.3) for factual, deterministic outputs
- Use higher temperature (0.8-1.5) for creative, varied outputs
- Set `max_tokens` to control response length and costs
- Use system prompts to establish context and behavior

### Embeddings
- Use `text-embedding-3-small` for cost-effective semantic search
- Use `text-embedding-3-large` for highest quality
- Batch process multiple texts in a single API call for efficiency
- Store embeddings for reuse instead of regenerating

### Image Generation
- Be specific and descriptive in prompts
- Include style descriptors ("photorealistic", "watercolor", "3D render")
- Specify lighting and atmosphere for better results
- Use DALL-E 3 for highest quality and better prompt understanding
- Use DALL-E 2 when you need multiple variations (n > 1)

### Image Editing
- Ensure masks are PNG with transparency
- Transparent areas in the mask indicate what to edit
- Be clear about what should replace the masked area
- Images must be square and in PNG format

### Image Variations
- Works best with clear, well-composed images
- Results maintain the general composition but vary details
- Use for exploring design alternatives quickly

---

## Error Handling Examples

### Invalid Model Error
```json
{
  "error": "OpenAI API error (404): The model 'gpt-5' does not exist"
}
```

### Rate Limit Error
```json
{
  "error": "OpenAI API error (429): Rate limit exceeded. Please retry after 20 seconds."
}
```

### Invalid Parameters Error
```json
{
  "error": "Invalid input parameters: temperature: Number must be less than or equal to 2"
}
```

---

For more information, see the [OpenAI API Documentation](https://platform.openai.com/docs) and the [main README](../README.md).