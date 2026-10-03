/** Browser bridge to the bundled Python engine. Ciphertext stays in this worker. */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
export const CIPHER_LAB_TOOLS = [
  'persona-council', 'normal-man', 'emperor', 'inheritance', 'hallucinogens',
  'pacifist', 'detective', 'cartographer', 'mechanic', 'adversary', 'skeptic',
  'hill-inference', 'transposition-ensemble',
] as const
export type CipherLabToolName = typeof CIPHER_LAB_TOOLS[number]
export interface CipherLabManifest {
  format_version: number
  source_repository: string
  source_git_commit: string | null
  source_dirty: boolean | null
  source_sha256: string
  model_sha256: string
  archive_sha256: string
  archive_bytes: number
  uncompressed_bytes: number
  pyodide_version: string
  files: { path: string; bytes: number; sha256: string }[]
  tools: string[]
  limits: { max_letters: number; max_checks: number; max_candidates: number; max_period: number; run_seconds: number }
}
export interface CipherLabStatusEvent {
  state: 'idle' | 'loading' | 'ready' | 'running' | 'result' | 'error' | 'cancelled'
  message: string
  manifest?: CipherLabManifest
  errorCode?: string
}
export class CipherLabError extends Error {
  constructor(message: string, readonly code: string) { super(message); this.name = 'CipherLabError' }
}
type Pending = { id: number; resolve: (value: JsonValue) => void; reject: (error: CipherLabError) => void }

export class CipherLabRuntime {
  private worker: Worker | null = null
  private pending: Pending | null = null
  private initializers: { resolve: (value: CipherLabManifest) => void; reject: (error: CipherLabError) => void }[] = []
  private manifest: CipherLabManifest | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private sequence = 0
  private disposed = false
  private readonly onStatus: (event: CipherLabStatusEvent) => void

  constructor(options: { onStatus?: (event: CipherLabStatusEvent) => void } = {}) {
    this.onStatus = options.onStatus ?? (() => {})
  }

  /** Explicit preload is optional. runTool and predictBob initialize lazily. */
  initialize(): Promise<CipherLabManifest> {
    if (this.disposed) return Promise.reject(new CipherLabError('Cipher Lab has been closed.', 'disposed'))
    if (this.manifest) return Promise.resolve(this.manifest)
    return new Promise((resolve, reject) => {
      this.initializers.push({ resolve, reject })
      if (this.worker) return
      try {
        const worker = new Worker('/cipher-lab/worker.js', { type: 'module', name: 'cipher-lab-python' })
        this.worker = worker
        worker.onmessage = (event: MessageEvent) => { if (this.worker === worker) this.receive(event.data) }
        worker.onerror = () => { if (this.worker === worker) this.fail(new CipherLabError('The Python worker could not start. Check your connection and browser content blockers, then retry.', 'startup')) }
        // Startup has its own limit. The 30 second computation limit starts at running.
        this.timer = setTimeout(() => this.fail(new CipherLabError('Python startup timed out. The first load needs access to the pinned Pyodide CDN; check your connection or content blocker and retry.', 'startup-timeout')), 180_000)
        worker.postMessage({ type: 'init' })
      } catch {
        this.fail(new CipherLabError('This browser could not create the Python worker. Use a current browser over HTTPS.', 'startup'))
      }
    })
  }

  runTool(name: CipherLabToolName, text: string, params: { [key: string]: JsonValue } = {}): Promise<JsonValue> {
    return this.request({ kind: 'tool', tool: name, text, params })
  }

  predictBob(text: string): Promise<JsonValue> {
    return this.request({ kind: 'bob', text })
  }

  cancel(): void {
    this.fail(new CipherLabError('Cancelled. The worker was terminated; the next run starts a fresh Python session.', 'cancelled'), 'cancelled')
  }

  dispose(): void { this.cancel(); this.disposed = true }

  private async request(request: JsonValue): Promise<JsonValue> {
    if (this.pending) throw new CipherLabError('A run is already active. Cancel it before starting another.', 'busy')
    const id = ++this.sequence
    // Reserve before startup so two simultaneous callers cannot queue unbounded work.
    return new Promise((resolve, reject) => {
      this.pending = { id, resolve, reject }
      this.initialize().then(() => {
        if (this.pending?.id !== id) return
        this.worker?.postMessage({ type: 'run', id, request })
      }).catch((error: CipherLabError) => {
        if (this.pending?.id === id) { this.pending = null; reject(error) }
      })
    })
  }

  private receive(message: { type: string; id?: number; message?: string; manifest?: CipherLabManifest; result?: JsonValue; code?: string }): void {
    if (message.type === 'loading') {
      this.onStatus({ state: 'loading', message: message.message ?? 'Loading Python.' })
    } else if (message.type === 'ready' && message.manifest) {
      this.clearTimer()
      this.manifest = message.manifest
      for (const waiter of this.initializers.splice(0)) waiter.resolve(message.manifest)
      this.onStatus({ state: 'ready', message: 'Verified Python engine ready.', manifest: message.manifest })
    } else if (message.type === 'running' && this.pending && this.pending.id === message.id) {
      this.clearTimer()
      this.timer = setTimeout(() => this.fail(new CipherLabError('The run reached its 30 second browser limit. Reduce the check budget or input size and retry.', 'run-timeout')), 30_000)
      this.onStatus({ state: 'running', message: 'Running the Python engine locally.', ...(this.manifest ? { manifest: this.manifest } : {}) })
    } else if (message.type === 'result' && this.pending && this.pending.id === message.id) {
      this.clearTimer()
      const pending = this.pending
      this.pending = null
      pending.resolve(message.result ?? null)
      this.onStatus({ state: 'result', message: 'Run finished. Candidates still require independent evidence.' })
    } else if (message.type === 'error') {
      const error = new CipherLabError(message.message ?? 'The Python engine reported an error.', message.code ?? 'engine')
      if (message.id !== undefined && this.pending?.id !== message.id) return
      if (message.id !== undefined && this.manifest) {
        this.clearTimer()
        const pending = this.pending
        this.pending = null
        pending?.reject(error)
        this.onStatus({ state: 'error', message: error.message, errorCode: error.code })
      } else this.fail(error)
    }
  }

  private clearTimer(): void { if (this.timer !== null) clearTimeout(this.timer); this.timer = null }

  private fail(error: CipherLabError, state: 'error' | 'cancelled' = 'error'): void {
    this.clearTimer()
    this.worker?.terminate()
    this.worker = null
    this.manifest = null
    const pending = this.pending
    this.pending = null
    pending?.reject(error)
    for (const waiter of this.initializers.splice(0)) waiter.reject(error)
    this.onStatus({ state, message: error.message, errorCode: error.code })
  }
}
