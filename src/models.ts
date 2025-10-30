import OpenAI from "openai";

const openai = new OpenAI();

function parseJsonOutput<T>(payload: unknown): T {
  if (typeof payload !== "string" || payload.trim().length === 0) {
    throw new Error("Empty model response");
  }
  return JSON.parse(payload) as T;
}

function safeOutputText(res: unknown): string {
  // Handle different GPT-5 response formats
  const response = res as any;

  // Try different possible response structures for GPT-5
  if (typeof response?.output_text === "string") {
    return response.output_text;
  }

  if (typeof response?.response?.output_text === "string") {
    return response.response.output_text;
  }

  if (typeof response?.text === "string") {
    return response.text;
  }

  if (typeof response?.content === "string") {
    return response.content;
  }

  // Handle choices array format (like chat completions)
  if (Array.isArray(response?.choices) && response.choices.length > 0) {
    const choice = response.choices[0];
    if (typeof choice?.message?.content === "string") {
      return choice.message.content;
    }
    if (typeof choice?.text === "string") {
      return choice.text;
    }
  }

  console.error("Unexpected GPT-5 response format:", JSON.stringify(response, null, 2));
  throw new Error("Model response missing output_text or expected format");
}

export async function gpt5FastJSON<T>(
  name: string,
  system: string,
  input: unknown,
  jsonSchema: any
): Promise<T> {
  const res = await openai.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" },
    input: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(input) }
    ],
    text: {
      format: {
        type: "json_schema",
        name: name,
        schema: jsonSchema,
        strict: true
      },
      verbosity: "low"
    }
  });

  const out = safeOutputText(res);
  return parseJsonOutput<T>(out);
}

export async function gpt5ReasonJSON<T>(
  name: string,
  system: string,
  input: unknown,
  jsonSchema: any
): Promise<T> {
  const res = await openai.responses.create({
    model: "gpt-5",
    reasoning: { effort: "high" },
    input: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(input) }
    ],
    text: {
      format: {
        type: "json_schema",
        name: name,
        schema: jsonSchema,
        strict: true
      }
    }
  });

  const out = safeOutputText(res);
  return parseJsonOutput<T>(out);
}

export async function gpt5FastText(system: string, input: unknown): Promise<string> {
  const res = await openai.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" },
    input: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(input) }
    ],
    text: { verbosity: "low" }
  });

  return safeOutputText(res);
}
