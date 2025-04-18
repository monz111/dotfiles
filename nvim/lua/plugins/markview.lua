local M = {
  "MeanderingProgrammer/render-markdown.nvim",
  version = "v8.3.0",
  dependencies = { "nvim-treesitter/nvim-treesitter", "echasnovski/mini.icons" },
}

function M.config()
  require("render-markdown").setup {
    render_modes = { "n", "c", "t" },
    completions = { blink = { enabled = true } },
    latex = { enabled = false },
    checkbox = {
      checked = { icon = "✔ " },
    },
    bullet = {
      enabled = true,
      icons = { "", "◦", "⬥", "⬦", "⬧", "⬨" },
    },
    sign = {
      enabled = true,
    },
    heading = {
      border = true,
      border_virtual = true,
      width = "block",
      min_width = 50,
    },
    code = {
      enabled = true,
      sign = true,
      style = "full",
      position = "left",
      language_icon = true,
      language_name = true,
      highlight_border = false,
      width = "block",
      left_margin = 1,
      left_pad = 2,
      right_pad = 4,
      min_width = 40,
    },
  }
end

return M
