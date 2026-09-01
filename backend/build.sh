#!/bin/bash
set -e

echo "Installing Python dependencies (binary wheels only)..."
pip install --upgrade pip
pip install --only-binary :all: -r requirements.txt

echo "Build complete!"
