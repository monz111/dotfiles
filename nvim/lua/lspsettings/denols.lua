return {
  setup = {
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
