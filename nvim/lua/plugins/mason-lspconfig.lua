local M = {
  "williamboman/mason-lspconfig.nvim",
  dependencies = {
    "williamboman/mason.nvim",
    "neovim/nvim-lspconfig",
  },
}

function M.config()
  local lspconfig = require "lspconfig"
  local mason_lspconfig = require "mason-lspconfig"
  local default_settings = require "lspsettings.default"
  require("mason").setup { ui = { border = "none" } }

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
  }
  mason_lspconfig.setup { ensure_installed = active_server }

  -- INFO:
  -- The `setup_handlers` is used to configure LSP servers. For each server, it first attempts
  -- to load any custom settings. If custom settings are not found, it defaults to using the
  -- predefined settings from `lspsettings/default.lua`. The final configuration is then merged and applied
  -- to the respective LSP server setup.
  -- :help mason-lspconfig-settings
  mason_lspconfig.setup_handlers {
    function(server_name)
      local success, settings = pcall(require, "lspsettings." .. server_name)
      if not success then
        settings = {}
      end
      local final_settings = vim.tbl_deep_extend("force", default_settings, settings)
      lspconfig[server_name].setup(final_settings)
    end,

    ["denols"] = function()
      lspconfig.denols.setup {
        root_dir = lspconfig.util.root_pattern "deno.json",
        on_attach = function()
          local active_clients = vim.lsp.get_active_clients()
          for _, client in pairs(active_clients) do
            -- stop tsserver if denols is already active
            if client.name == "ts_ls" then
              client.stop()
            end
          end
        end,
      }
    end,
  }
end

return M
