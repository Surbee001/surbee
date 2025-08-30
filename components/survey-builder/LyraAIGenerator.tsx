'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle,
  Clock,
  Palette,
  Code,
  Download,
  ArrowRight,
  Play,
  Users,
  Mail,
  Star,
  FileText,
  CheckSquare,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LyraFormBuilder } from './LyraFormBuilder';
import type { LyraForm, AnyAtom } from './atoms/types';

interface LyraAIGeneratorProps {
  userPrompt: string;
  onFormGenerated: (form: LyraForm) => void;
}

export function LyraAIGenerator({
  userPrompt,
  onFormGenerated,
}: LyraAIGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedForm, setGeneratedForm] = useState<LyraForm | null>(null);

  const generationSteps = [
    { name: 'Analyzing prompt', icon: Sparkles, color: 'text-purple-500' },
    { name: 'Designing form structure', icon: Palette, color: 'text-blue-500' },
    { name: 'Generating atoms', icon: Code, color: 'text-green-500' },
    { name: 'Applying styling', icon: Palette, color: 'text-orange-500' },
    { name: 'Optimizing layout', icon: CheckCircle, color: 'text-green-500' },
  ];

  const generateFormFromPrompt = async (prompt: string) => {
    setIsGenerating(true);
    setGenerationStep(0);

    // Simulate AI generation process
    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Parse prompt and generate form
    const form = createFormFromPrompt(prompt);
    setGeneratedForm(form);
    setIsGenerating(false);
  };

  const createFormFromPrompt = (prompt: string): LyraForm => {
    const lowerPrompt = prompt.toLowerCase();

    // Determine form type and structure
    let formType = 'single';
    const atoms: AnyAtom[] = [];
    let title = 'Generated Form';
    let description = '';

    // Contact/Registration Forms
    if (
      lowerPrompt.includes('contact') ||
      lowerPrompt.includes('register') ||
      lowerPrompt.includes('signup')
    ) {
      title = 'Contact Information';
      description = 'Please provide your contact details';
      formType = 'multi-page';

      // Welcome page
      atoms.push({
        id: 'welcome-1',
        type: 'statement',
        label: 'Welcome',
        content:
          'Thank you for your interest! Please provide your contact information.',
        styling: { fontSize: '1.5rem', textAlign: 'center', color: '#374151' },
        metadata: {},
      });

      // Contact info
      atoms.push({
        id: 'contact-1',
        type: 'contact-info',
        label: 'Contact Information',
        fields: ['name', 'email', 'phone'],
        layout: 'single',
        required: true,
        styling: {},
        metadata: {},
      });

      // Email
      atoms.push({
        id: 'email-1',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true,
        validation: [{ type: 'email', message: 'Please enter a valid email' }],
        styling: {},
        metadata: {},
      });

      // Phone
      atoms.push({
        id: 'phone-1',
        type: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        required: false,
        styling: {},
        metadata: {},
      });

      // End screen
      atoms.push({
        id: 'end-1',
        type: 'end-screen',
        label: 'Thank You',
        title: 'Thank You!',
        message: 'We have received your information and will contact you soon.',
        showResults: false,
        styling: {},
        metadata: {},
      });
    }

    // Survey Forms
    else if (
      lowerPrompt.includes('survey') ||
      lowerPrompt.includes('feedback') ||
      lowerPrompt.includes('questionnaire')
    ) {
      title = 'Customer Survey';
      description =
        'We value your feedback. Please take a moment to complete this survey.';
      formType = 'multi-page';

      // Welcome page
      atoms.push({
        id: 'welcome-2',
        type: 'statement',
        label: 'Welcome to Our Survey',
        content:
          'Thank you for participating in our survey. This will take about 5 minutes.',
        styling: { fontSize: '1.5rem', textAlign: 'center', color: '#374151' },
        metadata: {},
      });

      // Rating question
      atoms.push({
        id: 'rating-1',
        type: 'rating',
        label: 'How would you rate our service?',
        maxRating: 5,
        iconType: 'star',
        required: true,
        styling: {},
        metadata: {},
      });

      // Multiple choice
      atoms.push({
        id: 'choice-1',
        type: 'multiple-choice',
        label: 'What features do you use most?',
        options: ['Feature A', 'Feature B', 'Feature C', 'Feature D'],
        allowMultiple: true,
        layout: 'vertical',
        required: true,
        styling: {},
        metadata: {},
      });

      // Long text
      atoms.push({
        id: 'text-1',
        type: 'long-text',
        label: 'Additional comments or suggestions',
        placeholder: 'Please share your thoughts...',
        rows: 4,
        required: false,
        styling: {},
        metadata: {},
      });

      // NPS
      atoms.push({
        id: 'nps-1',
        type: 'nps',
        label: 'How likely are you to recommend us?',
        scale: 10,
        labels: { low: 'Not likely', high: 'Very likely' },
        required: true,
        styling: {},
        metadata: {},
      });

      // End screen
      atoms.push({
        id: 'end-2',
        type: 'end-screen',
        label: 'Survey Complete',
        title: 'Thank You!',
        message: 'Your feedback helps us improve our services.',
        showResults: true,
        styling: {},
        metadata: {},
      });
    }

    // Event Registration
    else if (
      lowerPrompt.includes('event') ||
      lowerPrompt.includes('booking') ||
      lowerPrompt.includes('rsvp')
    ) {
      title = 'Event Registration';
      description = 'Register for our upcoming event';
      formType = 'multi-page';

      // Welcome
      atoms.push({
        id: 'welcome-3',
        type: 'statement',
        label: 'Event Registration',
        content:
          'Join us for an exciting event! Please complete your registration.',
        styling: { fontSize: '1.5rem', textAlign: 'center', color: '#374151' },
        metadata: {},
      });

      // Contact info
      atoms.push({
        id: 'contact-2',
        type: 'contact-info',
        label: 'Your Information',
        fields: ['name', 'email', 'phone'],
        layout: 'single',
        required: true,
        styling: {},
        metadata: {},
      });

      // Date picker
      atoms.push({
        id: 'date-1',
        type: 'date',
        label: 'Preferred Date',
        required: true,
        styling: {},
        metadata: {},
      });

      // Multiple choice for preferences
      atoms.push({
        id: 'preferences-1',
        type: 'multiple-choice',
        label: 'Event Preferences',
        options: ['Morning Session', 'Afternoon Session', 'Evening Session'],
        allowMultiple: false,
        layout: 'vertical',
        required: true,
        styling: {},
        metadata: {},
      });

      // End screen
      atoms.push({
        id: 'end-3',
        type: 'end-screen',
        label: 'Registration Complete',
        title: 'Registration Confirmed!',
        message: 'You will receive a confirmation email shortly.',
        showResults: false,
        styling: {},
        metadata: {},
      });
    }

    // Payment Forms
    else if (
      lowerPrompt.includes('payment') ||
      lowerPrompt.includes('purchase') ||
      lowerPrompt.includes('checkout')
    ) {
      title = 'Payment Information';
      description = 'Complete your purchase securely';
      formType = 'single';

      // Contact info
      atoms.push({
        id: 'contact-3',
        type: 'contact-info',
        label: 'Billing Information',
        fields: ['name', 'email'],
        layout: 'single',
        required: true,
        styling: {},
        metadata: {},
      });

      // Payment
      atoms.push({
        id: 'payment-1',
        type: 'payment',
        label: 'Payment Details',
        amount: 99.99,
        currency: 'USD',
        description: 'Premium Plan',
        provider: 'stripe',
        required: true,
        styling: {},
        metadata: {},
      });

      // Legal
      atoms.push({
        id: 'legal-1',
        type: 'legal',
        label: 'Terms and Conditions',
        required: true,
        checkboxText: 'I agree to the terms and conditions',
        styling: {},
        metadata: {},
      });
    }

    // Default simple form
    else {
      title = 'Simple Form';
      description = 'Please fill out the information below';
      formType = 'single';

      atoms.push({
        id: 'text-input-1',
        type: 'text-input',
        label: 'Name',
        placeholder: 'Enter your name',
        required: true,
        styling: {},
        metadata: {},
      });

      atoms.push({
        id: 'email-1',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        required: true,
        validation: [{ type: 'email', message: 'Please enter a valid email' }],
        styling: {},
        metadata: {},
      });

      atoms.push({
        id: 'rating-1',
        type: 'rating',
        label: 'Rating',
        maxRating: 5,
        iconType: 'star',
        required: false,
        styling: {},
        metadata: {},
      });
    }

    return {
      id: `form-${Date.now()}`,
      title,
      description,
      atoms,
      layout: {
        type: formType as 'single' | 'multi-page' | 'wizard',
        pages:
          formType === 'multi-page'
            ? [
                {
                  id: 'page-1',
                  title: 'Welcome',
                  atoms: atoms.slice(0, 1).map((a) => a.id),
                },
                {
                  id: 'page-2',
                  title: 'Information',
                  atoms: atoms.slice(1, -1).map((a) => a.id),
                },
                {
                  id: 'page-3',
                  title: 'Complete',
                  atoms: atoms.slice(-1).map((a) => a.id),
                },
              ]
            : undefined,
      },
      theme: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#f3f4f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '0.5rem',
        spacing: '1rem',
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        },
      },
      settings: {
        allowPartialSave: true,
        showProgressBar: true,
        allowBackNavigation: true,
        autoSave: true,
        emailNotifications: false,
      },
    };
  };

  const handleUseForm = () => {
    if (generatedForm) {
      onFormGenerated(generatedForm);
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span>AI Form Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="form-prompt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Describe your form
            </label>
            <Textarea
              id="form-prompt"
              placeholder="e.g., Create a contact form for a restaurant, Build a customer feedback survey, Make an event registration form..."
              value={userPrompt}
              onChange={() => {
                /* Handle prompt change */
              }}
              rows={3}
              className="w-full"
            />
          </div>

          <Button
            onClick={() => generateFormFromPrompt(userPrompt)}
            disabled={isGenerating || !userPrompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Generate Form</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Generating your form...
                    </span>
                    <Badge variant="secondary">
                      {Math.round(
                        ((generationStep + 1) / generationSteps.length) * 100,
                      )}
                      %
                    </Badge>
                  </div>

                  <Progress
                    value={
                      ((generationStep + 1) / generationSteps.length) * 100
                    }
                    className="w-full"
                  />

                  <div className="space-y-2">
                    {generationSteps.map((step, index) => (
                      <div
                        key={step.name}
                        className="flex items-center space-x-3"
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            index <= generationStep
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200'
                          }`}
                        >
                          {index <= generationStep ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            index <= generationStep
                              ? 'text-gray-900'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Form Preview */}
      <AnimatePresence>
        {generatedForm && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Form Preview</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {generatedForm.atoms.length} elements
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {generatedForm.layout.type}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {generatedForm.title}
                    </h3>
                    {generatedForm.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {generatedForm.description}
                      </p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    <LyraFormBuilder
                      form={generatedForm}
                      onFormChange={() => {}}
                      isEditing={false}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Sparkles className="w-4 h-4" />
                      <span>AI-generated form ready to use</span>
                    </div>

                    <Button
                      onClick={handleUseForm}
                      className="flex items-center space-x-2"
                    >
                      <span>Use This Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
