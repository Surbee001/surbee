import { NextRequest, NextResponse } from 'next/server';
import { mockAIResponse } from '../../../../../lib/surbee/dna-engine';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 },
      );
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate DNA mix based on description
    const dnaMix = mockAIResponse(description);

    // Generate rationale based on the mix
    const rationale = generateRationale(dnaMix, description);

    return NextResponse.json({
      dna_mix: dnaMix,
      rationale,
      success: true,
    });
  } catch (error) {
    console.error('Surbee analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze survey description' },
      { status: 500 },
    );
  }
}

function generateRationale(dnaMix: any, description: string): string {
  const dominantProfile = Object.entries(dnaMix).reduce((a, b) =>
    dnaMix[a[0]] > dnaMix[b[0]] ? a : b,
  )[0];

  const rationales = {
    Academic: `This survey requires a clean, professional design suitable for academic research. The ${dominantProfile} profile emphasizes readability and credibility, perfect for gathering reliable data from research participants.`,
    TypeformPro: `This survey benefits from an engaging, modern design that encourages participation. The ${dominantProfile} profile creates an interactive experience that keeps respondents engaged throughout the survey.`,
    Corporate: `This survey needs a professional, trustworthy appearance suitable for business contexts. The ${dominantProfile} profile conveys reliability and professionalism while maintaining accessibility.`,
    Minimalist: `This survey requires a clean, distraction-free design that focuses attention on the content. The ${dominantProfile} profile eliminates visual clutter to improve response quality.`,
    Playful: `This survey benefits from an energetic, creative design that makes participation enjoyable. The ${dominantProfile} profile creates a fun, engaging experience that encourages completion.`,
  };

  return (
    rationales[dominantProfile as keyof typeof rationales] ||
    `The ${dominantProfile} design profile was selected to best match the survey requirements and target audience.`
  );
}
