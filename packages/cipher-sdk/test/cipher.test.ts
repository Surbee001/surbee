/**
 * Cipher SDK Test Suite
 *
 * Run with: npx tsx test/cipher.test.ts
 */

import { Cipher } from '../src/cipher';
import {
  legitimateSubmission,
  spamSubmission,
  botSubmission,
  straightLiningSubmission,
  aiAssistedSubmission,
} from './fixtures';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message: string, color?: keyof typeof colors) {
  if (color) {
    console.log(`${colors[color]}${message}${colors.reset}`);
  } else {
    console.log(message);
  }
}

function printResult(name: string, result: any) {
  const passIcon = result.passed ? '✓' : '✗';
  const passColor = result.passed ? 'green' : 'red';

  log(`\n${passIcon} ${name}`, passColor);
  log(`  Score: ${(result.score * 100).toFixed(1)}%`, result.score >= 0.7 ? 'green' : result.score >= 0.4 ? 'yellow' : 'red');
  log(`  Recommendation: ${result.recommendation}`, result.recommendation === 'keep' ? 'green' : result.recommendation === 'review' ? 'yellow' : 'red');
  log(`  Confidence: ${(result.confidence * 100).toFixed(0)}%`, 'dim');

  if (result.flags.length > 0) {
    log(`  Flags: ${result.flags.join(', ')}`, 'yellow');
  }

  if (result.reasoning) {
    log(`  Reasoning: ${result.reasoning}`, 'dim');
  }

  log(`  Processing: ${result.meta.processingTimeMs}ms | Checks: ${result.meta.checksPassed}/${result.meta.checksRun} passed`, 'dim');
}

function printCheckDetails(checks: any[]) {
  const failed = checks.filter(c => !c.passed);
  const suspicious = checks.filter(c => c.passed && c.score > 0.3);

  if (failed.length > 0) {
    log('\n  Failed checks:', 'red');
    for (const check of failed) {
      log(`    • ${check.checkId}: ${check.details || 'Failed'} (score: ${check.score.toFixed(2)})`, 'red');
    }
  }

  if (suspicious.length > 0) {
    log('\n  Suspicious (passed but flagged):', 'yellow');
    for (const check of suspicious) {
      log(`    • ${check.checkId}: ${check.details || 'Suspicious'} (score: ${check.score.toFixed(2)})`, 'yellow');
    }
  }
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║              CIPHER SDK TEST SUITE                         ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  // ==========================================================================
  // TIER 1 TESTS (Basic offline)
  // ==========================================================================
  log('\n\n━━━ TIER 1 (Basic Offline) ━━━', 'blue');

  const tier1 = new Cipher({ tier: 1, offline: true, debug: false });

  log('\nTier 1 Info:', 'dim');
  const tier1Info = tier1.getTierInfo();
  log(`  Name: ${tier1Info.name}`, 'dim');
  log(`  Checks: ${tier1Info.checks.length}`, 'dim');
  log(`  Cost: $${tier1.estimateCost()} per response`, 'dim');

  // Test 1.1: Legitimate submission
  const t1_legitimate = tier1.validateSync(legitimateSubmission);
  printResult('Legitimate Submission', t1_legitimate);

  // Test 1.2: Spam submission
  const t1_spam = tier1.validateSync(spamSubmission);
  printResult('Spam Submission', t1_spam);
  printCheckDetails(t1_spam.checks);

  // Test 1.3: Bot submission
  const t1_bot = tier1.validateSync(botSubmission);
  printResult('Bot Submission', t1_bot);
  printCheckDetails(t1_bot.checks);

  // ==========================================================================
  // TIER 2 TESTS (Advanced offline)
  // ==========================================================================
  log('\n\n━━━ TIER 2 (Advanced Offline) ━━━', 'blue');

  const tier2 = new Cipher({ tier: 2, offline: true, debug: false });

  log('\nTier 2 Info:', 'dim');
  const tier2Info = tier2.getTierInfo();
  log(`  Name: ${tier2Info.name}`, 'dim');
  log(`  Checks: ${tier2Info.checks.length}`, 'dim');
  log(`  Cost: $${tier2.estimateCost()} per response`, 'dim');

  // Test 2.1: Legitimate submission
  const t2_legitimate = tier2.validateSync(legitimateSubmission);
  printResult('Legitimate Submission', t2_legitimate);

  // Test 2.2: Straight-lining
  const t2_straightline = tier2.validateSync(straightLiningSubmission);
  printResult('Straight-lining Submission', t2_straightline);
  printCheckDetails(t2_straightline.checks);

  // Test 2.3: AI-assisted (paste heavy)
  const t2_aiAssisted = tier2.validateSync(aiAssistedSubmission);
  printResult('AI-Assisted Submission (Paste Heavy)', t2_aiAssisted);
  printCheckDetails(t2_aiAssisted.checks);

  // Test 2.4: Bot with headless device
  const t2_bot = tier2.validateSync(botSubmission);
  printResult('Bot with Headless Browser', t2_bot);
  printCheckDetails(t2_bot.checks);

  // ==========================================================================
  // TIER 3-5 TESTS (AI-powered - requires API key)
  // ==========================================================================
  log('\n\n━━━ TIER 3-5 (AI-Powered) ━━━', 'blue');

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    log('\n⚠ ANTHROPIC_API_KEY not set - skipping AI-powered tests', 'yellow');
    log('  Set ANTHROPIC_API_KEY environment variable to test tiers 3-5', 'dim');
  } else {
    // Tier 3 test
    log('\n--- Tier 3 (Claude Sonnet 4.5) ---', 'blue');
    const tier3 = new Cipher({ tier: 3, apiKey, debug: false });

    const t3_legitimate = await tier3.validate(legitimateSubmission);
    printResult('Legitimate Submission (Tier 3)', t3_legitimate);

    const t3_spam = await tier3.validate(spamSubmission);
    printResult('Spam Submission (Tier 3)', t3_spam);
    printCheckDetails(t3_spam.checks);

    // Tier 5 test (most thorough)
    log('\n--- Tier 5 (Claude Opus 4.5) ---', 'blue');
    const tier5 = new Cipher({ tier: 5, apiKey, debug: false });

    log('\nTier 5 Info:', 'dim');
    const tier5Info = tier5.getTierInfo();
    log(`  Name: ${tier5Info.name}`, 'dim');
    log(`  Checks: ${tier5Info.checks.length}`, 'dim');
    log(`  Est. Cost: $${tier5.estimateCost()} per response`, 'dim');

    const t5_legitimate = await tier5.validate(legitimateSubmission);
    printResult('Legitimate Submission (Tier 5)', t5_legitimate);

    const t5_bot = await tier5.validate(botSubmission);
    printResult('Bot Submission (Tier 5)', t5_bot);
    printCheckDetails(t5_bot.checks);
  }

  // ==========================================================================
  // BATCH VALIDATION TEST
  // ==========================================================================
  log('\n\n━━━ BATCH VALIDATION ━━━', 'blue');

  const batchCipher = new Cipher({ tier: 2, offline: true });

  const batchResult = await batchCipher.validateBatch({
    submissions: [
      legitimateSubmission,
      spamSubmission,
      botSubmission,
      straightLiningSubmission,
    ],
  });

  log('\nBatch Results:', 'cyan');
  log(`  Total: ${batchResult.summary.total}`, 'dim');
  log(`  Passed: ${batchResult.summary.passed}`, 'green');
  log(`  Review: ${batchResult.summary.review}`, 'yellow');
  log(`  Failed: ${batchResult.summary.failed}`, 'red');
  log(`  Avg Score: ${(batchResult.summary.avgScore * 100).toFixed(1)}%`, 'dim');

  // ==========================================================================
  // INDIVIDUAL CHECK IMPORTS TEST
  // ==========================================================================
  log('\n\n━━━ INDIVIDUAL CHECKS ━━━', 'blue');

  // Import individual checks
  const {
    checkMinimalEffort,
    checkStraightLining,
    checkLowInteraction,
    checkWebDriverDetected,
  } = await import('../src/checks');

  log('\nTesting individual check imports:', 'dim');

  const minEffortResult = checkMinimalEffort(spamSubmission.responses);
  log(`  checkMinimalEffort: ${minEffortResult.passed ? '✓' : '✗'} (score: ${minEffortResult.score.toFixed(2)})`, minEffortResult.passed ? 'green' : 'red');

  const straightLineResult = checkStraightLining(straightLiningSubmission.responses);
  log(`  checkStraightLining: ${straightLineResult.passed ? '✓' : '✗'} (score: ${straightLineResult.score.toFixed(2)})`, straightLineResult.passed ? 'green' : 'red');

  const lowInteractionResult = checkLowInteraction(botSubmission.behavioralMetrics);
  log(`  checkLowInteraction: ${lowInteractionResult.passed ? '✓' : '✗'} (score: ${lowInteractionResult.score.toFixed(2)})`, lowInteractionResult.passed ? 'green' : 'red');

  const webDriverResult = checkWebDriverDetected(botSubmission.deviceInfo);
  log(`  checkWebDriverDetected: ${webDriverResult.passed ? '✓' : '✗'} (score: ${webDriverResult.score.toFixed(2)})`, webDriverResult.passed ? 'green' : 'red');

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  log('\n\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    TEST COMPLETE                           ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  log('\nExpected results:', 'dim');
  log('  • Legitimate submissions should PASS with high scores', 'dim');
  log('  • Spam/bot submissions should FAIL or be flagged for review', 'dim');
  log('  • Straight-lining should be detected', 'dim');
  log('  • Paste-heavy behavior should be flagged', 'dim');
  log('  • Headless browsers should be detected', 'dim');
  log('\n');
}

// Run tests
runTests().catch(console.error);
