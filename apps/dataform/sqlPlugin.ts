import { plugin } from "bun";

await plugin({
  name: "SQL",
  async setup(build) {
    build.onLoad({ filter: /\.(sql)$/ }, async (args) => {
      const text = await Bun.file(args.path).text();
      return {
        contents: `export default ${JSON.stringify(text)};`,
        loader: "js",
      };
    });
  },
});