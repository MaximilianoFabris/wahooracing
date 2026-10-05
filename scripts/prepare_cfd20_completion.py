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
C=ENG/'04_CFD_Results/H0-CFD-001/VALID_Extended_Postprocess'
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
for checkpoint in ['1.2','1.35','1.5','1.579983709']:
 for surface,axes,depth,quantity,limits,extent,label in [
  ('hullPressure',(0,1),2,'p',(-3000,6000),(-.08,1.82,-.34,.34),'Total pressure p / Pa'),
  ('freeSurface',(0,1),2,None,(-.1,.1),(-.8,1.9,-.48,.48),'Water-surface elevation / m'),
  ('centerPlane',(0,2),1,'U',(0,8),(-.8,1.9,-.16,.25),'Velocity magnitude / m/s'),
  ('waterline',(0,1),2,'U',(0,8),(-.8,1.9,-.48,.48),'Waterline-plane velocity / m/s'),
  ('nearWake',(1,2),0,'U',(0,8),(-.48,.48,-.16,.25),'Wake-plane velocity / m/s')]:
  if checkpoint!='1.579983709' and surface!='freeSurface':continue
  pth=C/'postProcessing/surfaceViews'/checkpoint/f'{surface}.vtp';m=read(pth);p=m['points'];faces=m['faces']
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
  save(f,'cfd20-'+surface+'-'+checkpoint.replace('.','-')+'.png',[pth])

p=C/'Combined_Histories.npz';data=np.load(p);force=data['force'];moment=data['moment'];assert len(force)==24342 and np.all(np.diff(force[:,0])>0)
f,axs=plt.subplots(3,1,figsize=(11,10),layout='constrained',sharex=True);f.patch.set_alpha(0)
for a,y,label in zip(axs,[-force[:,1],force[:,3],-moment[:,2]],['Drag / N','Vertical force / N','Bow-up pitch moment / N·m']):
 a.patch.set_alpha(0);a.plot(force[:,0],y,color='#24b8ff',lw=.65);a.axvline(.95,color='#e4b16b',ls='--',lw=1);a.set_ylabel(label);a.grid(axis='y',alpha=.12)
axs[0].text(.97,.96,'Extension begins',transform=axs[0].get_xaxis_transform(),va='top',color='#e4b16b')
axs[-1].set_xlabel('Actual simulated time / s · original samples, no smoothing');save(f,'cfd20-force-history.png',[p])
p=C/'Statistics.json';stats=json.loads(p.read_text());f,axs=plt.subplots(3,1,figsize=(11,9),layout='constrained',sharex=True);f.patch.set_alpha(0)
for a,q,label in zip(axs,['drag_N','vertical_N','bow_up_pitch_Nm'],['Mean drag / N','Mean vertical force / N','Mean bow-up moment / N·m']):
 a.patch.set_alpha(0);rr=[r for r in stats['statistics'] if r['quantity']==q and r['start_s'] in [.95,1.1,1.25,1.4] and abs(r['end_s']-stats['last_time_s'])<1e-8]
 assert len(rr)==4
 a.plot([r['start_s'] for r in rr],[r['mean'] for r in rr],marker='o',color='#24b8ff');a.set_ylabel(label);a.grid(axis='y',alpha=.12)
axs[-1].set_xticks([.95,1.1,1.25,1.4]);axs[-1].set_xlabel('Averaging-window start / s · all windows end at 1.579983709 s');save(f,'cfd20-nested-means.svg',[p])
import shutil
for original,dest in [('Valid_Force_Histories.png','cfd20-source-forces.png'),('Field_Views_Contact_Sheet.png','cfd20-source-sequence.png')]+[(f'Valid_Fields_{t}.png','cfd20-source-fields-'+t.replace('.','-')+'.png') for t in ['1.2','1.35','1.5','1.579983709']]:
 src=C/original;shutil.copyfile(src,OUT/dest);provenance.append({'asset':'engineering/'+dest,'sources':[{'file':str(src.relative_to(ENG)),'sha256':hashlib.sha256(src.read_bytes()).hexdigest()}],'treatment':'Original rendered study sheet copied unchanged.'})
(ROOT/'docs/cfd20-completion-sources.json').write_text(json.dumps(provenance,indent=2),encoding='utf-8');print('Prepared',len(provenance),'completed-run graphics and sheets.')
