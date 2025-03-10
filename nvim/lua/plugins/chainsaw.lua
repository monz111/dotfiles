local M = {
  "chrisgrieser/nvim-chainsaw",
}

function M.config()
  require("chainsaw").setup ()
  local wk = require "which-key"
  wk.add {
    { "<leader>s", "<CMD>lua require('chainsaw').variableLog()<CR>", desc = "LSP" },
    { "<leader>S", "<CMD>lua require('chainsaw').objectLog()<CR>", desc = "LSP" },
  }
end

return M
