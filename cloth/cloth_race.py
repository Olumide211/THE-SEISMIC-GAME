"""Spenda Race, shots 1-2 (0.0-3.5s): two phones floating side by side under one sheet of
black satin; top rim light fades up; at 2.5s the satin is yanked off toward the top left.

Headless Blender (bpy module), portrait 1080x1920. Same two-pass approach as cloth.py:
settle the sheet over both slabs, then hook a pinned patch on its upper-left and yank.
The camera is baked per frame from race_cam.json (smoothstep segments), the same curve the
Remotion scene uses, so the holdout plates line up with the 3D phones.
  main pass: frames 1-100           -> cloth/frames_race/main_####.png
  hold pass: frames 86-106, slabs as holdout -> cloth/frames_race/hold_####.png

usage: python cloth_race.py [--test 1,40,80] [--samples N] [--start A --end B] [--pass main|hold] [--res 100]
"""
import argparse
import json
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30
LAST_FRAME = 106  # t = 3.5s

ap = argparse.ArgumentParser()
ap.add_argument('--test', type=str, default='')
ap.add_argument('--samples', type=int, default=40)
ap.add_argument('--start', type=int, default=1)
ap.add_argument('--end', type=int, default=LAST_FRAME)
ap.add_argument('--pass', dest='pass_', default='main')
ap.add_argument('--res', type=int, default=100)
args = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])

CAM = json.load(open(os.path.join(HERE, 'race_cam.json')))
ZC = CAM['zc']


def t2f(t):
    return 1 + t * FPS


def to_blender(p):
    return Vector((p[0], -p[2], p[1] + ZC))


def smooth(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def cam_at(t):
    ks = CAM['keys']
    if t <= ks[0][0]:
        return ks[0][1], ks[0][2]
    for (t0, p0, a0), (t1, p1, a1) in zip(ks, ks[1:]):
        if t <= t1:
            k = smooth((t - t0) / (t1 - t0))
            return [a + (b - a) * k for a, b in zip(p0, p1)], [a + (b - a) * k for a, b in zip(a0, a1)]
    return ks[-1][1], ks[-1][2]


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = FPS
scene.frame_start = 1

# ---------------------------------------------------------------- two phone slabs (match the 3D phones)
PW, PH, PD = 1.0, 2.163, 0.1
GAP_X = 0.62
BASE_Z = ZC - PH / 2
slabs = []
slab_mat = bpy.data.materials.new('SlabMat')
slab_mat.use_nodes = True
sb = slab_mat.node_tree.nodes['Principled BSDF']
sb.inputs['Base Color'].default_value = (0.006, 0.006, 0.006, 1)
sb.inputs['Roughness'].default_value = 0.25
sb.inputs['Metallic'].default_value = 0.6
for x in (-GAP_X, GAP_X):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, BASE_Z + PH / 2))
    s = bpy.context.object
    s.scale = (PW, PD, PH)
    bpy.ops.object.transform_apply(scale=True)
    b = s.modifiers.new('Round', 'BEVEL')
    b.width = 0.04
    b.segments = 6
    s.data.materials.append(slab_mat)
    s.modifiers.new('Collision', 'COLLISION')
    s.collision.thickness_outer = 0.012
    s.collision.cloth_friction = 8
    slabs.append(s)

# invisible catcher far below so the hem settles (phones float in a void)
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, BASE_Z - 0.9))
floor = bpy.context.object
floor.modifiers.new('Collision', 'COLLISION')
floor.collision.cloth_friction = 0.5
floor.visible_camera = False
floor.visible_glossy = False
floor.visible_diffuse = False

# ---------------------------------------------------------------- satin sheet over both
CW, CD = 2.75, 5.2
bpy.ops.mesh.primitive_grid_add(x_subdivisions=80, y_subdivisions=150, size=1, location=(0, 0, BASE_Z + PH + 0.06))
sheet = bpy.context.object
sheet.scale = (CW, CD, 1)
bpy.ops.object.transform_apply(scale=True)


def cloth_settings(obj, frames):
    m = obj.modifiers.new('Cloth', 'CLOTH')
    s = m.settings
    s.quality = 8
    s.mass = 0.14
    s.air_damping = 3.0
    s.tension_stiffness = 12
    s.compression_stiffness = 12
    s.shear_stiffness = 6
    s.bending_stiffness = 0.08
    s.tension_damping = 4
    s.bending_damping = 0.4
    c = m.collision_settings
    c.distance_min = 0.008
    c.use_self_collision = True
    c.self_distance_min = 0.005
    c.collision_quality = 3
    m.point_cache.frame_start = frames[0]
    m.point_cache.frame_end = frames[1]
    return m


SETTLE = 90
scene.frame_end = SETTLE
cloth_settings(sheet, (1, SETTLE))
print('settling...', flush=True)
for f in range(1, SETTLE + 1):
    scene.frame_set(f)
dg = bpy.context.evaluated_depsgraph_get()
settled = bpy.data.meshes.new_from_object(sheet.evaluated_get(dg))
bpy.data.objects.remove(sheet)
sheet = bpy.data.objects.new('Satin', settled)
scene.collection.objects.link(sheet)
scene.frame_end = LAST_FRAME
scene.frame_set(1)
for p in sheet.data.polygons:
    p.use_smooth = True

verts = sheet.data.vertices
pin = sheet.vertex_groups.new(name='pin')
top = BASE_Z + PH
grab = [i for i, v in enumerate(verts) if v.co.x < -GAP_X + 0.05 and v.co.z > top - 0.05 and abs(v.co.y) < 0.35]
pin.add(grab, 1.0, 'REPLACE')
print('grab verts', len(grab), flush=True)

hook_target = bpy.data.objects.new('Grab', None)
scene.collection.objects.link(hook_target)
hook = sheet.modifiers.new('Hook', 'HOOK')
hook.object = hook_target
hook.vertex_indices_set(grab)
hook.center = (0, 0, 0)
# anticipation lift from 2.2s, yank at 2.5s up-left and toward the lens
for t, loc in [
    (0.0, (0, 0, 0)),
    (2.2, (0, 0, 0)),
    (2.5, (-0.02, -0.02, 0.12)),
    (2.8, (-0.35, -0.35, 0.55)),
    (3.1, (-1.0, -1.3, 1.1)),
    (3.5, (-2.4, -3.6, 1.9)),
]:
    hook_target.location = loc
    hook_target.keyframe_insert('location', frame=t2f(t))

sim = cloth_settings(sheet, (1, LAST_FRAME))
sim.settings.vertex_group_mass = 'pin'
sub = sheet.modifiers.new('Subd', 'SUBSURF')
sub.levels = 1
sub.render_levels = 2

# ---------------------------------------------------------------- satin material (with fine weave)
mat = bpy.data.materials.new('Satin')
mat.use_nodes = True
N, L = mat.node_tree.nodes, mat.node_tree.links
pb = N['Principled BSDF']
pb.inputs['Base Color'].default_value = (0.008, 0.008, 0.009, 1)
pb.inputs['Roughness'].default_value = 0.3
pb.inputs['Specular IOR Level'].default_value = 0.6
pb.inputs['Anisotropic'].default_value = 0.65
pb.inputs['Sheen Weight'].default_value = 0.6
pb.inputs['Sheen Roughness'].default_value = 0.35
uvn = N.new('ShaderNodeUVMap')
weave = N.new('ShaderNodeTexWave')
weave.inputs['Scale'].default_value = 1100
weave.inputs['Distortion'].default_value = 0.5
L.new(uvn.outputs['UV'], weave.inputs['Vector'])
bump = N.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = 0.08
L.new(weave.outputs['Fac'], bump.inputs['Height'])
L.new(bump.outputs['Normal'], pb.inputs['Normal'])
sheet.data.materials.append(mat)


# ---------------------------------------------------------------- lights
def area(name, loc, rot, size, size_y, energy_keys):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.shape = 'RECTANGLE'
    ld.size, ld.size_y = size, size_y
    ob = bpy.data.objects.new(name, ld)
    scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = [math.radians(a) for a in rot]
    for t, e in energy_keys:
        ld.energy = e
        ld.keyframe_insert('energy', frame=t2f(t))


area('Rim', (0, 0.65, top + 1.1), (-35, 0, 0), 3.4, 0.3, [(0, 0), (0.3, 60), (1.4, 1300), (3.5, 1400)])
area('KickL', (-2.2, 1.4, top + 0.2), (-60, -45, 0), 0.6, 3.0, [(0, 0), (0.6, 0), (1.5, 360)])
area('KickR', (2.2, 1.4, top + 0.2), (-60, 45, 0), 0.6, 3.0, [(0, 0), (0.6, 0), (1.5, 360)])
area('Key', (0, -2.2, top + 2.0), (40, 0, 0), 3.5, 1.4, [(0, 0), (0.8, 0), (1.6, 120), (3.5, 140)])

world = bpy.data.worlds.new('W')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0, 0, 0, 1)
scene.world = world

# ---------------------------------------------------------------- camera (baked per frame)
cd = bpy.data.cameras.new('Cam')
cd.lens = 50
cd.sensor_width = 36
cd.sensor_fit = 'AUTO'
cd.dof.use_dof = True
cd.dof.aperture_fstop = 2.8
cam = bpy.data.objects.new('Cam', cd)
scene.collection.objects.link(cam)
scene.camera = cam
aim = bpy.data.objects.new('Aim', None)
scene.collection.objects.link(aim)
tr = cam.constraints.new('TRACK_TO')
tr.target = aim
tr.track_axis = 'TRACK_NEGATIVE_Z'
tr.up_axis = 'UP_Y'
cd.dof.focus_object = aim
for f in range(1, LAST_FRAME + 1):
    p, a = cam_at((f - 1) / FPS)
    cam.location = to_blender(p)
    cam.keyframe_insert('location', frame=f)
    aim.location = to_blender(a)
    aim.keyframe_insert('location', frame=f)

# ---------------------------------------------------------------- render
r = scene.render
r.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 6
r.resolution_x, r.resolution_y = 1080, 1920
r.resolution_percentage = args.res
r.film_transparent = True
r.use_motion_blur = True
r.motion_blur_shutter = 0.6
r.image_settings.file_format = 'PNG'
r.image_settings.color_mode = 'RGBA'
r.image_settings.color_depth = '16'
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - High Contrast'

if args.pass_ == 'hold':
    for s in slabs:
        s.is_holdout = True

out_dir = os.path.join(HERE, 'frames_race')
os.makedirs(out_dir, exist_ok=True)
print('simulating pull...', flush=True)
for f in range(1, LAST_FRAME + 1):
    scene.frame_set(f)
frames = [int(x) for x in args.test.split(',')] if args.test else range(args.start, args.end + 1)
for f in frames:
    scene.frame_set(f)
    r.filepath = os.path.join(out_dir, f'{args.pass_}_{f:04d}.png')
    bpy.ops.render.render(write_still=True)
    print('rendered', f, flush=True)
