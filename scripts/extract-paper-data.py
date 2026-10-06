#!/usr/bin/env python3
"""Copy the small datasets the paper explainer pages draw from out of the companion repositories.

    python3 scripts/extract-paper-data.py --papers /path/to/checkouts

`--papers` holds one checkout per companion repository (minimal-winding, collapse-without-rotation,
stable-expansion, hh-dynamics, hh-pulse, nf-pulse, double-pendulum, cardiac-rings, rank-window). The
script writes src/paper-data.json, with the source commit and path of every dataset, and converts each
paper's figures from PDF to SVG (or to a 1600-pixel PNG when the SVG would pass 400 kB) in
public/papers/figures/<id>/ (needs pdftocairo from poppler).
Numbers are copied as published; nothing is recomputed here. Rerun after a paper release.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
OUT = SITE / "src" / "paper-data.json"
FIGURES = SITE / "public" / "papers" / "figures"


def commit(repo: Path) -> str:
    return subprocess.run(["git", "-C", str(repo), "rev-parse", "HEAD"], capture_output=True, text=True,
                          check=True).stdout.strip()


def load(repo: Path, path: str) -> dict:
    return json.loads((repo / path).read_text(encoding="utf-8"))


def config(record: dict, alpha: float = 0) -> dict:
    """Vortex positions as [x, y] floats and circulations as floats, rounded for the browser."""
    z = [[round(float(x), 12), round(float(y), 12)] for x, y in record["z"]]
    g = [round(float(v), 12) for v in record["G"]]
    out = {"N": len(z), "alpha": alpha, "z": z, "G": g}
    if "P" in record:
        out["P"] = float(record["P"])
    return out


_TEX = (("\\sqrt{3 + \\alpha}", "√(3 + α)"), ("\\sqrt{3}", "√3"), ("\\sqrt3", "√3"), ("\\sqrt{2}", "√2"), ("\\sqrt", "√"), ("\\varepsilon t^{1/4 +\n\\varepsilon}", "ε t^(1/4 + ε)"), ("\\alpha", "α"),
        ("\\varepsilon", "ε"), ("\\eps", "ε"), ("\\omega", "ω"), ("\\Gamma", "Γ"), ("\\pi", "π"), ("\\mu", "μ"), ("\\gamma", "γ"), ("\\infty", "∞"),
        ("\\ldots", "…"), ("\\le", "≤"), ("\\ge", "≥"), ("\\to", "→"), ("\\pm", "±"), ("\\in", "∈"),
        ("\\,", " "), ("\\'", ""), ("{", ""), ("}", ""), ("$", ""), ("~", " "))


def abstract(repo: Path) -> str:
    """The README's abstract as plain text, with the few TeX commands it uses turned into symbols."""
    text = (repo / "README.md").read_text(encoding="utf-8")
    body = text.split("## Abstract", 1)[1].split("\n## ", 1)[0]
    for tex, plain in _TEX:
        body = body.replace(tex, plain)
    return " ".join(body.split())


def source(repo: Path, path: str) -> dict:
    return {"repository": f"https://github.com/ChaseHendrick/{repo.name}", "commit": commit(repo), "path": path}


def figures(repo: Path, pid: str) -> list[str]:
    folder = repo / "paper" / "figures"
    target = FIGURES / pid
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True)
    names = []
    for pdf in sorted(folder.glob("*.pdf")):
        svg = target / (pdf.stem + ".svg")
        if (folder / svg.name).exists():
            shutil.copyfile(folder / svg.name, svg)
        else:
            subprocess.run(["pdftocairo", "-svg", str(pdf), str(svg)], check=True)
        if svg.stat().st_size > 400_000:
            # Dense plots make heavy SVGs; ship a 1600-pixel PNG instead.
            svg.unlink()
            subprocess.run(["pdftocairo", "-png", "-singlefile", "-scale-to-x", "1600", "-scale-to-y", "-1", str(pdf),
                            str(target / pdf.stem)], check=True)
            names.append(f"/papers/figures/{pid}/{pdf.stem}.png")
            continue
        names.append(f"/papers/figures/{pid}/{svg.name}")
    return names


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--papers", required=True, type=Path)
    root = parser.parse_args().papers
    data: dict[str, dict] = {}

    mw = root / "minimal-winding"
    cwr = root / "collapse-without-rotation"
    many = load(mw, "data/collapse-euler-n7-12.json")["minima"]
    winding = [{"N": 3, "P": math.sqrt(3) / 2, "kind": "proved lower bound, approached but never reached"}]
    for n, path in ((4, "data/certify-inputs/kkt_N4.json"), (5, "data/certify-inputs/kkt_N5.json"),
                    (6, "data/certify-inputs/kkt_N6.json")):
        winding.append({"N": n, "P": float(load(mw, path)["P"]), "kind": "computer-assisted proof"})
    winding += [{"N": m["N"], "P": float(m["P"]), "kind": "numerical"} for m in many]
    for n in (33, 61, 603):
        winding.append({"N": n, "P": float(load(mw, f"data/collapse-euler-n{n}.json")["P"]), "kind": "numerical"})
    data["minimal-winding"] = {
        "source": source(mw, "data/"),
        "winding": winding,
        "continuum": 0.47736353369161202484,
        "configs": {
            "n4": config(load(mw, "data/certify-inputs/kkt_N4.json")),
            "n5": config(load(mw, "data/certify-inputs/kkt_N5.json")),
            "n6": config(load(mw, "data/certify-inputs/kkt_N6.json")),
            "n12": config(next(m for m in many if m["N"] == 12)),
            "n61": config(load(mw, "data/collapse-euler-n61.json")),
        },
        "figures": figures(mw, "minimal-winding"),
    }

    n11 = load(cwr, "data/collapse-alpha2-n11-no-rotation.json")["minima"][0]["config"]
    data["collapse-without-rotation"] = {
        "source": source(cwr, "data/"),
        "phase": [{"alpha": a, "N": n} for a, n in ((6, 5), (4, 6), (3, 8), (2, 11), (1.5, 17), (1.2, 29), (1, 60))],
        "limit": [0.66, 0.80],
        "configs": {
            "alpha2-n11": config(n11, 2) | {"P": 0.0},
            "sqg-n60": config(load(cwr, "data/collapse-sqg-n60-no-rotation.json"), 1) | {"P": 0.0},
        },
        "figures": figures(cwr, "collapse-without-rotation"),
    }

    se = root / "stable-expansion"
    controls = load(se, "data/starts-controls.json")
    data["stable-expansion"] = {
        "source": source(se, "data/"),
        "configs": {
            "stable4": config(load(se, "data/start-four.json")),
            "stable5": config(load(se, "data/start-five.json")),
            "unstable4": config(controls["unstable4"]),
            "unstable5": config(controls["unstable5"]),
        },
        "survey": [{"N": 4, "stable": 52, "converged": 342}, {"N": 5, "stable": 32, "converged": 543}],
        "figures": figures(se, "stable-expansion"),
    }

    hp = root / "hh-pulse"
    pulses = {}
    for temp, path in (("18.5", "data/hp_pulse_18.5_El10.613.json"), ("6.3", "data/hp_pulse_6.3_El10.613.json")):
        record = load(hp, path)
        pulses[temp] = {"K": record["K"], "lambda_u": float(record["lambda_u"]), "t_end": record["t_end"]}
    data["hh-pulse"] = {
        "source": source(hp, "data/"),
        "pulses": pulses,
        "speeds": {"18.5": "18.73188824788048354046831343329624387695575077",
                   "6.3": "12.31375672016229859330140853674732362368394751453213155988245"},
        "hh1952": {"18.5": 18.8},
        "figures": figures(hp, "hh-pulse"),
    }

    hd = root / "hh-dynamics"
    data["hh-dynamics"] = {
        "source": source(hd, "README.md"),
        "hopf": {"J_H1": [9.775437995393, 9.775437995394], "J_H2": [154.522433665808, 154.522433665809]},
        "bistable": {"J": 8, "period_ms": [16.0058, 16.0140]},
        "figures": figures(hd, "hh-dynamics"),
    }

    nf = root / "nf-pulse"
    data["nf-pulse"] = {
        "source": source(nf, "README.md"),
        "fast_speed": "1.1027477097341592491478677",
        "slow_speed": "0.3775319350688905765075606",
        "eps_range": [0.08, 0.13693],
        "figures": figures(nf, "nf-pulse"),
    }

    dp = root / "double-pendulum"
    data["double-pendulum"] = {
        "source": source(dp, "README.md"),
        "entropy": [{"E": -0.5, "per_return": 0.0906, "per_time": 0.0213},
                    {"E": 0.0, "per_return": 0.1016, "per_time": 0.0138},
                    {"E": 0.5, "per_return": 0.0906, "per_time": 0.0129}],
        "figures": figures(dp, "double-pendulum"),
    }

    cr = root / "cardiac-rings"
    rings = []
    for n in (8, 16, 32, 64):
        record = load(cr, f"data/fourier-existence-N{n}.json")
        rings.append({"N": n, "T_ms": record["T_ms"]["lower"]["dec"]})
    data["cardiac-rings"] = {
        "source": source(cr, "data/"),
        "rings": rings,
        "multiplier_bound": 0.9997321,
        "figures": figures(cr, "cardiac-rings"),
    }

    rw = root / "rank-window"
    data["rank-window"] = {
        "source": source(rw, "README.md"),
        "sets": [{"d": 8, "bound": 1.25, "reported": 1.49, "border_low": 0.255, "border_high": 1.628},
                 {"d": 4, "bound": 1.5, "reported": 1.65, "border_low": 0.625, "border_high": 1.762},
                 {"d": 1, "bound": 3.0, "reported": 3.43, "border_low": None, "border_high": 3.5012}],
        "figures": figures(rw, "rank-window"),
    }

    for pid, record in data.items():
        record["abstract"] = abstract(root / pid)
    OUT.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(SITE)} and figures for {len(data)} papers")


if __name__ == "__main__":
    main()
