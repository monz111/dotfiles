filetype plugin indent on
syntax on

let &t_8f = "\<Esc>[38;2;%lu;%lu;%lum"
let &t_8b = "\<Esc>[48;2;%lu;%lu;%lum"

if has('vim_starting')
  set nocompatible
endif

set rtp +=~/.vim
set autochdir
set backspace=indent,eol,start
set history=100
set ignorecase
set smartcase
set title
set showcmd
set laststatus=2
set showmatch
set matchtime=1
set termencoding=utf8
set encoding=utf8
set fenc=utf8
set wrap
set tabstop=2
set expandtab
set shiftwidth=2
set softtabstop=2
set hlsearch
set incsearch
set nonumber
set noswapfile
set nobackup
set autoread
set hidden
set clipboard=unnamed
set cursorline
set fileencoding=utf-8
set fileencodings=utf-8
set fileformats=unix,dos,mac
set foldlevel=99
set bomb
set binary
set ttyfast
set ruler
set autoindent
set splitright
set splitbelow
set scrolloff=3
set laststatus=2
set modeline
set modelines=10
set titleold="Terminal"
set titlestring=%F
set statusline=%F%m%r%h%w%=(%{&ff}/%Y)\ (line\ %l\/%L,\ col\ %c)\
set noerrorbells visualbell t_vb=
set mouse=a
set whichwrap=b,s,h,l,<,>,[,]
set wildignore+=*/tmp/*,*.so,*.swp,*.zip,*.pyc,*.db,*.sqlite
set shortmess+=c
set completeopt=menuone,noinsert,noselect,preview
set ambiwidth=double

if has('nvim')
  set clipboard+=unnamedplus
  set guicursor=a:blinkon0
else
  set guicursor=i:blinkwait700-blinkon400-blinkoff250
	set clipboard+=unnamed,autoselect
endif
