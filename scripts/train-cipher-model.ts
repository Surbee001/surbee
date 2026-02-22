#!/usr/bin/env npx tsx
/**
 * Cipher ML Training Script
 *
 * Generates synthetic training data and trains an XGBoost model on Modal.
 *
 * Usage:
 *   npx tsx scripts/train-cipher-model.ts [--samples=50000] [--version=v1.0.0]
 */

import { generateSyntheticData, exportForTraining, getDatasetStats } from '../src/lib/cipher/synthetic-data';

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: string): string => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : defaultValue;
};

const sampleCount = parseInt(getArg('samples', '50000'), 10);
const modelVersion = getArg('version', `v${Date.now()}`);

console.log('🔐 Cipher ML Training Pipeline');
console.log('================================\n');

async function main() {
  // Step 1: Generate synthetic data
  console.log(`📊 Generating ${sampleCount.toLocaleString()} synthetic samples...`);
  console.time('Data generation');

  const samples = generateSyntheticData(sampleCount);
  const stats = getDatasetStats(samples);

  console.timeEnd('Data generation');
  console.log(`\n✅ Generated ${stats.total.toLocaleString()} samples:`);
  console.log(`   Fraud: ${stats.fraudCount.toLocaleString()} (${((stats.fraudCount / stats.total) * 100).toFixed(1)}%)`);
  console.log(
    `   Legitimate: ${stats.legitCount.toLocaleString()} (${((stats.legitCount / stats.total) * 100).toFixed(1)}%)`
  );

  console.log('\n📈 By archetype:');
  for (const [archetype, count] of Object.entries(stats.byArchetype).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${archetype}: ${count.toLocaleString()}`);
  }

  console.log('\n📏 By survey length:');
  for (const [length, count] of Object.entries(stats.bySurveyLength)) {
    console.log(`   ${length}: ${count.toLocaleString()}`);
  }

  // Step 2: Export for training
  console.log('\n🔄 Preparing data for training...');
  const { X, y, metadata } = exportForTraining(samples);

  console.log(`   Feature matrix: ${X.length} x ${X[0].length}`);
  console.log(`   Labels: ${y.length}`);

  // Step 3: Call Modal training function
  console.log(`\n🚀 Triggering Modal training for model ${modelVersion}...`);
  console.log('   This may take a few minutes...\n');

  const MODAL_INFERENCE_URL =
    process.env.CIPHER_ML_URL || 'https://cgihadi--cipher-ml-inference-server.modal.run';

  // For training, we need to call the Modal function directly
  // Since we can't call Modal functions directly from Node.js, we'll save the data
  // and let the user run Modal manually, OR we set up an HTTP endpoint for training

  // Option 1: Save training data to a file for manual Modal invocation
  const fs = await import('fs');
  const path = await import('path');

  const dataDir = path.join(process.cwd(), '.cipher-training');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dataPath = path.join(dataDir, `training-data-${modelVersion}.json`);
  const trainingPayload = {
    X,
    y,
    model_version: modelVersion,
    metadata: {
      generated_at: new Date().toISOString(),
      sample_count: sampleCount,
      stats,
    },
  };

  console.log(`📁 Saving training data to ${dataPath}...`);
  fs.writeFileSync(dataPath, JSON.stringify(trainingPayload));

  // Calculate file size
  const fileSizeBytes = fs.statSync(dataPath).size;
  const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
  console.log(`   File size: ${fileSizeMB} MB`);

  // Option 2: If CIPHER_ML_TRAINING_URL is set, trigger training via HTTP
  const trainingUrl = process.env.CIPHER_ML_TRAINING_URL;

  if (trainingUrl) {
    console.log(`\n🌐 Triggering remote training at ${trainingUrl}...`);

    try {
      const response = await fetch(`${trainingUrl}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingPayload),
      });

      if (!response.ok) {
        throw new Error(`Training request failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('\n✅ Training complete!');
      console.log(`   Model version: ${result.model_version}`);
      console.log(`   Precision: ${(result.metrics.precision * 100).toFixed(2)}%`);
      console.log(`   Recall: ${(result.metrics.recall * 100).toFixed(2)}%`);
      console.log(`   F1 Score: ${(result.metrics.f1 * 100).toFixed(2)}%`);
      console.log(`   AUC-ROC: ${(result.metrics.auc_roc * 100).toFixed(2)}%`);

      if (result.top_features) {
        console.log('\n🎯 Top features:');
        for (const feature of result.top_features.slice(0, 10)) {
          console.log(`   ${feature.display_name}: ${(feature.importance * 100).toFixed(2)}%`);
        }
      }
    } catch (error) {
      console.error(`\n❌ Remote training failed: ${error}`);
      console.log('   You can train manually using the saved data file.');
    }
  } else {
    console.log('\n📌 To train the model, run:');
    console.log(`   modal run modal/cipher-ml.py::train_model --data-file="${dataPath}"`);
    console.log('\n   Or set CIPHER_ML_TRAINING_URL to enable automatic remote training.');
  }

  // Show Modal commands for manual invocation
  console.log('\n📋 Manual Modal commands:');
  console.log('   # Deploy the Cipher ML app:');
  console.log('   modal deploy modal/cipher-ml.py');
  console.log('\n   # Train with Python script:');
  console.log('   python scripts/modal-train.py');

  console.log('\n✨ Done!');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
