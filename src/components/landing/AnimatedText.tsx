"use client";

import React, { useState, useEffect } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  colors?: string[];
  transitionDuration?: number;
  highlightDuration?: number;
  intervalDuration?: number;
  characterDelay?: number;
}

// Helper function to generate color variations (different tones of the same color)
const generateColorVariations = (baseColor: string, count: number): string[] => {
  // Extract RGB values
  const rgbMatch = baseColor.match(/\d+/g);
  if (!rgbMatch) return [baseColor];
  
  const r = parseInt(rgbMatch[0]);
  const g = parseInt(rgbMatch[1]);
  const b = parseInt(rgbMatch[2]);
  
  const variations: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Create variations by adjusting brightness and saturation
    const factor = 0.7 + (0.6 * i / count); // Vary from 70% to 130% brightness
    const saturation = 0.8 + (0.4 * i / count); // Vary saturation
    
    const newR = Math.min(255, Math.max(0, Math.floor(r * factor)));
    const newG = Math.min(255, Math.max(0, Math.floor(g * factor)));
    const newB = Math.min(255, Math.max(0, Math.floor(b * factor)));
    
    variations.push(`rgb(${newR}, ${newG}, ${newB})`);
  }
  
  return variations;
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = "",
  colors = [
    "rgb(255, 181, 146)", // peach/orange
    "rgb(108, 213, 253)", // light blue
    "rgb(255, 200, 200)", // light pink
    "rgb(200, 255, 200)", // light green
    "rgb(255, 255, 200)", // light yellow
    "rgb(200, 200, 255)", // light purple
    "rgb(255, 220, 177)", // warm orange
    "rgb(177, 220, 255)", // cool blue
  ],
  transitionDuration = 300,
  highlightDuration = 1200,
  intervalDuration = 3000,
  characterDelay = 150,
}) => {
  const [words, setWords] = useState<Array<{
    id: string;
    text: string;
    characters: Array<{
      id: string;
      char: string;
      color: string;
      isHighlighted: boolean;
    }>;
    isHighlighted: boolean;
  }>>([]);

  useEffect(() => {
    // Split text into individual words and characters
    const wordArray = text.split(' ');
    const wordObjects = wordArray.map((word, wordIndex) => ({
      id: `word-${wordIndex}`,
      text: word,
      characters: word.split('').map((char, charIndex) => ({
        id: `word-${wordIndex}-char-${charIndex}`,
        char: char,
        color: '#171717', // Default black color
        isHighlighted: false,
      })),
      isHighlighted: false,
    }));
    
    setWords(wordObjects);
  }, [text]);

  useEffect(() => {
    if (words.length === 0) return;

    const highlightRandomWord = () => {
      // Reset all words and characters to black
      setWords(prev => prev.map(word => ({
        ...word,
        isHighlighted: false,
        characters: word.characters.map(char => ({
          ...char,
          color: '#171717',
          isHighlighted: false,
        }))
      })));

      // After a brief delay, highlight a random word
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * words.length);
        const selectedWord = words[randomIndex];
        const baseColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Generate color variations for each character
        const colorVariations = generateColorVariations(baseColor, selectedWord.characters.length);
        
        // Mark the word as highlighted
        setWords(prev => prev.map((word, index) => 
          index === randomIndex 
            ? { ...word, isHighlighted: true }
            : word
        ));

        // Animate each character sequentially - only one at a time
        selectedWord.characters.forEach((_, charIndex) => {
          setTimeout(() => {
            setWords(prev => prev.map((word, wordIndex) => 
              wordIndex === randomIndex 
                ? {
                    ...word,
                    characters: word.characters.map((char, cIndex) => {
                      if (cIndex === charIndex) {
                        // Highlight the current character
                        return { 
                          ...char, 
                          color: colorVariations[cIndex], 
                          isHighlighted: true 
                        };
                      } else {
                        // Ensure all other characters are black
                        return { 
                          ...char, 
                          color: '#171717', 
                          isHighlighted: false 
                        };
                      }
                    })
                  }
                : word
            ));

            // Reset this character back to black after a shorter duration
            setTimeout(() => {
              setWords(prev => prev.map((word, wordIndex) => 
                wordIndex === randomIndex 
                  ? {
                      ...word,
                      characters: word.characters.map((char, cIndex) => 
                        cIndex === charIndex 
                          ? { ...char, color: '#171717', isHighlighted: false }
                          : char
                      )
                    }
                  : word
              ));
            }, characterDelay - 50); // Reset just before the next character highlights
          }, charIndex * characterDelay);
        });

        // Reset the word highlight after all characters are done
        setTimeout(() => {
          setWords(prev => prev.map((word, index) => 
            index === randomIndex 
              ? { ...word, isHighlighted: false }
              : word
          ));
        }, highlightDuration + (selectedWord.characters.length * characterDelay));
      }, 100);
    };

    // Start the animation cycle
    const interval = setInterval(highlightRandomWord, intervalDuration);
    
    // Initial highlight after a short delay
    setTimeout(highlightRandomWord, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [words.length, colors, highlightDuration, intervalDuration, characterDelay]);

  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={word.id}>
          {word.characters.map((character) => (
            <span
              key={character.id}
              style={{
                transition: `color ${transitionDuration}ms ease-in-out`,
                color: character.color,
              }}
            >
              {character.char}
            </span>
          ))}
          {wordIndex < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
};
