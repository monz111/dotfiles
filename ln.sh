#!/bin/sh
mkdir -p ~/.config/nvim
curl -LO --output-dir ~/.config/alacritty/theme https://github.com/catppuccin/alacritty/raw/main/catppuccin-mocha.toml
ln -nfs ~/dotfiles/alacritty/alacritty.toml ~/.config/alacritty/alacritty.toml
ln -nfs ~/dotfiles/nvim ~/.config/nvim
ln -nfs ~/dotfiles/tmux/.tmux.conf ~/ 
ln -nfs ~/dotfiles/zsh/.zshrc ~/ 
ln -nfs ~/dotfiles/starship/starship.toml ~/.config/starship.toml
ln -nfs ~/dotfiles/biome/.biome.json ~/
ln -nfs ~/dotfiles/kitty/ ~/.config/kitty
ln -nfs ~/dotfiles/hammerspoon/init.lua ~/.hammerspoon
ln -nfs ~/dotfiles/sesh ~/.config/sesh
ln -nfs ~/dotfiles/ghostty ~/.config/ghostty
ln -nfs ~/dotfiles/lazygit ~/.config/lazygit
ln -nfs ~/dotfiles/qutebrowser/config.py ~/.qutebrowser/config.py
ln -nfs ~/dotfiles/qutebrowser/userscripts/qute-bitwarden.js ~/.qutebrowser/userscripts/
