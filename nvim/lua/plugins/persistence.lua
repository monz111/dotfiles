local M = {
  "folke/persistence.nvim",
  event = "BufReadPre",
}

function M.config()
  require("persistence").setup {
    dir = vim.fn.stdpath "state" .. "/sessions/", -- directory where session files are saved
    -- minimum number of file buffers that need to be open to save
    -- Set to 0 to always save
    need = 0,
    branch = false, -- use git branch to save session
  }
end

return M
