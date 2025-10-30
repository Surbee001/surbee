// Core Lyra Atom Interface
export interface LyraAtom {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  styling?: StylingProps;
  logic?: LogicRule[];
  position?: Position;
  metadata?: Record<string, any>;
}

// Validation System
export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: string | number;
  message?: string;
}

// Comprehensive Styling System
export interface StylingProps {
  // Layout
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;

  // Colors
  backgroundColor?: string;
  color?: string;
  borderColor?: string;

  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: string;
  lineHeight?: string;

  // Borders
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;

  // Effects
  boxShadow?: string;
  opacity?: number;

  // Responsive
  sm?: Partial<StylingProps>;
  md?: Partial<StylingProps>;
  lg?: Partial<StylingProps>;
  xl?: Partial<StylingProps>;
}

// Logic System
export interface LogicRule {
  type: 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'calculate';
  condition: string;
  target?: string;
  value?: any;
}

// Position for absolute positioning
export interface Position {
  x: number;
  y: number;
  z?: number;
}

// ===== RECOMMENDED ATOMS =====
export interface VideoAudioAtom extends LyraAtom {
  type: 'video-audio';
  url: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
}

export interface ShortTextAtom extends LyraAtom {
  type: 'short-text';
  maxLength?: number;
  minLength?: number;
}

export interface MultipleChoiceAtom extends LyraAtom {
  type: 'multiple-choice';
  options: string[];
  allowMultiple?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  imageOptions?: { text: string; image?: string }[];
}

// ===== CONNECT TO APPS ATOMS =====
export interface HubspotAtom extends LyraAtom {
  type: 'hubspot';
  formId: string;
  portalId: string;
  region?: string;
}

export interface BrowseAppsAtom extends LyraAtom {
  type: 'browse-apps';
  availableApps: string[];
  selectedApps: string[];
  integrationType: 'oauth' | 'api' | 'webhook';
}

// ===== CONTACT ATOMS =====
export interface ContactInfoAtom extends LyraAtom {
  type: 'contact-info';
  fields: ('name' | 'email' | 'phone' | 'company' | 'position')[];
  layout: 'single' | 'multi-column';
}

export interface EmailAtom extends LyraAtom {
  type: 'email';
  confirmEmail?: boolean;
  allowMultiple?: boolean;
}

export interface PhoneAtom extends LyraAtom {
  type: 'phone';
  format?: string;
  countryCode?: boolean;
  validationType?: 'basic' | 'strict';
}

export interface AddressAtom extends LyraAtom {
  type: 'address';
  fields: ('street' | 'city' | 'state' | 'zip' | 'country')[];
  validation?: 'basic' | 'strict';
}

export interface WebsiteAtom extends LyraAtom {
  type: 'website';
  protocol?: 'http' | 'https' | 'both';
  allowSubdomains?: boolean;
}

// ===== TEXT/VIDEO ATOMS =====
export interface LongTextAtom extends LyraAtom {
  type: 'long-text';
  rows?: number;
  maxLength?: number;
  richText?: boolean;
}

export interface ClarifyAIAtom extends LyraAtom {
  type: 'clarify-ai';
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface FAQAIAtom extends LyraAtom {
  type: 'faq-ai';
  knowledgeBase?: string;
  maxQuestions?: number;
  autoGenerate?: boolean;
}

// ===== CHOICE ATOMS =====
export interface DropdownAtom extends LyraAtom {
  type: 'dropdown';
  options: string[];
  allowSearch?: boolean;
  allowMultiple?: boolean;
  placeholder?: string;
}

export interface PictureChoiceAtom extends LyraAtom {
  type: 'picture-choice';
  options: { text: string; image: string; value: string }[];
  layout: 'grid' | 'list';
  allowMultiple?: boolean;
  imageSize?: 'small' | 'medium' | 'large';
}

export interface YesNoAtom extends LyraAtom {
  type: 'yes-no';
  labels?: { yes: string; no: string };
  layout?: 'horizontal' | 'vertical';
}

export interface LegalAtom extends LyraAtom {
  type: 'legal';
  termsUrl?: string;
  privacyUrl?: string;
  required?: boolean;
  checkboxText?: string;
}

export interface CheckboxAtom extends LyraAtom {
  type: 'checkbox';
  options: string[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  allowOther?: boolean;
  otherLabel?: string;
}

// ===== RATING ATOMS =====
export interface NPSAtom extends LyraAtom {
  type: 'nps';
  scale: 0 | 10;
  labels?: { low: string; high: string };
  followUp?: boolean;
}

export interface OpinionScaleAtom extends LyraAtom {
  type: 'opinion-scale';
  scale: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  labels?: { low: string; high: string };
  showNumbers?: boolean;
}

export interface RatingAtom extends LyraAtom {
  type: 'rating';
  maxRating: number;
  iconType?: 'star' | 'heart' | 'thumbs' | 'custom';
  customIcon?: string;
  labels?: string[];
  allowHalf?: boolean;
}

export interface RankingAtom extends LyraAtom {
  type: 'ranking';
  options: string[];
  maxSelections?: number;
  allowTies?: boolean;
}

export interface MatrixAtom extends LyraAtom {
  type: 'matrix';
  rows: string[];
  columns: string[];
  type: 'radio' | 'checkbox' | 'rating';
  required?: boolean;
}

// ===== OTHER ATOMS =====
export interface NumberAtom extends LyraAtom {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  format?: 'integer' | 'decimal' | 'currency' | 'percentage';
}

export interface DateAtom extends LyraAtom {
  type: 'date';
  minDate?: string;
  maxDate?: string;
  format?: string;
  allowTime?: boolean;
}

export interface PaymentAtom extends LyraAtom {
  type: 'payment';
  amount: number;
  currency: string;
  description?: string;
  provider: 'stripe' | 'paypal' | 'custom';
  recurring?: boolean;
}

export interface FileUploadAtom extends LyraAtom {
  type: 'file-upload';
  allowedTypes: string[];
  maxSize: number;
  maxFiles?: number;
  dragDrop?: boolean;
}

export interface GoogleDriveAtom extends LyraAtom {
  type: 'google-drive';
  folderId?: string;
  allowUpload?: boolean;
  allowDownload?: boolean;
  permissions?: 'view' | 'edit';
}

export interface CalendlyAtom extends LyraAtom {
  type: 'calendly';
  eventTypeId: string;
  prefill?: Record<string, string>;
  hideEventTypeDetails?: boolean;
}

// ===== WELCOME ATOMS =====
export interface PartialSubmitAtom extends LyraAtom {
  type: 'partial-submit';
  saveProgress?: boolean;
  autoSave?: boolean;
  resumeUrl?: string;
}

export interface StatementAtom extends LyraAtom {
  type: 'statement';
  content: string;
  richText?: boolean;
  showProgress?: boolean;
}

export interface QuestionGroupAtom extends LyraAtom {
  type: 'question-group';
  title: string;
  description?: string;
  questions: string[];
  randomize?: boolean;
}

export interface MultiPageAtom extends LyraAtom {
  type: 'multi-page';
  pages: {
    id: string;
    title: string;
    description?: string;
    atoms: string[];
  }[];
  navigation: 'linear' | 'nonlinear';
  progressBar?: boolean;
}

export interface EndScreenAtom extends LyraAtom {
  type: 'end-screen';
  title: string;
  message: string;
  actions?: { label: string; url: string; type: 'primary' | 'secondary' }[];
  showResults?: boolean;
}

export interface RedirectAtom extends LyraAtom {
  type: 'redirect';
  url: string;
  delay?: number;
  method: 'immediate' | 'delayed' | 'conditional';
  conditions?: Record<string, any>;
}

// ===== EXISTING ATOMS (Updated) =====
export interface TextInputAtom extends LyraAtom {
  type: 'text-input';
  inputType?: 'text' | 'email' | 'password' | 'tel' | 'url';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export interface TextAreaAtom extends LyraAtom {
  type: 'text-area';
  rows?: number;
  maxLength?: number;
  minLength?: number;
  richText?: boolean;
}

export interface SelectAtom extends LyraAtom {
  type: 'select';
  options: string[];
  allowMultiple?: boolean;
  allowSearch?: boolean;
  placeholder?: string;
}

export interface RadioGroupAtom extends LyraAtom {
  type: 'radio-group';
  options: string[];
  layout?: 'vertical' | 'horizontal' | 'grid';
}

export interface CheckboxGroupAtom extends LyraAtom {
  type: 'checkbox-group';
  options: string[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  allowOther?: boolean;
  otherLabel?: string;
}

export interface SliderAtom extends LyraAtom {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  showValue?: boolean;
  showLabels?: boolean;
  labels?: { min: string; max: string };
}

export interface DatePickerAtom extends LyraAtom {
  type: 'date-picker';
  minDate?: string;
  maxDate?: string;
  format?: string;
  allowTime?: boolean;
  timeFormat?: '12h' | '24h';
}

export interface ImageAtom extends LyraAtom {
  type: 'image';
  src: string;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
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
  children: string[];
  layout: 'vertical' | 'horizontal' | 'grid';
  gap?: string;
}

export interface HeadingAtom extends LyraAtom {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}

export interface ParagraphAtom extends LyraAtom {
  type: 'paragraph';
  content: string;
  richText?: boolean;
}

export interface ButtonAtom extends LyraAtom {
  type: 'button';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  action?: 'submit' | 'reset' | 'custom';
  customAction?: string;
}

export interface ProgressAtom extends LyraAtom {
  type: 'progress';
  value: number;
  max: number;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export interface CardAtom extends LyraAtom {
  type: 'card';
  children: string[];
  padding?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
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
  | VideoAudioAtom
  | ShortTextAtom
  | MultipleChoiceAtom
  | HubspotAtom
  | BrowseAppsAtom
  | ContactInfoAtom
  | EmailAtom
  | PhoneAtom
  | AddressAtom
  | WebsiteAtom
  | LongTextAtom
  | ClarifyAIAtom
  | FAQAIAtom
  | DropdownAtom
  | PictureChoiceAtom
  | YesNoAtom
  | LegalAtom
  | CheckboxAtom
  | NPSAtom
  | OpinionScaleAtom
  | RankingAtom
  | MatrixAtom
  | NumberAtom
  | DateAtom
  | PaymentAtom
  | FileUploadAtom
  | GoogleDriveAtom
  | CalendlyAtom
  | PartialSubmitAtom
  | StatementAtom
  | QuestionGroupAtom
  | MultiPageAtom
  | EndScreenAtom
  | RedirectAtom
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
  layout: {
    type: 'single' | 'multi-page' | 'wizard';
    pages?: {
      id: string;
      title: string;
      atoms: string[];
    }[];
  };
  theme: FormTheme;
  settings: FormSettings;
}

export interface FormTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface FormSettings {
  allowPartialSave: boolean;
  showProgressBar: boolean;
  allowBackNavigation: boolean;
  autoSave: boolean;
  maxSubmissions?: number;
  redirectUrl?: string;
  emailNotifications?: boolean;
}
