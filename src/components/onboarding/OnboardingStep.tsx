import React from 'react';

interface OnboardingStepProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function OnboardingStep({ title, description, children }: OnboardingStepProps) {
  return (
    <div className="text-left space-y-6">
      <div className="space-y-4">
        <h1 
          className="text-4xl font-light text-white leading-tight"
          style={{ fontFamily: 'PP Editorial, serif', fontWeight: 100 }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p className="text-lg text-gray-300 leading-relaxed">{description}</p>
      </div>
      {children && (
        <div className="mt-8">
          {children}
        </div>
      )}
    </div>
  );
}