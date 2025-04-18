local M = {
  "petertriho/nvim-scrollbar",
}

function M.config()
  require("scrollbar").setup {
    handle = {
      blend = 0, -- Integer between 0 and 100. 0 for fully opaque and 100 to full transparent. Defaults to 30.
    },
  }
end

return M
