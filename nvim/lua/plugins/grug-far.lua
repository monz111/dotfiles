local M = {
  "MagicDuck/grug-far.nvim",
}

M.config = function()
  require("grug-far").setup {}

  local wk = require "which-key"
  wk.add {
    { "<leader>r", "<cmd>lua require('grug-far').open({ prefills = { search = vim.fn.expand('<cword>') } })<CR>", desc = "Search and Replace" },
  }
end

return M
