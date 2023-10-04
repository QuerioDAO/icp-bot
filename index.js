const config = require('./config');
const { runMigrations } = require("./migrations");
const { Crawler } = require("./crawler");
const { INFO, ERROR } = require("./logs");

let crawler = new Crawler(config.ic_api, config.db_file, config.content_miner_api);

let stop = false;

const pause = (timeout) =>
    new Promise((res) => setTimeout(res, timeout * 1000));

const mainLoop = async (_) => {
    try {
       await runMigrations(config.db_file);
       
        while (!stop) {
            await crawler.run();

            INFO(`pause for 24 hours`);
            await pause(24 * 3600);
        }
    } catch (error) {
        ERROR(`[mainLoop] error :`);
        console.error(error);
        ERROR(`shutting down`);
        process.exit(1);
    }
};

mainLoop();

function shutdown(exitCode = 0) {
    stop = true;
    setTimeout(() => {
        INFO(`shutdown`);
        process.exit(exitCode);
    }, 3000);
}
//listen for TERM signal .e.g. kill
process.on("SIGTERM", shutdown);
// listen for INT signal e.g. Ctrl-C
process.on("SIGINT", shutdown);
