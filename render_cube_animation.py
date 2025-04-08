#!/usr/bin/env python3
import bpy
import os
import math
import subprocess

# Configuration parameters
cube_size = 1.0
thickness = 0.3
corner_magnitude = .2
# Animation parameters
frames_per_cycle = 120
output_dir = "frames"

def setup_scene():
    # Clear existing objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    
    # Set up camera
    bpy.ops.object.camera_add(location=(0, 0, 3))
    camera = bpy.context.active_object
    camera.rotation_euler = (0, 0, 0)
    bpy.context.scene.camera = camera
    
    # Set up lighting
    bpy.ops.object.light_add(type='SUN', location=(0, 0, 5))
    light = bpy.context.active_object
    light.data.energy = 10
    
    # Set up render settings
    bpy.context.scene.render.resolution_x = 160
    bpy.context.scene.render.resolution_y = 160
    bpy.context.scene.render.resolution_percentage = 100
    bpy.context.scene.render.image_settings.file_format = 'PNG'
    bpy.context.scene.render.engine = 'BLENDER_EEVEE_NEXT'
    
    # Set up world background
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bg.inputs[0].default_value = (0, 0, 0, 1)  # Black background
    bg.inputs[1].default_value = 1.0  # Full strength
    
    return camera

def create_cube():
    # Create a cube
    bpy.ops.mesh.primitive_cube_add(size=cube_size)
    cube = bpy.context.active_object
    
    # Convert to wireframe
    bpy.ops.object.modifier_add(type='WIREFRAME')
    cube.modifiers["Wireframe"].thickness = thickness
    cube.modifiers["Wireframe"].use_even_offset = True
    
    # Create sphere corners
    bpy.ops.mesh.primitive_uv_sphere_add(radius=corner_magnitude, location=(0, 0, 0))
    sphere = bpy.context.active_object
    
    # Create emission material
    mat = bpy.data.materials.new(name="Emission")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    # Create emission shader
    emission = nodes.new(type='ShaderNodeEmission')
    emission.inputs[0].default_value = (1, 1, 1, 1)  # White color
    emission.inputs[1].default_value = 5.0  # Strength
    
    # Create material output
    output = nodes.new(type='ShaderNodeOutputMaterial')
    
    # Link nodes
    mat.node_tree.links.new(emission.outputs[0], output.inputs[0])
    
    # Assign material to both cube and sphere
    cube.data.materials.append(mat)
    sphere.data.materials.append(mat)
    
    # Create corner spheres at each vertex
    for i in range(8):
        bpy.ops.object.duplicate()
        corner = bpy.context.active_object
        corner.location = cube.data.vertices[i].co
        corner.parent = cube
    
    # Delete the original sphere
    bpy.ops.object.select_all(action='DESELECT')
    sphere.select_set(True)
    bpy.ops.object.delete()
    
    return cube

def render_animation():
    # Setup scene
    camera = setup_scene()
    cube = create_cube()
    
    # Set up output directory
    os.makedirs(output_dir, exist_ok=True)
    bpy.context.scene.render.filepath = os.path.join(output_dir, "frame_")
    
    # Set up animation
    bpy.context.scene.frame_start = 0
    bpy.context.scene.frame_end = frames_per_cycle - 1
    
    # Animate rotation
    for frame in range(frames_per_cycle):
        bpy.context.scene.frame_set(frame)
        angle = (frame / frames_per_cycle) * 2 * math.pi
        cube.rotation_euler = (angle, angle, angle)
        cube.keyframe_insert(data_path="rotation_euler", frame=frame)
    
    # Render animation
    bpy.ops.render.render(animation=True)
    
    print(f"Rendered {frames_per_cycle} frames to {output_dir}/")

def create_gif():
    # Get all frame files
    frame_files = sorted([f for f in os.listdir(output_dir) if f.startswith('frame_') and f.endswith('.png')])
    
    # Use ffmpeg to create the GIF
    gif_path = os.path.join('.', 'spin.gif')
    input_pattern = os.path.join(output_dir, 'frame_%04d.png')
    
    # Construct ffmpeg command
    cmd = [
        'ffmpeg',
        '-y',  # Overwrite output file without asking
        '-framerate', '30',  # 60 frames per second
        '-i', input_pattern,
        '-vf', 'scale=160:160:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        '-loop', '0',
        gif_path
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"Created GIF at {gif_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error creating GIF: {e}")
    except FileNotFoundError:
        print("ffmpeg not found. Please install ffmpeg to create GIFs.")

if __name__ == "__main__":
    render_animation()
    create_gif() 