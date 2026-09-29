#!/mnt/data/workspace/.venv/bin/python
"""Exporta pau_catalog.db + cb_catalog.db a public/data/index.json i public/crops/**.webp (sense pèrdua).

Només LLEGEIX les BD: no retalla res. Ús:
    scripts/export_dades.py            exporta (abans passa `pau check` i `cb check`)
    scripts/export_dades.py --check    valida el que ja s'ha exportat (recomptes, ids únics, imatges)
"""
import json
import shutil
import sqlite3
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WS = ROOT.parents[1]
PAU_DIR = WS / "docencia/materials/2BAT/matematiques/recursos/pau_catalog"
CB_DIR = WS / "docencia/materials/competencies_basiques/cb_catalog"
PUB = ROOT / "public"
OUT = PUB / "data/index.json"
CONV = {"JUNY": "juny", "SET": "setembre", "CB": "ordinària", "AD": "diagnòstica"}
COLECCIO = {("PAU", "mat2"): "PAU Mat II", ("PAU", "mat_ccss"): "PAU Mat CCSS",
            ("CB4ESO", "mat"): "CCBB 4t ESO", ("CB4ESO", "cte"): "CCBB 4t ESO",
            ("CB2ESO", "mat"): "CCBB 2n ESO", ("CB2ESO", "cte"): "CCBB 2n ESO"}
MATERIA = {"mat2": "Matemàtiques II", "mat_ccss": "Matemàtiques CCSS", "mat": "Matemàtiques", "cte": "Ciències i tecnologia"}
RECOMPTES = {"pau": 1005, "cb_items": 627, "cb_activitats": 77}


def webp(src: Path, dest_rel: str) -> str:
    dest = PUB / dest_rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists() or dest.stat().st_mtime < src.stat().st_mtime:
        Image.open(src).convert("RGB").save(dest, "WEBP", lossless=True, method=4)
    return dest_rel


def rows(db: Path, sql: str):
    con = sqlite3.connect(db)
    con.row_factory = sqlite3.Row
    return [dict(r) for r in con.execute(sql)]


def fitxes_pau() -> list:
    out = []
    for r in rows(PAU_DIR / "pau_catalog.db", "SELECT * FROM exercicis ORDER BY materia, any, convocatoria, serie, numero"):
        e = PAU_DIR / r["enunciat_img"]
        s = PAU_DIR / r["solucio_img"] if r["solucio_img"] else None
        out.append({
            "tipus": "pau", "id": r["id"], "coleccio": COLECCIO[("PAU", r["materia"])], "materia": MATERIA[r["materia"]],
            "any": r["any"], "conv": CONV[r["convocatoria"]], "prova": f'Sèrie {r["serie"]}', "num": r["numero"],
            "punts": r["punts"], "bloc": r["bloc"], "tema": r["tema"], "text": r["enunciat_text"] or "",
            "sol_text": r["solucio_text"] or "", "img": webp(e, f'crops/pau/{r["id"]}_e.webp'),
            "sol_img": webp(s, f'crops/pau/{r["id"]}_s.webp') if s and s.exists() else None,
        })
    return out


def fitxes_cb() -> list:
    con = CB_DIR / "cb_catalog.db"
    acts = rows(con, "SELECT * FROM activitats ORDER BY prova, numero")
    items = rows(con, "SELECT * FROM items ORDER BY prova, numero, sub")
    per_act = defaultdict(list)
    for it in items:
        per_act[it["activitat_id"]].append(it)
    out = []
    for a in acts:
        its = per_act[a["id"]]
        i0 = its[0]
        ctx = []
        for c in [a["context_img"]] + [it["context_img"] for it in its]:
            if c and c not in ctx:
                ctx.append(c)
        groups, seen = [], {}
        for it in its:
            gid = it["pare"] or it["id"]
            if gid not in seen:
                seen[gid] = {"id": gid, "num": it["numero"], "punts": 0, "text": it["enunciat_text"] or "",
                             "img": webp(CB_DIR / it["enunciat_img"], "crops/cb/" + it["enunciat_img"].removeprefix("crops/").replace(".png", ".webp")),
                             "ctx": it["context_img"], "claus": []}
                groups.append(seen[gid])
            g = seen[gid]
            g["punts"] += it["punts"] or 0
            g["claus"].append({"id": it["id"], "sub": it["sub"], "clau": it["solucio_text"] or it["resposta"] or "", "tipus": it["tipus"]})
        for g in groups:
            g["ctx"] = "crops/cb/" + g["ctx"].removeprefix("crops/").replace(".png", ".webp") if g["ctx"] else None
        out.append({
            "tipus": "cb", "id": a["id"], "coleccio": COLECCIO[(i0["etapa"], i0["materia"])], "materia": MATERIA[i0["materia"]],
            "any": i0["any"], "conv": CONV[i0["convocatoria"]], "prova": a["prova"], "num": a["numero"],
            "titol": a["titol"], "descripcio": a["descripcio"], "bloc": i0["bloc"], "tema": i0["tema"],
            "text": a["context_text"] or "",
            "ctx": [webp(CB_DIR / c, "crops/cb/" + c.removeprefix("crops/").replace(".png", ".webp")) for c in ctx],
            "items": groups, "items_text": " ".join(g["text"] for g in groups),
            "punts": sum(g["punts"] for g in groups),
        })
    return out


def comprova() -> int:
    d = json.loads(OUT.read_text())
    f = d["fitxes"]
    errs = []
    ids = [x["id"] for x in f]
    if len(ids) != len(set(ids)):
        errs.append("ids duplicats")
    n_pau = sum(x["tipus"] == "pau" for x in f)
    n_act = sum(x["tipus"] == "cb" for x in f)
    n_it = sum(sum(len(g["claus"]) for g in x["items"]) for x in f if x["tipus"] == "cb")
    for k, v in (("pau", n_pau), ("cb_activitats", n_act), ("cb_items", n_it)):
        if v != RECOMPTES[k]:
            errs.append(f"{k}: {v} ≠ {RECOMPTES[k]}")
    imgs = []
    for x in f:
        if x["tipus"] == "pau":
            imgs += [x["img"], x["sol_img"]]
        else:
            imgs += x["ctx"] + [g["img"] for g in x["items"]]
    for i in imgs:
        if i and not (PUB / i).exists():
            errs.append(f"falta {i}")
    print(f"{n_pau} PAU · {n_act} activitats CB · {n_it} ítems CB · {len(set(i for i in imgs if i))} imatges · {len(errs)} errors")
    for e in errs[:10]:
        print("  ✗", e)
    return 1 if errs else 0


def main() -> int:
    if "--check" in sys.argv:
        return comprova()
    for cmd in (["scripts/pau", "check"], ["scripts/pau", "check", "--materia", "mat_ccss"], ["scripts/cb", "check"]):
        r = subprocess.run(cmd, cwd=WS, capture_output=True, text=True)
        if r.returncode:
            print(f"✗ {' '.join(cmd)} no passa:\n{r.stdout[-800:]}")
            return 1
    fitxes = fitxes_pau() + fitxes_cb()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    dim = {str(f.relative_to(PUB)): list(Image.open(f).size) for f in sorted((PUB / "crops").rglob("*.webp"))}  # evita salts de maquetació
    # el text de cerca (gran) va a part: la pàgina pinta les fitxes sense esperar-lo
    text = {f["id"]: [f.pop("text", ""), f.pop("sol_text", ""), f.pop("items_text", "")] for f in fitxes}
    for f in fitxes:
        for g in f.get("items", []):
            g.pop("text", None)
    (OUT.parent / "text.json").write_text(json.dumps(text, ensure_ascii=False, separators=(",", ":")))
    OUT.write_text(json.dumps({"fitxes": fitxes, "dim": dim}, ensure_ascii=False, separators=(",", ":")))
    print(f"index.json: {OUT.stat().st_size // 1024} KB · text.json: {(OUT.parent / 'text.json').stat().st_size // 1024} KB · crops: {sum(f.stat().st_size for f in (PUB / 'crops').rglob('*.webp')) // 2**20} MB")
    return comprova()


if __name__ == "__main__":
    sys.exit(main())
