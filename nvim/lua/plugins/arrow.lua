local M = {
  "otavioschwanck/arrow.nvim",
  dependencies = {
    { "echasnovski/mini.icons" },
  },
}

function M.config()
  require("arrow").setup {
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
    { "mm", "<cmd>Arrow toggle_current_line_for_buffer<CR>", desc = "Mark this line" },
    { "mn", "<cmd>Arrow next_buffer_bookmark<CR>", desc = "Mark Next" },
    { "mp", "<cmd>Arrow next_buffer_bookmark<CR>", desc = "Mark Preview" },
  }
end

return M
