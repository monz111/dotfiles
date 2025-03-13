local M = {
  "rmagatti/auto-session",
}

M.config = function()
  require("auto-session").setup {
    suppressed_dirs = { "~/", "~/Projects", "~/Downloads", "/" },
  }
end

return M
