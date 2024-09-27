local M = {
  "nvim-treesitter/nvim-treesitter",
  dependencies = {
    "windwp/nvim-ts-autotag",
  },
  event = { "BufReadPost", "BufNewFile" },
  build = ":TSUpdate",
}

function M.config()
  require("nvim-treesitter.configs").setup {
    ensure_installed = {
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
    },
    highlight = { enable = true },
    indent = { enable = true },
  }
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
end

return M
