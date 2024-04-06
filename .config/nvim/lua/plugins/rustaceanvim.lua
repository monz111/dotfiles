local on_attach = require("plugins.lspconfig").on_attach
local capabilities = require("plugins.lspconfig").capabilities
local M = {
  "mrcjkb/rustaceanvim",
  version = "^4",
  ft = { "rust" },
  dependencies = "neovim/nvim-lspconfig",
  config = function()
    return {
      server = {
        on_attach = on_attach,
        capabilities = capabilities,
      }
    }
  end,
}

return M
