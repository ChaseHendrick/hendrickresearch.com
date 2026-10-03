// Real Python in a module worker. No request can supply executable Python.
// Pinned release documented at https://pyodide.org/en/stable/usage/webworker.html
export const PYODIDE_VERSION = '314.0.7';
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const TOOLS = ['persona-council', 'normal-man', 'emperor', 'inheritance',
  'hallucinogens', 'pacifist', 'detective', 'cartographer', 'mechanic',
  'adversary', 'skeptic', 'hill-inference', 'transposition-ensemble'];
const COMMON = ['cribs', 'max_checks', 'max_candidates'];
const PARAMETERS = {
  'persona-council': [...COMMON, 'lexicon', 'keywords', 'max_rotations', 'personas', 'unplaced_crib', 'verification_cribs', 'expected_plaintext_sha256', 'proposed_plaintext'],
  'normal-man': COMMON, emperor: COMMON, inheritance: [...COMMON, 'lexicon', 'keywords'],
  hallucinogens: [...COMMON, 'max_rotations'], pacifist: COMMON,
  detective: ['crib', 'max_period', 'min_checks', 'max_checks', 'max_candidates'],
  cartographer: [...COMMON, 'max_width', 'max_rails'], mechanic: COMMON,
  adversary: [...COMMON, 'candidate'],
  skeptic: [...COMMON, 'verification_cribs', 'expected_plaintext_sha256', 'candidate_plaintexts', 'voice'],
  'hill-inference': COMMON, 'transposition-ensemble': [...COMMON, 'max_width', 'max_rails'],
};

function letters(text, minimum = 4) {
  if (typeof text !== 'string' || text.length > 4096 || /[^\x00-\x7f]/.test(text) || /[0-9]/.test(text)) {
    throw new Error('This browser lab accepts ASCII A-Z ciphertext with spaces and punctuation, at most 4096 raw characters. Digits and other scripts need a different tool.');
  }
  const normalized = text.replace(/[^a-z]/gi, '').toUpperCase();
  if (normalized.length < minimum || normalized.length > 512) throw new Error(`Supply ${minimum} to 512 A-Z letters.`);
  return normalized;
}
function integer(value, name, low, high) {
  if (!Number.isSafeInteger(value) || value < low || value > high) throw new Error(`${name} must be an integer in ${low}..${high}.`);
}
function jsonGuard(value, depth = 0) {
  if (depth > 4) throw new Error('Parameters are nested too deeply.');
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Numeric parameters must be finite.');
  if (typeof value === 'string' && value.length > 4096) throw new Error('A parameter string is too long.');
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return;
  if (Array.isArray(value)) {
    if (value.length > 100) throw new Error('A parameter list exceeds 100 entries.');
    value.forEach(item => jsonGuard(item, depth + 1)); return;
  }
  if (typeof value !== 'object' || Object.keys(value).length > 32) throw new Error('Parameters must be a small JSON object.');
  for (const [key, item] of Object.entries(value)) {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error('Unsupported parameter key.');
    jsonGuard(item, depth + 1);
  }
}
export function validateRequest(input) {
  if (!input || typeof input !== 'object' || !['tool', 'bob'].includes(input.kind)) throw new Error('Unsupported request.');
  const normalized = letters(input.text, input.kind === 'bob' ? 16 : 4);
  if (input.kind === 'bob') {
    if (Object.keys(input).some(key => !['kind', 'text'].includes(key))) throw new Error('Bob accepts ciphertext only.');
    return {kind: 'bob', text: input.text};
  }
  if (Object.keys(input).some(key => !['kind', 'tool', 'text', 'params'].includes(key))) throw new Error('Unsupported request field.');
  if (!TOOLS.includes(input.tool)) throw new Error('That tool is not enabled in the browser lab.');
  const params = input.params ?? {};
  if (typeof params !== 'object' || Array.isArray(params) || params === null) throw new Error('Parameters must be a JSON object.');
  jsonGuard(params);
  if (JSON.stringify(params).length > 16384) throw new Error('Parameter JSON exceeds 16 KiB.');
  if (Object.keys(params).some(key => !PARAMETERS[input.tool].includes(key))) throw new Error('Unsupported parameter for the selected browser tool.');
  const prepared = {...params, max_checks: params.max_checks ?? 5000, max_candidates: params.max_candidates ?? 10};
  integer(prepared.max_checks, 'max_checks', 0, 10000);
  integer(prepared.max_candidates, 'max_candidates', 1, 10);
  for (const [name, low, high] of [['max_period', 0, 16], ['min_checks', 1, 16], ['max_rotations', 0, 8], ['max_width', 2, 16], ['max_rails', 2, 5]]) {
    if (name in prepared) integer(prepared[name], name, low, high);
  }
  // Larger backend defaults are narrowed explicitly for the browser.
  if (input.tool === 'cartographer') prepared.max_width = prepared.max_width ?? 16;
  for (const key of ['cribs', 'verification_cribs']) if (key in prepared) {
    if (!Array.isArray(prepared[key]) || prepared[key].length > 32) throw new Error(`${key} requires at most 32 offset/plaintext records.`);
    for (const crib of prepared[key]) {
      if (!crib || typeof crib !== 'object' || Object.keys(crib).sort().join(',') !== 'offset,plaintext') throw new Error('Each crib needs only offset and plaintext.');
      integer(crib.offset, 'crib offset', 0, 511);
      const plain = letters(crib.plaintext, 1);
      if (crib.offset + plain.length > normalized.length) throw new Error('A crib extends beyond the normalized ciphertext.');
    }
  }
  for (const key of ['lexicon', 'keywords']) if (prepared[key] !== undefined && prepared[key] !== null) {
    if (!Array.isArray(prepared[key]) || prepared[key].length > 100 || prepared[key].some(word => typeof word !== 'string' || !/^[A-Za-z]{1,32}$/.test(word))) throw new Error(`${key} requires at most 100 explicit A-Z words of 1 to 32 letters.`);
  }
  if (prepared.personas !== undefined && (!Array.isArray(prepared.personas) || !prepared.personas.length || prepared.personas.some(name => !TOOLS.slice(1, 11).includes(name)) || new Set(prepared.personas).size !== prepared.personas.length)) throw new Error('Select distinct supported persona names.');
  if (prepared.expected_plaintext_sha256 !== undefined && prepared.expected_plaintext_sha256 !== null && !/^[0-9a-fA-F]{64}$/.test(prepared.expected_plaintext_sha256)) throw new Error('The reference SHA-256 must contain exactly 64 hexadecimal digits.');
  for (const key of ['candidate', 'proposed_plaintext']) if (prepared[key] !== undefined && prepared[key] !== null && letters(prepared[key]).length !== normalized.length) throw new Error('A proposed candidate must match the normalized ciphertext length.');
  if (prepared.candidate_plaintexts !== undefined && prepared.candidate_plaintexts !== null) {
    if (!Array.isArray(prepared.candidate_plaintexts) || prepared.candidate_plaintexts.length > 10 || prepared.candidate_plaintexts.some(candidate => letters(candidate).length !== normalized.length)) throw new Error('Review at most 10 candidates with matching normalized lengths.');
  }
  for (const key of ['crib', 'unplaced_crib']) if (prepared[key] !== undefined && prepared[key] !== null) {
    if (letters(prepared[key], 1).length > normalized.length) throw new Error('The supplied crib is longer than the ciphertext.');
  }
  if (input.tool === 'detective' && !prepared.crib) throw new Error('Detective requires a supplied unplaced crib.');
  if (prepared.voice !== undefined && !['dale', 'plain'].includes(prepared.voice)) throw new Error('Voice must be dale or plain.');
  return {kind: 'tool', tool: input.tool, text: input.text, params: prepared};
}

// This is trusted, constant Python. User strings are data passed to a function.
const PYTHON_BOOTSTRAP = String.raw`
import hashlib
import json
import re
import stat
import sys
import zipfile
from pathlib import Path, PurePosixPath

_cipher_lab_root = "/cipher-lab"
_cipher_lab_manifest = json.loads(Path("/tmp/cipher-lab-manifest.json").read_text())
_cipher_lab_archive = Path("/tmp/cipher-lab-engine.zip").read_bytes()
if hashlib.sha256(_cipher_lab_archive).hexdigest() != _cipher_lab_manifest["archive_sha256"]:
    raise ValueError("source archive hash mismatch")
_cipher_lab_records = _cipher_lab_manifest["files"]
if not isinstance(_cipher_lab_records, list) or not 1 <= len(_cipher_lab_records) <= 256:
    raise ValueError("source file count is invalid")
_cipher_lab_expected = {record["path"]: record for record in _cipher_lab_records}
if len(_cipher_lab_expected) != len(_cipher_lab_records):
    raise ValueError("duplicate source paths")
_cipher_lab_total = 0
with zipfile.ZipFile(Path("/tmp/cipher-lab-engine.zip")) as archive:
    if set(archive.namelist()) != set(_cipher_lab_expected) or len(archive.infolist()) != len(_cipher_lab_expected):
        raise ValueError("archive entries do not match the manifest")
    for info in archive.infolist():
        name = info.filename
        path = PurePosixPath(name)
        if (name != "LICENSE" and not re.fullmatch(r"engine/(?:[a-z_][a-z_0-9]*/)*[a-z_][a-z_0-9]*\.(?:py|json|txt)", name)) or ".." in path.parts or path.is_absolute():
            raise ValueError("unsafe source archive path")
        if stat.S_ISLNK(info.external_attr >> 16) or info.is_dir():
            raise ValueError("source archive links and directories are not allowed")
        record = _cipher_lab_expected[name]
        if not isinstance(record["bytes"], int) or not 0 <= record["bytes"] <= 4 * 1024 * 1024 or info.file_size != record["bytes"]:
            raise ValueError("source file size mismatch")
        _cipher_lab_total += info.file_size
        if _cipher_lab_total > 16 * 1024 * 1024:
            raise ValueError("source archive exceeds the uncompressed limit")
        raw = archive.read(info)
        if hashlib.sha256(raw).hexdigest() != record["sha256"]:
            raise ValueError("source file hash mismatch")
        destination = Path(_cipher_lab_root, *path.parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(raw)
if _cipher_lab_total != _cipher_lab_manifest["uncompressed_bytes"]:
    raise ValueError("source uncompressed byte count mismatch")
if hashlib.sha256(json.dumps(_cipher_lab_records, sort_keys=True, separators=(",", ":")).encode()).hexdigest() != _cipher_lab_manifest["source_sha256"]:
    raise ValueError("source manifest digest mismatch")
if hashlib.sha256(Path(_cipher_lab_root, "engine/data/neural_router_v2_weights.json").read_bytes()).hexdigest() != _cipher_lab_manifest["model_sha256"]:
    raise ValueError("model hash mismatch")
sys.path.insert(0, _cipher_lab_root)
from engine.tool_registry import run_tool as _cipher_lab_run_tool
from engine.neural_router_v2 import route_probabilities as _cipher_lab_predict

_cipher_lab_tools = ("persona-council", "normal-man", "emperor", "inheritance", "hallucinogens", "pacifist", "detective", "cartographer", "mechanic", "adversary", "skeptic", "hill-inference", "transposition-ensemble")
def _cipher_lab_dispatch(payload_json):
    payload = json.loads(payload_json)
    text = payload.get("text")
    if not isinstance(text, str) or len(text) > 4096 or not text.isascii() or any(ch.isdigit() for ch in text):
        raise ValueError("browser input must be bounded ASCII Latin text")
    normalized = "".join(ch for ch in text.upper() if "A" <= ch <= "Z")
    if not 4 <= len(normalized) <= 512:
        raise ValueError("browser input must contain4..512 letters")
    if payload.get("kind") == "bob":
        if set(payload) != {"kind", "text"}:
            raise ValueError("Bob accepts ciphertext only")
        result = _cipher_lab_predict(text)
    elif payload.get("kind") == "tool" and payload.get("tool") in _cipher_lab_tools:
        params = payload.get("params", {})
        if not isinstance(params, dict) or len(json.dumps(params)) > 16384:
            raise ValueError("browser parameters exceed16 KiB")
        # Defense in depth: these caps cannot be bypassed through worker messages.
        for key, minimum, maximum in (("max_checks", 0, 10000), ("max_candidates", 1, 10), ("max_period", 0, 16), ("max_width", 2, 16), ("max_rotations", 0, 8), ("max_rails", 2, 5)):
            if key in params and (not isinstance(params[key], int) or isinstance(params[key], bool) or not minimum <= params[key] <= maximum):
                raise ValueError("browser parameter outside its finite bounds: " + key)
        params.setdefault("max_checks", 5000)
        params.setdefault("max_candidates", 10)
        if payload["tool"] == "cartographer":
            params.setdefault("max_width", 16)
        result = _cipher_lab_run_tool(payload["tool"], text, params=params)
    else:
        raise ValueError("tool not enabled in the browser lab")
    encoded = json.dumps(result, allow_nan=False, separators=(",", ":"))
    if len(encoded) > 2 * 1024 * 1024:
        raise ValueError("result exceeds the browser output limit")
    return encoded
`;

let initialization = null;
let engine = null;
let manifest = null;
let busy = false;
function status(message) { self.postMessage({type: 'loading', message}); }
async function fetchBounded(url, maximum) {
  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch(url, {signal: controller.signal, credentials: 'same-origin', cache: 'no-cache'});
    if (!response.ok) throw new Error(`Could not fetch the bundled engine (${response.status}).`);
    const declared = Number(response.headers.get('Content-Length'));
    if (declared > maximum) throw new Error('Bundled engine download exceeds its limit.');
    const reader = response.body?.getReader();
    if (!reader) throw new Error('This browser does not support streamed engine downloads.');
    const chunks = []; let size = 0;
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); throw new Error('Bundled engine download exceeds its limit.'); }
      chunks.push(value);
    }
    const result = new Uint8Array(size); let position = 0;
    for (const chunk of chunks) { result.set(chunk, position); position += chunk.byteLength; }
    return result;
  } finally { clearTimeout(deadline); }
}
async function initialize() {
  if (initialization) return initialization;
  initialization = (async () => {
    status('Downloading and verifying the first-party Python source.');
    const metadata = await fetchBounded('/cipher-lab/manifest.json', 128 * 1024);
    manifest = JSON.parse(new TextDecoder().decode(metadata));
    if (manifest.format_version !== 1 || manifest.pyodide_version !== PYODIDE_VERSION || !/^[a-f0-9]{64}$/.test(manifest.archive_sha256) || JSON.stringify(manifest.tools) !== JSON.stringify(TOOLS)) throw new Error('The engine manifest is incompatible. Reload the site.');
    const archive = await fetchBounded('/cipher-lab/engine.zip', 8 * 1024 * 1024);
    if (archive.byteLength !== manifest.archive_bytes) throw new Error('Engine archive size mismatch. Reload the site.');
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', archive))].map(value => value.toString(16).padStart(2, '0')).join('');
    if (digest !== manifest.archive_sha256) throw new Error('Engine archive integrity check failed. Reload the site.');
    status('Loading Python and NumPy. The first run downloads the pinned Pyodide runtime.');
    try {
      const {loadPyodide} = await import(`${PYODIDE_BASE}pyodide.mjs`);
      engine = await loadPyodide({indexURL: PYODIDE_BASE, packages: ['numpy'], stdout: () => {}, stderr: () => {}});
    } catch {
      throw new Error('Python or NumPy could not load from the pinned Pyodide CDN. Check your connection and content blockers. Offline startup requires previously cached runtime assets.');
    }
    engine.FS.writeFile('/tmp/cipher-lab-engine.zip', archive);
    engine.FS.writeFile('/tmp/cipher-lab-manifest.json', metadata);
    await engine.runPythonAsync(PYTHON_BOOTSTRAP);
    // Release archive copies after the verified files have been extracted.
    engine.FS.unlink('/tmp/cipher-lab-engine.zip');
    self.postMessage({type: 'ready', manifest});
  })();
  return initialization;
}
if (typeof self !== 'undefined') self.onmessage = async (event) => {
  const message = event.data;
  if (message?.type === 'init') {
    try { await initialize(); }
    catch (error) { initialization = null; self.postMessage({type: 'error', code: 'startup', message: String(error.message ?? error).slice(0, 1200)}); }
    return;
  }
  if (message?.type !== 'run' || !Number.isSafeInteger(message.id)) return;
  if (busy) { self.postMessage({type: 'error', id: message.id, code: 'busy', message: 'A Python run is already active.'}); return; }
  busy = true;
  let runner;
  try {
    const request = validateRequest(message.request);
    await initialize();
    self.postMessage({type: 'running', id: message.id});
    runner = engine.globals.get('_cipher_lab_dispatch');
    // Fixed function invocation, never Python source interpolation or user evaluation.
    const encoded = runner(JSON.stringify(request));
    self.postMessage({type: 'result', id: message.id, result: JSON.parse(encoded)});
  } catch (error) {
    self.postMessage({type: 'error', id: message.id, code: 'validation-or-engine', message: String(error.message ?? error).slice(0, 1200)});
  } finally { runner?.destroy(); busy = false; }
};
