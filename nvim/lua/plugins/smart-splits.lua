local M = {
  "mrjones2014/smart-splits.nvim",
}

function M.config()
  require("smart-splits").setup {
    resize_mode = {
      quit_key = "<ESC>",
      resize_keys = { "h", "j", "k", "l" },
      silent = false,
      hooks = {
        on_enter = nil,
        on_leave = nil,
      },
    },
  }
  local icons = require "icons"
  local wk = require "which-key"
  wk.add {
    {
      "<leader>wr",
      "<cmd>lua require('smart-splits').start_resize_mode()<cr>",
      desc = "[SmartSplits] Resize Mode",
      icon = icons.ui.Resize,
    },
    {
      "<leader>wh",
      "<cmd>lua require('smart-splits').swap_buf_left()<cr>",
      desc = "Swap Left",
      icon = icons.ui.BoldArrowLeft,
    },
    {
      "<leader>wj",
      "<cmd>lua require('smart-splits').swap_buf_down()<cr>",
      desc = "Swap Down↓",
      icon = icons.ui.BoldArrowDown,
    },
    {
      "<leader>wk",
      "<cmd>lua require('smart-splits').swap_buf_up()<cr>",
      desc = "Swap Up↑",
      icon = icons.ui.BoldArrowUp,
    },
    {
      "<leader>wl",
      "<cmd>lua require('smart-splits').swap_buf_right()<cr>",
      desc = "Swap Right",
      icon = icons.ui.BoldArrowRight,
    },
  }
end

return M
