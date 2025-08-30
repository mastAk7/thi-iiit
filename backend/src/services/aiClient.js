const axios = require('axios');
const { env } = require('../config');
const mockTHI = require('./mockData');


async function getTHI(payload) {
    if (env.AI_MODE === 'mock') {
        return mockTHI(payload);
    }
    const url = `${env.AI_BASE_URL.replace(/\/$/, '')}/thi`;
    const { data } = await axios.post(url, payload, { timeout: env.AI_TIMEOUT_MS });
    return data; // assumed to match contract
}


module.exports = { getTHI };