/**
 * Accuracy detection example
 * Track and analyze survey response quality
 */

import { createClient } from "surbee-sdk";

async function main() {
  const client = createClient({
    apiKey: "surbee_your_api_key_here",
  });

  // Create accuracy detector for a survey
  const detector = client.accuracy.create({
    surveyId: "survey_123",
    events: ["mouseMovement", "timeTracking", "focusLoss"],
    sensitivity: "high",
  });

  // Generate tracking script to embed in your survey
  const trackingScript = detector.generateTrackingScript();
  console.log("Embed this script in your survey:");
  console.log("=".repeat(50));
  console.log(trackingScript);
  console.log("=".repeat(50));

  // Simulate response data collection
  const responseData = {
    surveyId: "survey_123",
    answers: {
      q1: "Yes",
      q2: "Very satisfied",
      q3: "Great product!",
    },
    questionTimes: [2000, 3500, 5000], // milliseconds per question
    mouseData: [
      { x: 100, y: 200, t: Date.now() },
      { x: 150, y: 250, t: Date.now() + 100 },
      // ... more movement data
    ],
    focusLossCount: 0,
  };

  // Analyze accuracy
  console.log("\nAnalyzing response quality...");
  const analysis = await client.accuracy.analyze("survey_123", responseData);

  console.log("\nAccuracy Analysis Results:");
  console.log(`Score: ${analysis.score}/100`);
  console.log(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);

  if (analysis.flags.length > 0) {
    console.log("\nQuality Flags:");
    analysis.flags.forEach(flag => {
      console.log(`- [${flag.severity.toUpperCase()}] ${flag.type}: ${flag.description}`);
    });
  } else {
    console.log("\nNo quality issues detected!");
  }

  if (analysis.metrics) {
    console.log("\nDetailed Metrics:");
    console.log(`- Avg time per question: ${(analysis.metrics.avgTimePerQuestion / 1000).toFixed(1)}s`);
    console.log(`- Mouse movement variance: ${analysis.metrics.mouseMovementVariance.toFixed(2)}`);
    console.log(`- Consistency score: ${(analysis.metrics.consistencyScore * 100).toFixed(1)}%`);
  }
}

main().catch(console.error);
