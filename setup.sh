#!/bin/bash

# Install system dependencies for OpenGL/GLUT and Xvfb
sudo apt-get update
sudo apt-get install -y freeglut3-dev python3-opengl xvfb

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Make the render script executable
chmod +x render_cube_animation.py

echo "Setup complete! To run the renderer:"
echo "source venv/bin/activate"
echo "xvfb-run -a ./render_cube_animation.py" 