local M = {
  "arnamak/stay-centered.nvim",
}

function M.config()
  require("stay-centered").setup {
    -- skip_filetypes = { "lua", "typescript" },
  }

  local wk = require "which-key"
  wk.add {
    { "<leader>uc", require("stay-centered").toggle, desc = "Toggleed stay-centered" },
  }
end

return M
