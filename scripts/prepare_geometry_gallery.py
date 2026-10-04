"""Website-only plots from reviewed geometry records. Sources remain read-only."""
import csv, json, hashlib, shutil
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
R=Path(__file__).resolve().parents[1]
G=R.parent/'_Wahoo_Engineering/01_Geometry_Analysis'
O=R/'public/assets/geometry';O.mkdir(exist_ok=True,parents=True)
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'text.color':'#eef3f6','axes.labelcolor':'#abb6be','xtick.color':'#abb6be','ytick.color':'#abb6be','axes.edgecolor':'#415461','axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'path'})
records=[]
def rows(name):
 with (G/name).open(encoding='utf-8-sig') as f:return list(csv.DictReader(f))
def fig(n=1,size=(11,6)):
 f,axs=plt.subplots(n,1,figsize=size,layout='constrained',squeeze=False)
 f.patch.set_alpha(0)
 for a in axs.flat:a.patch.set_alpha(0)
 return f,list(axs.flat)
def source(name,files,treatment):
 records.append({'asset':'geometry/'+name,'sources':[{'file':x,'sha256':hashlib.sha256((G/x).read_bytes()).hexdigest()} for x in files],'treatment':treatment})
def save(f,name,files):
 f.savefig(O/name,dpi=170,transparent=True,bbox_inches="tight",pad_inches=.12);plt.close(f);source(name,files,'Replotted original numerical samples; no fitted geometry or solver execution.')
def copy(name,dest):
 shutil.copyfile(G/name,O/dest);source(dest,[name],'Unchanged original rendered study sheet; available through a full-size source link.')

arcfile='H0_R02_Arc_Length_Curvature_Samples.csv';arc=rows(arcfile)
palette=['#d59d61','#aa92db','#74d4e8','#eef3f6']
for hb in [-90,-75,-50,-25,0,25,50,75,90]:
 code=('S' if hb<0 else 'P')+str(abs(hb)) if hb else 'C00'
 f,aa=fig(3,(11,10)); subset=[r for r in arc if float(r['halfbeam_percent'])==hb]
 for h,color in zip([1,.5,.25,.125],palette):
  rr=[r for r in subset if float(r['spacing_mm'])==h]
  for j,piece in enumerate(sorted(set(r['piece'] for r in rr))):
   ss=sorted([r for r in rr if r['piece']==piece],key=lambda r:float(r['s_mm']))
   x=[float(r['s_mm']) for r in ss]
   for a,key,factor in zip(aa,['Z_cm','signed_K_per_mm','quality_dK_ds_per_mm2'],[10,1,1]):
    y=[float(r[key])*factor if r[key] else np.nan for r in ss]
    a.plot(x,y,color=color,lw=1,label=f'{h:g} mm' if j==0 else None)
 aa[0].set_title(('Centreline' if hb==0 else ('Port' if hb>0 else 'Starboard')+f' {abs(hb)}% half-beam')+' · four sampling intervals',loc='left')
 aa[0].legend(frameon=False,labelcolor='#eef3f6',ncol=4)
 for a,label in zip(aa,['Height Z / mm','Signed curvature / mm⁻¹','Curvature rate / mm⁻²']):
  a.set_ylabel(label);a.set_xlabel('True arc length from this path’s aft end / mm');a.grid(alpha=.12)
 aa[1].set_yscale('symlog',linthresh=1e-5);aa[2].set_yscale('symlog',linthresh=1e-6)
 save(f,'arc-'+code+'.png',[arcfile])
 copy('H0_R02_Arc_Length_Analysis_'+code+'.png','source-arc-'+code+'.png')

cf='H0_R02_Arc_Length_Convergence.csv';conv=rows(cf);good=[r for r in conv if r['converged']=='True'];assert len(good)==6
f,aa=fig(size=(11,6));a=aa[0]
for r in good:
 peaks=json.loads(r['density_peaks']);base=peaks[-1]['magnitude_per_mm2']
 a.plot([p['spacing_mm'] for p in peaks],[100*(p['magnitude_per_mm2']/base-1) for p in peaks],marker='o',label=r['id'])
a.set_xscale('log',base=2);a.invert_xaxis();a.set_xticks([1,.5,.25,.125],['1','0.5','0.25','0.125']);a.set_xlabel('Sampling interval / mm · refinement →');a.set_ylabel('Magnitude difference from finest sample / %');a.legend(frameon=False,labelcolor='#eef3f6',ncol=3);a.grid(alpha=.12);save(f,'arc-convergence.svg',[cf])

vf='H0_R02_SubD_vs_NURBS_Deviation_Samples.csv';validation=rows(vf)
xyz=np.array([[float(r['wahoo_'+k+'_cm']) for k in 'xyz'] for r in validation]);deviation=np.array([float(r['distance_mm']) for r in validation])
rf='H0_R01_Verification_Assets/capture_data.json';ref=json.loads((G/rf).read_text());frame=ref['reference'];origin=np.array(frame['origin_world']);axes=np.array([frame['axes_world'][k] for k in ['x_forward','y_port','z_up']]);points={k:axes@(np.array(v)-origin) for k,v in ref['points_world'].items()}
for name,ij in [('top',(0,1)),('side',(0,2)),('end',(1,2))]:
 f,aa=fig(size=(11,6));a=aa[0]
 a.scatter(xyz[:,ij[0]],xyz[:,ij[1]],s=.4,color='#658393',alpha=.4,rasterized=True)
 for k in ['STERN','BOW','PORT widest','STARBOARD widest']:
  pt=points[k];a.scatter(pt[ij[0]],pt[ij[1]],s=24,color='#24b8ff');a.annotate(k,(pt[ij[0]],pt[ij[1]]),xytext=(6,10 if k!='STARBOARD widest' else -18),textcoords='offset points',fontsize=9)
 a.set_aspect('equal');a.margins(.12);a.set_xlabel(['X forward / cm','Y port / cm','Z up / cm'][ij[0]]);a.set_ylabel(['X forward / cm','Y port / cm','Z up / cm'][ij[1]]);a.set_title('Recorded native surface samples + R01 reference points',loc='left');save(f,'reference-'+name+'.png',[vf,rf])
f,aa=fig(size=(11,6));a=aa[0]
sc=a.scatter(xyz[:,0],xyz[:,1],c=deviation*1000,s=2,cmap='viridis',vmin=0,vmax=deviation.max()*1000,rasterized=True)
a.set_aspect('equal');a.set_xlabel('R01 X forward / cm');a.set_ylabel('Y port / cm');f.colorbar(sc,ax=a,orientation='horizontal',shrink=.7,pad=.16,label='Native sample to derived Brep distance / micrometres');save(f,'conversion-deviation.png',[vf])

tf='H0_R02_Transverse_Sections.csv';trans=rows(tf)
mf='H0_R02_Feature_Intent_Matrix.csv';features=rows(mf)
for name,rs,keys in [('feature-map',features,['X_cm','Y_cm']),('converged-map',good,None)]:
 f,aa=fig(size=(11,6));a=aa[0]
 a.scatter([float(r['X_cm']) for r in trans if r['valid'].lower()=='true'],[float(r['Y_cm']) for r in trans if r['valid'].lower()=='true'],s=.3,color='#617b8d',alpha=.3,rasterized=True)
 for i,r in enumerate(rs):
  pt=[float(r[k]) for k in keys] if keys else json.loads(r['local_cm'])[:2]
  label=r['Region'] if keys else r['id'];color='#e7b670' if label in ['R5','R9'] else '#24b8ff'
  a.scatter(*pt,s=28,color=color);offset={'R6':(-45,-35),'R7':(16,16)}.get(label,(5,10 if i%2 else -16));a.annotate(label,pt,xytext=offset,textcoords='offset points',color=color,arrowprops={'arrowstyle':'-','color':color,'lw':.6})
 a.set_aspect('equal');a.margins(.08);a.set_xlabel('R02 X forward / cm');a.set_ylabel('Y port / cm');save(f,name+'.png',[tf,mf if keys else cf])

tailfile='H0_R02_Tail_Transverse_Sections.csv';tail=[r for r in rows(tailfile) if r["percent_from_physical_bow"]];f,aa=fig(size=(11,6));a=aa[0]
stations=sorted(set(float(r['percent_from_physical_bow']) for r in tail))
for station,color in zip(stations,plt.cm.cool(np.linspace(.1,.9,len(stations)))):
 rr=[r for r in tail if float(r['percent_from_physical_bow'])==station]
 for j,branch in enumerate(sorted(set(r['branch'] for r in rr))):
  ss=sorted([r for r in rr if r['branch']==branch],key=lambda r:float(r['curve_parameter']))
  a.plot([float(r['y_cm']) for r in ss],[float(r['z_cm']) for r in ss],lw=1,color=color,label=f'{station:g}%' if j==0 else None)
a.set_aspect('equal');a.set_xlabel('Y port / cm');a.set_ylabel('Z up / cm');a.legend(title='From physical bow toward stern',frameon=False,labelcolor='#eef3f6',ncol=4);save(f,'tail-sections.svg',[tailfile])
rockfile='H0_R02_Tail_Rocker.csv';rock=rows(rockfile);f,aa=fig(size=(11,6));a=aa[0]
for hb,color in zip(sorted(set(float(r['halfbeam_percent']) for r in rock)),plt.cm.cool(np.linspace(.1,.9,9))):
 rr=[r for r in rock if float(r['halfbeam_percent'])==hb]
 for j,b in enumerate(sorted(set(r['branch'] for r in rr))):
  ss=sorted([r for r in rr if r['branch']==b],key=lambda r:float(r['x_R01_cm']))
  a.plot([float(r['x_R01_cm']) for r in ss],[float(r['z_cm']) for r in ss],lw=1,label=f'{hb:g}% half-beam' if j==0 else None,color=color)
a.set_aspect('equal');a.set_xlabel('R01 X forward / cm');a.set_ylabel('Lower-envelope Z / cm');a.legend(frameon=False,labelcolor='#eef3f6',ncol=3);save(f,'tail-rocker.svg',[rockfile])
sf='H0_R02_Symmetry.csv';sym=rows(sf);f,aa=fig(size=(11,5));a=aa[0]
a.semilogy([float(r['station_percent']) for r in sym],[float(r['max_mm']) for r in sym],color='#24b8ff');a.set_xlabel('R02 station / % from stern');a.set_ylabel('Maximum sampled mirrored deviation / mm');a.grid(alpha=.12);save(f,'sampled-symmetry.svg',[sf])

for src,dst in [('H0_R01_Reference_Verification.png','source-reference-r01.png'),('H0_R02_Reference_Verification.png','source-reference-r02.png'),('H0_R02_Arc_Length_Convergence_Detail.png','source-convergence.png'),('H0_R02_Converged_Curvature_Rate_Map.png','source-converged-map.png'),('H0_R02_Feature_Intent_Review.png','source-feature-review.png'),('H0_R02_Full_Hull_Fairness_Analysis.png','source-fairness.png'),('H0_R02_Native_SubD_Visual_Fairness.png','source-native-fairness.png'),('H0_R02_SubD_vs_NURBS_Validation.png','source-validation.png'),('H0_R02_Tail_Section_Views.png','source-tail-views.png'),('H0_R02_Tail_Section_Analysis.png','source-tail-analysis.png')]:copy(src,dst)
(R/'docs/geometry-gallery-sources.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(f'Prepared {len(records)} geometry graphics and original source sheets.')
