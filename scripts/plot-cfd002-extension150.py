from pathlib import Path
import sys,json
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'.plot-deps'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path(__file__).resolve().parents[1];src=Path(sys.argv[1]);d=json.loads((src/'Accepted_Data.json').read_text());a=json.loads((src/'Dynamic_Analysis.json').read_text());samples=d['samples']
plt.rcParams.update({'font.size':11,'svg.fonttype':'none','path.simplify':False})
fig,axs=plt.subplots(2,1,figsize=(11,7.5));fig.subplots_adjust(left=.10,right=.97,top=.85,bottom=.15,hspace=.55)
for ax,kind,key,factor,label in [(axs[0],'heave','heave_m',1000,'Heave from release / mm'),(axs[1],'pitch','bow_up_deg',1,'Absolute bow-up pitch / degrees')]:
 ax.plot([s['tau'] for s in samples],[s[key]*factor for s in samples],color='#94bce3',lw=1.7)
 for event in a['turns'][kind]:
  e=event['estimate'];ax.scatter(e['tau'],e[key]*factor,c='#e7ac55',s=25,zorder=3)
  ax.annotate(f"{e[key]*factor:.2f}"+(' mm' if kind=='heave' else '°'),(e['tau'],e[key]*factor),xytext=(0,12 if event['direction']=='downward' else -19),textcoords='offset points',ha='center',color='#eef3f6',fontsize=9)
 ax.axvline(.949985056,color="#abb6be",ls="--",lw=.8);ax.set_xlim(0,1.55);ax.set_ylim((-12,125) if kind=='heave' else (0,15));ax.set_ylabel(label,color='#eef3f6');ax.set_xlabel('Time since release, τ / s',color='#abb6be');ax.tick_params(colors='#abb6be');ax.grid(color='#abb6be',alpha=.18);ax.set_facecolor('none');ax.spines[['top','right']].set_visible(False)
 for sp in ['bottom','left']:ax.spines[sp].set_color('#abb6be')
fig.suptitle('CFD-002 / Completed extension to 1.50 s',x=.10,ha='left',color='#eef3f6',fontsize=20)
fig.text(.10,.89,'20 km/h · free heave + pitch · surge-constrained · no rider / no jet thrust',color='#94bce3',fontsize=11)
fig.text(.10,.045,'29,908 accepted samples · no smoothing · interpolated extrema\nApproximately 1.50 s · dashed line: previous endpoint · migrating mean; stability and damping unresolved',color='#abb6be',fontsize=10)
fig.savefig(root/'public/assets/engineering/cfd002-extension150/motion.svg',transparent=True);plt.close(fig)
