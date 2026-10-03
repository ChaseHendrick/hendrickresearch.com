"""Build a deterministic, first-party Python snapshot for the Cipher Lab worker.

python scripts/sync-cipher-lab.py --source /path/to/undeciphered-texts
No tests, scratch files, cases, local paths or training corpora are published.
"""
from __future__ import annotations

import argparse
import ast
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tempfile
import zipfile

PYODIDE_VERSION = "314.0.7"
TOOLS = ("persona-council", "normal-man", "emperor", "inheritance", "hallucinogens",
         "pacifist", "detective", "cartographer", "mechanic", "adversary", "skeptic",
         "hill-inference", "transposition-ensemble")
# Explicit entry points. Only static Python imports reachable from these are copied.
ROOT_MODULES = (
    "engine.tool_registry", "engine.persona_solvers", "engine.neural_router_v2",
    "engine.solvers.persona_normal_man", "engine.solvers.persona_court_notice",
    "engine.solvers.persona_inheritance", "engine.solvers.persona_hallucinogens",
    "engine.solvers.pacifist", "engine.solvers.persona_detective",
    "engine.solvers.persona_cartographer", "engine.solvers.persona_mechanic",
    "engine.solvers.persona_adversary", "engine.solvers.persona_skeptic",
    "engine.solvers.hill_inference", "engine.transposition_ensemble",
)
EXCLUDED_MODULES = {"engine.cli", "engine.__main__", "engine.case_workflow",
                    "engine.cipher_synthesis", "engine.ocr"}
DATA_FILES = (
    "english.txt", "neural_router_v2_weights.json", "neural_router_weights.json",
    "neural_router_v2_metrics.json", "neural_router_v2_audit.json",
    "persona_emperor_solver_certificate.json", "persona_inheritance_solver_certificate.json",
    "persona_hallucinogens_solver_certificate.json", "persona_pacifist_solver_certificate.json",
    "persona_detective_solver_certificate.json", "persona_cartographer_solver_certificate.json",
    "persona_mechanic_solver_certificate.json", "persona_normal_man_solver_certificate.json",
    "persona_adversary_solver_certificate.json", "persona_skeptic_solver_certificate.json",
    "hill_inference_certificate.json", "transposition_ensemble_certificate.json",
)
MAX_ARCHIVE_BYTES = 8 * 1024 * 1024
MAX_UNCOMPRESSED_BYTES = 16 * 1024 * 1024
MAX_FILES = 256


def _module_path(source: Path, module: str):
    if module in EXCLUDED_MODULES or not (module == "engine" or module.startswith("engine.")):
        return None
    base = source.joinpath(*module.split("."))
    for path in (base.with_suffix(".py"), base / "__init__.py"):
        if path.is_symlink():
            raise ValueError("source symlink is not allowed: " + module)
        if path.is_file():
            return path
    return None


def _source_paths(source: Path):
    pending = list(ROOT_MODULES)
    paths, seen = set(), set()
    while pending:
        module = pending.pop()
        if module in seen:
            continue
        seen.add(module)
        path = _module_path(source, module)
        if path is None:
            if module in ROOT_MODULES:
                raise ValueError("missing required source module: " + module)
            continue
        # Parent package initializers are executable dependencies too.
        bits = module.split(".")
        pending.extend(".".join(bits[:index]) for index in range(1, len(bits)))
        paths.add(path)
        tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                pending.extend(alias.name for alias in node.names if alias.name.startswith("engine"))
            elif isinstance(node, ast.ImportFrom) and node.module and not node.level:
                if node.module == "engine" or node.module.startswith("engine."):
                    pending.append(node.module)
                    pending.extend(node.module + "." + alias.name for alias in node.names)
            elif isinstance(node, ast.Call) and node.args and isinstance(node.args[0], ast.Constant):
                # Include literal lazy imports, never inferred paths or user-provided names.
                if isinstance(node.func, ast.Attribute) and node.func.attr == "import_module":
                    value = node.args[0].value
                    if isinstance(value, str) and value.startswith("engine."):
                        pending.append(value)
    for name in DATA_FILES:
        path = source / "engine/data" / name
        if path.is_symlink():
            raise ValueError("source symlink is not allowed: " + name)
        if not path.is_file():
            raise ValueError("missing required source data: " + name)
        paths.add(path)
    license_path = source / "LICENSE"
    if license_path.is_symlink() or not license_path.is_file():
        raise ValueError("the source license must be a regular file")
    paths.add(license_path)
    for path in paths:
        if any(parent.is_symlink() for parent in path.parents if parent != source.parent):
            raise ValueError("source symlink directory is not allowed")
        if not path.resolve().is_relative_to(source):
            raise ValueError("source file escaped the repository")
    return sorted(paths, key=lambda path: path.relative_to(source).as_posix())


def _git(source: Path, arguments: list[str]):
    try:
        result = subprocess.run(["git", "-C", str(source), *arguments], capture_output=True,
                                text=True, timeout=5, check=True)
        return result.stdout.strip()
    except (subprocess.SubprocessError, OSError):
        return None


def _atomic_write(path: Path, data: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=".cipher-lab-", delete=False) as temporary:
        temporary.write(data)
        saved = Path(temporary.name)
    saved.replace(path)


def build_snapshot(source: Path, output: Path):
    source = source.resolve()
    paths = _source_paths(source)
    if len(paths) > MAX_FILES:
        raise ValueError("source snapshot exceeds the file limit")
    records, payloads = [], {}
    for path in paths:
        relative = path.relative_to(source).as_posix()
        data = path.read_bytes()
        payloads[relative] = data
        records.append({"path": relative, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
    total = sum(record["bytes"] for record in records)
    if total > MAX_UNCOMPRESSED_BYTES:
        raise ValueError("source snapshot exceeds the uncompressed byte limit")
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for relative, data in payloads.items():
            item = zipfile.ZipInfo(relative, date_time=(1980, 1, 1, 0, 0, 0))
            item.compress_type = zipfile.ZIP_DEFLATED
            item.create_system = 3
            item.external_attr = 0o100644 << 16
            archive.writestr(item, data, compresslevel=9)
    raw = buffer.getvalue()
    if len(raw) > MAX_ARCHIVE_BYTES:
        raise ValueError("source archive exceeds the compressed byte limit")
    # The digest binds exact source/data paths and their bytes, not local filesystem metadata.
    source_digest = hashlib.sha256(json.dumps(records, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    status = _git(source, ["status", "--porcelain", "--untracked-files=normal"])
    manifest = {
        "format_version": 1,
        "source_repository": "https://github.com/ChaseHendrick/undeciphered-texts",
        "source_git_commit": _git(source, ["rev-parse", "HEAD"]),
        "source_dirty": None if status is None else bool(status),
        "source_sha256": source_digest,
        "model_sha256": hashlib.sha256(payloads["engine/data/neural_router_v2_weights.json"]).hexdigest(),
        "archive_sha256": hashlib.sha256(raw).hexdigest(),
        "archive_bytes": len(raw), "uncompressed_bytes": total,
        "pyodide_version": PYODIDE_VERSION,
        "pyodide_documentation": "https://pyodide.org/en/stable/usage/webworker.html",
        "files": records, "tools": list(TOOLS),
        "source_policy": "Source license, explicit Python entry points and their static engine imports; explicit data files. No cases, tests, private work, training corpus files, native OCR or SMT entry point.",
        "limits": {"max_letters": 512, "max_checks": 10000, "max_candidates": 10,
                   "max_period": 16, "run_seconds": 30},
        "period_limit_scope": "The exposed max_period option is capped at16. Existing exact-autokey persona branches test up to32 primer lengths inside the same global work budget; caller keyword guesses are limited to32 letters.",
    }
    _atomic_write(output / "engine.zip", raw)
    _atomic_write(output / "manifest.json", (json.dumps(manifest, indent=2, allow_nan=False) + "\n").encode())
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "public/cipher-lab")
    arguments = parser.parse_args()
    manifest = build_snapshot(arguments.source, arguments.output)
    print(json.dumps({key: manifest[key] for key in ("archive_sha256", "model_sha256", "source_git_commit", "source_dirty", "archive_bytes")}, indent=2))


if __name__ == "__main__":
    main()
