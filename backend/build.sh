#!/bin/bash
set -e

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install --prefer-binary -r requirements.txt

echo "Build complete!"
