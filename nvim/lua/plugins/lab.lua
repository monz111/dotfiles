local M = {
  "0x100101/lab.nvim",
  build = "cd js && npm ci",
}

function M.config()
  local wk = require "which-key"
  wk.add {
    { "<leader>cp", "<cmd>:Lab code panel<cr>", desc = "Lab Panel" },
    { "<leader>cr", "<cmd>:Lab code run<cr>", desc = "Lab Run" },
    { "<leader>cs", "<cmd>:Lab code stop<cr>", desc = "Lab Stop" },
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
