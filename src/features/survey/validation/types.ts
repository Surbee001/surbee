export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  message: string
  min?: number
  max?: number
  pattern?: string
  validator?: (value: any) => boolean
}

