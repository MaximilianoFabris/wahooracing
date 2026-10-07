import bpy, json, math
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]/'.preview/hull-renderings'
ROOT.mkdir(parents=True,exist_ok=True)
src=Path(__file__).resolve().parents[2]/'_Wahoo_Engineering/01_Geometry_Analysis/H0_R03_Hydrostatic_Assets/coarse.json'
d=json.loads(src.read_text())
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
mesh=bpy.data.meshes.new('H0 R03 unmodified derived tessellation')
mesh.from_pydata(d['vertices_Wahoo_m'],[],d['triangles']); mesh.update()
ob=bpy.data.objects.new('Actual H0 R03 hull',mesh); bpy.context.collection.objects.link(ob)
lo=Vector(tuple(min(v[i] for v in d['vertices_Wahoo_m']) for i in range(3)))
hi=Vector(tuple(max(v[i] for v in d['vertices_Wahoo_m']) for i in range(3)))
center=(lo+hi)/2
ob.location=-center
for p in mesh.polygons: p.use_smooth=True
mat=bpy.data.materials.new('Illustrative satin graphite finish'); mat.use_nodes=True
bs=mat.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(.21,.245,.27,1); bs.inputs['Metallic'].default_value=.65; bs.inputs['Roughness'].default_value=.29
ob.data.materials.append(mat)
scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.render.resolution_x=1600; scene.render.resolution_y=850; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.film_transparent=True
scene.world.color=(.15,.15,.15)
def area(name,loc,power,color,size,scale=1):
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.color=color; data.shape='RECTANGLE'; data.size=size; data.size_y=size*scale
    obj=bpy.data.objects.new(name,data); scene.collection.objects.link(obj); obj.location=loc; obj.rotation_euler=(-obj.location).to_track_quat('-Z','Y').to_euler()
area('Soft studio key',(0,-1.4,2.6),420,(.83,.9,1),3,.4)
area('Blue edge',(0,1.3,.9),260,(.01,.34,1),2.5,.16)
area('Front strip',(-2,0,.3),120,(1,1,1),2,.2)
camd=bpy.data.cameras.new('Camera'); cam=bpy.data.objects.new('Camera',camd); scene.collection.objects.link(cam); scene.camera=cam
camd.type='ORTHO'; camd.ortho_scale=2.15
def render(name,loc,roll=0):
    cam.location=loc; cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler(); cam.rotation_euler.rotate_axis('Z',roll)
    scene.render.filepath=str(ROOT/name); bpy.ops.render.render(write_still=True)

render('hull-side.png',(0,-3,0))
camd.ortho_scale=.8
render('hull-front.png',(3,0,0))
render('hull-back.png',(-3,0,0))
