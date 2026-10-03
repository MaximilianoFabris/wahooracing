from pathlib import Path
from PIL import Image
import csv,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
BOARD=ROOT.parent.parent
OUT=ROOT/'public/assets';OUT.mkdir(parents=True,exist_ok=True)
assets=[
 ('logo.png',BOARD.parent/'Wahoo_Gray.png',360),
 ('hull-hero.webp',ROOT.parent/'design-approval/hull-hero.png',1600),
 ('hull-bottom.webp',ROOT.parent/'design-approval/hull-bottom.png',1600),
 ('archive-exterior.webp',BOARD/'perspective 01.png',1400),
 ('archive-assembly.webp',BOARD/'Wahoo_02_transparent background.png',1600),
 ('archive-water.webp',BOARD/'Wahoo_01_transparent background.png',1000),
 ('archive-sketch.webp',BOARD/'blueprint01.jpg',1200),
 ('archive-deck.webp',BOARD/'Wahoo_01_transparent background_02.png',1400),
 ('archive-grab-handle.webp',BOARD/'grabhandle.png',1300),
 ('archive-hand-control.webp',BOARD/'ViewCapture20220421_043009.png',1400),
]
records=[]
for name,src,size in assets:
 im=Image.open(src);im.thumbnail((size,size),Image.Resampling.LANCZOS)
 im.save(OUT/name,**({'optimize':True} if name.endswith('.png') else {'quality':88,'method':6}))
 records.append({'asset':name,'source':str(src),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'treatment':'Resized and encoded; alpha preserved. Original unchanged.'})
source=ROOT.parent/'_Wahoo_Engineering/01_Geometry_Analysis/H0_R03_Displacement_Curve.csv'
rows=list(csv.DictReader(source.open(encoding='utf-8-sig')))
data=[{'density':int(r['rho_kg_m3']),'mass':float(r['requested_mass_kg']),'immersion':float(r['level_immersion_m']) if r['achievable']=='true' else None,'achievable':r['achievable']=='true'} for r in rows]
(ROOT/'content/displacement.json').write_text(json.dumps(data,indent=2))
(ROOT/'docs/asset-sources.json').write_text(json.dumps(records,indent=2))
print('Prepared',len(records),'assets and',len(data),'source data points.')
