local M = {
  "bullets-vim/bullets.vim",
}

-- NOTE: enable the plugin only for specific filetypes, if you don't do this,
-- and you use the new snacks picker by folke, you won't be able to select a
-- file with <CR> when in insert mode, only in normal mode
-- https://github.com/folke/snacks.nvim/issues/812
--
-- This didn't work, added vim.g.bullets_enable_in_empty_buffers = 0 to
-- ~/github/dotfiles-latest/neovim/neobean/init.lua
-- ft = { "markdown", "text", "gitcommit", "scratch" },
function M.config()
  -- Disable deleting the last empty bullet when pressing <cr> or 'o'
  -- default = 1
  vim.g.bullets_delete_last_bullet_if_empty = 1

  -- (Optional) Add other configurations here
  -- For example, enabling/disabling mappings
  -- vim.g.bullets_set_mappings = 1
end

return M
