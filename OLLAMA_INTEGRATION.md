# Ollama Local LLM Integration 🦙

## Overview

Ollama support has been added to the ModelRouter, giving you **100% free, local LLM** capabilities for development!

### Why Ollama?

✅ **Free** - No API costs whatsoever
✅ **Private** - Data never leaves your machine
✅ **Fast** - No network latency
✅ **Offline** - Works without internet
✅ **Flexible** - Switch models easily

---

## Setup

### 1. Ollama is Already Installed!

You mentioned Ollama is fully installed on your machine. To use it:

```bash
# Ensure Ollama service is running
ollama serve

# In another terminal, pull recommended models:
ollama pull llama3.2        # Best general model (3B params)
ollama pull mistral         # Fast alternative
ollama pull llama3.2:1b     # Tiny, super fast
```

### 2. Verify Installation

```bash
# List available models
ollama list

# Test a model
ollama run llama3.2
>>> Hi, can you help me plan a trip?
```

---

## How It Works

### Automatic Priority in Development

When `NODE_ENV=development`, the ModelRouter **automatically uses Ollama first**:

```typescript
// In development mode
const router = new ModelRouter();
const response = await router.chat(messages);
// 🦙 Uses Ollama automatically!

// In production mode
// ☁️ Uses cloud providers (Gemini, GPT, Claude)
```

### Fallback Mechanism

If Ollama is unavailable, the router seamlessly falls back to cloud providers:

```
1. Try Ollama (if development mode) → ❌ Failed
2. Try Gemini/GPT/Claude → ✅ Success
```

---

## Usage Examples

### Basic Usage

```typescript
import { ModelRouter } from './lib/llm';

const router = new ModelRouter();

// Automatically uses Ollama in development
const response = await router.chat([
  { role: 'system', content: 'You are a travel assistant' },
  { role: 'user', content: 'Suggest a 3-day Paris itinerary' }
]);

console.log(response.message);
// Full itinerary generated locally, for free!
```

### Force Ollama Usage

```typescript
// Force Ollama even in production
const response = await router.chat(messages, {
  forceProvider: 'ollama'
});
```

### Direct Ollama Client

```typescript
import { OllamaClient } from './lib/llm';

const ollama = new OllamaClient();

// Check if available
if (await ollama.isAvailable()) {
  const response = await ollama.chat(messages);
}

// List models
const models = await ollama.listModels();
console.log('Available models:', models);
```

### Use Different Model

```typescript
import { OllamaClient } from './lib/llm';

// Use Mistral instead of Llama
const ollama = new OllamaClient('http://localhost:11434', 'mistral');
const response = await ollama.chat(messages);
```

---

## Recommended Models for Travel Assistant

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| **llama3.2** | 3B | Fast | Excellent | **Recommended** - Best balance |
| **mistral** | 7B | Medium | Excellent | High-quality responses |
| **llama3.2:1b** | 1B | Very Fast | Good | Quick testing |
| **llama3:8b** | 8B | Slower | Best | Production-quality |

### Pull a Model

```bash
ollama pull llama3.2
```

### Switch Models in Code

```typescript
// In lib/llm/model-router.ts
constructor() {
  // ...
  this.ollama = new OllamaClient(
    'http://localhost:11434',
    'mistral'  // Change this
  );
}
```

---

## Configuration

### Environment Variables

```bash
# In .env
NODE_ENV=development              # Enables Ollama-first routing

# Or force Ollama even in production
USE_OLLAMA_FIRST=true

# Custom Ollama URL (if not using default)
OLLAMA_BASE_URL=http://localhost:11434
```

### ModelRouter Configuration

The router is pre-configured, but you can customize:

```typescript
// lib/llm/model-router.ts

constructor() {
  // Custom Ollama URL or model
  this.ollama = new OllamaClient(
    process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    process.env.OLLAMA_MODEL || 'llama3.2'
  );

  // Control when to use Ollama
  this.useOllamaFirst =
    process.env.NODE_ENV === 'development' ||
    process.env.USE_OLLAMA_FIRST === 'true';
}
```

---

## Testing

### Test Ollama Integration

```bash
# Ensure Ollama is running
ollama serve

# Run the test
npx tsx test-model-router.ts
```

**Expected Output:**
```
🚀 Testing Multi-Model LLM Router
============================================================

✅ Available providers: ollama, google, openai, anthropic
🦙 Ollama detected - will use local LLM for development!

Test 1: Simple Query
------------------------------------------------------------
🦙 Using Ollama (local LLM)...
✅ Success! Used 350 tokens, cost: $0.0000

💬 Response: I'd be happy to help you plan a trip! ...
```

### Test Specific Models

```typescript
import { OllamaClient } from './lib/llm';

async function testModel(modelName: string) {
  const ollama = new OllamaClient('http://localhost:11434', modelName);

  if (await ollama.isAvailable()) {
    console.log(`✅ ${modelName} is available`);

    const response = await ollama.chat([
      { role: 'user', content: 'Suggest a beach destination' }
    ]);

    console.log(response.message);
  } else {
    console.log(`❌ ${modelName} not available - run: ollama pull ${modelName}`);
  }
}

// Test different models
await testModel('llama3.2');
await testModel('mistral');
await testModel('codellama');
```

---

## Performance Comparison

### Response Times (approximate)

| Model | Cold Start | Warm | Quality |
|-------|-----------|------|---------|
| **Ollama (llama3.2)** | 2-5s | 0.5-2s | Excellent |
| **Gemini** | 1-3s | 1-2s | Excellent |
| **GPT-4o-mini** | 1-3s | 1-2s | Excellent |
| **Claude Sonnet** | 2-4s | 2-3s | Best |

**Verdict**: Ollama is competitive in speed, especially when warm!

### Token Generation Speed

| Model | Tokens/sec |
|-------|------------|
| llama3.2:1b | ~100-200 |
| llama3.2 (3B) | ~50-100 |
| mistral (7B) | ~30-50 |

*Varies by hardware (CPU/GPU)*

---

## Cost Savings

### Development (using Ollama)

```
100 developers × 100 queries/day × 30 days = 300,000 queries/month

With cloud providers:
  - Gemini: ~$150/month
  - GPT-4o-mini: ~$45/month
  - Claude: ~$4,500/month

With Ollama:
  - $0/month 💰
```

### Production (hybrid approach)

Use Ollama for:
- Internal testing
- Development environments
- Non-critical features
- High-volume, low-complexity queries

Use cloud for:
- Customer-facing features
- Complex reasoning tasks
- When best quality is needed

---

## Troubleshooting

### Ollama Not Found

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

### Model Not Available

```bash
# List models
ollama list

# Pull missing model
ollama pull llama3.2
```

### Slow Performance

```bash
# Use smaller model
ollama pull llama3.2:1b

# Or use GPU acceleration (if available)
# Ollama automatically uses GPU if available
```

### Router Not Using Ollama

```typescript
// Check provider availability
const router = new ModelRouter();
const providers = await router.getAvailableProviders();
console.log('Available:', providers);

// Verify Ollama is first
if (providers[0] !== 'ollama') {
  console.log('Ollama not first - check NODE_ENV');
}
```

---

## Advanced Features

### Custom System Prompts

```typescript
const ollama = new OllamaClient();

const response = await ollama.chat([
  {
    role: 'system',
    content: `You are an expert travel agent specializing in budget travel.
Always provide cost estimates in USD.
Focus on off-the-beaten-path destinations.`
  },
  {
    role: 'user',
    content: 'Suggest a cheap Europe trip'
  }
]);
```

### Streaming Responses (Future)

```typescript
// Not yet implemented, but Ollama supports it:
const stream = await ollama.chatStream(messages);

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### Model Management

```typescript
import { OllamaClient } from './lib/llm';

const ollama = new OllamaClient();

// List all models
const models = await ollama.listModels();
console.log('Installed models:', models);

// Pull a new model
const success = await ollama.pullModel('mistral');
if (success) {
  console.log('Mistral installed!');
}
```

---

## Best Practices

### 1. Use for Development

✅ **Do**: Use Ollama for all development work
❌ **Don't**: Force Ollama in production without testing

### 2. Choose Right Model

✅ **Do**: Use llama3.2 for balanced performance
❌ **Don't**: Use large models (70B+) on limited hardware

### 3. Implement Fallback

✅ **Do**: Let ModelRouter handle fallback automatically
❌ **Don't**: Assume Ollama is always available

### 4. Test Quality

✅ **Do**: Compare Ollama output with cloud providers
❌ **Don't**: Assume local = lower quality (often comparable!)

---

## Integration with TripPlanningAgent

The TripPlanningAgent automatically uses the ModelRouter, which includes Ollama:

```typescript
import { TripPlanningAgent } from './lib/agents/trip-planning-agent';

const agent = new TripPlanningAgent();

// In development, this uses Ollama automatically!
const response = await agent.processMessage(
  'Plan a 5-day trip to Japan',
  conversationHistory,
  context
);

// Response generated locally, for free!
console.log(response.message);
```

---

## Next Steps

1. **✅ Ollama is integrated** - Works automatically in development
2. **🔧 Tune your setup** - Try different models
3. **📊 Monitor performance** - Compare with cloud providers
4. **💰 Save money** - $0 development costs!

---

## Resources

- [Ollama Homepage](https://ollama.ai/)
- [Ollama Models Library](https://ollama.ai/library)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [ModelRouter Implementation](./LLM_ROUTER_IMPLEMENTATION.md)

---

**You're all set with free, local LLM! No more API costs in development! 🦙✨**
