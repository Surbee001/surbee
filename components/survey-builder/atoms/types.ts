// Lyra Atoms - Core Types for Flexible Form Components

export interface LyraAtom {
  id: string;
  type: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  styling?: StylingProps;
  logic?: LogicRule[];
  position?: Position;
  metadata?: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message?: string;
}

export interface StylingProps {
  // Layout
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  display?: 'block' | 'inline' | 'flex' | 'grid';

  // Colors
  backgroundColor?: string;
  color?: string;
  borderColor?: string;

  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';

  // Borders
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: string;

  // Effects
  boxShadow?: string;
  opacity?: number;

  // Responsive
  responsive?: {
    mobile?: Partial<StylingProps>;
    tablet?: Partial<StylingProps>;
    desktop?: Partial<StylingProps>;
  };
}

export interface LogicRule {
  type: 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'calculate';
  condition: string;
  target?: string;
  value?: any;
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

// Specific Atom Types
export interface TextInputAtom extends LyraAtom {
  type: 'text-input';
  inputType?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  defaultValue?: string;
  maxLength?: number;
  minLength?: number;
}

export interface TextAreaAtom extends LyraAtom {
  type: 'text-area';
  rows?: number;
  maxLength?: number;
  minLength?: number;
  defaultValue?: string;
}

export interface SelectAtom extends LyraAtom {
  type: 'select';
  options: SelectOption[];
  multiple?: boolean;
  defaultValue?: string | string[];
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupAtom extends LyraAtom {
  type: 'radio-group';
  options: RadioOption[];
  defaultValue?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
}

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupAtom extends LyraAtom {
  type: 'checkbox-group';
  options: CheckboxOption[];
  defaultValue?: string[];
  layout?: 'vertical' | 'horizontal' | 'grid';
}

export interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RatingAtom extends LyraAtom {
  type: 'rating';
  maxRating: number;
  defaultValue?: number;
  showLabels?: boolean;
  labels?: string[];
  icon?: 'star' | 'heart' | 'thumbs' | 'custom';
}

export interface SliderAtom extends LyraAtom {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  showLabels?: boolean;
  labels?: string[];
}

export interface DatePickerAtom extends LyraAtom {
  type: 'date-picker';
  dateFormat?: string;
  minDate?: string;
  maxDate?: string;
  defaultValue?: string;
  showTime?: boolean;
}

export interface FileUploadAtom extends LyraAtom {
  type: 'file-upload';
  accept?: string[];
  maxSize?: number;
  multiple?: boolean;
  maxFiles?: number;
}

export interface ImageAtom extends LyraAtom {
  type: 'image';
  src: string;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

export interface VideoAtom extends LyraAtom {
  type: 'video';
  src: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: string;
  height?: string;
}

export interface DividerAtom extends LyraAtom {
  type: 'divider';
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  thickness?: string;
}

export interface SpacerAtom extends LyraAtom {
  type: 'spacer';
  height: string;
}

export interface ContainerAtom extends LyraAtom {
  type: 'container';
  children: LyraAtom[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  gap?: string;
  columns?: number;
}

export interface HeadingAtom extends LyraAtom {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}

export interface ParagraphAtom extends LyraAtom {
  type: 'paragraph';
  content: string;
}

export interface ButtonAtom extends LyraAtom {
  type: 'button';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  action?: 'submit' | 'reset' | 'next' | 'previous' | 'custom';
}

export interface ProgressAtom extends LyraAtom {
  type: 'progress';
  current: number;
  total: number;
  showPercentage?: boolean;
  variant?: 'line' | 'circle';
}

export interface CardAtom extends LyraAtom {
  type: 'card';
  children: LyraAtom[];
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: string;
}

// Union type for all atoms
export type AnyAtom =
  | TextInputAtom
  | TextAreaAtom
  | SelectAtom
  | RadioGroupAtom
  | CheckboxGroupAtom
  | RatingAtom
  | SliderAtom
  | DatePickerAtom
  | FileUploadAtom
  | ImageAtom
  | VideoAtom
  | DividerAtom
  | SpacerAtom
  | ContainerAtom
  | HeadingAtom
  | ParagraphAtom
  | ButtonAtom
  | ProgressAtom
  | CardAtom;

// Form Structure
export interface LyraForm {
  id: string;
  title: string;
  description?: string;
  atoms: AnyAtom[];
  layout: 'single' | 'multi-step' | 'wizard';
  theme: FormTheme;
  settings: FormSettings;
}

export interface FormTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  spacing?: string;
}

export interface FormSettings {
  allowSave?: boolean;
  allowEdit?: boolean;
  showProgress?: boolean;
  autoSave?: boolean;
  validationMode?: 'immediate' | 'onSubmit' | 'onBlur';
}
