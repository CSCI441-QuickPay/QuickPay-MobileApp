folders=("app" "assets" "components" "controllers" "data" "ios")

for folder in "${folders[@]}"; do
  if [ -d "$folder" ]; then
    echo ""
    echo "📁 $folder/"
    # List only files (not directories)
    find "$folder" -maxdepth 1 -type f | sed 's|'"$folder"'/|  ├── |'
  fi
done