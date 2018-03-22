let s:dein_dir = expand('~/.cache/dein')
let s:dein_repo_dir = s:dein_dir . '/repos/github.com/Shougo/dein.vim'
if &runtimepath !~# '/dein.vim'
  if !isdirectory(s:dein_repo_dir)
    execute '!git clone https://github.com/Shougo/dein.vim' s:dein_repo_dir
  endif
  execute 'set runtimepath^=' . fnamemodify(s:dein_repo_dir, ':p')
endif

set runtimepath+=~/.vim/dein/repos/github.com/Shougo/dein.vim
call dein#begin(expand('~/.vim/dein'))
call dein#add('Shougo/dein.vim')
call dein#add('kchmck/vim-coffee-script')
call dein#add('pangloss/vim-javascript')
call dein#add('mxw/vim-jsx')
" call dein#add('w0ng/vim-hybrid')
" call dein#add('junegunn/vim-easy-align')
" call dein#add('othree/html5.vim')
" call dein#add('hail2u/vim-css3-syntax')
"----------------------------------------
call dein#add('ervandew/supertab')
call dein#add('jlanzarotta/bufexplorer')
call dein#add('tomtom/tcomment_vim')
call dein#add('itchyny/lightline.vim')
call dein#add('kshenoy/vim-signature')
call dein#add('kana/vim-smartword')
call dein#add('osyo-manga/vim-over')
call dein#add('tpope/vim-fugitive')
" call dein#add('w0rp/ale')
call dein#end()

" colorscheme
syntax on
set background=dark
let g:hybrid_custom_term_colors = 0
let g:hybrid_reduced_contrast = 0
autocmd Colorscheme * highlight FullWidthSpace ctermbg=white
autocmd VimEnter * match FullWidthSpace /　/
colorscheme hybrid
"-------------------------------------

if dein#check_install()
  call dein#install()
endif
filetype plugin indent on

set nocompatible
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
set softtabstop=0
set hlsearch
set nu
set noswapfile
set nobackup
set autoread
set hidden
set clipboard=unnamed,autoselect

" ignore hjkl
noremap h <nop>
noremap j <nop>
noremap k <nop>
noremap l <nop>
" set WASD
noremap <S-a>   <left>
noremap <S-a>   <left>
noremap <S-w>   <up>
noremap <S-s>   <down>
noremap <S-d>   <right>
inoremap <silent> jj <ESC>
noremap <S-e>   $
noremap <S-q>   0
nnoremap == gg=G''
" ctags
let g:vim_tags_project_tags_command = "/usr/local/bin/ctags -R {OPTIONS} {DIRECTORY} 2>/dev/null"
let g:vim_tags_gems_tags_command = "/usr/local/bin/ctags -R {OPTIONS} `bundle show --paths` 2>/dev/null"
nnoremap <C-]> g<C-]>

" close tag
augroup MyXML
  autocmd!
  autocmd Filetype xml inoremap <buffer> </ </<C-x><C-o>
  autocmd Filetype html inoremap <buffer> </ </<C-x><C-o>
  autocmd Filetype php inoremap <buffer> </ </<C-x><C-o>
  autocmd Filetype js inoremap <buffer> </ </<C-x><C-o>
  autocmd Filetype ts inoremap <buffer> </ </<C-x><C-o>
  autocmd Filetype coffee inoremap <buffer> </ </<C-x><C-o>
augroup END
" 全角スペースハイライト
augroup HighlightTrailingSpaces
  autocmd!
  autocmd VimEnter,WinEnter,ColorScheme * highlight TrailingSpaces term=underline guibg=Red ctermbg=Red
  autocmd VimEnter,WinEnter * match TrailingSpaces /\s\+$/
augroup END

" php
autocmd FileType php setlocal sw=4 sts=0 ts=4 noet
" Sass
autocmd FileType scss setlocal sw=4 sts=0 ts=4 noet
" smartword
nmap w   <Plug>(smartword-w)
nmap b   <Plug>(smartword-b)
nmap e   <Plug>(smartword-e)
" unite.vim
nmap <silent> ,l :BufExplorer<CR>
nmap <silent> .; :Unite file_mru<CR>
au FileType unite nnoremap <silent> <buffer> <expr> <C-i> unite#do_action('split')
au FileType unite inoremap <silent> <buffer> <expr> <C-i> unite#do_action('split')

" ---------- 'osyo-manga/vim-over' ----------
" 全体置換
nnoremap <silent> <Space>o :OverCommandLine<CR>%s//g<Left><Left>
" 選択範囲置換
vnoremap <silent> <Space>o :OverCommandLine<CR>s//g<Left><Left>
" カーソルしたの単語置換
nnoremap sub :OverCommandLine<CR>%s/<C-r><C-w>//g<Left><Left>
