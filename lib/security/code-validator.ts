import { parse } from '@babel/parser'
import traverse from '@babel/traverse'

export function validateGeneratedCode(code: string): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const ast = parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] })
    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee as any
        if (
          (callee?.type === 'Identifier' && ['eval', 'Function', 'setTimeout', 'setInterval'].includes(callee.name)) ||
          (callee?.type === 'MemberExpression' && (callee.object as any)?.type === 'Identifier' && ['window', 'document', 'global'].includes((callee.object as any).name))
        ) {
          errors.push('Dangerous function call detected')
        }
      },
      ImportDeclaration(path) {
        const source = path.node.source.value
        const allowed = ['react', 'react-dom', 'lucide-react']
        if (!allowed.some((a) => (source as string).startsWith(a))) {
          errors.push(`Unauthorized import: ${source}`)
        }
      },
    })
  } catch (e: any) {
    errors.push(`Code parsing error: ${e?.message || 'parse_error'}`)
  }

  return { isValid: errors.length === 0, errors, warnings }
}

