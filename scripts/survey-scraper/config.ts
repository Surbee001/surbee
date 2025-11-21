export const FIRECRAWL_API_KEY = 'fc-516e1455c6e34c2ab73faa9cd54ed409';
export const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v2/scrape';

// Enhanced schema for comprehensive survey data extraction
export const SURVEY_SCHEMA = {
  type: "object",
  required: [],
  properties: {
    survey_basics: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        purpose: { type: "string" },
        target_industry: { type: "string" },
        use_case: { type: "string" },
        estimated_completion_time: { type: "string" },
        target_audience: { type: "string" },
        survey_provider: { type: "string" },
        template_category: { type: "string" }
      }
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question_number: { type: "number" },
          question_text: { type: "string" },
          question_type: { type: "string" },
          response_options: {
            type: "array",
            items: {
              type: "object",
              properties: {
                value: { type: "string" },
                label: { type: "string" },
                score: { type: "number" }
              }
            }
          },
          is_required: { type: "boolean" },
          category: { type: "string" },
          has_conditional_logic: { type: "boolean" },
          conditional_logic_description: { type: "string" },
          validation_rules: { type: "string" },
          placeholder_text: { type: "string" },
          help_text: { type: "string" },
          scale_details: {
            type: "object",
            properties: {
              scale_type: { type: "string" },
              scale_range: { type: "string" },
              lowest_point_label: { type: "string" },
              highest_point_label: { type: "string" },
              midpoint_label: { type: "string" },
              reverse_coded: { type: "boolean" }
            }
          },
          matrix_details: {
            type: "object",
            properties: {
              rows: { type: "array", items: { type: "string" } },
              columns: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    },
    skip_logic_and_branching: {
      type: "array",
      items: {
        type: "object",
        properties: {
          rule_id: { type: "string" },
          trigger_question: { type: "string" },
          condition: { type: "string" },
          condition_type: { type: "string" },
          action: { type: "string" },
          target_question: { type: "string" },
          description: { type: "string" }
        }
      }
    },
    survey_structure: {
      type: "object",
      properties: {
        total_questions: { type: "number" },
        has_sections: { type: "boolean" },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              section_name: { type: "string" },
              section_description: { type: "string" },
              section_order: { type: "number" },
              question_numbers: { type: "array", items: { type: "number" } }
            }
          }
        },
        has_branching: { type: "boolean" },
        has_randomization: { type: "boolean" },
        has_piping: { type: "boolean" },
        has_scoring: { type: "boolean" }
      }
    },
    ui_design_patterns: {
      type: "object",
      properties: {
        layout_style: { type: "string" },
        visual_style: { type: "string" },
        question_per_page: { type: "string" },
        has_progress_indicator: { type: "boolean" },
        progress_type: { type: "string" },
        is_mobile_optimized: { type: "boolean" },
        color_scheme: { type: "string" },
        typography: { type: "string" },
        button_styles: { type: "string" },
        animation_effects: { type: "array", items: { type: "string" } },
        notable_features: { type: "array", items: { type: "string" } }
      }
    },
    ux_best_practices: {
      type: "array",
      items: {
        type: "object",
        properties: {
          practice: { type: "string" },
          description: { type: "string" },
          implementation: { type: "string" }
        }
      }
    },
    domain_specific_elements: {
      type: "object",
      properties: {
        validated_scales_used: {
          type: "array",
          items: {
            type: "object",
            properties: {
              scale_name: { type: "string" },
              scale_acronym: { type: "string" },
              description: { type: "string" },
              scoring_method: { type: "string" }
            }
          }
        },
        compliance_considerations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              regulation: { type: "string" },
              requirement: { type: "string" }
            }
          }
        },
        industry_terminology: { type: "array", items: { type: "string" } },
        specialized_question_types: { type: "array", items: { type: "string" } }
      }
    },
    scoring_and_analytics: {
      type: "object",
      properties: {
        has_scoring: { type: "boolean" },
        scoring_method: { type: "string" },
        result_categories: { type: "array", items: { type: "string" } },
        interpretation_guidance: { type: "string" }
      }
    },
    accessibility_features: {
      type: "array",
      items: { type: "string" }
    }
  }
};

// Target URLs organized by category
export const TARGET_URLS = {
  // General Survey Platforms - Templates & Examples
  typeform: [
    'https://www.typeform.com/templates/',
    'https://www.typeform.com/templates/customer-satisfaction/',
    'https://www.typeform.com/templates/employee-engagement/',
    'https://www.typeform.com/templates/market-research/',
    'https://www.typeform.com/templates/feedback/',
    'https://www.typeform.com/templates/event-registration/',
    'https://www.typeform.com/templates/product-feedback/',
  ],

  surveymonkey: [
    'https://www.surveymonkey.com/mp/sample-survey-questionnaire-templates/',
    'https://www.surveymonkey.com/mp/customer-satisfaction-surveys/',
    'https://www.surveymonkey.com/mp/employee-engagement-surveys/',
    'https://www.surveymonkey.com/mp/healthcare-surveys/',
    'https://www.surveymonkey.com/mp/market-research-surveys/',
    'https://www.surveymonkey.com/mp/education-surveys/',
  ],

  google_forms: [
    'https://docs.google.com/forms/u/0/?tgif=d',
  ],

  jotform: [
    'https://www.jotform.com/form-templates/',
    'https://www.jotform.com/form-templates/category/survey',
    'https://www.jotform.com/form-templates/healthcare-survey',
    'https://www.jotform.com/form-templates/customer-satisfaction-survey',
    'https://www.jotform.com/form-templates/employee-evaluation-form',
  ],

  qualtrics: [
    'https://www.qualtrics.com/marketplace/survey-templates/',
    'https://www.qualtrics.com/experience-management/research/survey-question-types/',
  ],

  forms_apps: [
    'https://www.formstack.com/resources/survey-templates',
    'https://www.123formbuilder.com/form-templates/survey/',
  ],

  // Healthcare & Clinical
  healthcare: [
    'https://www.apa.org/depression-guideline/patient-health-questionnaire.pdf',
    'https://adaa.org/sites/default/files/GAD-7_Anxiety-updated_0.pdf',
    'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1495268/', // PHQ-9
    'https://outcometracker.org/library/PHQ-9.pdf',
    'https://www.ahrq.gov/cahps/surveys-guidance/index.html', // CAHPS surveys
    'https://www.who.int/tools/whoqol', // WHO Quality of Life
  ],

  mental_health_scales: [
    'https://www.curesz.org/measures/', // Validated scales database
    'https://eprovide.mapi-trust.org/', // Patient-Reported Outcome scales
  ],

  // HR & Employee Assessment
  hr_360_review: [
    'https://www.surveymonkey.com/mp/360-degree-feedback/',
    'https://www.cultureamp.com/blog/360-degree-feedback-template',
    'https://www.lattice.com/library/what-is-a-360-review-and-how-do-you-create-one',
  ],

  hr_engagement: [
    'https://www.surveymonkey.com/mp/employee-satisfaction-surveys/',
    'https://www.questionpro.com/survey-templates/employee-engagement-survey/',
    'https://www.gallup.com/workplace/employee-engagement-survey.aspx',
  ],

  // Financial Wellness
  finance: [
    'https://www.surveymonkey.com/mp/financial-wellness-survey-template/',
    'https://www.questionpro.com/survey-templates/financial-wellness-assessment/',
    'https://www.pwc.com/us/en/services/consulting/workforce/library/employee-financial-wellness-survey.html',
  ],

  // Engineering & Safety
  engineering: [
    'https://www.surveymonkey.com/mp/workplace-safety-survey-template/',
    'https://www.questionpro.com/survey-templates/technical-skills-assessment/',
    'https://www.osha.gov/safety-management/safety-health-programs',
  ],

  // Academic & Research
  academic: [
    'https://www.questionpro.com/blog/psychometric-questionnaire/',
    'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3886444/', // Survey methodology
  ],

  // Best Practices & Guides
  best_practices: [
    'https://www.qualtrics.com/experience-management/research/survey-design/',
    'https://www.surveymonkey.com/mp/survey-writing-tips/',
    'https://www.typeform.com/surveys/survey-design-best-practices/',
    'https://www.pewresearch.org/methods/u-s-surveys/writing-survey-questions/',
  ],

  // Customer Experience & Satisfaction
  customer_experience: [
    'https://www.surveymonkey.com/mp/customer-satisfaction-surveys/',
    'https://www.questionpro.com/survey-templates/customer-satisfaction-survey-template/',
    'https://www.qualtrics.com/experience-management/customer/customer-satisfaction/',
    'https://www.typeform.com/templates/customer-satisfaction/',
  ],

  // Market Research
  market_research: [
    'https://www.surveymonkey.com/mp/market-research-surveys/',
    'https://www.questionpro.com/survey-templates/market-research/',
    'https://www.typeform.com/templates/market-research/',
    'https://www.qualtrics.com/experience-management/brand/market-research/',
  ],

  // Education & Academic
  education: [
    'https://www.surveymonkey.com/mp/education-surveys/',
    'https://www.questionpro.com/survey-templates/education-survey/',
    'https://www.typeform.com/templates/education/',
  ],

  // Net Promoter Score (NPS)
  nps: [
    'https://www.surveymonkey.com/mp/net-promoter-score/',
    'https://www.questionpro.com/net-promoter-score/',
    'https://www.typeform.com/templates/nps/',
  ],

  // Product Feedback
  product_feedback: [
    'https://www.typeform.com/templates/product-feedback/',
    'https://www.surveymonkey.com/mp/product-survey-questions/',
    'https://www.questionpro.com/survey-templates/product-survey/',
  ],

  // Event Feedback
  event_surveys: [
    'https://www.typeform.com/templates/event/',
    'https://www.surveymonkey.com/mp/event-surveys/',
    'https://www.questionpro.com/survey-templates/event-survey/',
  ],

  // Non-Profit & Social Impact
  nonprofit: [
    'https://www.surveymonkey.com/mp/nonprofit-surveys/',
    'https://www.questionpro.com/survey-templates/nonprofit-survey/',
  ],

  // Government & Public Sector
  government: [
    'https://www.surveymonkey.com/mp/government-surveys/',
    'https://www.questionpro.com/survey-templates/government-survey/',
  ]
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  requestsPerMinute: 10,
  delayBetweenRequests: 6000, // 6 seconds
  maxRetries: 3,
  retryDelay: 10000 // 10 seconds
};
