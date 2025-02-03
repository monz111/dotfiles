export LANGUAGE="ja_JP.UTF-8"
export LANG="${LANGUAGE}"
export LC_ALL="${LANGUAGE}"
export GIT_EDITOR=nvim
export ZSH=$HOME/.oh-my-zsh

ZSH_THEME="wezm"

plugins=(git tmux zsh-syntax-highlighting zsh-completions zsh-autosuggestions dotenv)

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

fpath+=${ZSH_CUSTOM:-${ZSH:-~/.oh-my-zsh}/custom}/plugins/zsh-completions/src

export PATH=/usr/local/bin:$PATH
export PATH=$HOME/bin:$PATH
export PATH="/opt/homebrew/opt/icu4c/bin:$PATH"
export PATH="/opt/homebrew/opt/icu4c/sbin:$PATH"

source $ZSH/oh-my-zsh.sh
source ~/.zprofile

# pnpm
export PNPM_HOME="/Users/monz/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end

fssh() {
    local sshLoginHost
    sshLoginHost=`cat ~/.ssh/config | grep -i ^host | awk '{print $2}' | fzf`
    if [ "$sshLoginHost" = "" ]; then
        return 1
    fi
    ssh ${sshLoginHost}
}

eval "$(zoxide init --cmd cd zsh)"

export FZF_DEFAULT_OPTS=" \
--color=bg+:#313244,bg:#1e1e2e,spinner:#f5e0dc,hl:#f38ba8 \
--color=fg:#cdd6f4,header:#f38ba8,info:#cba6f7,pointer:#f5e0dc \
--color=marker:#b4befe,fg+:#cdd6f4,prompt:#cba6f7,hl+:#f38ba8 \
--color=selected-bg:#45475a \
--multi"

#sesh session-list
alias sl="sesh list -c -z | fzf-tmux"
export PATH="/opt/homebrew/opt/python@3.9/bin:$PATH"
