local M = {
  "0x100101/lab.nvim",
  build = "cd js && npm ci",
}

function M.config()
  local wk = require "which-key"
  wk.register {
    ["<leader>cr"] = { "<cmd>:Lab code run<cr>", "Lab Run" },
    ["<leader>cs"] = { "<cmd>:Lab code stop<cr>", "Lab Stop" },
    ["<leader>cp"] = { "<cmd>:Lab code panel<cr>", "Lab Panel" },
  }
  require("lab").setup {
    code_runner = {
      enabled = true,
    },
    quick_data = {
      enabled = false,
    },
  }
end

return M
