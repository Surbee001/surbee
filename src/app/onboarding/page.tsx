"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingStep from '@/components/onboarding/OnboardingStep';
import InterestPills from '@/components/onboarding/InterestPills';

interface OnboardingData {
  ageRange: string;
  hearAboutUs: string;
  interests: string[];
  name: string;
  surveyPreference: 'research' | 'fast';
}

const steps = [
  {
    id: 'welcome',
    title: 'Welc<em>o</em>me to Surbee',
    description: 'We\'ll ask you a few quick questions to personalize your experience.',
  },
  {
    id: 'age',
    title: 'What\'s y<em>o</em>ur age range?',
    description: 'This helps us create better survey templates for you.',
  },
  {
    id: 'source',
    title: 'Where did you h<em>e</em>ar about us?',
    description: 'Help us understand how people discover Surbee.',
  },
  {
    id: 'interests',
    title: 'What <em>i</em>nterests y<em>o</em>u?',
    description: 'Select topics that fascinate you to get relevant suggestions.',
  },
  {
    id: 'name',
    title: 'What Should We C<em>a</em>ll You?',
    description: 'Just so we can personalize your experience.',
  },
  {
    id: 'complete',
    title: 'All <em>s</em>et!',
    description: 'You\'re ready to start creating amazing surveys.',
  },
];

const backgroundImages = [
  'https://github.com/Surbee001/webimg/blob/main/u7411232448_A_radiant_quasar_glowing_in_deep_space_swirling_str_de4b6b4d-88a6-4c80-8e8a-9e521e57bd9a.png?raw=true',
  'https://github.com/Surbee001/webimg/blob/main/u7411232448_An_ancient_library_overgrown_with_glowing_plants_ho_10f63546-553d-4e9d-b8e1-28a37405b661.png?raw=true',
  'https://github.com/Surbee001/webimg/blob/main/u7411232448_An_ancient_library_overgrown_with_glowing_plants_ho_9a0349a1-1706-4f65-ab44-e7cc62af5b72.png?raw=true',
  'https://github.com/Surbee001/webimg/blob/main/u7411232448_create_a_soft_mountain_sceenary_with_furutistic_atm_764a2eaa-7543-4abb-8f5b-c57677355786.png?raw=true'
];

const ageRanges = ['18-24', '25-34', '35-54', '55+'];

const hearAboutOptions = [
  'Social Media',
  'Search Engine',
  'Friend/Colleague',
  'Advertisement',
  'Blog/Article',
  'Other'
];

const interestOptions = [
  'Technology', 'Marketing', 'Healthcare', 'Education', 'Finance',
  'Entertainment', 'Sports', 'Food & Dining', 'Travel', 'Science',
  'Art & Design', 'Music', 'Fashion', 'Gaming', 'Environment'
];

function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUserProfile } = useAuth();
  
  // Get step from URL or default to 0
  const getInitialStep = () => {
    const step = searchParams.get('step');
    return step ? Math.max(0, Math.min(parseInt(step) - 1, steps.length - 1)) : 0;
  };
  
  const [currentStep, setCurrentStep] = useState(getInitialStep());
  const [isLoading, setIsLoading] = useState(false);

  // Sync with URL changes (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentStep(getInitialStep());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [data, setData] = useState<OnboardingData>({
    ageRange: '',
    hearAboutUs: '',
    interests: [],
    name: '',
    surveyPreference: 'fast'
  });

  const updateStepInURL = (step: number) => {
    const url = new URL(window.location.href);
    if (step === 0) {
      url.searchParams.delete('step');
    } else {
      url.searchParams.set('step', (step + 1).toString());
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Complete onboarding
      setIsLoading(true);
      try {
        // Save user profile through AuthContext
        await updateUserProfile({
          name: data.name,
          ageRange: data.ageRange,
          hearAboutUs: data.hearAboutUs,
          interests: data.interests,
          surveyPreference: data.surveyPreference
        });
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateStepInURL(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateStepInURL(prevStep);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome step
      case 1: return data.ageRange; // Age range
      case 2: return data.hearAboutUs; // Source
      case 3: return data.interests.length > 0; // Interests
      case 4: return data.name.trim(); // Name
      case 5: return true; // Complete step
      default: return false;
    }
  };

  const getCurrentImage = () => {
    // Use the first image (quasar) for the last step as requested
    if (currentStep === 5) return backgroundImages[0];
    // For other steps, use the remaining images in order
    const imageIndex = currentStep % (backgroundImages.length - 1) + 1;
    return backgroundImages[imageIndex];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return null; // Welcome step
      
      case 1:
        // Age range selection
        return (
          <div className="space-y-6 max-w-md">
            <div className="age-range-grid">
              {ageRanges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setData({ ...data, ageRange: range })}
                  className={`age-range-button ${data.ageRange === range ? 'selected' : ''}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 2:
        // Where did you hear about us
        return (
          <div className="space-y-6 max-w-md">
            <select
              value={data.hearAboutUs}
              onChange={(e) => setData({ ...data, hearAboutUs: e.target.value })}
              className="onboarding-select"
              autoFocus
            >
              <option value="">Select an option</option>
              {hearAboutOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 3:
        // Interests selection
        return (
          <div className="space-y-6 max-w-2xl">
            <InterestPills
              interests={interestOptions}
              selected={data.interests}
              onSelectionChange={(interests) => setData({ ...data, interests })}
            />
          </div>
        );
      
      case 4:
        // Name input
        return (
          <div className="space-y-6 max-w-md">
            <Input
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Enter your name"
              className="onboarding-input"
              autoFocus
            />
          </div>
        );
      
      case 5:
        return null; // Complete step
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Surbee Logo */}
      <div className="absolute top-8 left-8 z-10">
        <img 
          src="https://github.com/Surbee001/webimg/blob/main/White%20Logo.png?raw=true"
          alt="Surbee" 
          className="h-10 w-auto"
        />
      </div>

      {/* Left Side - Content */}
      <div className="flex-1 flex items-center justify-start pl-24 pr-16">
        <div className="max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-8"
            >
              <OnboardingStep
                title={steps[currentStep].title}
                description={steps[currentStep].description}
              >
                {renderStepContent()}
              </OnboardingStep>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 flex items-center gap-4">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="onboarding-button"
                style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white' }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="onboarding-button"
            >
              {isLoading ? 'Setting up...' : currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="w-1/2 relative overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentStep}
            src={getCurrentImage()}
            alt="Onboarding background"
            className="onboarding-right-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function OnboardingPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <OnboardingPage />
    </Suspense>
  );
}