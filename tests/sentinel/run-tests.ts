#!/usr/bin/env tsx
/**
 * SENTINEL Test Execution Script
 *
 * Run this script to execute all tests and generate comprehensive reports
 *
 * Usage:
 *   npx tsx tests/sentinel/run-tests.ts
 */

import { runAllTests, printTestReport, exportResults } from './test-runner'

async function main() {
  console.log('🧪 SENTINEL Comprehensive Testing Suite\n')
  console.log('Testing with Claude Haiku 4.5 (claude-haiku-4-5-20251001)\n')

  try {
    // Run tests with Claude Haiku 4.5
    console.log('\n' + '='.repeat(80))
    console.log('🟣 Testing with Anthropic Claude Haiku 4.5')
    console.log('='.repeat(80))
    const summaryClaude = await runAllTests('anthropic')
    printTestReport(summaryClaude)
    exportResults(summaryClaude, 'sentinel-results-claude.json')

    // Exit with appropriate code
    const passThreshold = 0.80 // Require 80% accuracy to pass
    const accuracy = summaryClaude.accuracy

    if (accuracy >= passThreshold) {
      console.log(`\n✅ PASS: Accuracy ${(accuracy * 100).toFixed(2)}% >= ${(passThreshold * 100)}%`)
      process.exit(0)
    } else {
      console.log(`\n❌ FAIL: Accuracy ${(accuracy * 100).toFixed(2)}% < ${(passThreshold * 100)}%`)
      process.exit(1)
    }
  } catch (error: any) {
    console.error('\n❌ Test suite failed with error:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
