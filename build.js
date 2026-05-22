import { build } from "esbuild";

const files = [
  { entry: "index.js", outfile: "dist/index.js" },
  { entry: "git.js", outfile: "dist/git.js" },
  { entry: "run.js", outfile: "dist/run.js" },
  { entry: "install.js", outfile: "dist/install.js" },
];

Promise.all(
  files.map((file) =>
    build({
      entryPoints: [file.entry],
      bundle: true,
      platform: "node",
      outfile: file.outfile,
      minify: true,
      sourcemap: false,
      format: "esm",
      banner: {
        js: "#!/usr/bin/env node",
      },
    }),
  ),
).catch(() => process.exit(1));
