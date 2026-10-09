from pathlib import Path
import sys,json
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'.plot-deps'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
d=root/'provenance/cfd002-return-motion';a=np.array(json.loads((d/'motion.json').read_text()));st=json.loads((d/'Turning_Point_Status.json').read_text())
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':12,'svg.fonttype':'none','path.simplify':False})
fig,axs=plt.subplots(2,1,figsize=(11,8.8));fig.subplots_adjust(left=.11,right=.97,top=.89,bottom=.13,hspace=.48)
text='#f2f2f3';muted='#b6c0ca';blue='#94bce3'
for ax,col,title,ylabel in zip(axs,[1,2],['Vertical motion / heave','Pitch / absolute bow-up attitude'],['Heave from release (mm)','Bow-up angle (degrees)']):
 ax.plot(a[:,0],a[:,col],color=blue,lw=1.8)
 ax.set_title(title,loc='left',color=text,pad=15,fontsize=16)
 ax.set_ylabel(ylabel,color=text);ax.set_xlabel('Time since motion release, tau (s)',color=text,labelpad=8)
 ax.set_xlim(0,.70);ax.set_xticks(np.arange(0,.701,.1));ax.tick_params(colors=muted)
 ax.grid(color=muted,alpha=.2,lw=.6);ax.spines[['top','right']].set_visible(False)
 for sp in ['left','bottom']:ax.spines[sp].set_color(muted)
 ax.set_facecolor('none')
axs[0].set_ylim(-12,110);axs[1].set_ylim(0,14)
labels=[(0,0,(.04,38),'Initial minimum: -3.239 mm'),(0,2,(.22,98),'First maximum: +87.747 mm'),(0,4,(.41,43),'Return minimum: +77.392 mm'),(1,1,(.13,12.3),'First maximum: 10.738°'),(1,3,(.40,5.8),'Return minimum: 10.026°')]
for idx,event,pos,label in labels:
 e=st['confirmed_turning_points'][event]['interpolated'];x=e['tau'];y=e['heave_m']*1000 if idx==0 else e['bow_up_deg'];ax=axs[idx]
 ax.scatter([x],[y],color='#e7ac55',s=30,zorder=5)
 ax.annotate(label+'\ntau ≈ '+f'{x:.5f} s',(x,y),xytext=pos,color=text,fontsize=10,arrowprops={'arrowstyle':'-','color':muted,'lw':.8})
fig.suptitle('CFD-002 / Return motion and renewed rise',x=.11,ha='left',color=text,fontsize=21)
fig.text(.11,.035,f'WORK IN PROGRESS · {len(a):,} accepted saved samples · no smoothing\nSnapshot: 09 Oct 2026, 16:09:10 UTC · transient simulation; damping and stability undetermined',color=muted,fontsize=10)
fig.savefig(root/'public/assets/engineering/cfd002-return-motion.svg',transparent=True)
fig.savefig(root.parent/'cfd002-return-review.png',facecolor='#10171f',dpi=130)
plt.close(fig)

