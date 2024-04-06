local M = {
  "kylechui/nvim-surround",
  version = "*",
  event = "VeryLazy",
  config = function()
  end,
}

function M.config()
  require("nvim-surround").setup {}
end

return M
