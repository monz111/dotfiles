let mapleader="\<Space>"

map K gt
map J gT

tnoremap <Esc> <C-\><C-n>
inoremap <silent> jj <ESC>

nmap <Leader>q <Home>
nmap <Leader>e <End>
nmap <Leader>t :tabnew<CR>
nmap <Leader>w :tabclose<CR>

nnoremap <Leader>ss :source ~/.config/nvim/init.vim<CR>
nnoremap <Leader>sv :vsp ~/.config/nvim/init.vim<CR>
nnoremap <Leader>si :PlugInstall<CR>
