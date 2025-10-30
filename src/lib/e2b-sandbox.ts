/**
 * E2B Code Interpreter Sandbox
 *
 * Provides code execution capabilities using E2B sandboxes
 */

import 'dotenv/config'
import { Sandbox } from '@e2b/code-interpreter'

/**
 * Create and initialize an E2B sandbox
 * By default the sandbox is alive for 5 minutes
 */
export async function createSandbox() {
  try {
    console.log('🚀 Creating E2B sandbox...')
    const sbx = await Sandbox.create()
    console.log('✅ E2B sandbox created:', sbx.sandboxId)
    return sbx
  } catch (error) {
    console.error('❌ Failed to create E2B sandbox:', error)
    throw error
  }
}

/**
 * Execute Python code in a sandbox
 */
export async function executeCode(sandbox: Sandbox, code: string) {
  try {
    console.log('▶️ Executing code in sandbox...')
    const execution = await sandbox.runCode(code)
    console.log('✅ Code executed successfully')
    return {
      logs: execution.logs,
      error: execution.error,
      results: execution.results,
    }
  } catch (error) {
    console.error('❌ Code execution failed:', error)
    throw error
  }
}

/**
 * List files in sandbox directory
 */
export async function listFiles(sandbox: Sandbox, path: string = '/') {
  try {
    const files = await sandbox.files.list(path)
    return files
  } catch (error) {
    console.error('❌ Failed to list files:', error)
    throw error
  }
}

/**
 * Kill the sandbox and cleanup resources
 */
export async function killSandbox(sandbox: Sandbox) {
  try {
    await sandbox.kill()
    console.log('🔒 Sandbox killed')
  } catch (error) {
    console.error('❌ Failed to kill sandbox:', error)
    throw error
  }
}

/**
 * Example usage demonstrating sandbox operations
 */
export async function testSandbox() {
  let sbx: Sandbox | null = null

  try {
    // Create sandbox
    sbx = await createSandbox()

    // Execute Python code
    const execution = await executeCode(sbx, 'print("hello world")')
    console.log('Execution logs:', execution.logs)

    // List files
    const files = await listFiles(sbx, '/')
    console.log('Root directory files:', files)

    return {
      success: true,
      sandboxId: sbx.sandboxId,
      execution,
      files,
    }
  } catch (error) {
    console.error('Test failed:', error)
    return {
      success: false,
      error: String(error),
    }
  } finally {
    // Always kill sandbox to avoid resource leaks
    if (sbx) {
      await killSandbox(sbx)
    }
  }
}
