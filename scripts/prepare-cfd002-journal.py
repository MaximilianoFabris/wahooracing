from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
root=Path(__file__).resolve().parents[1]; d=root/'provenance/cfd002-turning-points'
a=np.array(json.loads((d/'motion.json').read_text())); st=json.loads((d/'Turning_Point_Status.json').read_text()); meta=json.loads((d/'snapshot.json').read_text())
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':12,'svg.fonttype':'none','path.simplify':False})
fig,axs=plt.subplots(2,1,figsize=(11,8.8));fig.subplots_adjust(left=.11,right=.97,top=.90,bottom=.12,hspace=.46)
text='#eef3f6';muted='#8497a5';blue='#42b9ef'
for ax,col,title,ylabel in zip(axs,[1,2],['Vertical motion / heave','Pitch / absolute bow-up attitude'],['Heave from release (mm)','Bow-up angle (degrees)']):
 ax.plot(a[:,0],a[:,col],color=blue,lw=1.8)
 ax.set_title(title,loc='left',color=text,pad=15,fontsize=16)
 ax.set_ylabel(ylabel,color=text);ax.set_xlabel('Time since motion release, tau (s)',color=text,labelpad=8)
 ax.set_xlim(0,.46);ax.set_xticks(np.arange(0,.451,.05));ax.tick_params(colors=muted)
 ax.grid(color=muted,alpha=.2,lw=.6);ax.spines[['top','right']].set_visible(False)
 for sp in ['left','bottom']:ax.spines[sp].set_color(muted)
 ax.set_facecolor('none')
axs[0].set_ylim(-12,106);axs[1].set_ylim(0,12.5)
events={x['kind']:x for x in st['confirmed_turning_points']}
for ax,kind,col,xytext,label in [(axs[0],'heave_minimum',1,(.12,16),'Initial minimum: -3.239 mm\ntau ≈ 0.06962 s'),(axs[0],'heave_maximum',1,(.20,93),'First rise maximum: +87.747 mm\ntau ≈ 0.43811 s'),(axs[1],'pitch_maximum',2,(.14,11.2),'First pitch maximum: 10.738°\ntau ≈ 0.34491 s')]:
 e=events[kind]['interpolated']; y=e['heave_m']*1000 if col==1 else e['bow_up_deg'];x=e['tau'];ax.scatter([x],[y],color='#e7ac55',s=35,zorder=5)
 ax.annotate(label,(x,y),xytext=xytext,color=text,fontsize=11,arrowprops={'arrowstyle':'-','color':muted,'lw':.8})
fig.suptitle('CFD-002 / First motion reversals',x=.11,ha='left',color=text,fontsize=21)
fig.text(.11,.035,f"PRELIMINARY · {len(a):,} accepted saved samples · no smoothing\nSnapshot: 08 Oct 2026, 17:18:56 UTC · interpolated event times · equilibrium not established",color=muted,fontsize=10)
out=root/'public/assets/engineering/cfd002-first-reversals.svg';fig.savefig(out,transparent=True);plt.close(fig)
record=dict(slug='cfd002-first-motion-reversals',title='CFD-002: the first motion reversals.',summary='The moving-hull calculation records its first pitch maximum and the end of its initial rise. A preliminary milestone in understanding the transient response—not a final stability result.',date='2026-10-08',dateLabel='08 Oct 2026 · snapshot at 17:18:56 UTC',revision='H0-CFD-002 / Resume_03 / INTERIM',type='Simulation',evidence='Preliminary simulated motion · run incomplete',status='published',systems=['hull-hydrodynamics'],hero='engineering/cfd002-first-reversals.svg',heroAlt='Saved heave and pitch histories show an initial heave minimum, then a pitch maximum of 10.738 degrees and heave maximum of 87.747 millimetres, followed by the start of return motion.',heroCaption='9,305 accepted saved motion samples through tau = 0.442544 s. No smoothing. Gold markers identify interpolated velocity-zero crossings; connecting lines join saved samples. Heave is relative to release; pitch is the absolute bow-up attitude.',sections=[
{'title':'A measurable change of direction','text':'The first pitch maximum occurred at an estimated tau of 0.344910 s, at approximately 10.738° bow-up. The hull then began rotating bow-down while still rising. At an estimated tau of 0.438109 s, heave reached approximately +87.747 mm relative to the release position and vertical velocity changed from upward to downward. Pitch at that heave maximum was approximately 10.489° bow-up.'},
{'title':'What the curves establish','text':'The response is no longer simply increasing in height and bow-up angle: both motions have reached a local maximum and begun to return. Before the rise, an initial heave minimum of approximately −3.239 mm occurred at tau ≈ 0.069617 s. The excursion from that initial minimum to the following maximum is approximately 90.986 mm. This is one observed excursion, not an established periodic amplitude or a damping measurement.'},
{'title':'Read the time and reference correctly','text':'Tau measures simulated time since motion was released from the saved CFD-001 fluid state at solver time 1.579983709 s. It is not elapsed computing time. The graph ends at tau = 0.442544 s, approximately 46.6% of the configured 0.95 s post-release interval. The initial absolute pitch is approximately 0.411°; the graph does not treat that initial attitude as zero.'},
{'title':'How the turning points were identified','text':'The monitoring record confirms five consecutive saved samples of each velocity sign around each crossing. Event times are linearly interpolated estimates within saved-step brackets. The pitch maximum is bracketed by tau = 0.344901964–0.344935324 s; the heave maximum by tau = 0.438074959–0.438134851 s. All plotted points come from accepted continuation segments, excluding the abandoned branch beyond its accepted interval.'},
{'title':'Return motion is not yet equilibrium','text':'At the snapshot endpoint, heave was approximately +87.726 mm and pitch 10.465° bow-up. Vertical velocity was −0.00968 m/s and pitch rate approximately −5.465°/s: the hull was descending and rotating bow-down. The monitor classification remains “STILL TOO EARLY TO CLASSIFY.” The next heave minimum and pitch minimum, followed by further corresponding maxima, are needed to compare successive excursions. Damped motion, persistent oscillation and growing porpoising are not yet distinguished.'},
{'title':'Keep the model assumptions visible','text':'This is the constrained heave-and-pitch study described in the <a href="/journal/cfd002-moving-hull-methodology/">CFD-002 methodology record</a>, continuing the 20 km/h boundary-speed baseline. The other four rigid-body motions remain constrained. The dry-board mass and inertia are provisional model inputs, not a rider-loaded physical test. These results do not establish final running trim, stable planing, mesh independence, resistance improvement or validated product performance.'},
{'title':'The next evidence','text':'The next review will compare confirmed minima and maxima, their time spacing, forces and moments, and numerical diagnostics over a longer record. A single turning point cannot establish a period or a settling trend. This article preserves the dated interim observation; later findings will be published as a follow-up rather than silently replacing this snapshot.'}
],sources=['Resume_03 / Turning_Point_Status.json — sample UTC 2026-10-08T17:18:56.539947+00:00','Accepted motionHistory / sixDoFRigidBodyState.dat segments: 1.579983709, 1.629983709, 1.707215799, 1.7086261725','Website snapshot provenance: source byte counts, SHA-256 hashes, accepted time bounds and 9,305 retained samples','H0-CFD-002 moving-hull methodology and Resume_03 restart provenance'],changes='Adds an explicitly preliminary motion result following the methodology article. Only saved text histories were read for this publication. No solver, monitoring configuration, mesh, physics, mass properties or CAD was changed. No new flow-field rendering was generated.')
(root/'content/cfd002-turning-points.json').write_text(json.dumps(record,indent=2,ensure_ascii=False),encoding='utf8')
p=root/'scripts/build.mjs';s=p.read_text(encoding='utf8');s=s.replace('const allUpdates=[','const allUpdates=[JSON.parse(await readFile(path.join(root,\'content/cfd002-turning-points.json\'),\'utf8\')),',1);p.write_text(s,encoding='utf8')
p=root/'scripts/navigation.mjs';s=p.read_text();s=s.replace("'cfd002-moving-hull-methodology']","'cfd002-moving-hull-methodology', 'cfd002-first-motion-reversals']");p.write_text(s)
print('Generated two traceable motion plots and dated Journal article')
