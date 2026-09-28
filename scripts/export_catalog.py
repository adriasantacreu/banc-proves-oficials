#!/mnt/data/workspace/.venv/bin/python
"""Exporta el catàleg PAU (pau_catalog.db) + CCBB (gencat-cb-forms) a public/data/proves.json i crops WebP 200 DPI.

Ús:
    /mnt/data/workspace/.venv/bin/python scripts/export_catalog.py [opció]
    --check   Només valida el proves.json existent (camps, enums, imatges presents)

Reutilitza el codi de pau-catalog (crops 200 DPI des de Pautec.pdf) i gencat-cb-forms
(segmenter + answers_registry). Per als PDF de la Generalitat amb el CMap de font
trencat (ex: 2ESO CTE 2025), on la detecció vectorial no troba ítems, fa un
fallback amb OCR tesseract (cat) sobre el render de la pàgina.
"""

import json
import os
import re
import sqlite3
import subprocess
import sys
import tempfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = PROJECT_ROOT.parents[1]
sys.path.insert(0, str(WORKSPACE / "projects/pau-catalog/src"))
sys.path.insert(0, str(WORKSPACE / "projects/gencat-cb-forms/src"))

import cv2  # noqa: E402
import pymupdf  # noqa: E402
from pau_catalog.generator import ensure_enunciat_crop, ensure_solution_crop  # noqa: E402
from pau_catalog.db import DEFAULT_DB_PATH  # noqa: E402
import answers_registry as ar  # noqa: E402
from segmenter import segment_pdf, autocrop_tight, pixmap_to_cv2  # noqa: E402

PUBLIC = PROJECT_ROOT / "public"
CROPS = PUBLIC / "crops"
CACHE_CB = PROJECT_ROOT / ".cache/cb"
DB_PAU = Path(DEFAULT_DB_PATH)
PDF_PAUTEC = WORKSPACE / "docencia/materials/2BAT/matematiques/recursos/Pautec.pdf"

CONV_PAU = {"ordinaria": ("j", "juny"), "extraordinaria": ("s", "setembre")}
DPI_OCR = 150
PT_PER_PX = 72.0 / DPI_OCR
MARGE_ESQ_PT = 88.0  # regla geomètrica Gencat: els ítems comencen a x0 <= 88 pt
MAX_ITEM_CB = 42  # cap prova CB no passa d'aquest número d'ítem


def pare_i_visual(num) -> tuple[int | None, str]:
    """Tradueix el num d'element del registre a (ítem pare per al crop, número visual).

    - int 21 o '21' → (21, '21')  ítem normal
    - '21_1'        → (21, '21.1')  sub-ítem amb guió baix
    - '61', '211'   → (6, '6.1'), (21, '21.1')  sub-ítems codificats concatenats (CTE antics)
    """
    s = str(num)
    if isinstance(num, int):
        if num <= MAX_ITEM_CB:
            return num, s
        return int(s[:-1]), f"{s[:-1]}.{s[-1]}"  # 61 → 6.1
    if s.isdigit() and int(s) <= MAX_ITEM_CB:
        return int(s), s
    if s.isdigit():  # '61' → 6.1
        return int(s[:-1]), f"{s[:-1]}.{s[-1]}"
    if "_" in s:
        p, sub = s.split("_", 1)
        return int(p), f"{p}.{sub}"
    return None, s


def webp_lossless(png: Path, dest: Path) -> str:
    """PNG → WebP sense pèrdua (més petit que PNG en captures de text)."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        img = Image.open(png)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        img.save(dest, "WEBP", lossless=True, method=6)
    return dest.relative_to(PROJECT_ROOT / "public").as_posix()


# ---------------------------------------------------------------- PAU


def export_pau() -> list[dict]:
    con = sqlite3.connect(DB_PAU)
    con.row_factory = sqlite3.Row
    rows = [dict(r) for r in con.execute("SELECT * FROM exercicis ORDER BY any DESC, serie, numero")]
    con.close()

    doc = pymupdf.open(str(PDF_PAUTEC)) if PDF_PAUTEC.exists() else None
    if doc is None:
        sys.exit(f"ERROR: no trobo el PDF font {PDF_PAUTEC}")

    out = []
    for row in rows:
        cid = row["id"]  # ex: PAU_2025_JUN_S1_Q5
        conv_abrev, conv_nom = CONV_PAU[row["convocatoria"]]
        ex_id = f"pau_mat2_{row['any']}_{conv_abrev}_s{row['serie']}_p{row['numero']}"
        base = CROPS / "pau" / ex_id
        en_img = sol_img = None

        crop_en = ensure_enunciat_crop(row, doc)
        if crop_en and Path(crop_en).exists():
            en_img = webp_lossless(Path(crop_en), base.with_name(f"{ex_id}_en.webp"))
        crop_sol = ensure_solution_crop(row, doc)
        if crop_sol and Path(crop_sol).exists():
            sol_img = webp_lossless(Path(crop_sol), base.with_name(f"{ex_id}_sol.webp"))

        out.append({
            "id": ex_id,
            "etapa": "pau_bat",
            "materia": "mat2",
            "any": row["any"],
            "convocatoria": conv_nom,
            "serie_o_model": row["serie"],
            "numero_pregunta": row["numero"],
            "enunciat_text": row["enunciat_text"] or "",
            "solucio_text": row["solucio_text"] or None,
            "puntuacio_max": row["punts"],
            "enunciat_img": en_img,
            "solucio_img": sol_img,
            "bloc": row["bloc"],
            "tema": row["tema"],
            "origen": "PAU Catalunya · compendi Pautec",
        })
    print(f"  PAU: {len(out)} exercicis")
    return out


# ---------------------------------------------------------------- OCR de rescat (PDF amb CMap trencat)


def _linies_ocr(png_bytes: bytes) -> list[tuple[float, float, str]]:
    """OCR d'una pàgina (tesseract cat, TSV) → línies [(x0_pt, y0_pt, text)] en punts PDF."""
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        f.write(png_bytes)
        ruta = f.name
    try:
        out = subprocess.run(
            ["tesseract", ruta, "stdout", "--psm", "3", "tsv", "-l", "cat"],
            capture_output=True, text=True, timeout=60,
        )
    finally:
        os.unlink(ruta)
    linies: dict[tuple[int, int], list] = {}
    for fila in out.stdout.splitlines()[1:]:
        c = fila.split("\t")
        if len(c) < 12 or not c[11].strip() or float(c[10]) < 0:
            continue
        clau = (int(c[2]), int(c[4]))
        linies.setdefault(clau, []).append((float(c[6]), float(c[7]), c[11]))
    res = []
    for paraules in linies.values():
        paraules.sort(key=lambda p: p[0])
        res.append((paraules[0][0] * PT_PER_PX, paraules[0][1] * PT_PER_PX,
                    " ".join(p[2] for p in paraules)))
    return sorted(res, key=lambda t: t[1])


def _render_crop(page, mat, rect, dest: Path) -> None:
    pix = page.get_pixmap(matrix=mat, clip=rect)
    cv2.imwrite(str(dest), autocrop_tight(pixmap_to_cv2(pix), pad=6))


def completa_amb_ocr(cache: Path, pdf: Path, esperats: set[int]) -> int:
    """Omple item_{n}.png i context_actN_intro.png que la detecció vectorial no va trobar."""
    faltants = {n for n in esperats if not (cache / f"item_{n}.png").exists()}
    if not faltants:
        return 0
    fets = 0
    doc = pymupdf.open(str(pdf))
    mat = pymupdf.Matrix(2, 2)  # 200/72 ≈ 2,78 → rect en pt, pixmap a 200 DPI
    mat = pymupdf.Matrix(200 / 72.0, 200 / 72.0)
    for pno in range(len(doc)):
        if not faltants:
            break
        page = doc[pno]
        pix = page.get_pixmap(dpi=DPI_OCR)
        ok, buf = cv2.imencode(".png", pixmap_to_cv2(pix))
        linies = _linies_ocr(buf.tobytes())

        act = None
        for x0, y0, txt in linies:
            m = re.search(r"ACTIVITAT\s+(\d+)", txt, re.I)
            if m and x0 <= MARGE_ESQ_PT + 5 and not (cache / f"context_act{m.group(1)}_intro.png").exists():
                act = (m.group(1), y0)

        inicis = []
        for x0, y0, txt in linies:
            m = re.match(r"^(\d{1,2})[\.\)]?", txt)
            if m and int(m.group(1)) in faltants and x0 <= MARGE_ESQ_PT + 2 and y0 > 85:
                inicis.append((int(m.group(1)), y0))
        inicis.sort(key=lambda t: t[1])
        if not inicis:
            continue

        if act and inicis[0][1] - act[1] > 35:
            rect = pymupdf.Rect(70, max(90, act[1] - 5), 530, inicis[0][1] - 6)
            _render_crop(page, mat, rect, cache / f"context_act{act[0]}_intro.png")
            fets += 1

        for i, (num, y0) in enumerate(inicis):
            crop_y0 = max(90, y0 - 6)
            crop_y1 = inicis[i + 1][1] - 6 if i + 1 < len(inicis) else 785
            if crop_y1 - crop_y0 < 20:
                continue
            _render_crop(page, mat, pymupdf.Rect(70, crop_y0, 530, crop_y1), cache / f"item_{num}.png")
            fets += 1
            faltants.discard(num)
    return fets


# ---------------------------------------------------------------- CCBB


def export_cb() -> list[dict]:
    out = []
    claus = sorted(ar.STRUCTURES.keys(), key=lambda k: (k[0], k[1], -k[2]))
    for curs, materia, any_ in claus:
        st = ar.STRUCTURES[(curs, materia, any_)]
        pdf = WORKSPACE / st["pdf_path"]
        cache = CACHE_CB / f"{curs}_{materia}_{any_}"
        if not pdf.exists():
            print(f"  !! Falta PDF {pdf}, es salta {curs} {materia} {any_}")
            continue
        cache.mkdir(parents=True, exist_ok=True)
        if not any(cache.iterdir()):
            segment_pdf(pdf, cache, dpi=200)

        # Ítems esperats (pare de cada num) i completar amb OCR si cal
        esperats = {p for el in st["elements"] if el["kind"] in ("item", "open_item")
                    for p in [pare_i_visual(el["num"])[0]] if p is not None}
        n_ocr = completa_amb_ocr(cache, pdf, esperats)
        if n_ocr:
            print(f"  · OCR de rescat {curs}_{materia}_{any_}: {n_ocr} crops")

        etapa = "cb_4eso" if curs == "4ESO" else "cb_2eso"
        mat_id = "cb_mat" if materia == "MAT" else "cb_cientifico_tec"
        mat_abrev = "m" if materia == "MAT" else "ct"
        resposta = ar.ANSWERS[(curs, materia, any_)]

        seccio, ctx_img = "", None
        for el in st["elements"]:
            kind = el["kind"]
            if kind == "section":
                seccio, ctx_img = f"{el['title']}. {el['desc']}", None
            elif kind == "image":
                fitxer = el.get("file", "")
                src = cache / fitxer
                dest = CROPS / "cb" / f"cb_{curs.lower()}_{any_}_{mat_abrev}_ctx_{Path(fitxer).stem}.webp"
                ctx_img = webp_lossless(src, dest) if src.exists() else None
            elif kind in ("item", "open_item"):
                num = el["num"]
                pare, visual = pare_i_visual(num)
                src = cache / f"item_{pare}.png" if pare else None
                ex_id = f"cb_{curs.lower()}_{any_}_{mat_abrev}_p{visual.replace('.', '_')}"
                en_img = webp_lossless(src, CROPS / "cb" / f"{ex_id}_en.webp") if src and src.exists() else None
                etiqueta = el.get("label") or el.get("desc") or ""
                text_cerca = " · ".join(filter(None, [seccio, etiqueta]))
                out.append({
                    "id": ex_id,
                    "etapa": etapa,
                    "materia": mat_id,
                    "any": any_,
                    "convocatoria": "diagnostica",
                    "serie_o_model": None,
                    "numero_pregunta": visual,
                    "enunciat_text": text_cerca,
                    "solucio_text": resposta.get(num),
                    "puntuacio_max": 1.0,
                    "enunciat_img": en_img,
                    "solucio_img": None,
                    "context_text": seccio,
                    "context_img": ctx_img,
                    "origen": st["title"],
                })
    print(f"  CCBB: {len(out)} ítems")
    return out


# ---------------------------------------------------------------- Validació (T010)

CAMPS = ["id", "etapa", "materia", "any", "convocatoria", "serie_o_model", "numero_pregunta",
         "enunciat_text", "solucio_text", "puntuacio_max", "enunciat_img", "solucio_img"]
ENUMS = {"etapa": {"pau_bat", "cb_4eso", "cb_2eso"},
         "materia": {"mat2", "mat_socials", "cb_mat", "cb_cientifico_tec"},
         "convocatoria": {"juny", "setembre", "diagnostica"}}


def valida(dades: dict) -> list[str]:
    errs = []
    ids = set()
    for ex in dades["exercicis"]:
        for camp in CAMPS:
            if camp not in ex:
                errs.append(f"{ex.get('id', '?')}: falta el camp {camp}")
        for camp, permesos in ENUMS.items():
            if ex.get(camp) not in permesos:
                errs.append(f"{ex.get('id', '?')}: {camp}={ex.get(camp)!r} no vàlid")
        if ex["id"] in ids:
            errs.append(f"id duplicat: {ex['id']}")
        ids.add(ex["id"])
        for camp_img in ("enunciat_img", "solucio_img", "context_img"):
            if ex.get(camp_img) and not (PUBLIC / ex[camp_img]).exists():
                errs.append(f"{ex['id']}: imatge absent {ex[camp_img]}")
    return errs


def main() -> None:
    if "--check" in sys.argv:
        dades = json.loads((PUBLIC / "data/proves.json").read_text())
        errs = valida(dades)
        n = len(dades["exercicis"])
        print(f"proves.json: {n} exercicis · {len(errs)} errors")
        for e in errs[:20]:
            print(" -", e)
        sys.exit(1 if errs else 0)

    print("Exportant PAU…")
    pau = export_pau()
    print("Exportant CCBB…")
    cb = export_cb()

    dades = {
        "generat_el": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "exercicis": pau + cb,
    }
    dest = PUBLIC / "data/proves.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(dades, ensure_ascii=False, separators=(",", ":")))

    errs = valida(dades)
    mides = sum(f.stat().st_size for f in CROPS.rglob("*.webp")) / 1e6
    comptes = dict(Counter(e["etapa"] for e in dades["exercicis"]))
    print(f"proves.json: {len(pau) + len(cb)} exercicis ({comptes})")
    print(f"crops WebP: {mides:.1f} MB · errors validació: {len(errs)}")
    for e in errs[:20]:
        print(" -", e)
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
