local M = {
  "mason-org/mason-lspconfig.nvim",
  dependencies = {
    { "mason-org/mason.nvim", opts = {} },
    "neovim/nvim-lspconfig",
  },
}

function M.config()
  local lspconfig = require "lspconfig"
  local mason_lspconfig = require "mason-lspconfig"
  require("mason").setup { ui = { border = "none" } }

  --  https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md#denols
  --  https://docs.deno.com/runtime/getting_started/setup_your_environment/#neovim-0.6%2B-using-the-built-in-language-server
  lspconfig.denols.setup {
    on_attach = on_attach,
    root_dir = lspconfig.util.root_pattern("deno.json", "deno.jsonc"),
    settings = require "lspsettings/denols"
  }

  lspconfig.ts_ls.setup {
    on_attach = on_attach,
    root_dir = lspconfig.util.root_pattern "package.json",
    single_file_support = false,
  }

  local active_server = {
    "lua_ls",
    "cssls",
    "html",
    "ts_ls",
    "bashls",
    "jsonls",
    "denols",
    "intelephense",
    "marksman",
    "eslint",
  }

  mason_lspconfig.setup {
    ensure_installed = active_server,
    automatic_enable = false,
  }
end

return M
