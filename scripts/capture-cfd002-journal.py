from pathlib import Path
import json,math,hashlib,datetime
root=Path('/mnt/c/Users/maxfa/Desktop/Wahoo/_Board Design/_ChatGpt/wahooracing')
d=root.parent/'_Wahoo_Engineering/04_CFD_Results/H0-CFD-002/Resume_03'
c=Path('/home/wahoo/Wahoo_CFD/H0-CFD-002/H0-CFD-002-R02-RECOVERY01')
out=root/'provenance/cfd002-turning-points';out.mkdir(parents=True,exist_ok=True)
b=(d/'Turning_Point_Status.json').read_bytes();status=json.loads(b);(out/'Turning_Point_Status.json').write_bytes(b)
source=1.579983709
segments=[('1.579983709',source,1.629983709),('1.629983709',1.629983709,1.707215799),('1.707215799',1.707215799,1.70862617253242965),('1.7086261725',1.7086261725,float('inf'))]
rows={};records=[]
for name,lo,hi in segments:
 p=c/'postProcessing/motionHistory'/name/'sixDoFRigidBodyState.dat';raw=p.read_bytes();(out/(name+'.dat')).write_bytes(raw)
 records.append(dict(path=str(p),sha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw),accepted_start=lo,accepted_end=min(hi,status['current']['t'])))
 for line in raw.decode().splitlines():
  if not line.strip() or line.lstrip().startswith('#'):continue
  try:r=[float(v) for v in line.replace('(',' ').replace(')',' ').split()]
  except ValueError:continue
  if len(r)>=16 and lo-1e-10<=r[0]<=min(hi,status['current']['t'])+1e-10:
   rows[r[0]]=[r[0]-source,1000*(r[6]-.036048298023364775),.41126936702634675-math.degrees(r[8]),r[12],-math.degrees(r[14])]
data=[rows[t] for t in sorted(rows)]
assert data and abs(data[-1][0]-status['current']['tau'])<1e-8
(out/'motion.json').write_text(json.dumps(data))
(out/'snapshot.json').write_text(json.dumps(dict(sample_utc=status['sample_utc'],count=len(data),columns=['tau_s','heave_mm','absolute_bow_up_deg','vertical_velocity_m_s','bow_up_rate_deg_s'],sources=records,method='Saved accepted motion samples; abandoned branch excluded; no smoothing; cutoff fixed to turning-point monitor timestamp.'),indent=2))
print(json.dumps(dict(sample_utc=status['sample_utc'],samples=len(data),last=data[-1],events=[{'kind':e['kind'],'tau':e['interpolated']['tau']} for e in status['confirmed_turning_points']])))
