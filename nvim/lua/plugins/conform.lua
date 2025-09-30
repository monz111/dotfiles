local M = {
  "stevearc/conform.nvim",
  keys = {
    {
      -- Customize or remove this keymap to your liking
      "<leader>=",
      function()
        require("conform").format { async = true }
      end,
      mode = "",
      desc = "Format buffer",
    },
  },
}

function M.config()
  local conform = require "conform"

  conform.setup {
    formatters_by_ft = {
      lua = { "stylua" },
      javascript = { "biome" },
      typescript = { "biome" },
      json = { "jq" },
      jsonc = { "biome" },
      javascriptreact = { "prettierd" },
      typescriptreact = { "prettier" },
      php = { "php-cs-fixer" },
      markdown = { "markdownlint" },
      html = { "htmlbeautifier" },
      bash = { "beautysh" },
      rust = { "rustfmt" },
      yaml = { "yamlfix" },
      toml = { "taplo" },
      css = { "prettierd" },
      scss = { "prettierd" },
      sh = { { "shfmt" } },
      sql = { { "sql-formatter" } },
      mysql = { { "sql-formatter" } },
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

  -- fidget
  local fidget = require "fidget"
  local function format_with_fidget()
    local success = conform.format { async = true }
    if success then
      fidget.notify "󰉼 File formatted 󰸞"
    else
      fidget.notify("󰉼 File format failed", vim.log.levels.ERROR, { annote = "File format failed" })
    end
  end

  -- which-key
  local wk = require "which-key"
  wk.add {
    { "<leader>=", format_with_fidget, desc = "Formatting" },
  }
end

return M
