local M = {
  'Wansmer/treesj',
  dependencies = { 'nvim-treesitter/nvim-treesitter' },
}

function M.config()
  require('treesj').setup()
  local wk = require "which-key"
  wk.add {
    { "<leader>m", "<cmd>TSJToggle<cr>", desc = "Treesj Toggle" },
  }
end

return M
