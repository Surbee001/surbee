import { redirect } from "next/navigation";

export default function DemoSurveyBuilderStandalonePage() {
  // Server-side redirect to the actual project page
  redirect('/project/demo?mock=1');
}

