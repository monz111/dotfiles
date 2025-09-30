local M = {
  "smoka7/hop.nvim",
  version = "*",
}

function M.config()
  require("hop").setup { keys = "asdfqwezxciopjklnm" }

  local wk = require "which-key"
  wk.add {
    { "f", "<cmd>HopWord<cr>", desc = "HopWord" },
  }
end

return M
