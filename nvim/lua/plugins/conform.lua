local M = {
  "stevearc/conform.nvim",
}

function M.config()
  local conform = require "conform"
  local wk = require "which-key"

  conform.setup {
    formatters_by_ft = {
      lua = { "stylua" },
      javascript = { "biome" },
      typescript = { "biome" },
      json = { "jq" },
      jsonc = { "biome" },
      javascriptreact = { "prettierd" },
      typescriptreact = { "prettier" },
      php = { "php_cs_fixer" },
      markdown = { { "prettierd", "prettier" } },
      html = { "htmlbeautifier" },
      bash = { "beautysh" },
      rust = { "rustfmt" },
      yaml = { "yamlfix" },
      toml = { "taplo" },
      css = { { "prettierd", "prettier" } },
      scss = { { "prettierd", "prettier" } },
      sh = { { "shfmt" } },
      sql = { { "sql_formatter" } },
      mysql = { { "sql_formatter" } },
      ["*"] = { "codespell" },
      ["_"] = { "trim_whitespace" },
    },
    formatters = {
      stylua = {
        prepend_args = { "--indent-type", "Spaces", "--indent-width", "2" },
      },
      biome = {
        args = function(ctx)
          local config_file = vim.fs.find({ "biome.json", ".biomerc.json" }, { upward = true, path = ctx.dirname })[1]
          local config_path = config_file and vim.fn.fnamemodify(config_file, ":p:h")
            or (os.getenv "HOME" .. "/dotfiles/biome/biome.json")
          local file_path = ctx.filename or "stdin.ts"

          return {
            "format",
            "--write",
            "--config-path=" .. config_path,
            "--stdin-file-path",
            file_path,
          }
        end,
      },
    },
  }
  -- dadbod
  vim.filetype.add {
    pattern = { [".*-query-[^%.]*"] = "sql" },
  }

  local wk = require "which-key"
  wk.add {
    {
      "<leader>=",
      function()
        conform.format {
          lsp_fallback = true,
          async = false,
          timeout_ms = 1000,
        }
      end,
      desc = "Format buffer",
    },
  }
end

return M
