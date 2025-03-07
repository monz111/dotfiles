local M = {
  "saghen/blink.cmp",
  build = "cargo build --release",
  -- event = { "LspAttach" },
  dependencies = {
    { "rafamadriz/friendly-snippets" },
  },
  opts_extend = { "sources.default", "sources.per_filetype", "sources.providers" },
}

function M.config()
  local function is_before_closing_char()
    return vim.fn.col "." - 1 > 0
      and vim.fn.getline("."):sub(vim.fn.col "." - 1, vim.fn.col "." - 1):match "[%)%>%]'\"]"
  end

  require("blink.cmp").setup {
    keymap = {
      preset = "none",
      ["<CR>"] = { "accept", "fallback" },
      ["<Up>"] = { "select_prev", "fallback" },
      ["<Down>"] = { "select_next", "fallback" },
      ["<C-k>"] = { "select_prev", "fallback_to_mappings" },
      ["<C-j>"] = { "select_next", "fallback_to_mappings" },
      ["<Tab>"] = {
        function(cmp)
          if cmp.is_menu_visible() then
            return cmp.select_next()
          elseif is_before_closing_char() then
            require("neotab").tabout()
          end
        end,
        "select_next",
        "snippet_forward",
        "fallback",
      },
    },
    signature = { enabled = true },
    completion = {
      menu = {
        min_width = 25,
        draw = {
          padding = 1,
          gap = 2,
        },
      },
      documentation = {
        auto_show = true,
        auto_show_delay_ms = 0,
      },
      ghost_text = { enabled = true },
    },
    appearance = {
      use_nvim_cmp_as_default = true,
      nerd_font_variant = "mono",
    },
    sources = {
      default = { "lsp", "path", "snippets", "buffer", "markdown", "dadbod" },
      per_filetype = {
        sql = { "snippets", "dadbod", "buffer" },
      },
      providers = {
        markdown = {
          name = "RenderMarkdown",
          module = "render-markdown.integ.blink",
          fallbacks = { "lsp" },
        },
        dadbod = {
          name = "Dadbod",
          module = "vim_dadbod_completion.blink",
        },
      },
    },
    fuzzy = { implementation = "prefer_rust_with_warning" },
  }
end

return M
