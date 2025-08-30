import { redirect } from "next/navigation";

export default function DemoSurveyBuilderPage() {
  // Server-side redirect to the actual project page
  redirect('/project/demo?mock=1');
}
