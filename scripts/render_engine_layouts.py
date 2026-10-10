"""Render source CAD packaging envelopes on true transparent canvases.
Restore source packages locally before running. Never modify the engineering packages.
Usage: python scripts/render_engine_layouts.py --source-root <CAD archive parent>
"""
import argparse, pathlib, shutil, zipfile, hashlib, json, sys
from PIL import Image, ImageDraw, ImageFont
import numpy as np
root=pathlib.Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--source-root',required=True);args=a.parse_args()
archive=pathlib.Path(args.source_root);work=root/'.preview/exhaust-transparent';work.mkdir(parents=True,exist_ok=True)
runtime=work/'_runtime';runtime.mkdir(exist_ok=True)
zip_source=archive/'WHE-CAD-001_Rev03_20261010/rhino3dm_runtime.zip'
with zipfile.ZipFile(zip_source) as z:
 for info in z.infolist():
  if not (runtime/info.filename).resolve().is_relative_to(runtime.resolve()): raise ValueError('Unsafe runtime path')
 z.extractall(runtime)
sys.path.insert(0,str(runtime))
provenance=[]
assets=root/'public/assets/engineering'
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22);titlefont=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',30);small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',17)

def panel(draw,rect,geometries,title,view):
 x0,y0,x1,y1=rect;u,v,depth=[np.array(q,float) for q in view];u/=np.linalg.norm(u);v/=np.linalg.norm(v);depth/=np.linalg.norm(depth)
 pts=np.concatenate([np.concatenate(t) for t,c,a in geometries]);proj=np.column_stack((pts@u,pts@v));mn,mx=proj.min(0),proj.max(0);scale=min((x1-x0-40)/max(mx[0]-mn[0],1),(y1-y0-65)/max(mx[1]-mn[1],1));center=(mn+mx)/2
 facets=[]
 for tris,color,alpha in geometries:
  for t in tris:
   xy=(np.column_stack((t@u,t@v))-center)*scale;xy[:,0]+=(x0+x1)/2;xy[:,1]=(y0+y1+30)/2-xy[:,1]
   n=np.cross(t[1]-t[0],t[2]-t[0]);length=np.linalg.norm(n);light=.62+.38*abs(np.dot(n/length,depth)) if length else .7
   facets.append((float(np.mean(t@depth)),xy,tuple(int(c*light) for c in color)+(alpha,)))
 for _,xy,color in sorted(facets,key=lambda q:q[0]):draw.polygon([tuple(a) for a in xy],fill=color)
 if title:draw.text((x0+12,y0+8),title,font=font,fill=(242,242,243,255))
 return center,scale

def overlay(draw,rect,geometries,allgeom):
 pts=np.concatenate([np.concatenate(t) for t,c,a in allgeom]);proj=pts[:,[1,2]];mn,mx=proj.min(0),proj.max(0);center=(mn+mx)/2;x0,y0,x1,y1=rect;scale=min((x1-x0-40)/(mx[0]-mn[0]),(y1-y0-65)/(mx[1]-mn[1]))
 for tris,col,alpha in geometries:
  for t in tris:
   xy=(t[:,[1,2]]-center)*scale;xy[:,0]+=(x0+x1)/2;xy[:,1]=(y0+y1+30)/2-xy[:,1];draw.polygon([tuple(p) for p in xy],fill=(*col,255))

def save(im,name):
 assert im.mode=='RGBA' and im.getchannel('A').getextrema()[0]==0
 dest=assets/name;im.save(dest);provenance.append({'output':name,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'transparent_background':True,'size_px':list(im.size)})

for rev in ['Rev01','Rev03']:
 name=f'WHE-CAD-001_{rev}_20261010';local=work/name;local.mkdir(exist_ok=True)
 for filename in ['build_rhino.py','packaging_parameters.json','SOURCE_HULL_REFERENCE.3dm']:
  original=archive/name/filename;target=local/filename;shutil.copyfile(original,target);assert hashlib.sha256(original.read_bytes()).digest()==hashlib.sha256(target.read_bytes()).digest()
  provenance.append({'source_revision':name,'file':filename,'sha256':hashlib.sha256(original.read_bytes()).hexdigest()})
 code=(local/'build_rhino.py').read_text(encoding='utf-8-sig');ns={'__file__':str(local/'build_rhino.py')}
 # Execute only source geometry definitions; omit all source-file writes and original raster rendering.
 exec(compile(code[:code.index('engine=new_file();')],str(local/'build_rhino.py'),'exec'),ns)
 exec(compile(code[code.index('def mesh_triangles('):code.index("font_path=")],str(local/'build_rhino.py'),'exec'),ns)
 parts,colors,r=ns['parts'],ns['colors'],ns['r'];tri=ns['mesh_triangles']
 engine=[(tri(q['mesh']),colors[q['layer']],255) for q in parts if not q['hidden'] and q['layer']!='04_Piston_and_Rod']
 hm=next(o.Geometry.Duplicate() for o in ns['hull'].Objects if type(o.Geometry).__name__=='SubD');hm.Subdivide(2);hm=r.Mesh.CreateFromSubDControlNet(hm,False);hm.Transform(r.Transform.Scale(ns['p']([0,0,0]),10))
 world=[]
 for q in parts:
  if q['hidden'] or q['layer']=='04_Piston_and_Rod':continue
  m=q['mesh'].Duplicate();m.Transform(ns['transform_world']());world.append((tri(m),colors[q['layer']],255))
 allgeom=[(tri(hm),(215,225,233),255)]+world
 im=Image.new('RGBA',(1600,1100),(0,0,0,0));d=ImageDraw.Draw(im,'RGBA');d.text((28,20),f'WAHOO | Rough engine + exhaust assembly / {rev}',font=titlefont,fill=(242,242,243,255));d.text((28,63),'Packaging envelopes · supplier dimensions and installed clearances remain unverified',font=small,fill=(182,192,202,255))
 panel(d,(15,105,800,660),engine,'Engine and exhaust / isometric',[(.8,.6,0),(-.3,.4,.866),(.52,-.69,.5)])
 panel(d,(810,105,1585,660),engine,'Top / bow up, cylinder head to left',[(0,-1,0),(1,0,0),(0,0,1)])
 rect=(15,680,1585,1030);panel(d,rect,allgeom,'Hull placement / side overview (x-ray overlay)',[(0,1,0),(0,0,1),(1,0,0)]);overlay(d,rect,world,allgeom)
 d.text((28,1050),'Blue/teal: case, cylinder and head   Purple: intake   Orange: starter   Brown: untuned exhaust volume',font=small,fill=(182,192,202,255))
 save(im,f'engine-layout-{rev.lower()}-transparent.png')
 if rev=='Rev03':
  thumb=Image.new('RGBA',(1600,800),(0,0,0,0));panel(ImageDraw.Draw(thumb,'RGBA'),(10,10,1590,790),engine,'',[(.8,.6,0),(-.3,.4,.866),(.52,-.69,.5)]);save(thumb,'exhaust-selected-rev03-thumbnail.png')
  route=Image.new('RGBA',(1600,650),(0,0,0,0));dr=ImageDraw.Draw(route,'RGBA');dr.text((28,16),'WAHOO | Selected cylinder-side exhaust route / Rev03',font=titlefont,fill=(242,242,243,255));panel(dr,(15,60,1585,590),allgeom,'Direct aft exhaust / plan, bow to right',[(0,1,0),(1,0,0),(0,0,-1)])
  pts=np.concatenate([np.concatenate(t) for t,c,a in allgeom]);proj=pts[:,[1,0]];mn,mx=proj.min(0),proj.max(0);center=(mn+mx)/2;scale=min(1530/(mx[0]-mn[0]),465/(mx[1]-mn[1]))
  for tris,col,alpha in world:
   for t in tris:
    xy=(t[:,[1,0]]-center)*scale;xy[:,0]+=800;xy[:,1]=(60+590+30)/2-xy[:,1];dr.polygon([tuple(p) for p in xy],fill=(*col,255))
  dr.text((28,610),'Conceptual envelopes · fit, thermal clearance and exhaust tuning remain unverified',font=small,fill=(182,192,202,255));save(route,'exhaust-route-rev03-transparent.png')
(root/'docs/engine-transparent-renders.json').write_text(json.dumps({'method':'Native source geometry reconstructed from unchanged revision inputs; source facet shading and x-ray overlays retained. Canvas alpha is zero outside drawn content. No source CAD or original preview file modified.','files':provenance},indent=2)+'\n',encoding='utf-8')
print('Rendered four true RGBA images from unchanged source geometry.')
