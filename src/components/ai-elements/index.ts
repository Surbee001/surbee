/**
 * AI Elements Components
 * 
 * A collection of components for building AI-powered chat interfaces.
 * Compatible with the Vercel AI SDK and supports any model with reasoning features.
 * 
 * @example
 * ```tsx
 * import { 
 *   MessageResponse, 
 *   ReasoningDisplay, 
 *   Reasoning, 
 *   ReasoningTrigger, 
 *   ReasoningContent,
 *   ChainOfThought,
 *   convertToReasoningSteps,
 *   useReasoningFromMessages,
 * } from '@/components/ai-elements';
 * ```
 */

// Message components for rendering AI responses with markdown
export {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageBranch,
  MessageBranchContent,
  MessageBranchSelector,
  MessageBranchPrevious,
  MessageBranchNext,
  MessageBranchPage,
  MessageResponse,
  MessageToolbar,
  type MessageProps,
  type MessageContentProps,
  type MessageActionsProps,
  type MessageActionProps,
  type MessageBranchProps,
  type MessageBranchContentProps,
  type MessageBranchSelectorProps,
  type MessageBranchPreviousProps,
  type MessageBranchNextProps,
  type MessageBranchPageProps,
  type MessageResponseProps,
  type MessageToolbarProps,
} from './message';

// Reasoning display component with chain-of-thought UI
export {
  ReasoningDisplay,
  convertToReasoningSteps,
  convertMessagePartsToSteps,
  useReasoningFromMessages,
  // Icons for custom step types
  SearchIcon,
  FileTextIcon,
  DatabaseIcon,
  BrainIcon,
  SparklesIcon,
  GlobeIcon,
  WrenchIcon,
  CodeIcon,
  MessageSquareIcon,
  // Types
  type ReasoningStep,
  type ThinkingStep,
  type ReasoningPart,
  type ToolPart,
  type TextPart,
  type MessagePart,
} from './reasoning-display';

// Reasoning component (AI SDK pattern)
export {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  ShimmerText,
  type ReasoningProps,
  type ReasoningTriggerProps,
  type ReasoningContentProps,
} from './reasoning';

// Chain of thought component
export {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtContent,
  ChainOfThoughtImage,
  type ChainOfThoughtProps,
  type ChainOfThoughtHeaderProps,
  type ChainOfThoughtStepProps,
  type ChainOfThoughtSearchResultsProps,
  type ChainOfThoughtSearchResultProps,
  type ChainOfThoughtContentProps,
  type ChainOfThoughtImageProps,
} from './chain-of-thought';
