local M = {
  "xiyaowong/transparent.nvim",
}

function M.config()
  require("transparent").clear_prefix "lualine"
end

return M
