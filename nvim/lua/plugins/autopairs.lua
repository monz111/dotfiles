local M = {
  "windwp/nvim-autopairs",
}

M.config = function()
  require("nvim-autopairs").setup {
    check_ts = true,
    disable_filetype = { "spectre_panel" },
  }
  per_filetype = {
    ["html"] = {
      enable_close = false,
    },
  }
end

return M
