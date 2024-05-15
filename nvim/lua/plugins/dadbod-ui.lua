local M = {
  "kristijanhusak/vim-dadbod-ui",
}

function M.config()
  local wk = require "which-key"
  wk.register {
    ["<leader>db"] = { "<cmd>DBUIToggle<cr>", "DB UI" },
  }
end

return M
