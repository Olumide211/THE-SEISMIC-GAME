"""Shot 1-2 (0.0-2.9s): phone slab under black satin, rim light fade-up, yank toward upper-left.

Headless Blender (bpy module). Two simulation passes:
  1. settle: a flat satin sheet falls over the phone slab and comes to rest.
  2. pull:   the settled sheet becomes the rest state; a pinned patch on its upper-left is
             hooked to an empty that yanks it up and out of frame.
Renders Cycles RGBA frames to cloth/frames/main_####.png (t = (frame-1)/30).
A second pass with the slab set to holdout (cloth/frames/hold_####.png) lets the
Remotion comp show the UI macro shot through the cloth as it sweeps past camera.

usage: python cloth.py [--test FRAME] [--samples N] [--start A --end B] [--pass main|hold]
"""
import argparse
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30
LAST_FRAME = 88  # t = 2.9s

ap = argparse.ArgumentParser()
ap.add_argument('--test', type=str, default='')
ap.add_argument('--samples', type=int, default=64)
ap.add_argument('--start', type=int, default=1)
ap.add_argument('--end', type=int, default=LAST_FRAME)
ap.add_argument('--pass', dest='pass_', default='main')
ap.add_argument('--res', type=int, default=100)
args = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])


def t2f(t):
    return 1 + t * FPS


# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = FPS
scene.frame_start = 1
scene.frame_end = LAST_FRAME

# ---------------------------------------------------------------- phone slab
PW, PH, PD = 0.80, 1.64, 0.11
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, PH / 2))
slab = bpy.context.object
slab.name = 'Slab'
slab.scale = (PW, PD, PH)
bpy.ops.object.transform_apply(scale=True)
bev = slab.modifiers.new('Round', 'BEVEL')
bev.width = 0.035
bev.segments = 6
slab_mat = bpy.data.materials.new('SlabMat')
slab_mat.use_nodes = True
bsdf = slab_mat.node_tree.nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (0.006, 0.006, 0.006, 1)
bsdf.inputs['Roughness'].default_value = 0.25
bsdf.inputs['Metallic'].default_value = 0.6
slab.data.materials.append(slab_mat)
col = slab.modifiers.new('Collision', 'COLLISION')
slab.collision.thickness_outer = 0.012
slab.collision.cloth_friction = 8

# floor (collision only, renders as pure black catcher)
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
floor = bpy.context.object
floor.name = 'Floor'
floor.modifiers.new('Collision', 'COLLISION')
floor.collision.cloth_friction = 0.5
floor_mat = bpy.data.materials.new('FloorMat')
floor_mat.use_nodes = True
fb = floor_mat.node_tree.nodes['Principled BSDF']
fb.inputs['Base Color'].default_value = (0.004, 0.004, 0.004, 1)
fb.inputs['Roughness'].default_value = 0.6
floor.data.materials.append(floor_mat)
floor.visible_camera = False
floor.visible_glossy = False
floor.visible_diffuse = False

# ---------------------------------------------------------------- satin sheet
CW, CD = 1.55, 3.9
bpy.ops.mesh.primitive_grid_add(x_subdivisions=62, y_subdivisions=156, size=1, location=(0, 0, PH + 0.06))
sheet = bpy.context.object
sheet.name = 'Satin'
sheet.scale = (CW, CD, 1)
bpy.ops.object.transform_apply(scale=True)


def cloth_settings(obj, frames):
    m = obj.modifiers.new('Cloth', 'CLOTH')
    s = m.settings
    s.quality = 8
    s.mass = 0.12
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


SETTLE_FRAMES = 90
scene.frame_end = SETTLE_FRAMES
cloth_settings(sheet, (1, SETTLE_FRAMES))
print('settling...', flush=True)
for f in range(1, SETTLE_FRAMES + 1):
    scene.frame_set(f)
    if f % 15 == 0:
        print('  settle', f, flush=True)

dg = bpy.context.evaluated_depsgraph_get()
settled = bpy.data.meshes.new_from_object(sheet.evaluated_get(dg))
bpy.data.objects.remove(sheet)
sheet = bpy.data.objects.new('Satin', settled)
scene.collection.objects.link(sheet)
scene.frame_end = LAST_FRAME
scene.frame_set(1)

# smooth shading + subdivision for silky folds
for p in sheet.data.polygons:
    p.use_smooth = True

# where does the sheet cover the front face? -> logo UV centre
verts = sheet.data.vertices
uvl = sheet.data.uv_layers.active.data
front_target = Vector((0, -PD / 2, PH * 0.66))
best, best_d = 0, 1e9
for i, v in enumerate(verts):
    d = (v.co - front_target).length
    if d < best_d:
        best, best_d = i, d
logo_uv = None
for loop in sheet.data.loops:
    if loop.vertex_index == best:
        logo_uv = uvl[loop.index].uv.copy()
        break
print('logo uv', logo_uv, 'dist', best_d, flush=True)

# pin patch: upper-left of the top fold
pin = sheet.vertex_groups.new(name='pin')
grab = [i for i, v in enumerate(verts) if v.co.x < -PW * 0.15 and v.co.z > PH - 0.05 and abs(v.co.y) < 0.35]
pin.add(grab, 1.0, 'REPLACE')
grab_c = sum((verts[i].co for i in grab), Vector()) / max(1, len(grab))
print('grab verts', len(grab), grab_c, flush=True)

hook_target = bpy.data.objects.new('Grab', None)
scene.collection.objects.link(hook_target)
hook = sheet.modifiers.new('Hook', 'HOOK')
hook.object = hook_target
hook.vertex_indices_set(grab)
hook.center = (0, 0, 0)

# yank path: slight lift (anticipation) from 1.4s, violent pull up-left at 1.8s,
# sweeping toward camera so the trailing fabric wipes frame by ~2.75s
keys = [
    (0.00, (0, 0, 0)),
    (1.40, (0, 0, 0)),
    (1.80, (-0.05, -0.05, 0.18)),
    (2.10, (-0.35, -0.45, 0.42)),
    (2.40, (-0.75, -1.05, 0.58)),
    (2.70, (-1.15, -1.75, 0.62)),
    (2.90, (-1.50, -2.30, 0.66)),
]
for t, loc in keys:
    hook_target.location = loc
    hook_target.keyframe_insert('location', frame=t2f(t))
sim = cloth_settings(sheet, (1, LAST_FRAME))
sim.settings.vertex_group_mass = 'pin'
sim.settings.pin_stiffness = 1.0
sub = sheet.modifiers.new('Subd', 'SUBSURF')
sub.levels = 1
sub.render_levels = 2

# ---------------------------------------------------------------- satin material
mat = bpy.data.materials.new('Satin')
mat.use_nodes = True
nt = mat.node_tree
N, L = nt.nodes, nt.links
pb = N['Principled BSDF']
pb.inputs['Base Color'].default_value = (0.008, 0.008, 0.009, 1)
pb.inputs['Roughness'].default_value = 0.32
pb.inputs['Specular IOR Level'].default_value = 0.6
pb.inputs['Anisotropic'].default_value = 0.65
pb.inputs['Sheen Weight'].default_value = 0.6
pb.inputs['Sheen Roughness'].default_value = 0.35
pb.inputs['Sheen Tint'].default_value = (0.6, 0.6, 0.6, 1)

uvn = N.new('ShaderNodeUVMap')
mapping = N.new('ShaderNodeMapping')
# logo sits on the front face: ~0.40m tall on a 3.9m-deep sheet
logo_h = 0.46
sx, sy = CW / logo_h, CD / logo_h
mapping.inputs['Scale'].default_value = (sx, sy, 1)
mapping.inputs['Location'].default_value = (0.5 - logo_uv.x * sx, 0.5 - logo_uv.y * sy, 0)
img = N.new('ShaderNodeTexImage')
img.image = bpy.data.images.load(os.path.join(HERE, 'logo_mask.png'))
img.image.colorspace_settings.name = 'Non-Color'
img.extension = 'CLIP'
img.interpolation = 'Cubic'
L.new(uvn.outputs['UV'], mapping.inputs['Vector'])
# the sheet's UV y runs front->back; flip so the mark reads upright on the front face
flip = N.new('ShaderNodeMapping')
flip.inputs['Location'].default_value = (1, 1, 0)
flip.inputs['Scale'].default_value = (-1, -1, 1)
L.new(mapping.outputs['Vector'], flip.inputs['Vector'])
L.new(flip.outputs['Vector'], img.inputs['Vector'])

logo_col = N.new('ShaderNodeMix')
logo_col.data_type = 'RGBA'
logo_col.inputs[6].default_value = (0.008, 0.008, 0.009, 1)
logo_col.inputs[7].default_value = (0.045, 0.045, 0.048, 1)
L.new(img.outputs['Color'], logo_col.inputs['Factor'])
L.new(logo_col.outputs[2], pb.inputs['Base Color'])

rough = N.new('ShaderNodeMapRange')
rough.inputs['To Min'].default_value = 0.34
rough.inputs['To Max'].default_value = 0.22
L.new(img.outputs['Color'], rough.inputs['Value'])
L.new(rough.outputs['Result'], pb.inputs['Roughness'])

# emboss + fine weave
weave = N.new('ShaderNodeTexWave')
weave.inputs['Scale'].default_value = 900
weave.inputs['Distortion'].default_value = 0.5
weave.bands_direction = 'X'
L.new(uvn.outputs['UV'], weave.inputs['Vector'])
blur_logo = N.new('ShaderNodeMath')
blur_logo.operation = 'MULTIPLY'
blur_logo.inputs[1].default_value = 1.0
L.new(img.outputs['Color'], blur_logo.inputs[0])
h = N.new('ShaderNodeMath')
h.operation = 'MULTIPLY_ADD'
h.inputs[1].default_value = 0.03
L.new(weave.outputs['Fac'], h.inputs[0])
L.new(blur_logo.outputs[0], h.inputs[2])
bump = N.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = 0.55
bump.inputs['Distance'].default_value = 0.004
L.new(h.outputs[0], bump.inputs['Height'])
L.new(bump.outputs['Normal'], pb.inputs['Normal'])
sheet.data.materials.append(mat)

# ---------------------------------------------------------------- lights
def area(name, loc, rot, size, size_y, energy_keys, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.shape = 'RECTANGLE'
    ld.size, ld.size_y = size, size_y
    ld.color = color
    ob = bpy.data.objects.new(name, ld)
    scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = [math.radians(a) for a in rot]
    for t, e in energy_keys:
        ld.energy = e
        ld.keyframe_insert('energy', frame=t2f(t))
    return ob


# top rim: just behind and above the slab, grazing the top fold toward camera
area('Rim', (0, 0.55, PH + 0.9), (-35, 0, 0), 2.2, 0.25, [(0, 0), (0.25, 40), (0.9, 900), (2.9, 1000)])
# back kickers carve the side silhouettes
area('KickL', (-1.5, 1.2, PH + 0.3), (-60, -45, 0), 0.5, 2.0, [(0, 0), (0.5, 0), (1.1, 260)])
area('KickR', (1.5, 1.2, PH + 0.3), (-60, 45, 0), 0.5, 2.0, [(0, 0), (0.5, 0), (1.1, 260)])
# soft top-front key: brings up the embossed mark at ~1.0s
area('Key', (0.0, -1.6, PH + 1.6), (40, 0, 0), 2.5, 1.2, [(0, 0), (0.6, 0), (1.05, 110), (2.9, 130)])

world = bpy.data.worlds.new('W')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0, 0, 0, 1)
scene.world = world

# ---------------------------------------------------------------- camera
cam_d = bpy.data.cameras.new('Cam')
cam_d.lens = 50
cam_d.dof.use_dof = True
cam_d.dof.aperture_fstop = 2.2
cam = bpy.data.objects.new('Cam', cam_d)
scene.collection.objects.link(cam)
scene.camera = cam
focus = bpy.data.objects.new('Focus', None)
scene.collection.objects.link(focus)
focus.location = (0, -PD / 2 - 0.05, PH * 0.75)
cam_d.dof.focus_object = focus
aim = bpy.data.objects.new('Aim', None)
scene.collection.objects.link(aim)
tr = cam.constraints.new('TRACK_TO')
tr.target = aim
tr.track_axis = 'TRACK_NEGATIVE_Z'
tr.up_axis = 'UP_Y'

# slow push-in; reference holds the box top ~15% from frame top
cam_keys = [
    (0.0, (0.08, -3.90, 1.90), (0.0, 0, 1.12)),
    (1.8, (0.04, -3.25, 1.88), (0.0, 0, 1.18)),
    (2.9, (-0.25, -2.30, 1.95), (-0.25, 0, 1.30)),
]
for t, cl, al in cam_keys:
    cam.location = cl
    cam.keyframe_insert('location', frame=t2f(t))
    aim.location = al
    aim.keyframe_insert('location', frame=t2f(t))
# 8 degree Dutch tilt builds during the pull
cam.rotation_euler = (0, 0, 0)

# ---------------------------------------------------------------- render
r = scene.render
r.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 6
r.resolution_x, r.resolution_y = 1920, 1080
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
    slab.is_holdout = True
    floor.is_holdout = True

out_dir = os.path.join(HERE, 'frames')
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
