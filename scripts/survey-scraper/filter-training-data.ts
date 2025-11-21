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

async function filterTrainingData() {
  const inputFile = path.join(process.cwd(), 'data', 'training-datasets', 'surbee-master-training.jsonl');
  const outputFile = path.join(process.cwd(), 'data', 'training-datasets', 'surbee-training-filtered.jsonl');

  console.log('🔍 Filtering Surbee training data for Mistral...\n');
  console.log('   Max tokens per example: 6,000\n');

  const fileContent = fs.readFileSync(inputFile, 'utf-8');
  const lines = fileContent.trim().split('\n');

  const filtered: TrainingExample[] = [];
  const removed: { line: number; tokens: number; reason: string }[] = [];

  console.log(`📊 Processing ${lines.length} examples...\n`);

  for (let i = 0; i < lines.length; i++) {
    try {
      const example: TrainingExample = JSON.parse(lines[i]);
      const tokens = estimateExampleTokens(example);

      if (tokens > 6000) {
        console.log(`❌ Line ${i + 1}: ${tokens} tokens - REMOVED (too long)`);
        removed.push({ line: i + 1, tokens, reason: 'Too many tokens' });
      } else if (tokens > 4000) {
        console.log(`⚠️  Line ${i + 1}: ${tokens} tokens - Large but OK`);
        filtered.push(example);
      } else {
        filtered.push(example);
      }
    } catch (error) {
      console.error(`❌ Line ${i + 1}: Parse error - REMOVED`);
      removed.push({ line: i + 1, tokens: 0, reason: 'Parse error' });
    }
  }

  // Write filtered data
  const filteredContent = filtered.map(ex => JSON.stringify(ex)).join('\n');
  fs.writeFileSync(outputFile, filteredContent);

  // Calculate stats
  const totalTokens = filtered.reduce((sum, ex) => sum + estimateExampleTokens(ex), 0);
  const avgTokens = Math.round(totalTokens / filtered.length);
  const maxTokens = Math.max(...filtered.map(ex => estimateExampleTokens(ex)));

  // Generate report
  console.log('\n' + '='.repeat(70));
  console.log('✨ FILTERING COMPLETE');
  console.log('='.repeat(70));
  console.log(`\n📊 Statistics:`);
  console.log(`  Original examples: ${lines.length}`);
  console.log(`  Kept examples: ${filtered.length}`);
  console.log(`  Removed examples: ${removed.length}`);
  console.log(`  Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`  Average tokens: ${avgTokens}`);
  console.log(`  Max tokens: ${maxTokens}`);
  console.log(`  All examples under: 6,000 tokens ✅`);

  if (removed.length > 0) {
    console.log(`\n⚠️  Removed examples:`);
    removed.forEach(r => {
      console.log(`  Line ${r.line}: ${r.tokens} tokens (${r.reason})`);
    });
  }

  console.log(`\n📁 Output file:`);
  console.log(`  ✅ ${outputFile}`);

  console.log('\n🎉 Ready to upload to Mistral!\n');
  console.log('💡 Upload this file:');
  console.log(`   surbee-training-filtered.jsonl\n`);
}

// Run
filterTrainingData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
