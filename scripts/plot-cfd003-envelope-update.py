"""Plot frozen monitoring history only. Never reads or changes the active solver case."""
import sys,json,hashlib
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'.plot-deps'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]) if len(sys.argv)>1 else root/'drafts/WI-016-cfd003'
assert source.resolve() == (root/'drafts/WI-016-cfd003').resolve(), 'Use assigned frozen inputs only'
for item in json.loads((source/'manifest.json').read_text(encoding='utf-8-sig')):
 assert hashlib.sha256((source/item['frozen']).read_bytes()).hexdigest().upper()==item['sha256'], item['frozen']
status=json.loads((source/'continuation-status.json').read_text());stop=json.loads((source/'original-stop.json').read_text())
cutoff=status['last_completed']['t'];ts=stop['last']['tau'];rows={}
for line in (source/'history.jsonl').read_text().splitlines():
 try:r=json.loads(line)
 except json.JSONDecodeError:continue
 if r['t']<=cutoff:rows[r['t']]=r
rows=[rows[t] for t in sorted(rows)];before=[r for r in rows if r['tau']<=ts+1e-9];after=[before[-1]]+[r for r in rows if r['tau']>ts+1e-9]
assert len(before)>8000 and len(after)>5
assert abs(before[-1]['heave']-stop['last']['heave_m'])<1e-7
plt.rcParams.update({'font.family':'DejaVu Sans','text.color':'#b6c0ca','axes.labelcolor':'#b6c0ca','xtick.color':'#b6c0ca','ytick.color':'#b6c0ca','svg.fonttype':'none','font.size':11,'axes.titleweight':'normal'})
fig,axes=plt.subplots(2,1,figsize=(12.8,7.8),sharex=True);fig.patch.set_alpha(0)
fig.subplots_adjust(left=.095,right=.96,top=.79,bottom=.20,hspace=.3)
fig.text(.095,.95,'CFD-003 / REACHING THE MOTION ENVELOPE',fontsize=21,color='#f2f2f3')
fig.text(.095,.905,'Prescribed 20–30 km/h ramp · free heave and pitch · transient simulation',fontsize=12)
for ax,key,factor,ylabel in zip(axes,['heave','bow_up_deg'],[1000,1],['Heave from original release / mm','Absolute bow-up pitch / deg']):
 ax.patch.set_alpha(0)
 ax.plot([r['tau'] for r in before],[r[key]*factor for r in before],color='#769fc2',lw=2,label='Original accepted trajectory')
 ax.plot([r['tau'] for r in after],[r[key]*factor for r in after],color='#c5e2fc',lw=2.3,label='CFD-003B continuation')
 ax.axvline(ts,color='#94bce3',ls=(0,(3,4)),lw=.9,alpha=.8)
 ax.plot(after[-1]['tau'],after[-1][key]*factor,'o',color='#c5e2fc',ms=4)
 ax.set_ylabel(ylabel,labelpad=14);ax.set_xlim(0,.51)
 ax.grid(axis='y',color='#33404c',lw=.6)
 for side in ['top','right']:ax.spines[side].set_visible(False)
 for side in ['left','bottom']:ax.spines[side].set_color('#33404c')
axes[0].set_ylim(75,215);axes[1].set_ylim(10,15.0)
axes[0].hlines(145,0,ts,colors='#94bce3',linestyles=(0,(6,5)),linewidth=.8,alpha=.7)
axes[0].text(.012,148,'Original protective guard: 145 mm',fontsize=10,color='#94bce3')
axes[0].annotate('Protective stop at 29.42 km/h',xy=(ts,145.09),xytext=(.16,163),fontsize=10,color='#c5e2fc',arrowprops={'arrowstyle':'-','color':'#94bce3','lw':.7})
axes[0].hlines(195,ts,rows[-1]['tau'],colors='#c5e2fc',linestyles=(0,(6,5)),linewidth=.8,alpha=.7)
axes[0].text(.012,205,'Continuation graceful-stop guard: 195 mm while rising',fontsize=10,color='#c5e2fc')
axes[0].annotate('Clean stop at 29.98 km/h',xy=(rows[-1]['tau'],rows[-1]['heave']*1000),xytext=(.27,178),fontsize=10,color='#c5e2fc',arrowprops={'arrowstyle':'-','color':'#94bce3','lw':.7})
fig.legend(*axes[0].get_legend_handles_labels(),loc='upper left',bbox_to_anchor=(.09,.865),frameon=False,fontsize=10,labelcolor='#b6c0ca',ncol=2)
axes[1].set_xlabel('Time since CFD-003 branch / s',labelpad=12)
last=rows[-1]
fig.text(.095,.065,f"Frozen snapshot: {status['utc'][:19].replace('T',' ')} UTC  |  stopped: {last['speed_m_s']*3.6:.2f} km/h",fontsize=10)
fig.text(.095,.025,'The ramp is incomplete; the 30 km/h hold was not reached. Motion-envelope limits are numerical safeguards, not physical stability limits.',fontsize=10)
out=source
fig.savefig(out/'motion-history.svg',transparent=True)
svg=out/'motion-history.svg'
svg.write_text(svg.read_text().replace('</svg>','<style>text{font-family:Arial,sans-serif!important}</style></svg>'))
fig.savefig(out/'motion-history.png',transparent=True,dpi=130)
record={'snapshotUtc':status['utc'],'acceptedHistoryRows':len(rows),'originalStop':stop['last'],'continuation':status['last_completed'],'scope':'Frozen monitoring data only; clean numerical guard stop, not a completed ramp/hold or physical validation.','generatorReference':'scripts/plot-cfd003-envelope.py','originalRows':len(before),'continuationRows':len(after)-1,'timeReference':'tau = solver t - 3.079964627532212 s (CFD-003 branch); heave from original CFD-002 release; absolute bow-up pitch','smoothing':False,'sourceHashes':json.loads((source/'manifest.json').read_text())}
(out/'plot-record.json').write_text(json.dumps(record,indent=2)+'\n')
print(f'Plotted {len(rows)} accepted samples; continuation {len(after)-1} samples; original stop retained.')
