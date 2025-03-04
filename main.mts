import * as bot from "./src/index.mjs";

(async () => {
    await bot.loadPlugins();
    await bot.client();
})();
