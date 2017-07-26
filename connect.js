var elasticsearch = require('elasticsearch');
var connectionString = 'localhost:9200';
var chalk = require('chalk');

var client;
var connection = function () {
    if (!client) {
        client = new elasticsearch.Client({
            host: connectionString,
            log: 'debug'
        });
        console.log(chalk.red('CONNECTION ESTABLISHED'));
        return client;
    } else {
        return client;
    }
};

module.exports.connection = connection;
