local M = {
  "j-morano/buffer_manager.nvim",
  dependencies = {
    { "nvim-lua/plenary.nvim" },
  },
}

function M.config()
  require("buffer_manager").setup {
    show_icons = true,
    leader_key = false, -- Recommended to be a single key
    buffer_leader_key = "<leader>m", -- Per Buffer Mappings
    per_buffer_config = {
      lines = 5, -- Number of lines showed on preview.
      sort_automatically = true, -- Auto sort buffer marks.
      treesitter_context = { line_shift_down = 2 },
    },
  }

  local wk = require "which-key"
  wk.add {
    { "<TAB>", "<CMD>lua require('buffer_manager.ui').toggle_quick_menu()<CR>", desc = "Buffer" },
    { "<leader>x", "<cmd>bdelete<CR>", desc = "Close buffer" },
  }
end

return M
