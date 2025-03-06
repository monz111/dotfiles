local M = {
  "Wansmer/treesj",
  dependencies = { "vim-treesitter/nvim-treesitter" },
}

function M.config()
  require("treesj").setup {
    use_default_keymaps = false,
  }
  local wk = require "which-key"
  wk.add {
    { "<leader>m", "<cmd>TSJToggle<cr>", desc = "TreeSJ Toggle" },
  }
end

return M
