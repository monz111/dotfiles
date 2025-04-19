local M = {
  "chrisgrieser/nvim-chainsaw",
}

function M.config()
  require("chainsaw").setup()
  local wk = require "which-key"
  wk.add {
    { "<leader>s", "<CMD>lua require('chainsaw').variableLog()<CR>", desc = "Chainsaw Log" },
    { "<leader>S", "<CMD>lua require('chainsaw').objectLog()<CR>", desc = "Chainsaw ObjectLog" },
  }
end

return M
