# Custom Conversation Tone Feature

## Overview
Allow users to personalize how Surbee Lyra talks to them - from formal to funny, by name or anonymously, encouraging or direct.

## User Experience

### 1. Settings UI Location
**Path**: `/dashboard/settings/conversation`

```tsx
// Example UI
<ConversationSettings>
  <PresetSelector>
    - Professional & Direct
    - Friendly & Encouraging
    - Casual & Funny
    - Academic & Precise
    - Custom...
  </PresetSelector>

  <CustomInstructions>
    <TextArea
      placeholder="Describe how you'd like me to talk to you...

Examples:
- Call me Sarah and be super encouraging
- Be funny and use dad jokes
- Keep it professional but warm
- Explain things like I'm 5
- Be brief and to-the-point, no fluff"
      maxLength={500}
    />
  </CustomInstructions>

  <QuickToggles>
    - Use my name: [Toggle] (if name detected)
    - Use emojis: [Toggle]
    - Technical explanations: [Toggle]
  </QuickToggles>
</ConversationSettings>
```

### 2. Preset Examples

```typescript
const conversationPresets = {
  professional: {
    name: "Professional & Direct",
    description: "Clear, efficient, business-focused",
    tone: "You maintain a professional tone, get straight to the point, avoid casual language, and focus on delivering high-quality results efficiently.",
    useEmojis: false,
  },

  friendly: {
    name: "Friendly & Encouraging",
    description: "Supportive, warm, celebrates progress",
    tone: "You're enthusiastically supportive, celebrate wins, provide encouragement, and make users feel confident about their work. You're like a helpful colleague who's genuinely excited about their project.",
    useEmojis: true,
  },

  casual: {
    name: "Casual & Funny",
    description: "Relaxed, witty, uses humor",
    tone: "You're laid-back and occasionally witty, throwing in relevant jokes or light humor. You keep things fun without being unprofessional. You're like chatting with a technically skilled friend.",
    useEmojis: true,
  },

  academic: {
    name: "Academic & Precise",
    description: "Detailed, methodical, educational",
    tone: "You provide thorough explanations with proper terminology, cite best practices, explain the 'why' behind decisions, and approach problems methodically. You're like a knowledgeable professor.",
    useEmojis: false,
  },

  concise: {
    name: "Ultra Concise",
    description: "Minimal words, maximum action",
    tone: "You use as few words as possible. No fluff, no explanations unless asked. Just do the work and confirm it's done. Like a highly efficient senior developer.",
    useEmojis: false,
  },
};
```

## Database Schema

### New Table: `user_conversation_preferences`

```sql
CREATE TABLE user_conversation_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Preset or custom
  preset_type VARCHAR(50), -- 'professional', 'friendly', 'casual', 'academic', 'concise', 'custom'

  -- Custom instructions
  custom_instructions TEXT, -- User's free-form tone description

  -- Personalization
  preferred_name VARCHAR(100), -- "Call me Sarah"
  use_name BOOLEAN DEFAULT false,
  use_emojis BOOLEAN DEFAULT false,
  technical_depth VARCHAR(20) DEFAULT 'balanced', -- 'minimal', 'balanced', 'detailed'

  -- Generated tone prompt (cached)
  generated_tone_prompt TEXT, -- The actual prompt injected into system

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Row Level Security
ALTER TABLE user_conversation_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversation preferences"
  ON user_conversation_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own conversation preferences"
  ON user_conversation_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversation preferences"
  ON user_conversation_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Implementation

### 1. API Route: `/api/user/conversation-preferences`

```typescript
// GET - Fetch user's preferences
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);

  const { data } = await supabaseAdmin
    .from('user_conversation_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  return NextResponse.json({ preferences: data || getDefaultPreferences() });
}

// PUT - Update preferences
export async function PUT(request: NextRequest) {
  const userId = await getUserId(request);
  const body = await request.json();

  const { preset_type, custom_instructions, preferred_name, use_name, use_emojis } = body;

  // Generate tone prompt from preferences
  const generatedTonePrompt = generateTonePrompt({
    preset_type,
    custom_instructions,
    preferred_name,
    use_name,
    use_emojis,
  });

  const { data, error } = await supabaseAdmin
    .from('user_conversation_preferences')
    .upsert({
      user_id: userId,
      preset_type,
      custom_instructions,
      preferred_name,
      use_name,
      use_emojis,
      generated_tone_prompt: generatedTonePrompt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  return NextResponse.json({ success: true, data });
}
```

### 2. Tone Prompt Generator

```typescript
// src/lib/services/conversation-tone.ts

export function generateTonePrompt(preferences: ConversationPreferences): string {
  const parts: string[] = [];

  // Base preset
  if (preferences.preset_type && preferences.preset_type !== 'custom') {
    const preset = conversationPresets[preferences.preset_type];
    parts.push(preset.tone);
  }

  // Custom instructions (highest priority)
  if (preferences.custom_instructions) {
    parts.push(`\n\n**User's Personal Instructions:**\n${preferences.custom_instructions}`);
  }

  // Name personalization
  if (preferences.use_name && preferences.preferred_name) {
    parts.push(`\n- The user prefers to be called "${preferences.preferred_name}". Use their name naturally in conversation when appropriate.`);
  }

  // Emoji preference
  if (preferences.use_emojis) {
    parts.push(`\n- The user enjoys emojis. Feel free to use them naturally to add warmth and clarity.`);
  } else {
    parts.push(`\n- Do not use emojis.`);
  }

  // Technical depth
  if (preferences.technical_depth === 'minimal') {
    parts.push(`\n- Keep technical explanations minimal. Focus on results, not implementation details.`);
  } else if (preferences.technical_depth === 'detailed') {
    parts.push(`\n- Provide detailed technical explanations, including why certain approaches are used and what trade-offs exist.`);
  }

  return parts.join('');
}
```

### 3. Inject into System Prompt

```typescript
// surbeeWorkflowV3.ts - Modified

export function streamWorkflowV3({
  messages,
  model = 'gpt-5',
  userId, // NEW: Pass userId
}: {
  messages: ChatMessage[],
  model?: string,
  userId?: string // NEW
}) {
  // ...

  // NEW: Fetch user's conversation preferences
  let userTonePrompt = '';
  if (userId) {
    const preferences = await getUserConversationPreferences(userId);
    if (preferences?.generated_tone_prompt) {
      userTonePrompt = preferences.generated_tone_prompt;
    }
  }

  const systemPrompt = `You are Surbee Lyra, an AI assistant specializing in building surveys, questionnaires, and forms.

**Your Conversational Style:**
${userTonePrompt || defaultConversationalStyle}

${restOfSystemPrompt}`;

  // ...
}
```

### 4. Helper Function

```typescript
// src/lib/services/conversation-preferences.ts

export async function getUserConversationPreferences(userId: string) {
  const { data } = await supabaseAdmin
    .from('user_conversation_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data;
}

// Middleware to inject into API routes
export async function injectConversationTone(userId: string, systemPrompt: string): Promise<string> {
  const preferences = await getUserConversationPreferences(userId);

  if (!preferences?.generated_tone_prompt) {
    return systemPrompt;
  }

  // Replace the conversational style section
  return systemPrompt.replace(
    /\*\*Your Conversational Style:\*\*[^]*?(?=\*\*Your Core Purpose:)/,
    `**Your Conversational Style:**\n${preferences.generated_tone_prompt}\n\n`
  );
}
```

## User Examples

### Example 1: Encouraging Student
```
Preset: Friendly & Encouraging
Custom: "I'm a student working on my thesis. Please be patient and explain things clearly. Celebrate small wins with me!"
Name: Emily
Use emojis: Yes

Generated prompt:
"You're enthusiastically supportive, celebrate wins, and make the user feel confident. The user is a student working on their thesis - be patient and explain things clearly, celebrating small wins. The user prefers to be called Emily - use their name naturally. Feel free to use emojis naturally."
```

### Example 2: Busy Founder
```
Preset: Ultra Concise
Custom: "I'm building fast. Just tell me what you did, no explanations unless I ask."
Name: None
Use emojis: No

Generated prompt:
"Use as few words as possible. No fluff, no explanations unless asked. The user is building fast - just tell them what you did without explanations unless they ask. Do not use emojis."
```

### Example 3: Researcher
```
Preset: Academic & Precise
Custom: "I'm doing psychology research. Please use proper methodology terms and explain your design decisions."
Name: Dr. Martinez
Use emojis: No

Generated prompt:
"You provide thorough explanations with proper terminology and cite best practices. The user is doing psychology research - use proper methodology terms and explain your design decisions. The user prefers to be called Dr. Martinez. Do not use emojis."
```

## Implementation Timeline

1. **Phase 1** (Current): Implement base conversational improvements ✅
2. **Phase 2**: Add database schema and API routes
3. **Phase 3**: Build settings UI
4. **Phase 4**: Create preset library
5. **Phase 5**: Test with real users and refine
6. **Phase 6**: Add A/B testing to optimize presets

## Benefits

✅ **Personalization**: Users feel like Surbee is "their" assistant
✅ **Flexibility**: Works for students, researchers, founders, agencies
✅ **Retention**: Users more likely to stick with a tool that "gets them"
✅ **Differentiation**: Competitors don't offer this level of customization
✅ **Viral**: "Check out how my AI talks to me" sharing potential

## Technical Considerations

- **Performance**: Cache generated_tone_prompt to avoid regenerating on every request
- **Token Usage**: Keep custom instructions under 500 chars to avoid bloating prompts
- **Defaults**: If no preferences set, use current conversational style
- **Privacy**: User tone preferences are private, never shared
- **Updates**: Allow users to change preferences mid-conversation (takes effect on next message)
