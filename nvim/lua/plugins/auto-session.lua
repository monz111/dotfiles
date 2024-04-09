local M = {
  "rmagatti/auto-session",
}

function M.config()
  require("auto-session").setup {
    log_level = "error",
    auto_session_suppress_dirr = { "~/", "~/Downloads", "/", "~/Projects" },
    auto_session_root_dir = vim.fn.stdpath "data" .. "/sessions/",
    auto_session_use_git_branch = true,
    auto_save_enabled = false,
    auto_restore_enabled = false,
    session_lens = {
      buftypes_to_ignore = {},
      load_on_setup = true,
      theme_conf = { border = true },
      previewer = false,
    },
  }

  vim.keymap.set("n", "<Leader>s", require("auto-session.session-lens").search_session, {
    noremap = true,
  })

  local wk = require "which-key"
  wk.register {
    ["<leader> r"] = { ":echo ' Session has been restored.' | SessionRestore<cr>", "Session Resotore" },
    ["<leader>ss"] = { ":echo ' Session has been saved.' | SessionSave<cr>", "Session Save" },
    ["<leader>sl"] = { "<cmd>Autosession search<cr>", "Sassion List" },
    ["<leader>sd"] = { "<cmd>Autosession delete<cr>", "Sassion Delete" },
  }
end

return M
