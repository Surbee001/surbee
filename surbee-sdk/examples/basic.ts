/**
 * Basic example: Generate a survey with Surbee SDK
 */

import { createClient } from "surbee-sdk";

async function main() {
  // Initialize SDK with Surbee Platform API key
  const client = createClient({
    apiKey: "surbee_your_api_key_here", // Get from console.surbee.com
  });

  // Check if client is configured
  const isConfigured = await client.isConfigured();
  console.log("Client configured:", isConfigured);

  // Generate a survey
  const result = await client.surveys.generate(
    "Create a customer satisfaction survey for a SaaS product",
    {
      format: "tsx_component",
      framework: "react",
      language: "typescript",
      reasoningEffort: "high",
    }
  );

  // Output the generated code
  console.log("Generated Survey Component:");
  console.log("=".repeat(50));
  console.log(result.code);
  console.log("=".repeat(50));

  // Show metadata
  console.log("\nMetadata:");
  console.log(`- Provider: ${result.metadata.provider}`);
  console.log(`- Model: ${result.metadata.model}`);
  console.log(`- Generation time: ${result.metadata.generationTime}ms`);

  if (result.reasoning) {
    console.log("\nReasoning steps:");
    result.reasoning.forEach((step, i) => {
      console.log(`${i + 1}. ${step}`);
    });
  }
}

main().catch(console.error);
