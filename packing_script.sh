#!/bin/bash

# Companion module ESPHome API build script

# Clean up and create fresh directory structure
rm -rf /tmp/esphome-module
mkdir -p /tmp/esphome-module/companion

# Copy necessary files
cp /home/bence/Dokumentumok/VSCode/companion-module-esphome-api/pkg/main.js /tmp/esphome-module/
cp /home/bence/Dokumentumok/VSCode/companion-module-esphome-api/package.json /tmp/esphome-module/
cp /home/bence/Dokumentumok/VSCode/companion-module-esphome-api/companion/manifest.json /tmp/esphome-module/companion/

# Navigate to temp directory
cd /tmp/esphome-module || exit 1

# Create the tar archive
tar -czvf /home/bence/Dokumentumok/VSCode/companion-module-esphome-api/companion-module-esphome-api-3.0.6.tgz .

echo "Build complete: companion-module-esphome-api-3.0.6.tgz created successfully"
