const axios = require('axios');
const { ERROR } = require("./logs");

class ContentMinerClient {
    constructor(api) {
        this.api = api;
    }

    async get(endpoint) {
        let result = '';

        try {
            const response = await axios.get(this.api + endpoint);

            if (response?.data) {
                result = response?.data;
            }
        } catch (error) {
            ERROR(`ContentMinerClient[get] ${endpoint}, ${error}`);
        }

        return result;
    }

    async post(endpoint, data) {
        try {
            const response = await axios.post(this.api + endpoint, data);
        } catch (error) {
            ERROR(`ContentMinerClient[post] ${endpoint}, ${error}`);
        }
    }
}

module.exports = {
    ContentMinerClient,
};

