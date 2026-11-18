#!/bin/sh
# Copy the mods that live in ~/.config/herdr-app/mods as real folders (not symlinks,
# because their images do not show through a link) from ~/dotfiles. Symlinked mods are skipped.
src=~/dotfiles/herdr-app/mods
dst=~/.config/herdr-app/mods
for m in "$src"/*/; do
  m=$(basename "$m")
  d="$dst/$m"
  [ -d "$d" ] && [ ! -L "$d" ] || continue
  rsync -a --delete "$src/$m/" "$d/" && echo "synced $m"
done
