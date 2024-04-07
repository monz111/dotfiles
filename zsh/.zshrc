export LANGUAGE="ja_JP.UTF-8"
export LANG="${LANGUAGE}"
export LC_ALL="${LANGUAGE}"
export GIT_EDITOR=nvim
export ZSH=~/.oh-my-zsh
source $ZSH/oh-my-zsh.sh

ZSH_THEME="wezm"

plugins=(git tmux zsh-syntax-highlighting zsh-completions wakatime zsh-autosuggestions)

autoload -U compinit && compinit -u

# Color
export LSCOLORS=Exfxcxdxbxegedabagacad
export ZLS_COLORS=$LS_COLORS
export CLICOLOR=true

# History
HISTFILE=$HOME/.zsh_history
HISTSIZE=10000
SAVEHIST=10000
DIRSTACKSIZE=100

autoload -U compinit vcs_info
compinit -u

setopt auto_menu
setopt auto_cd
setopt no_beep
setopt auto_pushd
setopt multios
setopt print_eight_bit
setopt extended_history
setopt hist_reduce_blanks
setopt correct
setopt extended_history
setopt append_history
setopt inc_append_history
setopt hist_save_no_dups
setopt hist_no_functions
setopt hist_no_store
setopt hist_ignore_dups

# Command
export PATH=/usr/local/bin:$PATH

# Git
fpath=($(brew --prefix)/share/zsh/site-functions $fpath)

# Node
export PATH=$HOME/.nodebrew/current/bin:$PATH
