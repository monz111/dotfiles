local M = {
  "andrewferrier/debugprint.nvim",
  dependencies = {
    "echasnovski/mini.nvim", -- Needed to enable :ToggleCommentDebugPrints for NeoVim 0.9
  },
}

function M.config()
  require("debugprint").setup {
    print_tag = "🚨DEBUG",
    keymaps = {
        normal = {
        plain_below = nil, 
        plain_above = nil,
        variable_below = "<leader>.",
        variable_above = nil,
        variable_below_alwaysprompt = nil,
        variable_above_alwaysprompt = nil,
        textobj_below = nil,
        textobj_above = nil,
        -- toggle_comment_debug_prints = "<leader>..",
        -- delete_debug_prints = "<leader>...",
      },
      visual = {
        variable_below = "<leader>.",
        variable_above = nil,
      },
    },
  }
end

return M
