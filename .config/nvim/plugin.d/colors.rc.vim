set termguicolors

if has('nvim')
  colorscheme kanagawa
  highlight Visual guifg=#FFFFFF guibg=SlateBlue gui=none term=reverse cterm=reverse
else
  colorscheme hybrid
endif

highlight CursorLine term=bold cterm=bold guibg=Grey10
highlight Normal ctermbg=NONE guibg=NONE
highlight NonText ctermbg=NONE guibg=NONE
highlight SpecialKey ctermbg=NONE guibg=NONE
highlight EndOfBuffer ctermbg=NONE guibg=NONE
highlight Comment guifg=gray60
