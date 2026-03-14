/**
 * Block Registry — maps BlockType to React component.
 */

import type React from 'react'
import type { BlockType } from '@/lib/block-editor/types'
import type { BlockComponentProps } from './types'

import { HeadingBlock } from './HeadingBlock'
import { ParagraphBlock } from './ParagraphBlock'
import { DividerBlock } from './DividerBlock'
import { SpacerBlock } from './SpacerBlock'
import { ImageBlock } from './ImageBlock'
import { VideoBlock } from './VideoBlock'
import { ButtonBlock } from './ButtonBlock'
import { CustomCodeBlock } from './CustomCodeBlock'
import { TextInputBlock } from './TextInputBlock'
import { TextAreaBlock } from './TextAreaBlock'
import { RadioBlock } from './RadioBlock'
import { CheckboxBlock } from './CheckboxBlock'
import { SelectBlock } from './SelectBlock'
import { ScaleBlock } from './ScaleBlock'
import { NPSBlock } from './NPSBlock'
import { SliderBlock } from './SliderBlock'
import { YesNoBlock } from './YesNoBlock'
import { DatePickerBlock } from './DatePickerBlock'
import { MatrixBlock } from './MatrixBlock'
import { RankingBlock } from './RankingBlock'
import { FileUploadBlock } from './FileUploadBlock'
import { LikertBlock } from './LikertBlock'
import { ImageChoiceBlock } from './ImageChoiceBlock'
import { ColumnsBlock } from './ColumnsBlock'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BlockRegistry: Record<BlockType, React.FC<BlockComponentProps<any>>> = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
  image: ImageBlock,
  video: VideoBlock,
  button: ButtonBlock,
  'custom-code': CustomCodeBlock,
  'text-input': TextInputBlock,
  textarea: TextAreaBlock,
  radio: RadioBlock,
  checkbox: CheckboxBlock,
  select: SelectBlock,
  scale: ScaleBlock,
  nps: NPSBlock,
  slider: SliderBlock,
  'yes-no': YesNoBlock,
  'date-picker': DatePickerBlock,
  matrix: MatrixBlock,
  ranking: RankingBlock,
  'file-upload': FileUploadBlock,
  likert: LikertBlock,
  'image-choice': ImageChoiceBlock,
  columns: ColumnsBlock,
}

export type { BlockComponentProps } from './types'
