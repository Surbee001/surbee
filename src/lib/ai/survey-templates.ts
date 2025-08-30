// Pre-built survey architectures for different use cases
// Like v0/Lovable templates but for surveys

export const surveyTemplates = {
  'market-research': {
    name: 'Market Research Survey',
    description: 'Comprehensive market analysis with consumer insights',
    complexity: 'professional',
    estimatedTime: '8-12 minutes',
    architecture: {
      pages: [
        {
          id: 'welcome',
          name: 'Welcome',
          purpose: 'Introduction and consent',
          position: 1,
          questions: [
            {
              id: 'welcome_text',
              type: 'info-display',
              label: 'Welcome to our market research study',
              required: false,
              validation: { rules: [], messages: {} },
              logic: {},
              analytics: { trackingEvents: ['page_view'] }
            }
          ]
        },
        {
          id: 'demographics',
          name: 'About You',
          purpose: 'Demographic segmentation',
          position: 2,
          questions: [
            {
              id: 'age_group',
              type: 'radio',
              label: 'What is your age group?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please select your age group' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
            },
            {
              id: 'income_range',
              type: 'radio',
              label: 'What is your household income range?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please select your income range' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              options: ['Under $25k', '$25k-$49k', '$50k-$74k', '$75k-$99k', '$100k-$149k', '$150k+']
            }
          ]
        },
        {
          id: 'product_usage',
          name: 'Product Usage',
          purpose: 'Understanding current behavior',
          position: 3,
          questions: [
            {
              id: 'usage_frequency',
              type: 'scale',
              label: 'How often do you use products in this category?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please rate the frequency' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              scale: { min: 1, max: 7, labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Frequently', 'Very Often', 'Always'] }
            },
            {
              id: 'brand_awareness',
              type: 'checkbox',
              label: 'Which of these brands are you familiar with?',
              required: false,
              validation: { rules: [], messages: {} },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              options: ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E', 'None of these']
            }
          ]
        },
        {
          id: 'preferences',
          name: 'Preferences',
          purpose: 'Product preference insights',
          position: 4,
          questions: [
            {
              id: 'feature_importance',
              type: 'matrix',
              label: 'How important are these features to you?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please rate all features' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              matrix: {
                rows: ['Price', 'Quality', 'Brand reputation', 'Design', 'Functionality'],
                columns: ['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Extremely Important']
              }
            }
          ]
        },
        {
          id: 'feedback',
          name: 'Additional Feedback',
          purpose: 'Qualitative insights',
          position: 5,
          questions: [
            {
              id: 'additional_comments',
              type: 'textarea',
              label: 'Any additional comments or suggestions?',
              required: false,
              validation: { 
                rules: ['maxLength:500'], 
                messages: { maxLength: 'Please keep comments under 500 characters' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] }
            }
          ]
        }
      ],
      flow: {
        navigation: 'linear',
        progressType: 'percentage',
        allowBack: true
      },
      validation: {
        realTime: true,
        completionChecks: ['all-required-answered', 'quality-threshold']
      },
      analytics: {
        trackingLevel: 'advanced',
        fraudDetection: true,
        behavioralMetrics: true
      },
      design: {
        theme: 'professional-blue',
        layout: 'card-based',
        animations: true
      }
    }
  },

  'academic-study': {
    name: 'Academic Research Study',
    description: 'Rigorous academic research with methodological controls',
    complexity: 'academic',
    estimatedTime: '15-20 minutes',
    architecture: {
      pages: [
        {
          id: 'consent',
          name: 'Informed Consent',
          purpose: 'Ethical compliance and consent',
          position: 1,
          questions: [
            {
              id: 'consent_form',
              type: 'consent-display',
              label: 'Research Study Consent Form',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Consent is required to participate' }
              },
              logic: {},
              analytics: { trackingEvents: ['page_view', 'consent_given'] }
            }
          ]
        },
        {
          id: 'attention_check_1',
          name: 'Instructions',
          purpose: 'Attention and comprehension check',
          position: 2,
          questions: [
            {
              id: 'instruction_check',
              type: 'radio',
              label: 'Please select "Agree" to show you are paying attention to these instructions.',
              required: true,
              validation: { 
                rules: ['required', 'equals:Agree'], 
                messages: { 
                  required: 'Please select an option',
                  equals: 'Please select "Agree" to continue'
                }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'attention_check'] },
              options: ['Agree', 'Disagree', 'Neutral']
            }
          ]
        },
        {
          id: 'demographics',
          name: 'Participant Information',
          purpose: 'Demographic controls',
          position: 3,
          questions: [
            {
              id: 'academic_level',
              type: 'radio',
              label: 'What is your highest level of education?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please select your education level' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              options: ['High school or equivalent', 'Some college', "Bachelor's degree", "Master's degree", 'Doctoral degree', 'Professional degree']
            },
            {
              id: 'research_experience',
              type: 'scale',
              label: 'How familiar are you with academic research?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please rate your familiarity' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              scale: { min: 1, max: 5, labels: ['Not familiar at all', 'Slightly familiar', 'Moderately familiar', 'Very familiar', 'Extremely familiar'] }
            }
          ]
        },
        {
          id: 'main_study',
          name: 'Main Study Questions',
          purpose: 'Primary research measures',
          position: 4,
          questions: [
            {
              id: 'likert_scale_battery',
              type: 'matrix',
              label: 'Please indicate your level of agreement with each statement:',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please rate all statements' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              matrix: {
                rows: [
                  'I find this topic interesting',
                  'I have strong opinions about this subject',
                  'I consider myself knowledgeable in this area',
                  'This topic is relevant to my daily life'
                ],
                columns: ['Strongly Disagree', 'Disagree', 'Neither Agree nor Disagree', 'Agree', 'Strongly Agree']
              }
            }
          ]
        },
        {
          id: 'attention_check_2',
          name: 'Validation Check',
          purpose: 'Second attention check',
          position: 5,
          questions: [
            {
              id: 'validation_question',
              type: 'radio',
              label: 'For quality control, please select "Option 3" from the choices below.',
              required: true,
              validation: { 
                rules: ['required', 'equals:Option 3'], 
                messages: { 
                  required: 'Please select an option',
                  equals: 'Please select "Option 3" as instructed'
                }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'attention_check'] },
              options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
            }
          ]
        },
        {
          id: 'debriefing',
          name: 'Study Debriefing',
          purpose: 'Ethical debriefing and next steps',
          position: 6,
          questions: [
            {
              id: 'debriefing_info',
              type: 'info-display',
              label: 'Thank you for participating in this research study.',
              required: false,
              validation: { rules: [], messages: {} },
              logic: {},
              analytics: { trackingEvents: ['page_view', 'study_completed'] }
            }
          ]
        }
      ],
      flow: {
        navigation: 'linear',
        progressType: 'steps',
        allowBack: false
      },
      validation: {
        realTime: true,
        completionChecks: ['all-required-answered', 'attention-checks-passed', 'time-threshold']
      },
      analytics: {
        trackingLevel: 'research',
        fraudDetection: true,
        behavioralMetrics: true
      },
      design: {
        theme: 'academic-neutral',
        layout: 'single-column',
        animations: false
      }
    }
  },

  'employee-engagement': {
    name: 'Employee Engagement Survey',
    description: 'Comprehensive employee satisfaction and engagement measurement',
    complexity: 'professional',
    estimatedTime: '10-15 minutes',
    architecture: {
      pages: [
        {
          id: 'introduction',
          name: 'Introduction',
          purpose: 'Context and confidentiality assurance',
          position: 1,
          questions: [
            {
              id: 'intro_text',
              type: 'info-display',
              label: 'This survey is completely confidential and will help improve our workplace.',
              required: false,
              validation: { rules: [], messages: {} },
              logic: {},
              analytics: { trackingEvents: ['page_view'] }
            }
          ]
        },
        {
          id: 'job_satisfaction',
          name: 'Job Satisfaction',
          purpose: 'Overall satisfaction metrics',
          position: 2,
          questions: [
            {
              id: 'overall_satisfaction',
              type: 'nps',
              label: 'How likely are you to recommend this company as a great place to work?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please provide a rating' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] }
            },
            {
              id: 'satisfaction_factors',
              type: 'matrix',
              label: 'How satisfied are you with these aspects of your job?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please rate all aspects' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              matrix: {
                rows: ['Work-life balance', 'Compensation', 'Career development', 'Management support', 'Workplace culture', 'Job security'],
                columns: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']
              }
            }
          ]
        },
        {
          id: 'management',
          name: 'Management & Leadership',
          purpose: 'Leadership effectiveness assessment',
          position: 3,
          questions: [
            {
              id: 'manager_effectiveness',
              type: 'scale',
              label: 'How would you rate your direct manager\'s effectiveness?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please rate your manager' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              scale: { min: 1, max: 5, labels: ['Poor', 'Below Average', 'Average', 'Above Average', 'Excellent'] }
            }
          ]
        },
        {
          id: 'feedback',
          name: 'Additional Feedback',
          purpose: 'Qualitative insights and suggestions',
          position: 4,
          questions: [
            {
              id: 'improvement_suggestions',
              type: 'textarea',
              label: 'What suggestions do you have for improving our workplace?',
              required: false,
              validation: { 
                rules: ['maxLength:1000'], 
                messages: { maxLength: 'Please keep suggestions under 1000 characters' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] }
            }
          ]
        }
      ],
      flow: {
        navigation: 'linear',
        progressType: 'percentage',
        allowBack: true
      },
      validation: {
        realTime: true,
        completionChecks: ['all-required-answered']
      },
      analytics: {
        trackingLevel: 'advanced',
        fraudDetection: false,
        behavioralMetrics: true
      },
      design: {
        theme: 'corporate-blue',
        layout: 'card-based',
        animations: true
      }
    }
  },

  'product-feedback': {
    name: 'Product Feedback Survey',
    description: 'User experience and product improvement insights',
    complexity: 'professional',
    estimatedTime: '5-8 minutes',
    architecture: {
      pages: [
        {
          id: 'usage_context',
          name: 'Your Usage',
          purpose: 'Understanding user context',
          position: 1,
          questions: [
            {
              id: 'usage_duration',
              type: 'radio',
              label: 'How long have you been using our product?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please select your usage duration' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              options: ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', 'More than 1 year']
            },
            {
              id: 'usage_frequency',
              type: 'radio',
              label: 'How often do you use our product?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please select your usage frequency' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              options: ['Daily', 'Several times a week', 'Weekly', 'Monthly', 'Rarely']
            }
          ]
        },
        {
          id: 'experience_rating',
          name: 'Your Experience',
          purpose: 'Overall experience assessment',
          position: 2,
          questions: [
            {
              id: 'overall_rating',
              type: 'scale',
              label: 'How would you rate your overall experience with our product?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please provide a rating' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              scale: { min: 1, max: 5, labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] }
            },
            {
              id: 'feature_satisfaction',
              type: 'matrix',
              label: 'How satisfied are you with these features?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please rate all features' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              matrix: {
                rows: ['Ease of use', 'Performance', 'Design', 'Features', 'Reliability'],
                columns: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
              }
            }
          ]
        },
        {
          id: 'improvements',
          name: 'Improvements',
          purpose: 'Product improvement insights',
          position: 3,
          questions: [
            {
              id: 'missing_features',
              type: 'textarea',
              label: 'What features or improvements would you like to see?',
              required: false,
              validation: { 
                rules: ['maxLength:500'], 
                messages: { maxLength: 'Please keep suggestions under 500 characters' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] }
            },
            {
              id: 'recommendation',
              type: 'nps',
              label: 'How likely are you to recommend our product to others?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please provide a recommendation score' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] }
            }
          ]
        }
      ],
      flow: {
        navigation: 'linear',
        progressType: 'percentage',
        allowBack: true
      },
      validation: {
        realTime: true,
        completionChecks: ['all-required-answered']
      },
      analytics: {
        trackingLevel: 'advanced',
        fraudDetection: true,
        behavioralMetrics: true
      },
      design: {
        theme: 'modern-gradient',
        layout: 'card-based',
        animations: true
      }
    }
  },

  'customer-satisfaction': {
    name: 'Customer Satisfaction Survey',
    description: 'Measure customer satisfaction and service quality',
    complexity: 'simple',
    estimatedTime: '3-5 minutes',
    architecture: {
      pages: [
        {
          id: 'satisfaction_rating',
          name: 'Satisfaction Rating',
          purpose: 'Core satisfaction metrics',
          position: 1,
          questions: [
            {
              id: 'service_rating',
              type: 'scale',
              label: 'How would you rate the service you received today?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please provide a rating' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              scale: { min: 1, max: 5, labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'] }
            },
            {
              id: 'staff_helpfulness',
              type: 'scale',
              label: 'How helpful was our staff?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please rate staff helpfulness' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              scale: { min: 1, max: 5, labels: ['Not Helpful', 'Slightly Helpful', 'Moderately Helpful', 'Very Helpful', 'Extremely Helpful'] }
            }
          ]
        },
        {
          id: 'feedback',
          name: 'Your Feedback',
          purpose: 'Additional comments and suggestions',
          position: 2,
          questions: [
            {
              id: 'additional_comments',
              type: 'textarea',
              label: 'Any additional comments or suggestions?',
              required: false,
              validation: { 
                rules: ['maxLength:300'], 
                messages: { maxLength: 'Please keep comments under 300 characters' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] }
            },
            {
              id: 'return_likelihood',
              type: 'radio',
              label: 'How likely are you to return or use our services again?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please indicate your likelihood to return' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              options: ['Definitely will not', 'Probably will not', 'Might or might not', 'Probably will', 'Definitely will']
            }
          ]
        }
      ],
      flow: {
        navigation: 'linear',
        progressType: 'steps',
        allowBack: true
      },
      validation: {
        realTime: true,
        completionChecks: ['all-required-answered']
      },
      analytics: {
        trackingLevel: 'basic',
        fraudDetection: false,
        behavioralMetrics: false
      },
      design: {
        theme: 'friendly-green',
        layout: 'simple',
        animations: true
      }
    }
  },

  'user-research': {
    name: 'User Research Study',
    description: 'UX research and user behavior insights',
    complexity: 'research',
    estimatedTime: '12-18 minutes',
    architecture: {
      pages: [
        {
          id: 'screener',
          name: 'Screening Questions',
          purpose: 'Qualify participants for study',
          position: 1,
          questions: [
            {
              id: 'target_user_check',
              type: 'radio',
              label: 'Do you currently use digital design tools for work?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please answer this screening question' }
              },
              logic: { skipTo: 'end_screen' },
              analytics: { trackingEvents: ['interact', 'screener_response'] },
              options: ['Yes, regularly (daily/weekly)', 'Yes, occasionally (monthly)', 'Rarely', 'No, never']
            }
          ]
        },
        {
          id: 'user_background',
          name: 'Background',
          purpose: 'User context and experience',
          position: 2,
          questions: [
            {
              id: 'experience_level',
              type: 'radio',
              label: 'How would you describe your experience level?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please select your experience level' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              options: ['Beginner (0-1 years)', 'Intermediate (2-4 years)', 'Advanced (5-9 years)', 'Expert (10+ years)']
            },
            {
              id: 'primary_tools',
              type: 'checkbox',
              label: 'Which tools do you primarily use? (Select all that apply)',
              required: true,
              validation: { 
                rules: ['required', 'minSelections:1'], 
                messages: { 
                  required: 'Please select at least one tool',
                  minSelections: 'Please select at least one tool'
                }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              options: ['Figma', 'Sketch', 'Adobe XD', 'InVision', 'Framer', 'Other']
            }
          ]
        },
        {
          id: 'task_scenarios',
          name: 'Task Scenarios',
          purpose: 'Behavioral and workflow assessment',
          position: 3,
          questions: [
            {
              id: 'workflow_challenges',
              type: 'ranking',
              label: 'Rank these workflow challenges by how often you encounter them (1 = most common):',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please rank all items' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              items: ['Version control', 'Team collaboration', 'Asset management', 'Design handoff', 'Feedback incorporation']
            }
          ]
        },
        {
          id: 'preferences',
          name: 'Preferences',
          purpose: 'Feature preferences and priorities',
          position: 4,
          questions: [
            {
              id: 'feature_priorities',
              type: 'matrix',
              label: 'How important are these features to your workflow?',
              required: true,
              validation: { 
                rules: ['required'], 
                messages: { required: 'Please rate all features' }
              },
              logic: {},
              analytics: { trackingEvents: ['interact', 'change'] },
              matrix: {
                rows: ['Real-time collaboration', 'Advanced prototyping', 'Component libraries', 'Design tokens', 'Developer handoff'],
                columns: ['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Critical']
              }
            }
          ]
        }
      ],
      flow: {
        navigation: 'branching',
        progressType: 'percentage',
        allowBack: true
      },
      validation: {
        realTime: true,
        completionChecks: ['all-required-answered', 'screener-passed']
      },
      analytics: {
        trackingLevel: 'research',
        fraudDetection: true,
        behavioralMetrics: true
      },
      design: {
        theme: 'research-purple',
        layout: 'two-column',
        animations: true
      }
    }
  }
};

export type SurveyTemplateKey = keyof typeof surveyTemplates;

// Template selection helper
export function selectTemplate(analysis: any): SurveyTemplateKey | null {
  const { surveyType, complexity, targetAudience } = analysis;
  
  // Smart template matching logic
  if (surveyType === 'market-research') return 'market-research';
  if (surveyType === 'academic-study') return 'academic-study';
  if (surveyType === 'employee-engagement') return 'employee-engagement';
  if (surveyType === 'product-feedback') return 'product-feedback';
  if (surveyType === 'customer-satisfaction') return 'customer-satisfaction';
  if (surveyType === 'user-research') return 'user-research';
  
  // Fallback based on complexity
  if (complexity === 'academic') return 'academic-study';
  if (complexity === 'research') return 'user-research';
  if (complexity === 'simple') return 'customer-satisfaction';
  
  // Default fallback
  return 'product-feedback';
}

// Template customization helper
export function customizeTemplate(templateKey: SurveyTemplateKey, analysis: any) {
  const template = surveyTemplates[templateKey];
  
  // Deep clone the template
  const customized = JSON.parse(JSON.stringify(template));
  
  // Apply customizations based on analysis
  if (analysis.tone === 'casual') {
    customized.architecture.design.theme = customized.architecture.design.theme.replace('professional', 'friendly');
  }
  
  if (analysis.estimatedLength === 'short') {
    // Reduce questions for shorter surveys
    customized.architecture.pages = customized.architecture.pages.slice(0, 3);
  }
  
  if (analysis.urgency === 'immediate') {
    customized.architecture.design.animations = false; // Faster loading
  }
  
  return customized;
}