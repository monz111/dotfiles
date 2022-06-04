command Sov so ~/.vimrc

if has('nvim')
	command! -nargs=* T split | wincmd j | resize 5 | terminal <args>
	autocmd TermOpen * startinsert
endif

autocmd FileType php setlocal tabstop=4 softtabstop=4 shiftwidth=4

augroup my-glyph-palette
  autocmd! *
  autocmd FileType fern call glyph_palette#apply()
  autocmd FileType nerdtree,startify call glyph_palette#apply()
augroup END

augroup vimrc_syntax
  autocmd!
  highlight default ExtraWhitespace ctermbg=red guibg=red
  autocmd VimEnter,WinEnter,BufRead *
        \ call matchadd('ExtraWhitespace', "[\u2000-\u200B\u3000]")
augroup END

function! s:load_configurations() abort
  for path in glob('~/dotfiles/.config/nvim/plugin.d/*.vim', 1, 1, 1)
    execute printf('source %s', fnameescape(path))
  endfor
  if(has('nvim'))
    for path in glob('~/dotfiles/.config/nvim/plugin.d/*.lua', 1, 1, 1)
      execute printf('source %s', fnameescape(path))
    endfor
  end
endfunction

call s:load_configurations()
