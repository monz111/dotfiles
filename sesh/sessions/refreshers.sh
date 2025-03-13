#!/bin/zsh

source ~/.zshrc
pj1

tmux split-window -v -l 10
tmux send-keys -t 1 "pj1 && nvim" C-m
tmux send-keys -t 2 "docker compose up -d && clear && docker compose exec app zsh" C-m
tmux select-pane -t 1
