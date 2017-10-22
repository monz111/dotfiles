# Created by newuser for 5.0.5
export LANG=ja_JP.UTF-8
export LC_ALL=$LANG
LANG="ja_JP.UTF-8"
SUPPORTED="ja_JP.eucJP:ja_JP:ja"
LANGUAGE="ja_JP.UTF-8"
ZSH_THEME="nebirhos"

export ZSH=/home/homepage/.oh-my-zsh
plugins=(git tmux)
source $ZSH/oh-my-zsh.sh

# Color
export LSCOLORS=Exfxcxdxbxegedabagacad
export ZLS_COLORS=$LS_COLORS
export CLICOLOR=true

# History
HISTFILE=$HOME/.zsh_history
HISTSIZE=10000
SAVEHIST=10000

autoload -U compinit vcs_info
compinit -u

alias vi=vim
alias ll="ls -l"
alias la="ls -la"
alias rm="rm -i"
alias mv="mv -i"
alias cp="cp -i"
alias j="jobs"
alias f="fg"
alias .="source"
alias history="history -i 1"
alias gti="git"

DIRSTACKSIZE=100

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

# Ruby
# if which rbenv > /dev/null; then eval "$(rbenv init -)"; fi

# Node
export PATH=$HOME/.nodebrew/current/bin:$PATH
