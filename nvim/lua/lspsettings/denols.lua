return {
  deno = {
    enable = true,
    lint = true,
    unstable = true,
    suggest = {
      autoImports = true,
      completeFunctionCalls = true,
      names = true,
      paths = true,
      imports = {
        autoDiscover = true,
        hosts = {
          ["https://deno.land"] = true,
          ["https://cdn.nest.land"] = true,
          ["https://crux.land"] = true,
          ["https://esm.sh"] = true,
        },
      },
    },
  },
}
