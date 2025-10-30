/**
 * BYOK (Bring Your Own Keys) example
 * Use your own AI provider API keys instead of Surbee Platform API
 */

import { createClient } from "surbee-sdk";

async function main() {
  // Initialize SDK with your own API keys
  const client = createClient({
    apiKey: "surbee_platform_key", // Still need for some features
    providerKeys: {
      openai: process.env.OPENAI_API_KEY,
      xai: process.env.XAI_API_KEY,
    },
    defaultProvider: "gpt-5",
  });

  // Check available providers
  const providers = await client.getProviders();
  console.log("Available providers:", providers);

  // Generate with specific provider
  const result = await client.surveys.generate(
    "Create an employee feedback survey with 5 questions",
    {
      format: "tsx_component",
      provider: "gpt-5",
      reasoningEffort: "high",
    }
  );

  console.log("Survey generated successfully!");
  console.log(`Using: ${result.metadata.provider} - ${result.metadata.model}`);

  // Save to file
  const fs = await import("fs");
  fs.writeFileSync("generated-survey.tsx", result.code);
  console.log("Saved to generated-survey.tsx");
}

main().catch(console.error);
