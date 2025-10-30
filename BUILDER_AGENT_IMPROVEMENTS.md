# Builder Agent Improvements Documentation

## Problem Statement

The builder agent in `surbeeWorkflowV2.ts` was stopping prematurely after describing what it would do, rather than actually executing the tool calls. This resulted in incomplete builds where:

1. Agent would say "I will set up a survey..." but then stop
2. No actual files were created via tool calls
3. The workflow would complete without a working survey

## Root Causes

1. **Passive Language in System Prompt**: The original prompt used phrases like "You are an expert survey builder" which encouraged description over action
2. **No Enforcement of Tool Execution**: No mechanism to detect when the agent stopped without completing the task
3. **Weak User Messages**: The final user message was too polite ("Build this survey now using the tools available")
4. **No Follow-up Mechanism**: If the agent stopped prematurely, there was no retry logic

## Solutions Implemented

### 1. Aggressive System Prompt (Lines 1404-1476)

**Changes:**
- Added "who EXECUTES tasks using tools, not just describes them" to the agent description
- Added 🚨 CRITICAL RULES section with 4 explicit rules:
  1. NEVER say "I will do X" without immediately doing X
  2. NEVER describe code without calling create_file
  3. NEVER stop until all necessary tools are called
  4. Each response MUST include tool calls

**Before:**
```typescript
system: `You are an expert survey builder. You MUST create a complete, working React survey...`
```

**After:**
```typescript
system: `You are an expert survey builder who EXECUTES tasks using tools, not just describes them.

🚨 CRITICAL RULES:
1. NEVER say "I will do X" without immediately doing X with tool calls
2. NEVER describe code without calling create_file with the actual code
3. NEVER stop until you've called all necessary tools to complete the task
4. Each response MUST include tool calls, not just explanations
...
REMEMBER: Tool execution, not explanations. Act, don't describe.`
```

### 2. Forceful User Message (Lines 1477-1493)

**Changes:**
- Replaced polite request with explicit command
- Listed exact tool calls to execute in order
- Added "DO NOT explain" and "EXECUTE immediately" directives

**Before:**
```typescript
{ role: 'user', content: 'Build this survey now using the tools available.' }
```

**After:**
```typescript
{
  role: 'user',
  content: `Execute the build plan NOW by calling the required tools in order:
1. Call init_sandbox("${projectName}")
2. Call create_shadcn_component for each UI component needed
3. Call create_file with the complete Survey.tsx code
4. Call render_preview

DO NOT explain what you will do. DO NOT describe the code.
EXECUTE the tool calls immediately in this response.

Start with init_sandbox now.`
}
```

### 3. Detection and Recovery Mechanism (Lines 1563-1636)

**New Logic:**
- After build stream completes, check if files were actually created
- If only package.json exists (size === 1), agent stopped prematurely
- Automatically trigger a "continue" stream with even more forceful prompt

**Implementation:**
```typescript
// Check if the agent actually created files or just talked about it
const filesAfterBuild = projectFiles.get(projectName);
const hasCreatedFiles = filesAfterBuild && filesAfterBuild.files.size > 1;

if (!hasCreatedFiles) {
  console.log('⚠️ Agent did not create files, prompting to continue...');

  // Continue the build with a forceful prompt
  const continueStream = streamText({
    system: `You stopped without completing the task. You MUST execute tools NOW.

DO NOT explain or describe. EXECUTE THESE TOOLS IMMEDIATELY:
1. If init_sandbox not called yet: Call it NOW
2. Call create_shadcn_component for: button, input, card
3. Call create_file with path "src/Survey.tsx" and COMPLETE React code
4. Call render_preview

Execute the first uncompleted step RIGHT NOW.`,
    messages: history,
    tools: { /* all tools */ },
    maxToolRoundtrips: 15,
  });

  // Consume and append to buildText
  for await (const textPart of continueStream.textStream) {
    buildText += textPart;
  }
}
```

## Additional Tools Added

The builder agent now has access to advanced tools for complex workflows:

### Code Analysis & Search
- `codebase_search`: Semantic search for code patterns
- `grep`: Exact pattern matching with regex
- `glob_file_search`: Find files by glob patterns

### File System Operations
- `delete_file`: Delete files from workspace
- `list_dir`: List directory contents with filtering

### Code Modification
- `search_replace`: String replacement with replace_all support
- `run_terminal_cmd`: Execute commands with permission controls
- `read_lints`: Check code quality and linter errors

### Project Management
- `todo_write`: Create and track task lists

## Testing the Changes

To verify the improvements work:

1. **Test Case 1: Normal Build**
   - User: "Create a customer satisfaction survey"
   - Expected: Agent immediately calls init_sandbox, then components, then create_file
   - Success: Survey.tsx is created with complete code

2. **Test Case 2: Recovery Mechanism**
   - Simulate: Agent stops after init_sandbox
   - Expected: Detection mechanism triggers continue stream
   - Success: Agent completes remaining steps (components + file creation)

3. **Test Case 3: Complex Survey**
   - User: "Create a multi-page survey with conditional logic"
   - Expected: Agent uses advanced tools (grep, search_replace) if needed
   - Success: All files created, logic implemented

## Configuration

The improvements use the existing model configuration:
```typescript
const MODEL_CONFIG = {
  builder: openai('gpt-5-mini'),
};
```

And reasoning configuration:
```typescript
const REASONING_CONFIG = {
  builder: true,  // Show reasoning for building
};
```

## Performance Considerations

1. **Additional Stream**: Recovery mechanism adds one extra LLM call if agent stops prematurely
2. **Max Roundtrips**: Set to 15 to allow sufficient tool execution
3. **Timeout**: No timeout changes, relies on existing configuration

## Future Improvements

1. **Smarter Detection**: Count actual tool calls instead of just checking files
2. **Progressive Prompts**: Escalate prompt aggression with each retry
3. **Tool Call Verification**: Check if required tools (init_sandbox, create_file) were called
4. **Metrics**: Track how often recovery mechanism is triggered

## Files Modified

- `/Users/hadi/surbee/src/lib/agents/surbeeWorkflowV2.ts`
  - Lines 1404-1476: System prompt improvements
  - Lines 1477-1493: User message improvements
  - Lines 1563-1636: Detection and recovery mechanism

## Rollback Plan

If these changes cause issues:

1. Revert system prompt to original version
2. Revert user message to: `'Build this survey now using the tools available.'`
3. Remove detection/recovery block (lines 1563-1636)

The core workflow and tools remain unchanged, only prompting strategy was modified.
