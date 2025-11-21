import * as fs from 'fs';
import * as path from 'path';

interface MistralMessage {
  role: string;
  content: string;
}

interface TrainingExample {
  messages: MistralMessage[];
  metadata?: any;
}

// Approximate token count (4 chars ≈ 1 token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function estimateExampleTokens(example: TrainingExample): number {
  const allContent = example.messages.map(m => m.content).join('');
  return estimateTokens(allContent);
}

function truncateContent(content: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (content.length <= maxChars) {
    return content;
  }

  // Try to parse as JSON and truncate arrays
  try {
    const obj = JSON.parse(content);

    // If it's a survey with questions array, limit questions
    if (obj.questions && Array.isArray(obj.questions)) {
      obj.questions = obj.questions.slice(0, 5); // Keep only first 5 questions
    }

    // If it has examples array, limit it
    if (obj.examples && Array.isArray(obj.examples)) {
      obj.examples = obj.examples.slice(0, 3);
    }

    return JSON.stringify(obj, null, 2);
  } catch (e) {
    // If not JSON, just truncate text
    return content.substring(0, maxChars) + '\n\n[Content truncated due to length]';
  }
}

function cleanExample(example: TrainingExample, maxTokens: number = 6000): TrainingExample | null {
  const currentTokens = estimateExampleTokens(example);

  // If already under limit, return as is
  if (currentTokens <= maxTokens) {
    return example;
  }

  console.log(`⚠️  Example has ${currentTokens} tokens, truncating to ${maxTokens}...`);

  // Truncate the assistant's response (usually the longest)
  const cleanedMessages = example.messages.map(msg => {
    if (msg.role === 'assistant') {
      return {
        ...msg,
        content: truncateContent(msg.content, maxTokens - 500) // Reserve 500 for system/user
      };
    }
    return msg;
  });

  return {
    messages: cleanedMessages,
    metadata: example.metadata
  };
}

async function cleanTrainingData() {
  const inputFile = path.join(process.cwd(), 'data', 'training-datasets', 'surbee-master-training.jsonl');
  const outputFile = path.join(process.cwd(), 'data', 'training-datasets', 'surbee-master-training-clean.jsonl');
  const rejectedFile = path.join(process.cwd(), 'data', 'training-datasets', 'rejected-examples.jsonl');

  console.log('🧹 Cleaning Surbee training data for Mistral...\n');

  const fileContent = fs.readFileSync(inputFile, 'utf-8');
  const lines = fileContent.trim().split('\n');

  const cleaned: TrainingExample[] = [];
  const rejected: TrainingExample[] = [];
  let totalTokens = 0;

  console.log(`📊 Processing ${lines.length} examples...\n`);

  for (let i = 0; i < lines.length; i++) {
    try {
      const example: TrainingExample = JSON.parse(lines[i]);
      const tokens = estimateExampleTokens(example);

      if (tokens > 8000) {
        console.log(`❌ Line ${i + 1}: ${tokens} tokens - TOO LONG, truncating...`);
        const cleanedExample = cleanExample(example, 6000);
        if (cleanedExample) {
          const newTokens = estimateExampleTokens(cleanedExample);
          console.log(`   ✅ Reduced to ${newTokens} tokens`);
          cleaned.push(cleanedExample);
          totalTokens += newTokens;
        } else {
          rejected.push(example);
        }
      } else if (tokens > 6000) {
        console.log(`⚠️  Line ${i + 1}: ${tokens} tokens - Large but OK`);
        cleaned.push(example);
        totalTokens += tokens;
      } else {
        cleaned.push(example);
        totalTokens += tokens;
      }
    } catch (error) {
      console.error(`❌ Error parsing line ${i + 1}:`, error);
      rejected.push({ messages: [], metadata: { error: 'Parse error', line: i + 1 } });
    }
  }

  // Write cleaned data
  const cleanedContent = cleaned.map(ex => JSON.stringify(ex)).join('\n');
  fs.writeFileSync(outputFile, cleanedContent);

  // Write rejected examples
  if (rejected.length > 0) {
    const rejectedContent = rejected.map(ex => JSON.stringify(ex)).join('\n');
    fs.writeFileSync(rejectedFile, rejectedContent);
  }

  // Generate stats
  console.log('\n' + '='.repeat(70));
  console.log('✨ CLEANING COMPLETE');
  console.log('='.repeat(70));
  console.log(`\n📊 Statistics:`);
  console.log(`  Original examples: ${lines.length}`);
  console.log(`  Cleaned examples: ${cleaned.length}`);
  console.log(`  Rejected examples: ${rejected.length}`);
  console.log(`  Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`  Average tokens per example: ${Math.round(totalTokens / cleaned.length)}`);
  console.log(`  Max recommended tokens: 6,000 per example`);

  console.log(`\n📁 Output files:`);
  console.log(`  ✅ Clean data: ${outputFile}`);
  if (rejected.length > 0) {
    console.log(`  ⚠️  Rejected: ${rejectedFile}`);
  }

  console.log('\n🎉 Ready to upload to Mistral!\n');
  console.log('💡 Use this file for training:');
  console.log(`   ${outputFile}\n`);
}

// Run
cleanTrainingData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
