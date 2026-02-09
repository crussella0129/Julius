import { spawn } from 'child_process'

interface PythonResult {
  stdout: string
  stderr: string
  exitCode: number | null
  error?: string
  friendlyError?: string
}

const ERROR_TRANSLATIONS: Record<string, (match: RegExpMatchArray) => string> = {
  'SyntaxError: (.+)': (m) => `There's a syntax problem: ${m[1]}. Check for missing colons, parentheses, or quotes.`,
  'IndentationError: (.+)': (m) => `Indentation issue: ${m[1]}. Python uses spaces to show code blocks — make sure your lines are aligned correctly.`,
  "NameError: name '(.+)' is not defined": (m) => `Python doesn't recognize "${m[1]}". Did you spell it correctly? Variables must be created before you use them.`,
  "TypeError: (.+)": (m) => `Type mismatch: ${m[1]}. You might be mixing different types (like a number and a string).`,
  'ZeroDivisionError': () => `You tried to divide by zero, which isn't allowed in math.`,
  "IndexError: (.+)": (m) => `Index out of range: ${m[1]}. You're trying to access an item that doesn't exist in the list.`,
  "KeyError: (.+)": (m) => `Key not found: ${m[1]}. That key doesn't exist in the dictionary.`,
  "ValueError: (.+)": (m) => `Invalid value: ${m[1]}. The value you provided isn't the right kind.`,
  "AttributeError: (.+)": (m) => `Attribute error: ${m[1]}. That object doesn't have the property or method you're trying to use.`,
  "ModuleNotFoundError: No module named '(.+)'": (m) => `Module "${m[1]}" isn't installed. For exercises, you only need Python's built-in features.`,
  "FileNotFoundError: (.+)": (m) => `File not found: ${m[1]}. Check that the filename and path are correct.`
}

function translateError(stderr: string): string | undefined {
  for (const [pattern, translator] of Object.entries(ERROR_TRANSLATIONS)) {
    const match = stderr.match(new RegExp(pattern))
    if (match) return translator(match)
  }
  return undefined
}

export function runPython(code: string, timeout = 10000): Promise<PythonResult> {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    let killed = false

    const proc = spawn('python3', ['-u', '-c', code], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }
    })

    proc.stdout.on('data', (data) => { stdout += data.toString() })
    proc.stderr.on('data', (data) => { stderr += data.toString() })

    const timer = setTimeout(() => {
      killed = true
      proc.kill('SIGKILL')
    }, timeout)

    proc.on('close', (exitCode) => {
      clearTimeout(timer)

      if (killed) {
        resolve({
          stdout,
          stderr,
          exitCode,
          error: 'timeout',
          friendlyError: `Your code took too long (over ${timeout / 1000}s). Check for infinite loops.`
        })
        return
      }

      const friendlyError = stderr ? translateError(stderr) : undefined

      resolve({
        stdout,
        stderr,
        exitCode,
        friendlyError
      })
    })

    proc.on('error', (err) => {
      clearTimeout(timer)
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: null,
        error: 'spawn-error',
        friendlyError: 'Could not start Python. Make sure python3 is installed on your system.'
      })
    })

    // Close stdin immediately — exercises don't use input()
    proc.stdin.end()
  })
}
