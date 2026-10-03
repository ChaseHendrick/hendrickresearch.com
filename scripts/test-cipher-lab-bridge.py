"""Offline source parity and browser protocol checks. Run with NumPy available.

python scripts/test-cipher-lab-bridge.py --source /path/to/undeciphered-texts
Actual browser startup also needs the pinned Pyodide CDN.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest
import zipfile

sys.dont_write_bytecode = True

SITE = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--source", type=Path, required=True)
arguments, remaining = parser.parse_known_args()
SOURCE = arguments.source.resolve()
sys.argv = [sys.argv[0], *remaining]


class CipherLabBridgeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location("cipher_lab_sync", SITE / "scripts/sync-cipher-lab.py")
        cls.sync = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.sync)

    def test_deterministic_archive_hashes_and_excludes_private_work(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            first = self.sync.build_snapshot(SOURCE, output)
            original = (output / "engine.zip").read_bytes()
            second = self.sync.build_snapshot(SOURCE, output)
            self.assertEqual(first, second)
            self.assertEqual(original, (output / "engine.zip").read_bytes())
            self.assertEqual(hashlib.sha256(original).hexdigest(), first["archive_sha256"])
            self.assertTrue(first["source_git_commit"] is None or re.fullmatch(r"[0-9a-f]{40}", first["source_git_commit"]))
            self.assertIsInstance(first["source_dirty"], (bool, type(None)))
            self.assertEqual(first["tools"], list(self.sync.TOOLS))
            with zipfile.ZipFile(output / "engine.zip") as archive:
                self.assertEqual(archive.namelist(), sorted(archive.namelist()))
                for record in first["files"]:
                    self.assertEqual(archive.read(record["path"]), (SOURCE / record["path"]).read_bytes())
                    self.assertEqual(hashlib.sha256(archive.read(record["path"])).hexdigest(), record["sha256"])
                for name in archive.namelist():
                    self.assertTrue(name == "LICENSE" or name.startswith("engine/"))
                    self.assertNotIn("__pycache__", name)
                    self.assertNotIn("case_workflow", name)
                    self.assertNotIn("cipher_synthesis", name)
                    self.assertNotIn("ocr", name)
                    self.assertNotIn("neural_train_austen", name)
                model = archive.read("engine/data/neural_router_v2_weights.json")
                self.assertEqual(hashlib.sha256(model).hexdigest(), first["model_sha256"])

    def test_symlink_source_rejected_without_copying_it(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "engine").mkdir()
            (root / "engine/transposition_ensemble.py").symlink_to(SOURCE / "engine/transposition_ensemble.py")
            with self.assertRaisesRegex(ValueError, "symlink"):
                self.sync.build_snapshot(root, root / "output")

    def test_exact_worker_bootstrap_and_python_api_fixture_parity(self):
        worker = (SITE / "public/cipher-lab/worker.js").read_text()
        bootstrap = re.search(r"const PYTHON_BOOTSTRAP = String.raw`([\s\S]*?)`;", worker).group(1)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / "snapshot"
            manifest = self.sync.build_snapshot(SOURCE, output)
            runner = root / "parity.py"
            # Execute the exact trusted worker Python code, with only sandbox path names changed.
            script = bootstrap.replace('"/cipher-lab"', repr(str(root / "extracted")))
            script = script.replace('"/tmp/cipher-lab-engine.zip"', repr(str(output / "engine.zip")))
            script = script.replace('"/tmp/cipher-lab-manifest.json"', repr(str(output / "manifest.json")))
            script += '''
from engine.tool_registry import run_tool
from engine.neural_router_v2 import route_probabilities
vector = json.loads(Path(_cipher_lab_root, "engine/data/persona_emperor_solver_certificate.json").read_text())["controls"][0]
params = {"max_checks": 1000, "max_candidates": 10, "cribs": [{"offset": 0, "plaintext": vector["expected_plaintext"][:12]}]}
payload = {"kind": "tool", "tool": "normal-man", "text": vector["ciphertext"], "params": params}
actual = json.loads(_cipher_lab_dispatch(json.dumps(payload)))
assert actual == run_tool("normal-man", vector["ciphertext"], params=params)
assert any(hashlib.sha256(c["plaintext"].encode()).hexdigest() == vector["plaintext_sha256"] for c in actual["result"]["candidates"])
hill = json.loads(Path(_cipher_lab_root, "engine/data/hill_inference_certificate.json").read_text())["vectors"][1]
hill_payload = {"kind": "tool", "tool": "hill-inference", "text": hill["ciphertext"], "params": {"cribs": hill["cribs"], "max_checks": 1500, "max_candidates": 10}}
hill_report = json.loads(_cipher_lab_dispatch(json.dumps(hill_payload)))
assert hill_report == run_tool("hill-inference", hill["ciphertext"], params=hill_payload["params"])
assert any(hashlib.sha256(c["plaintext"].encode()).hexdigest() == hill["plaintext_sha256"] for c in hill_report["result"]["candidates"])
hill_payload["params"]["max_checks"] = 1
partial = json.loads(_cipher_lab_dispatch(json.dumps(hill_payload)))["result"]
assert partial["checks"] <= 1 and not partial["search_complete"]
bob = json.loads(_cipher_lab_dispatch(json.dumps({"kind": "bob", "text": vector["ciphertext"]})))
assert bob == route_probabilities(vector["ciphertext"])
assert bob["model_sha256"] == _cipher_lab_manifest["model_sha256"]
assert bob["claimed_plaintext"] is None
assert abs(sum(c["probability"] for c in bob["candidates"]) - 1) < 1e-10
try:
    _cipher_lab_dispatch(json.dumps({"kind": "tool", "tool": "aes", "text": "ABCD", "params": {}}))
except ValueError:
    pass
else:
    raise AssertionError("non-browser tool must not run")
print("actual Python source/tool/model parity passed")
'''
            runner.write_text(script)
            result = subprocess.run([sys.executable, "-I", str(runner)], capture_output=True, text=True, timeout=60)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("actual Python source/tool/model parity passed", result.stdout)
            self.assertEqual(manifest["limits"]["max_checks"], 10000)

    def test_worker_rejects_tampered_snapshot(self):
        worker = (SITE / "public/cipher-lab/worker.js").read_text()
        bootstrap = re.search(r"const PYTHON_BOOTSTRAP = String.raw`([\s\S]*?)`;", worker).group(1)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.sync.build_snapshot(SOURCE, root)
            manifest = json.loads((root / "manifest.json").read_text())
            manifest["files"][0]["sha256"] = "0" * 64
            (root / "manifest.json").write_text(json.dumps(manifest))
            script = bootstrap.replace('"/cipher-lab"', repr(str(root / "extracted")))
            script = script.replace('"/tmp/cipher-lab-engine.zip"', repr(str(root / "engine.zip")))
            script = script.replace('"/tmp/cipher-lab-manifest.json"', repr(str(root / "manifest.json")))
            runner = root / "tamper.py"
            runner.write_text(script)
            result = subprocess.run([sys.executable, "-I", str(runner)], capture_output=True, text=True, timeout=10)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("source file hash mismatch", result.stderr)

    def test_javascript_guards_and_runtime_cancel_deadline(self):
        script = r'''
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {validateRequest, TOOLS} from './public/cipher-lab/worker.js';
for (const name of TOOLS) {
  const params = name === 'detective' ? {crib:'TEST'} : {};
  const request = validateRequest({kind:'tool',tool:name,text:'A'.repeat(16),params});
  assert.equal(request.params.max_checks,5000);
  assert.equal(request.params.max_candidates,10);
}
for(const request of [
  {kind:'tool',tool:'train-router',text:'AAAA',params:{}},
  {kind:'tool',tool:'normal-man',text:'A'.repeat(513),params:{}},
  {kind:'tool',tool:'normal-man',text:'éABC',params:{}},
  {kind:'tool',tool:'normal-man',text:'ABC1',params:{}},
  {kind:'tool',tool:'normal-man',text:'ABCD',params:{max_checks:10001}},
  {kind:'tool',tool:'normal-man',text:'ABCD',params:{max_candidates:11}},
  {kind:'tool',tool:'detective',text:'ABCD',params:{crib:'A',max_period:17}},
  {kind:'tool',tool:'normal-man',text:'ABCD',params:{python:'print(1)'}},
  {kind:'bob',text:'AAAA'},
]) assert.throws(()=>validateRequest(request));
const emitted = ts.transpileModule(fs.readFileSync('src/cipher-lab-runtime.ts','utf8'), {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const timers = new Map(); let sequence=0; const workers=[];
class FakeWorker { constructor(url,options){ assert.equal(options.type,'module'); workers.push(this); } postMessage(m){this.last=m;} terminate(){this.terminated=true;} }
const sandbox={exports:{},Worker:FakeWorker,setTimeout:(fn,ms)=>{timers.set(++sequence,{fn,ms});return sequence;},clearTimeout:(id)=>timers.delete(id)};
vm.runInNewContext(emitted,sandbox);
const states=[]; const runtime=new sandbox.exports.CipherLabRuntime({onStatus:e=>states.push(e.state)});
const promise=runtime.runTool('normal-man','ABCD',{});
assert.deepEqual([...timers.values()].map(t=>t.ms),[180000]);
const worker=workers[0]; worker.onmessage({data:{type:'ready',manifest:{archive_sha256:'a'}}});
await Promise.resolve();
assert.equal(timers.size,0);
worker.onmessage({data:{type:'running',id:1}});
assert.deepEqual([...timers.values()].map(t=>t.ms),[30000]);
runtime.cancel(); await assert.rejects(promise,e=>e.code==='cancelled');
assert.ok(worker.terminated); assert.equal(timers.size,0);
const timed=runtime.runTool('normal-man','ABCD',{});
worker.onmessage({data:{type:'ready',manifest:{archive_sha256:'stale'}}});
assert.deepEqual([...timers.values()].map(t=>t.ms),[180000]);
const fresh=workers[1]; fresh.onmessage({data:{type:'ready',manifest:{archive_sha256:'b'}}}); await Promise.resolve();
fresh.onmessage({data:{type:'running',id:2}});
[...timers.values()][0].fn();
await assert.rejects(timed,e=>e.code==='run-timeout'); assert.ok(fresh.terminated);
assert.ok(states.includes('cancelled')); assert.ok(states.includes('error'));
console.log('guards, cancellation and computation deadline passed');
'''
        result = subprocess.run(["node", "--input-type=module", "-e", script], cwd=SITE,
                                capture_output=True, text=True, timeout=20)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
