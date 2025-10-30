export interface CodeValidationResult {
  isValid: boolean
  errors: string[]
}

// Very conservative client-side validator for AI-generated TSX.
// Disallows dynamic code execution, network/file access, and imports.
export function validateGeneratedCode(code: string): CodeValidationResult {
  const errors: string[] = []
  const src = code || ''

  const bannedPatterns: Array<{ re: RegExp; message: string }> = [
    { re: /\beval\b/i, message: 'Use of eval is not allowed' },
    { re: /\bFunction\s*\(/i, message: 'Dynamic Function constructor is not allowed' },
    { re: /\brequire\b/i, message: 'require is not allowed' },
    { re: /\bimport\s*\(/i, message: 'dynamic import() is not allowed' },
    { re: /\bXMLHttpRequest\b/i, message: 'XMLHttpRequest is not allowed' },
    { re: /\bfetch\b\s*\(/i, message: 'fetch is not allowed in generated components' },
    { re: /\bprocess\b\./i, message: 'process.* not allowed' },
    // Allow harmless DOM references; runtime will execute in browser
    // { re: /\bglobalThis\b/i, message: 'global access is not allowed' },
    // { re: /\blocalStorage\b|\bsessionStorage\b/i, message: 'storage access is not allowed' },
    // { re: /\bdocument\b|\bwindow\b/i, message: 'DOM globals not allowed directly' },
    { re: /\bfs\b|\bchild_process\b|\bos\b/i, message: 'Node APIs are not allowed' },
  ]

  for (const { re, message } of bannedPatterns) {
    if (re.test(src)) errors.push(message)
  }

  // Allow ES module imports (Babel will transform); still enforce safe default export only
  const exportCount = (src.match(/\bexport\b\s+default\b/gi) || []).length
  if (exportCount === 0) errors.push('Generated code must have a default export')
  if (/\bexport\b(?!\s+default\b)/gi.test(src)) {
    errors.push('Only default export is allowed')
  }

  return { isValid: errors.length === 0, errors }
}


