/**
 * Programmatic survey building example
 * Build surveys without AI using helper tools
 */

import { createSurvey, question, content, themes, validateSurvey } from "surbee-sdk";

async function main() {
  // Build survey programmatically
  const survey = createSurvey("Customer Satisfaction Survey")
    .theme(themes.modern)
    .addPage("intro", [
      content("welcome", "<h2>Welcome!</h2><p>Thank you for taking the time to provide feedback.</p>"),
      question.text("name", "What is your name?", { required: true }),
      question.email("email", "What is your email address?"),
    ])
    .addPage("feedback", [
      question.rating("satisfaction", "How satisfied are you with our product?", {
        scale: 5,
        required: true,
        helpText: "1 = Very Dissatisfied, 5 = Very Satisfied"
      }),
      question.multiSelect(
        "features",
        "Which features do you use most often?",
        [
          "Dashboard",
          "Analytics",
          "Reporting",
          "API Integration",
          "Mobile App"
        ],
        { required: true }
      ),
      question.longText("suggestions", "Any suggestions for improvement?"),
    ])
    .addPage("followup", [
      question.nps("nps", "How likely are you to recommend us to a friend?", {
        required: true,
        helpText: "0 = Not at all likely, 10 = Extremely likely"
      }),
      content("thanks", "<h3>Thank you!</h3><p>Your feedback is valuable to us.</p>"),
    ])
    // Add conditional logic
    .addBranchRule("satisfaction", { in: ["1", "2"] }, "followup")
    .build();

  // Validate survey
  const validation = validateSurvey(survey);
  if (!validation.valid) {
    console.error("Survey validation errors:");
    validation.errors.forEach(error => console.error(`- ${error}`));
    return;
  }

  console.log("Survey built successfully!");
  console.log(JSON.stringify(survey, null, 2));

  // Survey structure
  console.log(`\nSurvey: ${survey.title}`);
  console.log(`Pages: ${survey.pages.length}`);
  console.log(`Questions: ${survey.pages.flatMap(p => p.blocks.filter(b => b.kind === "question")).length}`);

  if (survey.logic) {
    console.log(`Branch rules: ${survey.logic.length}`);
  }
}

main().catch(console.error);
