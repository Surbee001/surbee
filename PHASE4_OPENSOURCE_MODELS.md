# 🤖 Phase 4: Open-Source In-House Models

**Status:** PLANNED (After Phase 7-8)
**Goal:** Zero API costs, fully self-hosted fraud detection

---

## 🎯 **Why Open-Source Models?**

### **Benefits:**
- ✅ **Zero ongoing API costs** (no OpenAI fees)
- ✅ **Complete data privacy** (everything stays on your servers)
- ✅ **Customization** (fine-tune specifically for your surveys)
- ✅ **No rate limits** (scale infinitely)
- ✅ **No vendor lock-in** (own your models)

### **Trade-offs:**
- ⚠️ Higher upfront setup cost (GPU infrastructure)
- ⚠️ Need to manage model hosting
- ⚠️ Requires training data collection
- ⚠️ Initial accuracy may be lower (improves with fine-tuning)

---

## 🏗️ **Architecture: In-House AI Stack**

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND: BehaviorProvider (unchanged)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1-2: Rules + Behavioral (unchanged)                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: IN-HOUSE AI MODELS (replaces OpenAI)              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Fine-tuned Open-Source LLMs                        │   │
│  │  • Llama 3.1 70B / 8B (Meta)                        │   │
│  │  • Mistral 7B / 8x7B MoE (Mistral AI)               │   │
│  │  • Phi-3 (Microsoft) - Small but powerful           │   │
│  │  • Qwen 2.5 (Alibaba) - Strong reasoning            │   │
│  │                                                      │   │
│  │  Fine-tuned for:                                    │   │
│  │  1. AI-generated text detection                     │   │
│  │  2. Semantic contradiction detection                │   │
│  │  3. Quality assessment                              │   │
│  │  4. Fraud pattern recognition                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4-7: Cross-Session, Bayesian, Ensemble (unchanged)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Recommended Models**

### **Option 1: Llama 3.1 (META) - RECOMMENDED**
**Best for:** General-purpose fraud detection

```yaml
Model: meta-llama/Meta-Llama-3.1-70B-Instruct
Size: 70B parameters (or 8B for smaller deployments)
License: Open source (Llama 3.1 Community License)
Strengths:
  - Excellent reasoning capabilities
  - Great at text analysis
  - Proven performance
  - Large community support
Hardware:
  - 70B: 2x A100 40GB or 4x A10 24GB
  - 8B: 1x RTX 4090 or 1x A10
Cost: ~$1-2/hour on cloud GPU (RunPod, Lambda Labs)
```

**Why Llama 3.1?**
- Battle-tested for text understanding
- Strong instruction following
- Can be quantized (4-bit) to run on consumer GPUs
- Excellent fine-tuning results

### **Option 2: Mistral 7B/8x7B (MISTRAL AI)**
**Best for:** Fast inference, cost-effective

```yaml
Model: mistralai/Mistral-7B-Instruct-v0.3
Size: 7B or 8x7B (Mixture of Experts)
License: Apache 2.0 (fully open)
Strengths:
  - Very fast inference
  - Smaller, cheaper to run
  - Competitive with larger models
  - Great for production
Hardware:
  - 7B: 1x RTX 3090 or T4
  - 8x7B: 2x A10 or 1x A100
Cost: ~$0.30-0.50/hour on cloud GPU
```

**Why Mistral?**
- Extremely efficient
- Lower hardware requirements
- Fast response times (<1s)
- Good enough for most fraud detection

### **Option 3: Phi-3 (MICROSOFT)**
**Best for:** Edge deployment, minimal hardware

```yaml
Model: microsoft/Phi-3-medium-4k-instruct
Size: 14B parameters
License: MIT (fully open)
Strengths:
  - Runs on CPU (no GPU needed!)
  - Very small, very fast
  - Surprisingly capable
  - Can run on-device
Hardware:
  - CPU only (16GB RAM)
  - Or 1x consumer GPU
Cost: Free (can run on your existing servers)
```

**Why Phi-3?**
- Can run anywhere
- No special hardware
- Great for testing/prototyping
- Lower accuracy but acceptable

---

## 📚 **Fine-Tuning Strategy**

### **Phase 1: Data Collection**

**Collect training data:**

```sql
-- Export labeled responses
SELECT
  responses,
  fraud_score,
  is_flagged,
  flag_reasons,
  -- Include human review labels
  review_status,
  CASE
    WHEN fraud_score > 0.8 THEN 'fraud'
    WHEN fraud_score < 0.3 THEN 'legitimate'
    ELSE 'uncertain'
  END as label
FROM survey_responses
WHERE review_status = 'reviewed'  -- Only human-verified data
LIMIT 10000;
```

**Training set structure:**
```jsonl
{"text": "Q: What is your opinion? A: As an AI language model, I don't have personal opinions...", "label": "fraud", "fraud_type": "ai_generated"}
{"text": "Q: Describe your experience A: It was really great! I loved how the interface was super intuitive and easy to navigate.", "label": "legitimate"}
{"text": "Q: Rate your satisfaction A: 5 Q: Would you recommend? A: 1", "label": "fraud", "fraud_type": "contradiction"}
```

**Target dataset:**
- 10,000+ labeled responses (minimum)
- 50,000+ ideal
- Balance: 60% legitimate, 40% fraud
- Diverse fraud types

### **Phase 2: Model Fine-Tuning**

**Using Hugging Face + LoRA (efficient fine-tuning):**

```python
# Example: Fine-tune Llama 3.1 8B for fraud detection

from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer
import torch

# 1. Load base model (4-bit quantized for efficiency)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    load_in_4bit=True,
    torch_dtype=torch.float16,
    device_map="auto"
)

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Meta-Llama-3.1-8B-Instruct")

# 2. Configure LoRA (Low-Rank Adaptation)
lora_config = LoraConfig(
    r=16,  # Rank
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],  # Which layers to fine-tune
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = prepare_model_for_kbit_training(model)
model = get_peft_model(model, lora_config)

# 3. Prepare training data
def format_prompt(row):
    return f"""Analyze this survey response for fraud:

Question: {row['question']}
Answer: {row['answer']}

Behavioral data:
- Response time: {row['time']}s
- Paste events: {row['pastes']}
- Mouse activity: {row['mouse_events']}

Is this fraudulent? Respond with JSON:
{{"is_fraud": true/false, "fraud_type": "...", "confidence": 0-1, "reasoning": "..."}}"""

# 4. Train
trainer = SFTTrainer(
    model=model,
    train_dataset=training_data,
    peft_config=lora_config,
    max_seq_length=2048,
    args=TrainingArguments(
        output_dir="./sentinel-llama-fraud",
        num_train_epochs=3,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        logging_steps=10,
        save_steps=100,
    ),
)

trainer.train()

# 5. Save fine-tuned model
model.save_pretrained("./sentinel-fraud-detector")
```

**Training time:** 6-12 hours on 1x A100
**Cost:** ~$10-20 one-time (on RunPod/Lambda Labs)

### **Phase 3: Model Deployment**

**Option A: Self-Hosted (Recommended for production)**

```python
# Use vLLM for fast inference
from vllm import LLM, SamplingParams

llm = LLM(
    model="./sentinel-fraud-detector",
    tensor_parallel_size=1,  # Number of GPUs
    gpu_memory_utilization=0.9
)

sampling_params = SamplingParams(
    temperature=0.1,  # Low temp for consistent fraud detection
    top_p=0.95,
    max_tokens=500
)

def detect_fraud(question, answer, behavioral_data):
    prompt = format_fraud_prompt(question, answer, behavioral_data)
    output = llm.generate([prompt], sampling_params)
    return parse_fraud_response(output[0].outputs[0].text)
```

**Hardware:** 1x A10 GPU (~$0.60/hour on cloud, or buy for $1000-2000)
**Throughput:** 50-100 requests/second
**Latency:** 100-500ms per request

**Option B: Cloud Hosting (Easier setup)**

**Use Replicate, HuggingFace Inference, or Modal:**

```python
# Example: Deploy to Replicate
import replicate

# Deploy your fine-tuned model
deployment = replicate.deployments.create(
    name="sentinel-fraud-detector",
    model="your-username/sentinel-llama-fraud",
    version="...",
    hardware="gpu-a10-small"
)

# Use in production
output = replicate.run(
    "your-username/sentinel-fraud-detector",
    input={
        "prompt": fraud_prompt,
        "max_tokens": 500,
        "temperature": 0.1
    }
)
```

**Cost:** ~$0.0001-0.0005 per request (cheaper than OpenAI!)

---

## 🎯 **Integration with SENTINEL**

### **Update AI Text Detection Service:**

```typescript
// src/lib/services/ai-text-detection.ts

export async function analyzeTextResponses(
  responses: Record<string, any>,
  questions: Record<string, string>,
  options?: { useInHouseModel?: boolean }
): Promise<AITextAnalysisResult> {

  // Choose model
  if (options?.useInHouseModel || process.env.USE_INHOUSE_MODELS === 'true') {
    return analyzeWithInHouseModel(responses, questions)
  } else {
    return analyzeWithOpenAI(responses, questions)  // Existing implementation
  }
}

async function analyzeWithInHouseModel(
  responses: Record<string, any>,
  questions: Record<string, string>
): Promise<AITextAnalysisResult> {
  // Call your self-hosted model
  const endpoint = process.env.INHOUSE_MODEL_ENDPOINT || 'http://localhost:8000/detect-fraud'

  const result = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      responses,
      questions,
    }),
  })

  return await result.json()
}
```

### **Environment Variable:**

```bash
# .env.local
USE_INHOUSE_MODELS=true
INHOUSE_MODEL_ENDPOINT=http://your-gpu-server:8000/detect-fraud

# Or use cloud endpoint
INHOUSE_MODEL_ENDPOINT=https://your-deployment.replicate.com/predict
```

---

## 💰 **Cost Comparison**

### **1000 Responses Analysis:**

| Approach | Setup Cost | Per-Request Cost | Total Cost |
|----------|-----------|-----------------|------------|
| **OpenAI o1** | $0 | $0.02 | $20 |
| **OpenAI GPT-4o** | $0 | $0.003 | $3 |
| **In-House (Cloud GPU)** | $10-20 training | $0.0003 | $0.30 |
| **In-House (Self-Hosted)** | $10-20 training + $1000 GPU | $0 (electricity) | ~$0.10 |

**Break-even point:** ~10,000 responses (after that, in-house is cheaper)

---

## 📊 **Recommended Open-Source Models**

### **For AI Text Detection:**
1. **Llama 3.1 70B** - Best accuracy
2. **Mistral 8x7B** - Best speed/accuracy balance
3. **Phi-3** - Best for CPU deployment

### **For Embeddings/Similarity (Fraud Ring Detection):**
1. **all-MiniLM-L6-v2** - Fast, good quality
2. **e5-large-v2** - Better accuracy
3. **instructor-xl** - Best for semantic search

### **For Classification (Quick Checks):**
1. **DeBERTa-v3** - Best GLUE scores
2. **RoBERTa** - Fast, reliable
3. **DistilBERT** - Tiny, CPU-friendly

---

## 🧪 **Testing Your Fine-Tuned Model**

```python
# Test your fine-tuned model
test_cases = [
    {
        "question": "What is your opinion on this product?",
        "answer": "As an AI language model, I don't have personal opinions, but I can provide a comprehensive analysis...",
        "expected": "fraud",
        "fraud_type": "ai_generated"
    },
    {
        "question": "How was your experience?",
        "answer": "It was really good! The interface was intuitive and easy to use.",
        "expected": "legitimate"
    },
]

correct = 0
for test in test_cases:
    result = model.detect_fraud(test['question'], test['answer'])
    if (result['is_fraud'] and test['expected'] == 'fraud') or \
       (not result['is_fraud'] and test['expected'] == 'legitimate'):
        correct += 1

accuracy = correct / len(test_cases)
print(f"Accuracy: {accuracy * 100}%")
```

**Target accuracy:** >90% to match OpenAI o1

---

## 🚀 **Quick Start (When Ready)**

### **1. Collect Training Data** (3-6 months)
- Run SENTINEL with OpenAI
- Collect 10k+ labeled responses
- Balance fraud/legitimate examples

### **2. Fine-Tune Model** (1 week)
- Choose base model (Llama 3.1 recommended)
- Fine-tune with LoRA
- Validate on test set

### **3. Deploy** (1-2 days)
- Option A: Self-host with vLLM
- Option B: Deploy to Replicate/Modal
- Update SENTINEL to use in-house model

### **4. Monitor & Improve** (Ongoing)
- Compare accuracy with OpenAI
- Collect edge cases
- Retrain periodically

---

## 📖 **Resources**

**Model Hubs:**
- Hugging Face: https://huggingface.co/models
- Llama models: https://huggingface.co/meta-llama
- Mistral models: https://huggingface.co/mistralai

**Fine-Tuning Guides:**
- Hugging Face TRL: https://github.com/huggingface/trl
- LoRA paper: https://arxiv.org/abs/2106.09685
- Unsloth (faster training): https://github.com/unslothai/unsloth

**Deployment:**
- vLLM: https://github.com/vllm-project/vllm
- Replicate: https://replicate.com
- Modal: https://modal.com

**GPU Providers:**
- RunPod: https://runpod.io (~$0.40/hour A10)
- Lambda Labs: https://lambdalabs.com (~$1.10/hour A100)
- Vast.ai: https://vast.ai (cheapest, varies)

---

## ✅ **Benefits Summary**

**Once Phase 4 is complete:**
- ✅ Zero ongoing API costs
- ✅ Complete data privacy
- ✅ Unlimited scaling
- ✅ Custom fraud types
- ✅ Faster inference (local GPU)
- ✅ No vendor dependencies

**SENTINEL becomes 100% self-contained!**

---

**Next Steps:** Complete Phase 7-8 first, then return to Phase 4 when you have enough training data.
