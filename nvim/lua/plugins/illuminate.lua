local M = {
  "RRethy/vim-illuminate",
  event = "VeryLazy",
}

function M.config()
  require("illuminate").configure {
    filetypes_denylist = {
      "mason",
      "harpoon",
      "DressingInput",
      "NeogitCommitMessage",
      "qf",
      "dirvish",
      "oil",
      "minifiles",
      "fugitive",
      "alpha",
      "NvimTree",
      "lazy",
      "NeogitStatus",
      "Trouble",
      "netrw",
      "lir",
      "DiffviewFiles",
      "Outline",
      "Jaq",
      "spectre_panel",
      "toggleterm",
      "DressingSelect",
      "TelescopePrompt",
      "snacks",
      "snacks_dashboard",
      "snacks_picker_input",
      "snacks_picker_list",
      "snacks_picker_preview",
    },
  }
end

return M
