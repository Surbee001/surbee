// test-e2b.ts
import 'dotenv/config'
import { Sandbox } from '@e2b/code-interpreter'

async function main() {
  console.log('Starting E2B Sandbox test...\n')

  // E2B API key
  const apiKey = process.env.E2B_API_KEY
  if (!apiKey) {
    throw new Error('E2B_API_KEY not found in environment variables')
  }

  const sbx = await Sandbox.create({ apiKey }) // By default the sandbox is alive for 5 minutes
  console.log('✅ Sandbox created:', sbx.sandboxId)

  const execution = await sbx.runCode('print("hello world")') // Execute Python inside the sandbox
  console.log('Execution logs:', execution.logs)

  const files = await sbx.files.list('/')
  console.log('Root directory files:', files)

  await sbx.kill()
  console.log('\n✅ Test completed!')
}

main().catch(console.error)
