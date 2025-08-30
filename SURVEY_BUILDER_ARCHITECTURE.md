# Surbee AI Survey Builder - Complete Architecture

## Overview
Surbee's AI Survey Builder is a sophisticated, PhD-level survey creation platform that generates research-grade surveys with real-time thinking, behavioral analytics, and intelligent follow-up suggestions.

## Core Features Implemented

### 1. AI-Powered Survey Generation (`/lib/ai/survey-generator.ts`)
- **PhD-Level Methodology**: Multi-step AI pipeline with research methodology principles
- **Intent Analysis**: Extracts research objectives, target audience, and methodological approach
- **Design System Generation**: Creates accessible, WCAG-compliant design systems
- **Component Code Generation**: Produces complete React TSX components with proper validation
- **Schema Validation**: Strict JSON schema validation for all AI outputs
- **Fallback Systems**: Graceful degradation when generation fails

### 2. Real-Time Thinking Process (`/api/think`, `ThoughtProcess` component)
- **SSE Streaming**: Server-Sent Events for real-time thinking display
- **Structured Planning**: AI outputs thinking steps in validated JSON format
- **Live UI Edits**: Real-time CSS/DOM manipulation during thinking
- **Shimmer Effects**: Beautiful loading states with timing calculations
- **Auto-Close**: Intelligent dropdown management after thinking completion

### 3. Safe Component Execution (`SurveyRenderer.tsx`)
- **Security Validation**: Code analysis to prevent dangerous operations
- **Babel Compilation**: Safe TSX-to-JS transformation with error handling
- **Dependency Control**: Only allows React and Lucide React imports
- **Error Boundaries**: Graceful fallback components for compilation failures
- **Runtime Testing**: Pre-execution component validation

### 4. Survey Logic Engine (`/lib/survey/logic-engine.ts`)
- **Conditional Logic**: Show/hide components based on responses
- **Skip Logic**: Dynamic page navigation with custom conditions
- **Progress Tracking**: Intelligent completion percentage calculation
- **State Management**: Export/import survey state for persistence
- **Real-time Evaluation**: Logic re-evaluation on every response update

### 5. Validation System (`/lib/validation/survey-validators.ts`)
- **Field-Level Validation**: Type-specific validation for all input types
- **Cross-Field Validation**: Consistency checks across multiple questions
- **Accuracy Checks**: Attention checks, speed checks, pattern detection
- **Custom Validators**: JavaScript function support for complex validation
- **Real-time Feedback**: Immediate validation feedback during input

### 6. Behavioral Analytics (`/api/analytics/capture`)
- **Event Tracking**: Page views, interactions, timing data
- **Behavioral Insights**: Drop-off analysis, completion rates, time analytics
- **Quality Metrics**: Response speed, pattern detection, attention monitoring
- **Real-time Dashboard**: Live analytics with AI-generated recommendations
- **Data Quality**: Automated data quality assessment and flagging

### 7. Follow-up Suggestions (`FollowUpSuggestions.tsx`)
- **AI-Generated Suggestions**: Intelligent recommendations for survey improvement
- **Categorized Actions**: Add questions, modify design, improve accessibility
- **Priority System**: High/medium/low priority suggestions
- **One-Click Application**: Auto-apply suggestions as new chat prompts
- **Dismissal Tracking**: Remember dismissed suggestions per session

## Technical Architecture

### Frontend Components
```
src/
├── app/
│   ├── page.tsx                    # Home dashboard with AI chat
│   ├── project/[id]/page.tsx       # Survey builder with enhanced features
│   └── api/
│       ├── think/route.ts          # SSE thinking process endpoint
│       ├── ai/generate-enhanced/   # Advanced survey generation
│       └── analytics/capture/      # Analytics collection endpoint
├── components/
│   ├── SurveyRenderer.tsx          # Safe component execution engine
│   ├── survey/FollowUpSuggestions.tsx
│   ├── analytics/SurveyAnalyticsDashboard.tsx
│   └── survey-builder/thought-process.tsx
├── lib/
│   ├── schemas/survey-schemas.ts   # Comprehensive type definitions
│   ├── survey/logic-engine.ts      # Survey flow and logic management
│   ├── validation/survey-validators.ts
│   └── ai/survey-generator.ts      # Enhanced AI generation pipeline
└── hooks/
    └── useSurveyLogic.ts          # React hook for survey logic
```

### Backend Services
- **Survey Generation Pipeline (tRPC)**: Multi-model AI system for comprehensive survey creation via `src/server/api/routers/survey.ts` using `lib/ai/survey-generator.ts` (pattern learning included)
- **Analytics Processing**: Real-time event capture with intelligent insights
- **Validation Engine**: Multi-layered validation with accuracy checking
- **Logic Runtime**: Dynamic survey flow based on user responses
- **Security Layer**: Code validation and safe execution environment

## Key Capabilities

### PhD-Level Survey Design
- Research methodology integration (cross-sectional, longitudinal, experimental)
- Bias reduction strategies and validity measures
- Psychometric principles in question design
- Statistical considerations for data quality

### Advanced Analytics
- Real-time behavioral tracking (timing, interactions, patterns)
- Drop-off analysis and completion optimization
- Accuracy checking (attention, consistency, speed)
- AI-generated insights and recommendations

### Intelligent UI Generation
- Complete React component generation from prompts
- Tailwind CSS styling with design system compliance
- Accessibility features (ARIA labels, keyboard navigation)
- Responsive design for all device types

### Research-Grade Features
- Multi-page surveys with complex branching logic
- Validation rules for data quality assurance
- Behavioral data collection for research insights
- Export capabilities for academic analysis

## Usage Flow

### 1. Survey Creation
```
User Prompt → AI Thinking (SSE) → Multi-Step Generation → Component Compilation → Live Preview
```

### 2. Real-Time Interaction
```
User Input → Logic Evaluation → Validation → Analytics Capture → UI Updates
```

### 3. Continuous Improvement
```
Survey Completion → Analytics Analysis → AI Recommendations → Follow-up Suggestions
```

## Integration Points

### With Existing Systems
- **Supabase**: Database persistence for surveys, analytics, and user data
- **tRPC (single source)**: Type-safe API layer for survey operations and generation
- **FlowBuilderV3**: Visual logic editor integration
- **UserNameBadge**: User session management
- **Checkpoint System**: Version control and state restoration

### With Future Features
- **Community Surveys**: Template sharing and remixing capabilities
- **Knowledge Base**: RAG integration for domain-specific survey templates
- **Advanced Analytics**: Machine learning insights and predictive modeling
- **Collaboration**: Real-time multi-user survey editing

## Security & Quality

### Code Safety
- AST parsing for dangerous function detection
- Whitelist-only imports (React, Lucide React)
- Sandboxed component execution
- Runtime error boundaries

### Data Quality
- Multi-layered validation (client, server, database)
- Accuracy checking algorithms
- Behavioral anomaly detection
- Response quality scoring

### Performance
- Component caching and memoization
- Lazy loading for large surveys
- Optimized re-rendering with React patterns
- Background analytics processing

## Development Workflow

### For New Survey Types
1. Update `survey-schemas.ts` with new component types
2. Add validation rules in `survey-validators.ts`
3. Enhance AI prompts in `survey-generator.ts`
4. Test with `SurveyRenderer` error handling

### For New Analytics
1. Define events in analytics capture API
2. Update behavioral tracking in components
3. Add insights generation logic
4. Create dashboard visualizations

### For New Logic Features
1. Extend `SurveyLogicEngine` with new condition types
2. Update `useSurveyLogic` hook for React integration
3. Add FlowBuilder visual representation
4. Test with complex survey flows

## Next Development Phases

### Phase 1: Enhanced AI (Immediate)
- RAG integration for domain-specific surveys
- Advanced prompt engineering for better component generation
- Multi-language survey support
- Custom AI model fine-tuning

### Phase 2: Advanced Analytics (Near-term)
- Machine learning insights for survey optimization
- Predictive completion modeling
- Advanced behavioral pattern recognition
- A/B testing framework for survey variants

### Phase 3: Community Features (Medium-term)
- Survey template marketplace
- Collaborative editing and sharing
- Peer review system for research surveys
- Citation and methodology documentation

### Phase 4: Enterprise Features (Long-term)
- White-label survey platform
- Advanced security and compliance
- Custom branding and domain integration
- Enterprise analytics and reporting

## Technical Excellence

The system demonstrates:
- **Sophisticated AI Integration**: Multi-model pipeline with validation
- **Research-Grade Quality**: PhD-level methodology and bias reduction
- **Production Safety**: Comprehensive error handling and security
- **User Experience**: Real-time feedback and intelligent suggestions
- **Scalable Architecture**: Modular design for future enhancements

This represents a complete, production-ready AI survey builder that combines cutting-edge AI capabilities with rigorous research methodology and excellent user experience.
