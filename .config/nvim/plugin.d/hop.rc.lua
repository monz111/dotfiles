require'hop'.setup()
vim.api.nvim_set_keymap('n', 'f', "<cmd> lua require'hop'.hint_words({ hint_position = require'hop.hint'.HintPosition.END })<cr>", {})
