call plug#begin('~/.vim/plugged')
Plug 'glidenote/memolist.vim'
Plug 'itchyny/lightline.vim'
Plug 'tpope/vim-surround'
Plug 'ervandew/supertab'
Plug 'tomtom/tcomment_vim'
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'lambdalisue/fern.vim'
Plug 'lambdalisue/fern-git-status.vim'
Plug 'lambdalisue/nerdfont.vim'
Plug 'lambdalisue/fern-renderer-nerdfont.vim'
Plug 'lambdalisue/glyph-palette.vim'
Plug 'MattesGroeger/vim-bookmarks'
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'Raimondi/delimitMate'
Plug 'simeji/winresizer'
Plug 'AndrewRadev/tagalong.vim'
if has('nvim')
  Plug 'rebelot/kanagawa.nvim'
  Plug 'echasnovski/mini.nvim', { 'branch': 'stable' }
  Plug 'nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}
  Plug 'yuki-yano/fzf-preview.vim', { 'branch': 'release/rpc' }
  Plug 'phaazon/hop.nvim'
  Plug 'nvim-treesitter/nvim-treesitter'
  Plug 'nvim-treesitter/nvim-treesitter-context'
  Plug 'nvim-lua/plenary.nvim'
  Plug 'nvim-telescope/telescope.nvim', { 'tag': '0.1.1' }
endif
call plug#end()
