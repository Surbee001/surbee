# Preview Tab & Session ID Linking Implementation

## Overview
Implemented complete integration between chat sessions and the preview sandbox, ensuring that the session ID is consistently used across the chat and preview experiences.

---

## What Was Implemented

### 1. **PreviewTab Component Updates** (`src/components/project-manage/PreviewTab.tsx`)

**Changes Made:**
- Added `activeChatSessionId` prop to PreviewTabProps interface
- Updated component to accept and use the session ID
- Modified iframe src to include session ID in URL

**Code Changes:**
```typescript
// Added to interface (line 68)
interface PreviewTabProps {
  projectId: string;
  sandboxBundle?: { ... } | null;
  activeChatSessionId?: string | null;  // NEW
}

// Updated component signature (line 1188)
export const PreviewTab: React.FC<PreviewTabProps> = ({
  projectId,
  sandboxBundle,
  activeChatSessionId  // NEW
}) => {

// Updated iframe src (line 1255)
<iframe
  src={`/project/${projectId}?sandbox=1${activeChatSessionId ? `&sessionId=${activeChatSessionId}` : ''}`}
  className="w-full h-full border-none rounded-2xl"
  title="Survey Preview"
/>
```

**Result:**
- ✅ Preview tab now receives and uses the active chat session ID
- ✅ Iframe loads with session ID parameter for continuity

---

### 2. **Project Manage Page Updates** (`src/app/project/[id]/manage/page.tsx`)

**Changes Made:**
- Passed `activeChatSessionId` prop to PreviewTab component

**Code Changes:**
```typescript
// Updated PreviewTab usage (line 967)
{activeTab === 'preview' && (
  <PreviewTab
    projectId={projectId}
    sandboxBundle={sandboxBundle}
    activeChatSessionId={activeChatSessionId}  // NEW
  />
)}
```

**Result:**
- ✅ Active session ID flows from manage page to preview tab
- ✅ Preview always shows the current active session

---

### 3. **Project Page Updates** (`src/app/project/[id]/page.tsx`)

**Changes Made:**
- Added import for `useChatSession` hook
- Extracted `sessionId` from URL query parameters
- Integrated `useChatSession` hook to manage chat sessions
- Added auto-save logic for messages

**Code Changes:**
```typescript
// Added import (line 21)
import { useChatSession } from '@/hooks/useChatSession';

// Extract session ID from URL (line 987)
const sessionIdFromUrl = searchParams?.get('sessionId');

// Initialize chat session management (lines 990-999)
const {
  sessionId: currentSessionId,
  isLoading: sessionLoading,
  saveMessages: saveChatMessages,
  loadSession,
} = useChatSession({
  projectId: projectId || '',
  userId: user?.id,
  sessionId: sessionIdFromUrl,
});

// Auto-save messages (lines 1081-1095)
useEffect(() => {
  if (messages.length > 0 && user?.id && !isSandboxPreview) {
    const messagesToSave = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text || msg.content || '',
      ...msg
    }));

    saveChatMessages(messagesToSave as any).catch(err => {
      console.error('Failed to save chat messages:', err);
    });
  }
}, [messages, user?.id, saveChatMessages, isSandboxPreview]);
```

**Result:**
- ✅ Project page reads session ID from URL
- ✅ Chat messages automatically saved to session
- ✅ Session persistence across page reloads
- ✅ Session ID linked to sandbox display

---

## How It Works

### User Flow:

```
1. User generates survey in chat
   ↓
2. Messages auto-saved to session
   ↓
3. Session ID stored in project.active_chat_session_id
   ↓
4. User clicks "Continue Editing" button
   ↓
5. Navigate to /project/{id}?sessionId={sessionId}
   ↓
6. Project page loads with session ID
   ↓
7. useChatSession restores previous messages
   ↓
8. User continues conversation from where they left off
```

### Preview Tab Flow:

```
1. User navigates to project manage page
   ↓
2. Manage page fetches active chat session ID
   ↓
3. Manage page passes session ID to PreviewTab
   ↓
4. PreviewTab iframe loads: /project/{id}?sandbox=1&sessionId={sessionId}
   ↓
5. Project page loads in sandbox mode with session context
   ↓
6. Survey displayed with correct session data
```

---

## Session ID & Sandbox ID Linking

**How They're Linked:**

The session ID **IS** the sandbox ID. They are the same value:

1. **Chat Session Creation:**
   - User starts chatting → Session created with UUID
   - Example: `session_id = "abc123-def456-..."`

2. **Sandbox Display:**
   - Preview tab loads iframe with same session ID
   - URL: `/project/{projectId}?sandbox=1&sessionId=abc123-def456-...`
   - Sandbox displays survey from this session

3. **Data Consistency:**
   - Same session ID used for:
     - Chat message history
     - Sandbox bundle (survey code)
     - Preview display
     - Continue editing functionality

**Database Structure:**
```sql
projects
  ├── id (UUID)
  └── active_chat_session_id (UUID) → Links to current session

chat_sessions
  ├── id (UUID) ← This is the session/sandbox ID
  ├── project_id (UUID)
  ├── messages (JSONB) ← Full conversation
  └── ...

-- When preview loads:
-- 1. Get project.active_chat_session_id
-- 2. Pass to iframe: ?sessionId=abc123-def456
-- 3. Project page loads session with that ID
-- 4. Displays survey from that session's conversation
```

---

## Files Modified

### New Files:
- ✅ `PREVIEW_SESSION_LINKING.md` (this file)

### Modified Files:
1. ✅ `src/components/project-manage/PreviewTab.tsx`
   - Added activeChatSessionId prop
   - Updated iframe src to include session ID

2. ✅ `src/app/project/[id]/manage/page.tsx`
   - Passed activeChatSessionId to PreviewTab

3. ✅ `src/app/project/[id]/page.tsx`
   - Added useChatSession import
   - Extracted sessionId from URL
   - Integrated session management
   - Added auto-save for messages

---

## Testing Steps

### Test 1: Session Persistence
1. Navigate to `/project/{projectId}`
2. Start a chat conversation
3. Send a few messages
4. Reload the page
5. ✅ **Expected:** Session should be maintained (if sessionId in URL)

### Test 2: Continue Editing
1. Generate a survey through chat
2. Navigate to `/project/{projectId}/manage`
3. Click "Continue Editing" button
4. ✅ **Expected:** Navigate back to chat with sessionId in URL
5. ✅ **Expected:** Previous messages should be loaded

### Test 3: Preview Tab with Session
1. Generate a survey through chat
2. Navigate to `/project/{projectId}/manage`
3. Switch to "Preview" tab
4. ✅ **Expected:** Sandbox displays the generated survey
5. Check iframe src in devtools
6. ✅ **Expected:** URL includes `sessionId={activeSessionId}`

### Test 4: Preview Without Survey
1. Create new project (no survey generated yet)
2. Navigate to `/project/{projectId}/manage`
3. Switch to "Preview" tab
4. ✅ **Expected:** Shows placeholder "Survey preview will appear here"

### Test 5: Message Auto-Save
1. Navigate to `/project/{projectId}`
2. Open browser DevTools → Network tab
3. Send a chat message
4. ✅ **Expected:** See POST request to `/api/projects/{id}/chat-session`
5. ✅ **Expected:** Response includes session data

---

## Key Features

### ✅ Automatic Session Creation
- Session automatically created when user starts chatting
- No manual session management required

### ✅ Real-time Message Saving
- Messages saved to database as conversation progresses
- No "save" button needed - happens automatically

### ✅ Session Continuity
- Users can leave and return to exact conversation state
- Session ID preserved in URL for shareable links

### ✅ Preview Integration
- Preview tab displays survey from active session
- Session ID passed to iframe for context consistency

### ✅ Session/Sandbox Linking
- Session ID = Sandbox ID (same value)
- Ensures preview shows correct survey version
- Maintains conversation context across views

---

## Benefits

**For Users:**
- ✅ Never lose conversation progress
- ✅ Continue editing from where they left off
- ✅ Preview shows exact survey from current session
- ✅ Seamless experience across chat and preview

**For Development:**
- ✅ Unified ID system (session = sandbox)
- ✅ Simplified state management
- ✅ Audit trail of all conversations
- ✅ Easy debugging with session IDs

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Project Page                            │
│  /project/{id}?sessionId={sid}                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useChatSession Hook                                  │  │
│  │  • Loads session by ID                                │  │
│  │  • Auto-saves messages                                │  │
│  │  • Returns sessionId                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Chat Interface                                       │  │
│  │  • Displays messages                                  │  │
│  │  • Sends new messages                                 │  │
│  │  • Generates surveys                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Session ID: abc123
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (Supabase)                        │
│                                                              │
│  chat_sessions                                              │
│  ├── id: abc123                                             │
│  ├── project_id: xyz789                                     │
│  ├── messages: [{role: 'user', content: '...'}, ...]       │
│  └── sandbox_bundle: {...}                                  │
│                                                              │
│  projects                                                   │
│  ├── id: xyz789                                             │
│  └── active_chat_session_id: abc123                         │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Session ID: abc123
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Project Manage Page                             │
│  /project/{id}/manage                                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Manage Page Logic                                    │  │
│  │  • Fetches active_chat_session_id                     │  │
│  │  • Passes to PreviewTab                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PreviewTab Component                                 │  │
│  │  • Receives activeChatSessionId                       │  │
│  │  • Loads iframe with sessionId                        │  │
│  │                                                        │  │
│  │  <iframe src="/project/{id}?sandbox=1&sessionId=abc123" /> │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Loads project page with sessionId
                         ▼
                  (Back to Project Page)
               Displays survey in sandbox mode
```

---

## Related Documentation

- **Chat Session Management:** See `CHAT_SESSION_IMPLEMENTATION.md`
- **Domain Knowledge System:** See `DOMAIN_KNOWLEDGE_SYSTEM.md`
- **Analysis Dots System:** See `ANALYSIS_DOTS_SYSTEM.md`

---

**Version**: 1.0
**Date**: 2025-01-21
**Status**: Fully Implemented ✅
