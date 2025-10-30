import { RAGContext, SurveySpec, BuildArtifact } from "./schemas";

export async function search_kb(query: string): Promise<RAGContext> {
  return { items: [], queryUsed: query };
}

export async function validate_spec(
  spec: SurveySpec
): Promise<{ errors: string[]; warnings: string[] }> {
  return { errors: [], warnings: [] };
}

export async function generate_code(
  spec: SurveySpec,
  flavor: "json" | "tsx" = "json"
): Promise<BuildArtifact> {
  if (flavor === "json") {
    return {
      format: "json_config",
      content: JSON.stringify(spec, null, 2),
      diagnostics: []
    };
  }

  const tsx = `export default function Survey() { return null }`;
  return { format: "tsx_component", content: tsx, diagnostics: ["TSX stub"] };
}

export async function renderer_apply(
  artifact: BuildArtifact
): Promise<{ ok: boolean; url: string }> {
  return { ok: true, url: "https://app.surbee.dev/preview/123" };
}

export async function save_runlog(_: any): Promise<void> {
  return;
}
