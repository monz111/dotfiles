local M = {
  "nvim-treesitter/nvim-treesitter",
  branch = "main",
  lazy = false,
  build = ":TSUpdate",
  dependencies = {
    "windwp/nvim-ts-autotag",
  },
}

function M.config()
  require("nvim-treesitter").setup {
    install_dir = vim.fn.stdpath "data" .. "/site",
  }

  require("nvim-treesitter").install {
    "lua",
    "html",
    "markdown",
    "markdown_inline",
    "bash",
    "vim",
    "vimdoc",
    "rust",
    "typescript",
    "javascript",
    "toml",
    "regex",
    "css",
    "tsx",
  }

  vim.api.nvim_create_autocmd("FileType", {
    callback = function(args)
      local lang = vim.treesitter.language.get_lang(vim.bo[args.buf].filetype)
      if lang and pcall(vim.treesitter.start, args.buf, lang) then
        vim.bo[args.buf].indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
      end
    end,
  })

  require("nvim-ts-autotag").setup {
    aliases = {
      ["html"] = "html",
      ["javascript"] = "html",
      ["jsx"] = "html",
      ["markdown"] = "html",
      ["php"] = "html",
      ["tsx"] = "html",
      ["typescript"] = "html",
      ["xml"] = "html",
    },
  }

  local catpuccin = require "catppuccin.palettes.mocha"
  vim.api.nvim_set_hl(0, "TreesitterContextBottom", { bg = catpuccin.base, underline = false })
end

return M
