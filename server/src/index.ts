import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { getErrorMessage } from './lib/errors.js'

function main(): void {
  const config = loadConfig()
  const app = createApp(config)
  app.listen(config.PORT, () => {
    process.stdout.write(`veily server listening on http://localhost:${config.PORT}\n`)
  })
}

try {
  main()
} catch (error: unknown) {
  process.stderr.write(`${getErrorMessage(error)}\n`)
  process.exit(1)
}
