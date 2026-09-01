#!/bin/bash
set -e

echo "Installing Python dependencies (binary wheels only)..."
pip install --upgrade pip setuptools wheel
pip install --only-binary :all: -r requirements.txt 2>&1 || pip install -r requirements.txt

echo "Build complete!"
