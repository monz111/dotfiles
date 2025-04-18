local M = {
  "brianhuster/live-preview.nvim",
  dependencies = {
    "echasnovski/mini.pick",
  },
}

function M.config()
  local wk = require "which-key"
  local icons = require "icons"

  wk.add {
    { "<leader>ps", "<CMD>LivePreview start<CR>", desc = "Live Preview Start", icon = icons.ui.Triangle },
    { "<leader>pc", "<CMD>LivePreview close<CR>", desc = "Live Preview Stop", icon = icons.ui.BoldClose },
  }
end

return M
