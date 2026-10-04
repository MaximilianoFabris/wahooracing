"""Replot archived engineering data for the website; never run or edit the source studies."""
import csv, hashlib, json, sys
from pathlib import Path
sys.dont_write_bytecode = True
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import PolyCollection
ROOT=Path(__file__).resolve().parents[1]
ENG=ROOT.parent/'_Wahoo_Engineering'
G=ENG/'01_Geometry_Analysis'
C=ENG/'04_CFD_Results/H0-CFD-001/VALID_Postprocess'
OUT=ROOT/'public/assets/engineering'; OUT.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(ENG/'07_Scripts'))
from H0_CFD_001_vtp import read,field
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':12,'text.color':'#eef3f6','axes.labelcolor':'#abb6be','xtick.color':'#abb6be','ytick.color':'#abb6be','axes.edgecolor':'#415461','axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'path'})
provenance=[]
def rows(p):
 with p.open(encoding='utf-8-sig') as f: return list(csv.DictReader(f))
def canvas(figsize=(10,5)):
 f,a=plt.subplots(figsize=figsize,layout='constrained');f.patch.set_alpha(0);a.patch.set_alpha(0);return f,a
def save(f,name,sources):
 f.savefig(OUT/name,transparent=True,dpi=160);plt.close(f)
 provenance.append({'asset':'engineering/'+name,'sources':[{'file':str(p.relative_to(ENG)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sources],'treatment':'Replotted from source data; transparent background. No geometry change or solver execution.'})
# Preserve source polygons; the projection does not fit replacement geometry.
for surface,axes,depth,quantity,limits,extent,label in [
 ('hullPressure',(0,1),2,'p',(-3000,6000),(-.08,1.82,-.34,.34),'Total pressure p / Pa'),
 ('freeSurface',(0,1),2,None,(-.1,.1),(-.8,1.9,-.48,.48),'Water-surface elevation / m'),
 ('centerPlane',(0,2),1,'U',(0,8),(-.8,1.9,-.16,.25),'Velocity magnitude / m/s'),
 ('nearWake',(1,2),0,'U',(0,8),(-.48,.48,-.16,.25),'Wake-plane velocity / m/s')]:
 pth=C/'postProcessing/surfaceViews/0.95'/f'{surface}.vtp';m=read(pth);p=m['points'];faces=m['faces']
 v,kind=(p[:,2],'point') if quantity is None else field(m,quantity)
 if quantity=='U':v=np.linalg.norm(v,axis=1)
 cent=np.array([p[face].mean(axis=0) for face in faces]);vals=np.array([v[face].mean() for face in faces]) if kind=='point' else v
 ids=np.flatnonzero((cent[:,axes[0]]>=extent[0])&(cent[:,axes[0]]<=extent[1])&(cent[:,axes[1]]>=extent[2])&(cent[:,axes[1]]<=extent[3]))
 ids=ids[np.argsort(cent[ids,depth])]
 if surface=='hullPressure':ids=ids[::-1]
 f,a=canvas((11,5));coll=PolyCollection([p[faces[i]][:,axes] for i in ids],array=vals[ids],cmap='turbo',edgecolors='none',rasterized=True)
 coll.set_clim(*limits);a.add_collection(coll);a.set_xlim(extent[:2]);a.set_ylim(extent[2:]);a.set_aspect('equal')
 a.set_xlabel(('X forward' if axes[0]==0 else 'Y port')+' / m');a.set_ylabel(('Y port' if axes[1]==1 else 'Z up')+' / m')
 cb=f.colorbar(coll,ax=a,orientation='horizontal',pad=.2,shrink=.7,aspect=40);cb.set_label(label+' · fixed display range');cb.outline.set_visible(False)
 save(f,'cfd-'+surface+'.png',[pth])
p=G/'H0_R03_Full_Dry_Mass_CG.json';mass=json.loads(p.read_text(encoding='utf-8'));cases=mass['cases']
f,a=canvas();a.barh([c['case'] for c in cases],[c['dry_mass_kg'] for c in cases],color=['#24b8ff','#8cb6cc','#c6d2d9'],height=.45)
for i,c in enumerate(cases):a.text(c['dry_mass_kg']+.4,i,f"{c['dry_mass_kg']:.2f} kg",va='center')
a.set_xlim(0,max(c['dry_mass_kg'] for c in cases)*1.25);a.set_xlabel('Calculated dry mass / kg · excludes fuel and rider');a.set_ylabel('Source scenario');a.invert_yaxis();save(f,'dry-mass.svg',[p])
f,a=canvas((10,6));comps=cases[0]['components']
a.scatter([c['CG_Wahoo_m'][0]*100 for c in comps],range(len(comps)),s=[c['mass_kg']*50 for c in comps],color='#24b8ff',alpha=.85)
a.set_yticks(range(len(comps)),[c['name'] for c in comps]);a.invert_yaxis();a.axvline(cases[0]['CG_Wahoo_m'][0]*100,color='#eef3f6',ls='--',label='Combined case A CG');a.legend(frameon=False,labelcolor='#eef3f6');a.set_xlabel('X forward of hydrodynamic stern / cm · marker area follows mass');a.grid(axis='x',alpha=.15);save(f,'component-cg.svg',[p])
p=G/'H0_R03_Dry_Hydrostatics.csv';hydro=[r for r in rows(p) if r['Record']=='EQUILIBRIUM_ZERO']
f,a=canvas()
for density,color in [('998','#97a6b0'),('1025','#24b8ff')]:
 rr=[r for r in hydro if r['Density_kg_m3']==density];a.plot([r['Case'] for r in rr],[float(r['Pitch_bow_up_deg']) for r in rr],marker='o',color=color,label=density+' kg/m³')
a.axhline(0,color='#415461',lw=1);a.set_ylabel('Equilibrium pitch / degrees · positive bow-up');a.set_xlabel('Dry mass scenario · roll constrained to zero');a.legend(frameon=False,labelcolor='#eef3f6');save(f,'dry-trim.svg',[p])
p=G/'H0_R02_Transverse_Sections.csv';sections=rows(p);f,a=canvas()
for station,color in [(25,'#617b8d'),(50,'#24b8ff'),(75,'#b2ccd9'),(90,'#eef3f6')]:
 rr=[r for r in sections if float(r['section_percent'])==station and r['valid'].lower()=='true']
 for j,branch in enumerate(sorted(set(r['branch'] for r in rr))):
  ss=sorted([r for r in rr if r['branch']==branch],key=lambda r:float(r['t']))
  a.plot([float(r['Y_cm']) for r in ss],[float(r['Z_cm']) for r in ss],color=color,lw=1.6,label=f'{station}% station' if j==0 else None)
a.set_aspect('equal');a.set_xlabel('Y port / cm');a.set_ylabel('Z up / cm');a.legend(frameon=False,labelcolor='#eef3f6',ncol=2);save(f,'hull-sections.svg',[p])
p=C/'Force_Window_Statistics.csv';force=rows(p);f,axs=plt.subplots(3,1,figsize=(10,9),layout='constrained',sharex=True);f.patch.set_alpha(0)
for a,q,label in zip(axs,['drag_N','vertical_N','bow_up_pitch_Nm'],['Drag / N','Vertical force / N','Bow-up pitch moment / N·m']):
 a.patch.set_alpha(0);rr=[r for r in force if r['quantity']==q and abs(float(r['end_s'])-float(r['start_s'])-.05)<1e-6];assert len(rr)>=6
 a.errorbar([(float(r['start_s'])+float(r['end_s']))/2 for r in rr],[float(r['mean']) for r in rr],xerr=.025,fmt='o',color='#24b8ff',capsize=3);a.set_ylabel(label);a.grid(axis='y',alpha=.15)
axs[-1].set_xlabel('Time / s · horizontal bars show each averaging interval');save(f,'cfd-force-windows.svg',[p])
p=G/'H0_R03_CG_Sensitivity.csv';sweep=[r for r in rows(p) if r['Record']=='CG_SWEEP_ROLL_ZERO'];f,a=canvas()
for density,color in [('998','#97a6b0'),('1025','#24b8ff')]:
 rr=sorted([r for r in sweep if r['Density_kg_m3']==density],key=lambda r:float(r['X_CG_percent_L']));assert rr
 a.plot([float(r['X_CG_percent_L']) for r in rr],[float(r['Pitch_bow_up_deg']) for r in rr],color=color,marker='o',label=density+' kg/m³')
a.axhline(0,color='#415461',lw=1);a.set_xlabel('Hypothetical longitudinal CG / % hydrodynamic length');a.set_ylabel('Static pitch / degrees · positive bow-up');a.legend(frameon=False,labelcolor='#eef3f6');save(f,'cg-trim-sensitivity.svg',[p])
p=G/'H0_R02_Arc_Length_Curvature_Samples.csv';curve=[r for r in rows(p) if abs(float(r['halfbeam_percent']))<1e-6 and abs(float(r['spacing_mm'])-.125)<1e-6];assert curve
f,a=canvas()
for piece in sorted(set(r['piece'] for r in curve)):
 rr=sorted([r for r in curve if r['piece']==piece],key=lambda r:float(r['s_mm']))
 a.plot([float(r['s_mm']) for r in rr],[float(r['signed_K_per_mm']) for r in rr],color='#24b8ff',lw=1)
a.set_xlabel('Arc length from this path’s aft end / mm');a.set_ylabel('Signed planar curvature / mm⁻¹');a.grid(axis='y',alpha=.15);save(f,'centreline-curvature.svg',[p])
(ROOT/'docs/engineering-gallery-sources.json').write_text(json.dumps(provenance,indent=2),encoding='utf-8')
print(f'Generated {len(provenance)} source-backed graphics.')
