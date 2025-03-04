local M = {
  "MagicDuck/grug-far.nvim",
}

M.config = function()
  require("grug-far").setup {}

  local wk = require "which-key"
  wk.add {
    { "<leader>r", "<cmd>GrugFar<CR>", desc = "Search and Replace" },
  }
end

return M
