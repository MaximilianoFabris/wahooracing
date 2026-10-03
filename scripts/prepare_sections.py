"""Replot documented R02 section coordinates; never modify engineering sources."""
from pathlib import Path
import csv,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
source=ROOT.parent/'_Wahoo_Engineering/01_Geometry_Analysis/H0_R02_Transverse_Sections.csv'
rows=list(csv.DictReader(source.open(encoding='utf-8-sig')))
out=ROOT/'public/assets'
for station in [25,50,75,90]:
 selected=[r for r in rows if float(r['section_percent'])==station and r['valid'].lower()=='true']
 # Equal 6.4 pixels/cm on both axes. Shared domains retain cross-section proportions.
 x=lambda v:240+v*6.4
 y=lambda v:206-v*6.4
 svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300" role="img" aria-labelledby="title desc"><title id="title">H0 R02 transverse section at {station}% station</title><desc id="desc">Actual sampled section coordinates. Horizontal Y, port positive, and vertical Z up, in centimetres. Equal axis scale. Station zero at stern, one hundred at bow. Geometric study, not a performance result.</desc>']
 svg.append(f'<text x="20" y="26" fill="#24b8ff" font-family="Segoe UI,sans-serif" font-size="20">H0 R02 / STATION {station}%</text>')
 for v in [0,10,20]:
  svg.append(f'<path d="M48,{y(v)}H432" stroke="#29343c" fill="none"/><text x="14" y="{y(v)+5}" fill="#abb6be" font-size="20" font-family="Segoe UI,sans-serif">{v}</text>')
 for v in [-30,-15,0,15,30]:svg.append(f'<text x="{x(v)}" y="251" text-anchor="middle" fill="#abb6be" font-size="20" font-family="Segoe UI,sans-serif">{v}</text>')
 svg.append(f'<path d="M240,65V233" stroke="#29343c"/><text x="14" y="55" fill="#abb6be" font-size="20" font-family="Segoe UI,sans-serif">Z (cm)</text><text x="240" y="284" fill="#abb6be" font-size="20" text-anchor="middle" font-family="Segoe UI,sans-serif">Y (cm) · + port</text>')
 for branch in sorted(set(r['branch'] for r in selected)):
  rr=sorted([r for r in selected if r['branch']==branch],key=lambda r:float(r['t']))
  pts=' '.join(f"{x(float(r['Y_cm'])):.3f},{y(float(r['Z_cm'])):.3f}" for r in rr)
  svg.append(f'<polyline points="{pts}" fill="none" stroke="#24b8ff" stroke-width="2"/>')
 svg.append('</svg>');(out/f'hull-section-{station}.svg').write_text(''.join(svg),encoding='utf-8')
(ROOT/'docs/section-graphics.json').write_text(json.dumps({'source':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'stations_percent':[25,50,75,90],'axes':'Y port-positive and Z up in cm; same 6.4 px/cm scale on both axes; all valid branch samples preserved in parameter order; no geometry alteration','source_rows':{str(s):sum(float(r['section_percent'])==s and r['valid'].lower()=='true' for r in rows) for s in [25,50,75,90]},'evidence':'R02 geometric section samples; not an acceptance test or hydrodynamic result'},indent=2))
print('Built four transparent section graphics from source coordinates.')
