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
      json = { "biome" },
      jsonc = { "biome" },
      javascriptreact = { "biome" },
      typescriptreact = { "prettier" },
      php = { { "intelephense", "prettier" } },
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
        args = {
          "format",
          "--write",
          ("--config-path=" .. os.getenv "HOME" .. "/dotfiles/biome/"),
          "--stdin-file-path",
          "$FILENAME",
        },
      },
    },
  }
  -- dadbod
  vim.filetype.add {
    pattern = { [".*-query-[^%.]*"] = "sql" },
  }
  vim.keymap.set({ "n", "v" }, "<leader>=", function()
    conform.format {
      lsp_fallback = true,
      async = false,
      timeout_ms = 1000,
    }
  end, { desc = "Format buffe" })
end

return M
