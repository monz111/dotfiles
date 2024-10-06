#!/bin/zsh

source ~/.zshrc
pj2
tmux split-window -v -l 60
tmux send-keys -t 1 "redb" C-m
tmux send-keys -t 2 "pnpm start"
tmux select-pane -t 2
