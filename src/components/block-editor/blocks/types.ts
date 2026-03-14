/**
 * Shared types for block editor components.
 */

import type { Block, BlockContentMap, BlockMeta, BlockType, SurveyTheme } from '@/lib/block-editor/types'

export interface BlockComponentProps<T extends BlockType = BlockType> {
  block: Block<T>
  isSelected: boolean
  isFocused: boolean
  /** true in editor mode, false when rendering for respondents */
  isEditing: boolean
  onContentChange: (content: Partial<BlockContentMap[T]>) => void
  onMetaChange: (meta: Partial<BlockMeta>) => void
  onDelete: () => void
  onInsertAfter: (type: BlockType) => void
  onFocus: () => void
  onBlur: () => void
  onSlashMenu?: (position: { x: number; y: number }) => void
  theme: SurveyTheme
}
