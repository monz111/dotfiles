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
    "eslint",
  }
  mason_lspconfig.setup { ensure_installed = active_server }

  -- Helper function to check if current directory is a Deno project
  local function is_deno_project(fname)
    local util = lspconfig.util
    return util.root_pattern("deno.json", "deno.jsonc")(fname) ~= nil
  end

  -- INFO:
  -- The `setup_handlers` is used to configure LSP servers. For each server, it first attempts
  -- to load any custom settings. If custom settings are not found, it defaults to using the
  -- predefined settings from `lspsettings/default.lua`. The final configuration is then merged and applied
  -- to the respective LSP server setup.
  -- :help mason-lspconfig-settings
  mason_lspconfig.setup_handlers {
    function(server_name)
      -- Skip ts_ls and denols here, handle them separately
      if server_name == "ts_ls" or server_name == "denols" then
        return
      end

      local success, settings = pcall(require, "lspsettings." .. server_name)
      if not success then
        settings = {}
      end
      local final_settings = vim.tbl_deep_extend("force", default_settings, settings)
      lspconfig[server_name].setup(final_settings)
    end,

    -- Configure denols for Deno projects only
    ["denols"] = function()
      local success, settings = pcall(require, "lspsettings.denols")
      if not success then
        settings = {}
      end

      local denols_settings = vim.tbl_deep_extend("force", default_settings, settings, {
        root_dir = lspconfig.util.root_pattern("deno.json", "deno.jsonc"),
        on_attach = function(client, bufnr)
          -- Stop ts_ls if it's running in the same buffer
          local clients = vim.lsp.get_clients { bufnr = bufnr }
          for _, other_client in pairs(clients) do
            if other_client.name == "ts_ls" and other_client.id ~= client.id then
              vim.lsp.stop_client(other_client.id)
            end
          end

          -- Call original on_attach if it exists in settings
          if settings.on_attach then
            settings.on_attach(client, bufnr)
          elseif default_settings.on_attach then
            default_settings.on_attach(client, bufnr)
          end
        end,
      })

      lspconfig.denols.setup(denols_settings)
    end,

    -- Configure ts_ls for Node.js projects only (exclude Deno projects)
    ["ts_ls"] = function()
      local success, settings = pcall(require, "lspsettings.ts_ls")
      if not success then
        settings = {}
      end

      local ts_ls_settings = vim.tbl_deep_extend("force", default_settings, settings, {
        root_dir = function(fname)
          local util = lspconfig.util
          -- Don't attach to Deno projects
          if is_deno_project(fname) then
            return nil
          end
          -- Attach to Node.js projects
          return util.root_pattern("package.json", "tsconfig.json", "jsconfig.json")(fname)
        end,
        single_file_support = false,
        on_attach = function(client, bufnr)
          -- Double check: stop if this is actually a Deno project
          if is_deno_project(vim.api.nvim_buf_get_name(bufnr)) then
            vim.lsp.stop_client(client.id)
            return
          end

          -- Stop denols if it's running in the same buffer
          local clients = vim.lsp.get_clients { bufnr = bufnr }
          for _, other_client in pairs(clients) do
            if other_client.name == "denols" and other_client.id ~= client.id then
              vim.lsp.stop_client(other_client.id)
            end
          end

          -- Call original on_attach if it exists in settings
          if settings.on_attach then
            settings.on_attach(client, bufnr)
          elseif default_settings.on_attach then
            default_settings.on_attach(client, bufnr)
          end
        end,
      })

      lspconfig.ts_ls.setup(ts_ls_settings)
    end,
  }
end

return M
