# Open-Source AI & Plagiarism Detection Alternatives

**Date:** January 2025
**Purpose:** Research alternatives to proprietary AI detection and plagiarism services

---

## Executive Summary

This document outlines open-source alternatives to proprietary AI text detection (OpenAI, GPTZero) and plagiarism detection services. While commercial solutions generally offer higher accuracy, several viable open-source options exist that can be self-hosted and integrated into SENTINEL.

**Key Finding:** Open-source models are viable for cost reduction but may require ensemble approaches to match commercial accuracy levels.

---

## 🤖 AI-Generated Text Detection

### Option 1: Hugging Face Models (Recommended)

#### **desklib/ai-text-detector-v1.01**
- **Architecture:** Fine-tuned microsoft/deberta-v3-large
- **Performance:** Leads RAID Benchmark for AI Detection
- **Strengths:**
  - Robust against adversarial attacks
  - Works across multiple domains
  - Handles various text types
- **Use Cases:** Content moderation, academic integrity, journalism
- **Integration:** Via Hugging Face Transformers library
- **Cost:** Free, runs locally
- **URL:** https://huggingface.co/desklib/ai-text-detector-v1.01

```python
from transformers import pipeline

detector = pipeline("text-classification",
                   model="desklib/ai-text-detector-v1.01")
result = detector("Your text here")
# Returns: {'label': 'AI' or 'HUMAN', 'score': confidence}
```

#### **SuperAnnotate/ai-detector**
- **Architecture:** Custom RoBERTa-based binary classifier
- **Training Data:** 14 different LLMs (GPT, LLaMA, Anthropic, Mistral)
- **Strengths:**
  - Trained on diverse AI models
  - Single output label (simple)
  - Modern LLM coverage
- **URL:** https://huggingface.co/SuperAnnotate/ai-detector

#### **openai-community/roberta-base-openai-detector**
- **Architecture:** RoBERTa base fine-tuned on GPT-2 outputs
- **Detection Rate:** ~95% for GPT-2 text
- **Limitations:**
  - Primarily trained on older GPT-2 model
  - OpenAI recommends pairing with other methods
  - May struggle with GPT-4/Claude detection
- **Best For:** Detecting older AI-generated content
- **URL:** https://huggingface.co/openai-community/roberta-base-openai-detector

### Option 2: GLTR (GPT Language Test Room)

- **Type:** Statistical analysis tool
- **Method:** Uses GPT-2 model to predict what would have been generated
- **Strengths:**
  - Transparent methodology
  - Visualizes prediction patterns
  - Open-source
- **Limitations:**
  - Based on GPT-2 (older model)
  - Requires manual interpretation
- **Best For:** Research and education

### Option 3: TypeTruth (Python Library)

- **Type:** Python library for AI detection
- **Status:** Limited documentation available
- **Best For:** Python-based custom implementations

---

## 📝 Plagiarism Detection

### Option 1: JPlag (Highly Recommended)

- **Languages:** Java, C#, C, C++, Python, JavaScript, TypeScript, Go, R, Rust, Kotlin, Swift, Scala
- **Features:**
  - State-of-the-art source code plagiarism detection
  - GDPR compliant (runs locally)
  - Can be executed locally on your infrastructure
- **Best For:** Code similarity detection in educational contexts
- **License:** Open-source
- **URL:** https://github.com/jplag/jplag

### Option 2: Dolos

- **Type:** Web app with CLI for source code analysis
- **Features:**
  - Interactive UI that runs in browser
  - Can be self-hosted
  - Command-line interface
  - Web visualization
- **Best For:** Source code plagiarism with visual analysis
- **License:** Open-source
- **URL:** https://github.com/dodona-edu/dolos

### Option 3: Python-Specific Libraries

#### **copydetect**
```bash
pip install copydetect
```
- **Features:**
  - Recursively searches directories
  - Compares files for plagiarism
  - Code filtering to detect modified code (non-lazy plagiarism)
- **Similar to:** MOSS (Measure of Software Similarity)
- **Best For:** Python code plagiarism detection

#### **pycode-similar**
```bash
pip install pycode-similar
```
- **Method:**
  - Normalizes Python AST representation
  - Uses difflib for modifications
  - UnifiedDiff (line-based)
  - TreeDiff (tree edit distance)
- **Best For:** Detecting modified/refactored code plagiarism
- **URL:** https://github.com/fyrestone/pycode_similar

#### **Plagiarism-checker-Python**
```bash
git clone https://github.com/Kalebu/Plagiarism-checker-Python
```
- **Method:** Cosine similarity for text documents
- **Features:**
  - Simple implementation
  - Fast execution
  - Easy to understand and modify
- **Best For:** Text-based plagiarism detection
- **URL:** https://github.com/Kalebu/Plagiarism-checker-Python

### Option 4: DIY Approach with NLTK + scikit-learn

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

def check_plagiarism(text1, text2):
    # Preprocess with NLTK
    tokens1 = word_tokenize(text1.lower())
    tokens2 = word_tokenize(text2.lower())

    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens1 = [w for w in tokens1 if w not in stop_words]
    tokens2 = [w for w in tokens2 if w not in stop_words]

    # TF-IDF + Cosine Similarity
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([' '.join(tokens1), ' '.join(tokens2)])
    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]

    return similarity
```

**Best For:** Custom implementations with full control

---

## 📊 Performance Comparison

| Solution | Type | Accuracy | Cost | Self-Hosted | Notes |
|----------|------|----------|------|-------------|-------|
| **desklib/ai-text-detector** | AI Detection | RAID Leader | Free | ✅ | Best open-source option |
| **SuperAnnotate/ai-detector** | AI Detection | Good | Free | ✅ | Modern LLM coverage |
| **roberta-openai-detector** | AI Detection | 95% (GPT-2) | Free | ✅ | Older models only |
| **JPlag** | Plagiarism | Excellent | Free | ✅ | Code-focused |
| **Dolos** | Plagiarism | Good | Free | ✅ | Visual interface |
| **copydetect** | Plagiarism | Good | Free | ✅ | Python-specific |
| **GPTZero** | AI Detection | 89-99% | $0.002/word | ❌ | Commercial baseline |
| **Originality.ai** | AI Detection | 96.7% | $0.01/credit | ❌ | Commercial baseline |
| **Turnitin** | Plagiarism | 97-98%* | $0.05-0.15 | ❌ | *Self-reported |

---

## 💡 Recommendations for SENTINEL

### Immediate Implementation (Phase 1)

**For AI Text Detection:**
1. **Primary:** Use `desklib/ai-text-detector-v1.01` (best open-source performer)
2. **Secondary:** Use `SuperAnnotate/ai-detector` for cross-validation
3. **Ensemble:** Average scores from both models for higher confidence

**For Plagiarism Detection:**
1. **Text Plagiarism:** Implement TF-IDF + Cosine Similarity (simple, effective)
2. **Code Plagiarism (if needed):** Use JPlag for source code submissions
3. **Advanced:** Add web search API (Google Custom Search) for internet plagiarism

### Cost Savings Estimate

**Current Costs (Commercial APIs):**
- OpenAI GPT-4o: ~$0.003-0.010 per response
- Originality.ai: ~$0.01 per check
- **Total per response:** ~$0.013-0.020

**With Open-Source Models:**
- Hugging Face inference (self-hosted): ~$0.001 per response (compute only)
- **Savings:** ~90% reduction in AI detection costs

### Performance Trade-offs

**Advantages:**
- ✅ 90% cost reduction
- ✅ No rate limits
- ✅ Data privacy (runs locally)
- ✅ GDPR compliant
- ✅ Customizable and tunable

**Disadvantages:**
- ⚠️ Slightly lower accuracy (89-95% vs 96-99% commercial)
- ⚠️ Requires infrastructure setup
- ⚠️ May need ensemble methods for best results
- ⚠️ No commercial support

---

## 🛠️ Integration Plan

### Step 1: Add Hugging Face Models

```typescript
// src/lib/services/ai-text-detection-opensource.ts

import { pipeline } from '@xenova/transformers'

let detector: any = null

async function initDetector() {
  if (!detector) {
    detector = await pipeline(
      'text-classification',
      'desklib/ai-text-detector-v1.01'
    )
  }
  return detector
}

export async function detectAITextOpenSource(
  text: string
): Promise<{
  isAI: boolean
  confidence: number
  model: string
}> {
  const detector = await initDetector()
  const result = await detector(text)

  return {
    isAI: result[0].label === 'AI',
    confidence: result[0].score,
    model: 'desklib/ai-text-detector-v1.01',
  }
}
```

### Step 2: Add Plagiarism Detection

```typescript
// src/lib/services/plagiarism-detection-opensource.ts

import { TfIdf } from 'natural'

export function detectPlagiarism(
  text: string,
  corpus: string[]
): {
  isPlagiarized: boolean
  maxSimilarity: number
  matchedTexts: Array<{ text: string; similarity: number }>
} {
  const tfidf = new TfIdf()

  // Add corpus documents
  corpus.forEach(doc => tfidf.addDocument(doc))

  // Add target document
  tfidf.addDocument(text)

  // Calculate similarities
  const similarities = corpus.map((doc, idx) => {
    let similarity = 0
    tfidf.tfidfs(text, (i, measure) => {
      if (i === idx) similarity = measure
    })
    return { text: doc, similarity }
  })

  const maxSimilarity = Math.max(...similarities.map(s => s.similarity))
  const threshold = 0.65 // 65% similarity = plagiarism

  return {
    isPlagiarized: maxSimilarity >= threshold,
    maxSimilarity,
    matchedTexts: similarities
      .filter(s => s.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity),
  }
}
```

### Step 3: Update Ensemble Scoring

Add configuration to choose between commercial and open-source:

```typescript
// src/lib/ml/ensemble-scoring.ts

export interface EnsembleInput {
  // ... existing fields
  useOpenSource?: boolean // NEW: Toggle between commercial/OSS
}
```

---

## 🔄 Migration Strategy

### Phase 1: Parallel Testing (Week 1-2)
- Run both commercial and open-source models side-by-side
- Collect accuracy metrics on 500+ test cases
- Validate that open-source accuracy meets 80%+ threshold

### Phase 2: Gradual Rollout (Week 3-4)
- Use open-source for 25% of traffic
- Monitor false positive/negative rates
- Adjust thresholds as needed

### Phase 3: Full Deployment (Week 5+)
- Switch to 100% open-source models
- Keep commercial APIs as fallback
- Monitor cost savings and performance

---

## 📈 Expected Results

**Performance Targets:**
- AI Detection Accuracy: ≥85% (vs 89% with GPT-4o)
- Plagiarism Detection Accuracy: ≥80%
- Cost per Response: $0.001 (vs $0.013-0.020)
- Processing Time: <2s (same as commercial)

**Risk Mitigation:**
- Use ensemble of multiple open-source models
- Keep commercial APIs as fallback for edge cases
- Implement confidence thresholds (use commercial if open-source confidence <60%)

---

## 🔗 Resources

### AI Text Detection
- Hugging Face Transformers: https://huggingface.co/docs/transformers
- desklib model: https://huggingface.co/desklib/ai-text-detector-v1.01
- RAID Benchmark: https://raid-bench.xyz/

### Plagiarism Detection
- JPlag: https://github.com/jplag/jplag
- Dolos: https://github.com/dodona-edu/dolos
- copydetect: https://github.com/blingenf/copydetect

### Libraries
- Transformers.js (browser): https://github.com/xenova/transformers.js
- Natural (NLP for Node): https://github.com/NaturalNode/natural
- scikit-learn (Python): https://scikit-learn.org/

---

## ✅ Conclusion

**Open-source AI and plagiarism detection is viable for SENTINEL** with the following approach:

1. **Use desklib/ai-text-detector-v1.01** for AI detection (best open-source option)
2. **Use TF-IDF + Cosine Similarity** for plagiarism detection (simple, effective)
3. **Implement ensemble approach** with multiple models for higher accuracy
4. **Keep commercial APIs as fallback** for cases with low confidence
5. **Expected 90% cost savings** with ~5% accuracy trade-off

**Next Steps:**
1. Install Hugging Face Transformers library
2. Implement detection functions
3. Run parallel tests with commercial APIs
4. Tune thresholds based on results
5. Deploy to production with monitoring
