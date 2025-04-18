local M = {
  "windwp/nvim-autopairs",
}

M.config = function()
  require("nvim-autopairs").setup {
    check_ts = true,
    disable_filetype = { "spectre_panel" },
  }
end

return M
