const axios = require('axios');
const { INFO, ERROR } = require("./logs");
const { DB } = require("./db");
const { canisterCodeHash } = require("./canisterinfo");
const { ContentMinerClient } = require('./client');
const cheerio = require("cheerio");

const pause = (timeout) => new Promise((res) => setTimeout(res, timeout * 1000));

class Crawler {
    constructor(ic_api, db_file, content_miner_api) {
        this.ic_api = ic_api;
        this.db = new DB(db_file);
        this.contentMinerClient = new ContentMinerClient(content_miner_api);
    }

    getCanisterUrl(canister_id, domain) {
        return `https://${canister_id}.${domain}`;
    }

    async getCanisterMetadata(canister_id, domain) {
        let metadata = {
            canister_id: canister_id,
        };
        try {
            metadata.domain = domain;
            let response = await axios(this.getCanisterUrl(canister_id, domain), { timeout: 10000 });
            const html_data = response?.data;

            if (response?.status == 200 && html_data) {
                const $ = cheerio.load(html_data);
                let title = $('meta[property="og:title"]').attr("content") ||
                    $("title").text() ||
                    $('meta[name="title"]').attr("content");

                metadata.title = title.replace(/(\r\n|\n|\r)/gm, "");
            }

            metadata.code_hash = await canisterCodeHash(canister_id);
            metadata.status = response?.status;
        }
        catch (error) {
            if (error?.response?.status) {
                metadata.status = error?.response?.status;
            }
        }

        return metadata;
    }

    async run() {
        let offset = 0;
        const limit = 50;

        try {
            const response = await axios(this.ic_api + `?offset=${offset}&limit=${limit}`);
            if (response?.data?.max_canister_index) {
                let max_canister_index = response?.data?.max_canister_index;

                INFO(`Total Canisters: ${max_canister_index}`);

                while (offset < max_canister_index) {
                    try {
                        let canisters_metadata = [];
                        const page_response = await axios(this.ic_api + `?max_canister_index${max_canister_index}&offset=${offset}&limit=${limit}`);
                        if (page_response?.data?.data?.length > 0) {
                            await Promise.all(page_response?.data?.data.map(async (c) => {
                                let should_update = true;
                                let canister_result = (await this.db.findCanister(c.canister_id))?.rows;
                                if (canister_result?.length) {
                                    let canister_data = canister_result[0];
                                    if (canister_data?.status != 200 ) {
                                        should_update = false;
                                    } 
                                }
                                
                                if (should_update) {
                                    let metadata = await this.getCanisterMetadata(c.canister_id, 'raw.ic0.app');
                                    if (metadata.status != 200) {
                                        metadata = await this.getCanisterMetadata(c.canister_id, 'icp0.io');
                                    }
                                    if (metadata) {
                                        canisters_metadata.push(metadata);
                                    }
                                } 
                            }));

                            if (canisters_metadata.length > 0) {
                                await this.db.saveCanisters(canisters_metadata);

                                for (const c of canisters_metadata) {
                                    if ((c.status == 200) && (c.title != 'Cycle Wallet')) {
                                        let url = this.getCanisterUrl(c.canister_id, c.domain);
 
                                        await this.contentMinerClient.post('/save_task', {task: { id: c.canister_id, url: url, chains: '1' }});
                                    } 
                                }
                            }
                            
                        }

                        await pause(2);

                        offset += limit;

                        INFO(`Canisters: [${offset}/${max_canister_index}] ${((offset/max_canister_index) * 100).toFixed(2)} %`);

                    } catch (error) {
                        ERROR(error);
                    }

                }
            }
        } catch (error) {
            ERROR(error);
        }
    }
}

module.exports = {
    Crawler
};

