let g:bookmark_sign = '📮 '
let g:bookmark_annotation_sign = '🧽 '
let g:bookmark_save_per_working_dir = 0
let g:bookmark_auto_save = 1
let g:bookmark_center = 1
nmap <Leader><Leader> <Plug>BookmarkToggle
nmap <Leader>i <Plug>BookmarkAnnotate
nmap <Leader>a <Plug>BookmarkShowAll
nmap <Leader>j <Plug>BookmarkNext
nmap <Leader>k <Plug>BookmarkPrev
nmap <Leader>x <Plug>BookmarkClearAll
