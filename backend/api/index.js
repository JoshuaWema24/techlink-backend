const app = require('../api/index.js');
const serverless = require('serverless-http');

module.exports = serverless(app);