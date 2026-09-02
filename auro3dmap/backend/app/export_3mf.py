"""Multi-object colored 3MF (ZIP + 3dmodel.model)."""

from __future__ import annotations

import zipfile
from io import BytesIO
from xml.sax.saxutils import escape

import numpy as np

from .mesh_build import MeshPart


def _hex_color(rgba: tuple[int, int, int, int]) -> str:
    r, g, b, a = rgba
    return f"#{r:02X}{g:02X}{b:02X}{a:02X}"


def parts_to_3mf(parts: list[MeshPart]) -> bytes:
    resources: list[str] = []
    items: list[str] = []

    obj_index = 0
    for part in parts:
        mesh = part.mesh
        if mesh is None or len(mesh.faces) == 0:
            continue
        verts = np.asarray(mesh.vertices, dtype=np.float64)
        faces = np.asarray(mesh.faces, dtype=np.int64)
        if not np.all(np.isfinite(verts)):
            finite_rows = np.isfinite(verts).all(axis=1)
            good = finite_rows[faces].all(axis=1)
            faces = faces[good]
            if faces.size == 0:
                continue
        mat_id = obj_index + 1
        obj_id = 100 + obj_index
        obj_index += 1
        hexc = _hex_color(part.color)

        v_xml = "\n".join(
            f'          <vertex x="{v[0]:.4f}" y="{v[1]:.4f}" z="{v[2]:.4f}" />'
            for v in verts
        )
        t_xml = "\n".join(
            # 3MF Core: p1, "basematerials" bloğu içindeki 1 tabanlı indeks —
            # her blokta tek <base> var, dolayısıyla her zaman "1" olmalı.
            f'          <triangle v1="{int(f[0])}" v2="{int(f[1])}" v3="{int(f[2])}" pid="{mat_id}" p1="1" />'
            for f in faces
        )
        name = escape(part.name)
        resources.append(
            f'      <basematerials id="{mat_id}">\n'
            f'        <base name="{name}" displaycolor="{hexc}" />\n'
            f"      </basematerials>"
        )
        resources.append(
            f'      <object id="{obj_id}" name="{name}" type="model">\n'
            f"        <mesh>\n"
            f"          <vertices>\n{v_xml}\n          </vertices>\n"
            f"          <triangles>\n{t_xml}\n          </triangles>\n"
            f"        </mesh>\n"
            f"      </object>"
        )
        items.append(f'      <item objectid="{obj_id}" />')

    model_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="tr" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <metadata name="Application">Auro3DMap</metadata>
  <metadata name="Title">Auro3DMap model</metadata>
  <resources>
{chr(10).join(resources)}
  </resources>
  <build>
{chr(10).join(items)}
  </build>
</model>
"""

    buf = BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(
            "[Content_Types].xml",
            """<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
</Types>""",
        )
        zf.writestr(
            "_rels/.rels",
            """<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>""",
        )
        zf.writestr("3D/3dmodel.model", model_xml)
    return buf.getvalue()
