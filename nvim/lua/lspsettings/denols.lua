return {
  root_dir = require("lspconfig").util.root_pattern("deno.json", "deno.jsonc"),
  settings = {
    init_options = {
      lint = true,
      unstable = true,
      suggest = {
        imports = {
          hosts = {
            ["https://deno.land"] = true,
            ["https://cdn.nest.land"] = true,
            ["https://crux.land"] = true,
            ["https://esm.sh/"] = true,
          },
        },
      },
    },
  },
}
