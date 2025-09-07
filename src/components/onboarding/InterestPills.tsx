import React from 'react';
import { Button } from '@/components/ui/button';

interface InterestPillsProps {
  interests: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}

export default function InterestPills({ interests, selected, onSelectionChange }: InterestPillsProps) {
  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      onSelectionChange(selected.filter(item => item !== interest));
    } else {
      onSelectionChange([...selected, interest]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {interests.map((interest) => (
        <Button
          key={interest}
          onClick={() => toggleInterest(interest)}
          variant={selected.includes(interest) ? "default" : "outline"}
          size="sm"
          className={`
            transition-all duration-200 
            ${selected.includes(interest) 
              ? 'bg-white text-black hover:bg-gray-200' 
              : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'
            }
          `}
        >
          {interest}
        </Button>
      ))}
    </div>
  );
}