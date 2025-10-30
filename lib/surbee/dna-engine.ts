import { DNAMix, DNAProfile, AtomStyle, BASE_DNA_PROFILES } from './types';

// DNA Engine Utility Functions

export function weightedAverage(
  mix: DNAMix,
  property: keyof DNAProfile,
): number {
  const profiles = Object.keys(mix) as (keyof DNAMix)[];
  let totalWeight = 0;
  let weightedSum = 0;

  profiles.forEach((profile) => {
    const weight = mix[profile];
    if (weight > 0) {
      const profileData = BASE_DNA_PROFILES[profile];
      const value = profileData[property];

      if (typeof value === 'number') {
        weightedSum += value * weight;
        totalWeight += weight;
      }
    }
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

export function dominantProperty(mix: DNAMix, property: keyof DNAProfile): any {
  const profiles = Object.keys(mix) as (keyof DNAMix)[];
  let maxWeight = 0;
  let dominantValue: any = null;

  profiles.forEach((profile) => {
    const weight = mix[profile];
    if (weight > maxWeight) {
      const profileData = BASE_DNA_PROFILES[profile];
      dominantValue = profileData[property];
      maxWeight = weight;
    }
  });

  return dominantValue;
}

export function blendPalettes(mix: DNAMix): AtomStyle['palette'] {
  const profiles = Object.keys(mix) as (keyof DNAMix)[];
  let totalWeight = 0;
  const blendedPalette = {
    primary: { r: 0, g: 0, b: 0 },
    secondary: { r: 0, g: 0, b: 0 },
    background: { r: 0, g: 0, b: 0 },
    text: { r: 0, g: 0, b: 0 },
  };

  profiles.forEach((profile) => {
    const weight = mix[profile];
    if (weight > 0) {
      const profileData = BASE_DNA_PROFILES[profile];
      const palette = profileData.palette;

      // Convert hex to RGB and blend
      Object.keys(palette).forEach((colorKey) => {
        const hex = palette[colorKey as keyof typeof palette];
        const rgb = hexToRgb(hex);
        if (rgb) {
          const key = colorKey as keyof typeof blendedPalette;
          blendedPalette[key].r += rgb.r * weight;
          blendedPalette[key].g += rgb.g * weight;
          blendedPalette[key].b += rgb.b * weight;
        }
      });

      totalWeight += weight;
    }
  });

  if (totalWeight > 0) {
    return {
      primary: rgbToHex(
        Math.round(blendedPalette.primary.r / totalWeight),
        Math.round(blendedPalette.primary.g / totalWeight),
        Math.round(blendedPalette.primary.b / totalWeight),
      ),
      secondary: rgbToHex(
        Math.round(blendedPalette.secondary.r / totalWeight),
        Math.round(blendedPalette.secondary.g / totalWeight),
        Math.round(blendedPalette.secondary.b / totalWeight),
      ),
      background: rgbToHex(
        Math.round(blendedPalette.background.r / totalWeight),
        Math.round(blendedPalette.background.g / totalWeight),
        Math.round(blendedPalette.background.b / totalWeight),
      ),
      text: rgbToHex(
        Math.round(blendedPalette.text.r / totalWeight),
        Math.round(blendedPalette.text.g / totalWeight),
        Math.round(blendedPalette.text.b / totalWeight),
      ),
    };
  }

  return BASE_DNA_PROFILES.Academic.palette;
}

export function generateStyle(mix: DNAMix): AtomStyle {
  return {
    spacing: weightedAverage(mix, 'spacing'),
    radius: weightedAverage(mix, 'radius'),
    shadow: dominantProperty(mix, 'shadow'),
    palette: blendPalettes(mix),
    font: dominantProperty(mix, 'font'),
  };
}

// Color utility functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// AI Prompt Generation
export function generateAIPrompt(description: string): string {
  return `Analyze this survey description and return DNA mix:
- Academic: 0-100%
- TypeformPro: 0-100%
- Corporate: 0-100%
- Minimalist: 0-100%
- Playful: 0-100%

Description: "${description}"

Return JSON response with dna_mix and rationale.`;
}

// Mock AI Response for development
export function mockAIResponse(description: string): DNAMix {
  const lowerDesc = description.toLowerCase();

  if (
    lowerDesc.includes('academic') ||
    lowerDesc.includes('research') ||
    lowerDesc.includes('professor')
  ) {
    return {
      Academic: 85,
      Minimalist: 15,
      TypeformPro: 0,
      Corporate: 0,
      Playful: 0,
    };
  } else if (
    lowerDesc.includes('marketing') ||
    lowerDesc.includes('brand') ||
    lowerDesc.includes('quiz')
  ) {
    return {
      TypeformPro: 70,
      Playful: 30,
      Academic: 0,
      Corporate: 0,
      Minimalist: 0,
    };
  } else if (
    lowerDesc.includes('corporate') ||
    lowerDesc.includes('business') ||
    lowerDesc.includes('professional')
  ) {
    return {
      Corporate: 80,
      Minimalist: 20,
      Academic: 0,
      TypeformPro: 0,
      Playful: 0,
    };
  } else if (
    lowerDesc.includes('minimal') ||
    lowerDesc.includes('clean') ||
    lowerDesc.includes('simple')
  ) {
    return {
      Minimalist: 90,
      Academic: 10,
      TypeformPro: 0,
      Corporate: 0,
      Playful: 0,
    };
  } else if (
    lowerDesc.includes('fun') ||
    lowerDesc.includes('playful') ||
    lowerDesc.includes('creative')
  ) {
    return {
      Playful: 80,
      TypeformPro: 20,
      Academic: 0,
      Corporate: 0,
      Minimalist: 0,
    };
  }

  // Default mix
  return {
    Academic: 30,
    TypeformPro: 20,
    Corporate: 20,
    Minimalist: 15,
    Playful: 15,
  };
}
