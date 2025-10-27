#!/bin/bash
# -----------------------------------------------
# Project Structure Tree Viewer
# Lists all files and directories recursively
# in a neat tree-like format for key folders.
# -----------------------------------------------

folders=("app" "assets" "components" "controllers" "data" "config" "models" "utils" "styles")

for folder in "${folders[@]}"; do
  if [ -d "$folder" ]; then
    echo ""
    echo "📁 $folder/"
    # Use find to list recursively, ignoring the root itself
    find "$folder" -mindepth 1 | sed -e "s|[^/]*/|  |g" -e "s|  \([^/]*\)$|  ├── \1|"
  fi
done
