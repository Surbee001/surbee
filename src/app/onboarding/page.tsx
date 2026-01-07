"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';

// Custom font URL for Opening Hours Sans
const OPENING_HOURS_FONT_URL = 'https://ik.imagekit.io/on0moldgr/OpeningHoursSans-Regular.woff2';

// Interest topics that Surbee can help with
const INTEREST_TOPICS = [
  { id: 'research', label: 'Research' },
  { id: 'customer-feedback', label: 'Customer Feedback' },
  { id: 'market-research', label: 'Market Research' },
  { id: 'employee-surveys', label: 'Employee Engagement' },
  { id: 'product', label: 'Product Development' },
  { id: 'academia', label: 'Academic Studies' },
];

// Animated text component that reveals text word by word
function AnimatedText({
  children,
  delay = 0,
  className = "",
  style = {}
}: {
  children: string;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const words = children.split(' ');

  return (
    <span className={className} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: delay + (i * 0.05),
            ease: [0.25, 0.1, 0.25, 1]
          }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// Feature item component (text only, no icons)
function FeatureItem({
  text,
  delay
}: {
  text: string;
  delay: number;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        fontFamily: "'Opening Hours Sans', sans-serif",
        fontSize: '17px',
        lineHeight: '1.6em',
        letterSpacing: '-0.01em',
        color: '#11100C',
        margin: 0,
      }}
    >
      {text}
    </motion.p>
  );
}

// Interest pill component
function InterestPill({
  topic,
  isSelected,
  onClick,
  delay
}: {
  topic: { id: string; label: string };
  isSelected: boolean;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        borderRadius: '50px',
        border: isSelected ? '2px solid #11100C' : '2px solid rgba(100, 100, 100, 0.2)',
        backgroundColor: isSelected ? '#11100C' : '#FFFFFF',
        color: isSelected ? '#FFFFFF' : '#11100C',
        fontFamily: "'Opening Hours Sans', sans-serif",
        fontSize: '14px',
        fontWeight: 400,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {topic.label}
    </motion.button>
  );
}

function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, hasCompletedOnboarding, updateUserProfile, loading } = useAuth();

  // Step state: 1 = terms, 2 = introduction, 3 = name, 4 = interests
  const [step, setStep] = useState(1);

  // Track if we've started onboarding in this session (to prevent redirect after step 1)
  const [onboardingStarted, setOnboardingStarted] = useState(false);

  // Load custom font
  useEffect(() => {
    const font = new FontFace('Opening Hours Sans', `url(${OPENING_HOURS_FONT_URL})`);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
    }).catch((error) => {
      console.error('Error loading font:', error);
    });
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Redirect to home if already completed onboarding (only if not currently going through it)
  useEffect(() => {
    if (!loading && !onboardingStarted && hasCompletedOnboarding) {
      router.push('/home');
    }
  }, [hasCompletedOnboarding, loading, router, onboardingStarted]);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [subscribedToEmails, setSubscribedToEmails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isUnderstandHovered, setIsUnderstandHovered] = useState(false);
  const [userName, setUserName] = useState('');
  const [isNameHovered, setIsNameHovered] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLetsGoHovered, setIsLetsGoHovered] = useState(false);

  const handleContinue = async () => {
    if (!acceptedTerms) return;

    // Mark that we've started onboarding (prevents redirect to home)
    setOnboardingStarted(true);

    // Move to step 2 immediately - we'll save everything at the end
    setStep(2);
  };

  const handleUnderstand = () => {
    // Move to step 3 (name input)
    setStep(3);
  };

  const handleNameContinue = () => {
    if (!userName.trim()) return;

    // Move to step 4 (interests) - we'll save everything at the end
    setStep(4);
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      }
      return [...prev, interestId];
    });
  };

  const handleLetsGo = async () => {
    setIsLoading(true);
    try {
      // Save ALL onboarding data at once
      await updateUserProfile({
        name: userName.trim(),
        interests: selectedInterests,
        acceptedTermsAt: new Date().toISOString(),
        subscribedToEmails: subscribedToEmails,
        onboardingCompleted: true,
      });

      // If user subscribed to emails, add to email_subscribers table for Loops
      if (subscribedToEmails && user?.email) {
        try {
          await fetch('/api/email-subscribers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: userName.trim() || undefined,
              userId: user.id,
              source: 'onboarding',
              interests: selectedInterests.length > 0 ? selectedInterests : undefined,
            }),
          });
        } catch (emailError) {
          // Don't block onboarding if email subscription fails
          console.error('Error adding email subscriber:', emailError);
        }
      }

      // Redirect to home
      router.push('/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (loading || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F7F7F4',
        }}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#F7F7F4',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              width: '100%',
              maxWidth: '440px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <h1
                style={{
                  fontFamily: "'Opening Hours Sans', 'Inter', sans-serif",
                  fontSize: '26px',
                  lineHeight: '1.2em',
                  letterSpacing: '-0.05em',
                  color: '#11100C',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Let's create your account
              </h1>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: '1.5',
                  color: '#646464',
                  margin: 0,
                }}
              >
                A few things for you to review.
              </p>
            </motion.div>

            {/* Terms Box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                border: '1px solid rgba(100, 100, 100, 0.1)',
              }}
            >
              {/* Terms Checkbox */}
              <label
                style={{
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  style={{
                    width: '20px',
                    height: '20px',
                    minWidth: '20px',
                    borderRadius: '6px',
                    border: acceptedTerms ? 'none' : '2px solid rgba(100, 100, 100, 0.3)',
                    backgroundColor: acceptedTerms ? '#11100C' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: '2px',
                  }}
                >
                  {acceptedTerms && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: '#11100C',
                  }}
                >
                  I agree to Surbee's{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    style={{ color: '#11100C', textDecoration: 'underline' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Consumer Terms
                  </a>
                  {' '}and{' '}
                  <a
                    href="/acceptable-use"
                    target="_blank"
                    style={{ color: '#11100C', textDecoration: 'underline' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Acceptable Use Policy
                  </a>
                  , and confirm that I am at least 18 years old.
                </span>
              </label>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'rgba(100, 100, 100, 0.1)' }} />

              {/* Email Subscription Checkbox */}
              <label
                style={{
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  onClick={() => setSubscribedToEmails(!subscribedToEmails)}
                  style={{
                    width: '20px',
                    height: '20px',
                    minWidth: '20px',
                    borderRadius: '6px',
                    border: subscribedToEmails ? 'none' : '2px solid rgba(100, 100, 100, 0.3)',
                    backgroundColor: subscribedToEmails ? '#11100C' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: '2px',
                  }}
                >
                  {subscribedToEmails && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: '#646464',
                  }}
                >
                  Subscribe to occasional product updates and promotional emails. You can opt out anytime.
                </span>
              </label>
            </motion.div>

            {/* Continue Button */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={handleContinue}
              disabled={!acceptedTerms || isLoading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 24px',
                backgroundColor: !acceptedTerms ? 'rgba(0, 0, 0, 0.3)' : isHovered ? '#F2C4FF' : '#000000',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50px',
                fontSize: '15px',
                fontWeight: 500,
                cursor: !acceptedTerms ? 'not-allowed' : isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'background-color 0.25s ease',
                width: '100%',
              }}
            >
              {isLoading ? 'Setting up...' : 'Continue'}
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              width: '100%',
              maxWidth: '520px',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
          >
            {/* Greeting */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  fontFamily: "'Opening Hours Sans', sans-serif",
                  fontSize: '26px',
                  lineHeight: '1.2em',
                  letterSpacing: '-0.05em',
                  color: '#11100C',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                <AnimatedText delay={0.2}>
                  Hey there, I'm Surbee.
                </AnimatedText>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  fontFamily: "'Opening Hours Sans', sans-serif",
                  fontSize: '17px',
                  lineHeight: '1.6em',
                  letterSpacing: '-0.01em',
                  color: '#11100C',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                <AnimatedText delay={0.7}>
                  Built to make research extraordinarily efficient, I'm the best way to create and analyze surveys with AI.
                </AnimatedText>
              </motion.p>
            </div>

            {/* Features - simple text list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FeatureItem
                text="Just describe what you need and I'll create beautiful, professional surveys in seconds."
                delay={1.2}
              />

              <FeatureItem
                text="Watch as I build your survey live. Chat with me to refine questions, adjust styling, and perfect every detail."
                delay={1.5}
              />

              <FeatureItem
                text="When responses come in, I'll help you analyze the data and uncover insights you might have missed."
                delay={1.8}
              />
            </div>

            {/* I Understand Button - small and left-aligned */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2.1, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={handleUnderstand}
              disabled={isLoading}
              onMouseEnter={() => setIsUnderstandHovered(true)}
              onMouseLeave={() => setIsUnderstandHovered(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 20px',
                backgroundColor: isUnderstandHovered ? '#F2C4FF' : '#000000',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50px',
                fontFamily: "'Opening Hours Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 400,
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'background-color 0.25s ease',
                marginTop: '8px',
                alignSelf: 'flex-start',
              }}
            >
              {isLoading ? 'Getting started...' : 'I understand'}
            </motion.button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              width: '100%',
              maxWidth: '480px',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
          >
            {/* Name Question */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  fontFamily: "'Opening Hours Sans', sans-serif",
                  fontSize: '26px',
                  lineHeight: '1.2em',
                  letterSpacing: '-0.05em',
                  color: '#11100C',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                <AnimatedText delay={0.2}>
                  Before we get started,
                </AnimatedText>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  fontFamily: "'Opening Hours Sans', sans-serif",
                  fontSize: '22px',
                  lineHeight: '1.4',
                  letterSpacing: '-0.01em',
                  color: '#11100C',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                <AnimatedText delay={0.6}>
                  what should I call you?
                </AnimatedText>
              </motion.p>
            </div>

            {/* Name Input */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userName.trim()) {
                    handleNameContinue();
                  }
                }}
                placeholder="Your name"
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '18px',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  border: '2px solid rgba(100, 100, 100, 0.2)',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  color: '#11100C',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#11100C';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 100, 100, 0.2)';
                }}
              />
            </motion.div>

            {/* Continue Button */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={handleNameContinue}
              disabled={!userName.trim() || isLoading}
              onMouseEnter={() => setIsNameHovered(true)}
              onMouseLeave={() => setIsNameHovered(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 24px',
                backgroundColor: !userName.trim() ? 'rgba(0, 0, 0, 0.3)' : isNameHovered ? '#F2C4FF' : '#000000',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50px',
                fontSize: '15px',
                fontWeight: 500,
                cursor: !userName.trim() ? 'not-allowed' : isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'background-color 0.25s ease',
                width: '100%',
              }}
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </motion.button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              width: '100%',
              maxWidth: '600px',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
          >
            {/* Interests Question */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  fontFamily: "'Opening Hours Sans', sans-serif",
                  fontSize: '26px',
                  lineHeight: '1.2em',
                  letterSpacing: '-0.05em',
                  color: '#11100C',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                <AnimatedText delay={0.2}>
                  {`What're you into, ${userName || 'friend'}?`}
                </AnimatedText>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  fontFamily: "'Opening Hours Sans', sans-serif",
                  fontSize: '17px',
                  lineHeight: '1.6em',
                  letterSpacing: '-0.01em',
                  color: '#646464',
                  margin: 0,
                }}
              >
                Pick up to three topics you'd like to explore. This helps me personalize your experience.
              </motion.p>
            </div>

            {/* Interest Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              {INTEREST_TOPICS.map((topic, index) => (
                <InterestPill
                  key={topic.id}
                  topic={topic}
                  isSelected={selectedInterests.includes(topic.id)}
                  onClick={() => toggleInterest(topic.id)}
                  delay={0.9 + (index * 0.05)}
                />
              ))}
            </motion.div>

            {/* Selection indicator */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                fontFamily: "'Opening Hours Sans', sans-serif",
                fontSize: '14px',
                color: '#646464',
                margin: 0,
              }}
            >
              {selectedInterests.length === 0
                ? 'Select the topics that interest you'
                : `${selectedInterests.length} selected`
              }
            </motion.p>

            {/* Let's Go Button - small and left-aligned */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.7, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={handleLetsGo}
              disabled={isLoading}
              onMouseEnter={() => setIsLetsGoHovered(true)}
              onMouseLeave={() => setIsLetsGoHovered(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 20px',
                backgroundColor: isLetsGoHovered ? '#F2C4FF' : '#000000',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50px',
                fontFamily: "'Opening Hours Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 400,
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'background-color 0.25s ease',
                alignSelf: 'flex-start',
              }}
            >
              {isLoading ? 'Starting Surbee...' : "Let's go"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function OnboardingPageWrapper() {
  return (
    <Suspense fallback={
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F7F7F4',
        }}
      />
    }>
      <OnboardingPage />
    </Suspense>
  );
}
