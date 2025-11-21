# Intelligent Draggable Analysis System

## Overview

I've implemented a comprehensive intelligent analysis system for your project insights page that includes:

1. **Draggable Analysis Dots** - Place anywhere on the page to analyze components
2. **AI-Powered Component Analysis** - Understands what's under each dot and provides insights
3. **Enhanced Intelligent Chat** - Ask complex questions about your survey data
4. **Beautiful Glass UI** - Consistent with your existing design language

---

## Features

### 1. Draggable Analysis Dots

- **Add Multiple Dots**: Click "Add Analysis Dot" button to create new analysis points
- **Drag Anywhere**: Drag dots to any position on the insights page
- **Persistent**: Dot positions are saved per project and restored on page reload
- **Component Detection**: Automatically detects what component (chart, table, metric, etc.) is under each dot
- **Smart Analysis**: Click any dot to get AI-powered insights about that component

### 2. Intelligent Chat (Enhanced)

The chat at the bottom now has **full AI capabilities** with:

- **Real-time Streaming**: AI responses stream word-by-word for fast perceived performance
- **Full Project Data Access**: AI has access to all survey responses, timing data, quality scores, etc.
- **Complex Query Support**: Can answer detailed questions like:
  - "Show me the first 5 people who completed this survey in under 5 minutes"
  - "What are the common themes in text responses to question 3?"
  - "Which responses are flagged for quality issues?"
  - "What's the completion rate by day of week?"

- **Function Calling**: AI can execute database queries to fetch exact data
- **Context-Aware**: Understands the current page state and components

### 3. Glass UI Design

All new components use your existing glass styling:
- Background: `rgba(255, 255, 255, 0.08)`
- Backdrop filter: `blur(16px)`
- Consistent with the existing chat bubble design

---

## Setup Instructions

### Step 1: Run Database Migration

The database table for storing analysis dots needs to be created:

1. Open your Supabase dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the entire SQL from: `supabase/migrations/20250115_add_analysis_dots.sql`
5. Click **Run**

Alternatively, you can run:
```bash
node scripts/run-analysis-dots-migration.js
```
This will display the migration instructions.

### Step 2: Ensure Environment Variables

Make sure you have the following in your `.env.local`:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Build and Run

```bash
# Install dependencies (already done)
pnpm install

# Run development server
pnpm dev
```

---

## How to Use

### Using Analysis Dots

1. **Navigate** to any project's Insights tab (`/project/[id]/manage` → Insights tab)
2. **Click** "Add Analysis Dot" button (bottom right)
3. **Drag** the new dot to any component on the page (charts, tables, metrics, etc.)
4. **Click** the dot to see AI analysis of that component
5. **Delete** dots by clicking the small red X when hovering over them

### Using the Intelligent Chat

1. **Click** the chat input at the bottom of the page
2. **Type** your question (simple or complex):
   - "What's my response rate?"
   - "Show me responses that completed in under 3 minutes"
   - "Analyze question 2 responses"
   - "Give me summary statistics"
3. **Watch** the AI response stream in real-time
4. **Ask follow-ups** - the chat maintains conversation context

---

## Architecture

### Frontend Components

**Created Files:**
- `src/contexts/ComponentRegistry.tsx` - Tracks all analyzable components
- `src/components/analysis-dots/DraggableAnalysisDot.tsx` - Individual draggable dot
- `src/components/analysis-dots/AnalysisPopup.tsx` - Glass-styled analysis popup
- `src/components/analysis-dots/AnalysisDotsManager.tsx` - Manages all dots for a project
- `src/lib/services/component-detection.ts` - Component serialization for AI

**Modified Files:**
- `src/app/project/[id]/manage/page.tsx` - Integrated ComponentRegistry and AI chat
- `src/types/database.ts` - Added AnalysisDot type

### Backend API Routes

**Created:**
- `src/app/api/projects/[id]/analysis-dots/route.ts` - CRUD operations for dots
- `src/app/api/projects/[id]/ai-analysis/route.ts` - Streaming AI analysis endpoint
- `src/app/api/projects/[id]/chat/route.ts` - Enhanced chat with function calling

### Database

**New Table:** `analysis_dots`
```sql
- id: UUID (primary key)
- project_id: UUID (foreign key to projects)
- user_id: UUID
- position_x: NUMERIC (percentage 0-100)
- position_y: NUMERIC (percentage 0-100)
- label: TEXT (optional)
- component_id: TEXT (optional)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Features:**
- Row Level Security (RLS) enabled
- Users can only see/edit dots for their own projects
- Cascade delete when project is deleted
- Indexed for performance

---

## AI Capabilities

### Component Analysis

When you click a dot, the AI:
1. **Detects** the component type (chart, metric, table, response, funnel)
2. **Serializes** the component data
3. **Analyzes** with Claude Sonnet 4.5
4. **Streams** insights in real-time
5. **Provides** actionable recommendations

### Chat Function Calling

The chat AI has access to these functions:

1. **query_responses** - Filter responses by time, quality, date, flags
2. **get_response_details** - Get full details of a specific response
3. **analyze_question** - Analyze all responses to a specific question
4. **get_summary_statistics** - Overall project metrics

The AI automatically decides which functions to call based on your question.

---

## Performance Features

- **Streaming**: Both chat and analysis stream responses for <3s perceived latency
- **Caching**: Component analyses are cached for 5 minutes
- **Lazy Loading**: Dots only fetch data when clicked
- **Debounced Updates**: Position updates are debounced during dragging
- **Indexed Queries**: Database queries use indexes for fast data retrieval

---

## Technical Details

### Stack
- **Frontend**: React, Next.js 15, TypeScript
- **Drag & Drop**: @dnd-kit/core
- **AI**: Anthropic Claude Sonnet 4.5 via SDK
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS + Custom Glass Effects

### Streaming Implementation
- Server-Sent Events (SSE) for real-time AI responses
- Word-by-word streaming for natural feel
- Automatic reconnection on errors
- Fallback to mock responses if AI unavailable

### Security
- Row Level Security on all database operations
- User authentication required for all API endpoints
- Project ownership verification
- Input sanitization

---

## Examples

### Example Chat Queries

**Simple:**
- "What's the completion rate?"
- "Show me the latest responses"
- "How many people have responded?"

**Complex:**
- "Find all responses completed in under 5 minutes with a quality score above 0.8"
- "What are the most common answers to question 3?"
- "Show me flagged responses from the last 7 days"
- "Compare completion times between mobile and desktop users"

### Example Analysis Scenarios

1. **Hover over a chart**: Get trend analysis, anomaly detection, recommendations
2. **Hover over a metric**: Get context, comparisons, improvement suggestions
3. **Hover over a response**: Get quality assessment, behavioral insights, flags
4. **Hover over funnel**: Get drop-off analysis, bottleneck identification

---

## Troubleshooting

### Dots not appearing
- Ensure migration has been run
- Check browser console for errors
- Verify API endpoints are accessible

### AI not responding
- Verify `ANTHROPIC_API_KEY` is set in `.env.local`
- Check API rate limits
- Look for errors in terminal/console
- Falls back to mock responses if AI unavailable

### Analysis not showing component data
- Ensure you're on the Insights tab
- Verify ComponentRegistry is wrapping the content
- Check that components are being registered

---

## Future Enhancements

Potential improvements for the future:

1. **Component Annotation**: Add notes/comments to specific components
2. **Shared Insights**: Share analysis dots with team members
3. **Insight History**: Track analysis over time
4. **Export**: Export insights to PDF/reports
5. **Voice Input**: Ask questions via voice
6. **Smart Suggestions**: AI proactively suggests interesting insights

---

## Files Changed/Created Summary

### New Files (14)
1. `supabase/migrations/20250115_add_analysis_dots.sql`
2. `src/types/database.ts` (updated)
3. `src/contexts/ComponentRegistry.tsx`
4. `src/lib/services/component-detection.ts`
5. `src/components/analysis-dots/DraggableAnalysisDot.tsx`
6. `src/components/analysis-dots/AnalysisPopup.tsx`
7. `src/components/analysis-dots/AnalysisDotsManager.tsx`
8. `src/app/api/projects/[id]/analysis-dots/route.ts`
9. `src/app/api/projects/[id]/ai-analysis/route.ts`
10. `src/app/api/projects/[id]/chat/route.ts`
11. `scripts/run-analysis-dots-migration.js`
12. `ANALYSIS_DOTS_SYSTEM.md` (this file)

### Modified Files (2)
1. `src/app/project/[id]/manage/page.tsx` - Added ComponentRegistry, AnalysisDotsManager, Real AI chat
2. `package.json` - Added @dnd-kit dependencies

### Dependencies Added
- `@dnd-kit/core` - Drag and drop functionality
- `@dnd-kit/utilities` - DnD utilities

---

## Support

For issues or questions:
1. Check browser console for errors
2. Check terminal/server logs
3. Verify all environment variables are set
4. Ensure database migration was successful
5. Check Supabase dashboard for table/RLS policies

---

**Status**: ✅ Implementation Complete
**Next Step**: Run the database migration and test the system!
