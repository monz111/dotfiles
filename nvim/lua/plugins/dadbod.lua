-- ~/.local/share/db_ui
local M = {
  "kristijanhusak/vim-dadbod-ui",
  dependencies = {
    { "tpope/vim-dadbod", lazy = true },
    { "pbogut/vim-dadbod-ssh", lazy = true },
    { "kristijanhusak/vim-dadbod-completion", ft = { "sql", "mysql", "plsql" }, lazy = true },
  },
}

function M.config()
  local wk = require "which-key"
  wk.add {
    { "<leader>-", "<cmd>DBUIToggle<cr>", desc = "DB UI" },
  }

  vim.g.db_ui_show_help = 0
  -- notification
  vim.g.db_ui_use_nvim_notify = 1
  vim.g.db_ui_force_echo_notifications = 1
  -- vim.api.nvim_set_hl(0, "NotificationInfo", { fg = "#2ecc71", bg = "NONE" })
  -- vim.api.nvim_set_hl(0, "NotificationWarning", { fg = "#f1c40f", bg = "NONE" })
  -- vim.api.nvim_set_hl(0, "NotificationError", { fg = "#c0392b", bg = "NONE" })
  -- vim.g.db_ui_notification_width = 100
  vim.opt.previewheight = 40

  -- icon
  vim.g.db_ui_show_database_icon = 1
  vim.g.db_ui_use_nerd_fonts = 1
  vim.g.db_ui_icons = {
    expanded = {
      db = "󰆼",
      buffers = "",
      saved_queries = "",
      schemas = "",
      schema = "󰙅",
      tables = "󰓱",
      table = "",
    },
    collapsed = {
      db = "󰆼",
      buffers = "",
      saved_queries = "",
      schemas = "",
      schema = "󰙅",
      tables = "󰓱",
      table = "",
    },
    saved_query = "",
    new_query = "󰓰",
    tables = "󰓫",
    buffers = "󰽘﬘",
    add_connection = "󰆺",
    connection_ok = "✓",
    connection_error = "✕",
  }
end

return M
