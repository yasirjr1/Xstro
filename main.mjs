import * as bot from "./release/index.mjs";


(async () => {
    await bot.loadPlugins();
    await bot.client();
})();
