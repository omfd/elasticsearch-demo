var chalk = require('chalk');
var es = require('../connect');
var _index = 'company_demo';
var _type = 'employee';

var client = es.connection();
var query = {
    index: _index,
    type: _type,
    body: {
        "query": {
            "match_phrase_prefix": {
                "job_title.edge_ngrams": {
                    "query": "",
                    "slop": 10
                }
            }
        }
        // ,
        // "filter":{
        //     "term":{
        //         "fields": ["first_name.keyword"]
        //     }
        // }
    }
};

module.exports.autocompleteFn = function (req, res) {
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "match": {
                    "first_name": req.query.term
                }
            }
        }
    }).then(function (resp) {
        console.log(chalk.yellow(JSON.stringify(resp)));
        var results = resp.hits.hits.map(function (hit) {
            return hit._source.first_name + " " + hit._source.last_name;
        });
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
};

module.exports.autocompleteMultiBestMatchFn = function (req, res) {
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "multi_match": {
                    "query": req.query.term,
                    "type": "best_fields",
                    "fields": ["full_name.raw^20", "first_name^10", "last_name"]
                    // "use_dis_max" : "true"
                    // "tie_breaker": 0.3
                }
            }
        }
    }).then(function (resp) {
        console.log(chalk.yellow(JSON.stringify(resp)));
        var results = resp.hits.hits.map(function (hit) {
            // hit.highlight.first_name ? console.log('checking if first name exists') :console.log('first name doesnt exists');
            // if(hit.highlight["first_name.raw"]){
            //     console.log("printing the highlight object", hit.highlight["first_name.raw"][0])
            // }
            // return hit.highlight["first_name.raw"] ? hit.highlight["first_name.raw"][0] : hit._source.first_name + " " + hit.highlight["last_name.raw"] ? hit.highlight["last_name.raw"][0] : hit._source.last_name;
            return hit._source.full_name + ' ' + hit._score;
        });
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
};

module.exports.autocompleteMultiMostMatchFn = function (req, res) {
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "multi_match": {
                    "query": req.query.term,
                    "type": "most_fields",
                    "fields": ["first_name^2", "last_name", "full_name^3"]
                }
            }
        }
    }).then(function (resp) {
        console.log(chalk.yellow(JSON.stringify(resp)));
        var results = resp.hits.hits.map(function (hit) {
            // hit.highlight.first_name ? console.log('checking if first name exists') :console.log('first name doesnt exists');
            // if(hit.highlight["first_name.raw"]){
            //     console.log("printing the highlight object", hit.highlight["first_name.raw"][0])
            // }
            // return hit.highlight["first_name.raw"] ? hit.highlight["first_name.raw"][0] : hit._source.first_name + " " + hit.highlight["last_name.raw"] ? hit.highlight["last_name.raw"][0] : hit._source.last_name;
            return hit._source.first_name + " " + hit._source.last_name + " " + hit._score ;
        });
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
};

module.exports.autocompleteMultiMatchEdgeNGramsFn = function (req, res) {
    console.log('PRINT THE QUERY PARAMETER-', req.query.term);
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "multi_match": {
                    "query": req.query.term,
                    "type": "most_fields",
                    "fields": ["first_name.edge_ngrams^2", "last_name.edge_ngrams", "full_name.edge_ngrams^5"],
                }
            }
        }
    }).then(function (resp) {
        console.log(chalk.yellow(JSON.stringify(resp)));
        var results = resp.hits.hits.map(function (hit) {
            return hit._source.first_name + " " + hit._source.last_name;
        });
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
};

module.exports.autocompleteMultiMatchNGramsFn = function (req, res) {
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "multi_match": {
                    "query": req.query.term,
                    "type": "most_fields",
                    "fields": ["first_name.autocomplete^10", "last_name.autocomplete^5", "full_name.autocomplete^20", "full_name.raw^50"]
                }
            }
        }
    }).then(function (resp) {
        console.log(chalk.yellow(JSON.stringify(resp)));
        var results = resp.hits.hits.map(function (hit) {
            return hit._source.first_name + " " + hit._source.last_name;
        });
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
};

module.exports.autocompleteMultiMatchShingleFn = function (req, res) {
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "multi_match": {
                    "query": req.query.term,
                    "type": "most_fields",
                    "fields": ["first_name.token^10", "last_name.token^5", "full_name.token^20"]
                }
            }
        }
    }).then(function (resp) {
        console.log(chalk.yellow(JSON.stringify(resp)));
        var results = resp.hits.hits.map(function (hit) {
            return hit._source.first_name + " " + hit._source.last_name;
        });
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
};

module.exports.autocompleteMultiFieldMatchingFn = function (req, res) {
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "multi_match": {
                    "query": req.query.term,
                    "type": "most_fields",
                    "fields": ["job_title.token^50", "first_name.token^12", "last_name.token^6", "full_name.token^25", "country", "city^6", "gender"]
                }
            }
        }
    }).then(function (resp) {
        console.log(chalk.yellow(JSON.stringify(resp)));
        var results = resp.hits.hits.map(function (hit) {
            return hit._source.first_name + " " + hit._source.last_name + " \" " + hit._source.job_title + "\" " + hit._source.city + " - " + hit._source.country + "==>" + hit._score;
        });
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
};


module.exports.autocompleteMultiBestMatchWithFuzinessFn = function (req, res) {
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "fuzzy": {

                    "country.edge_ngrams": {
                        "value": req.query.term,
                        "fuzziness": 2
                    }
                }
            },
            "aggregations": {
                "country": {
                    "terms": {
                        "field": "country.raw"
                    }
                }
            }
        }
    }).then(function (resp) {
        console.log(chalk.yellow(JSON.stringify(resp)));
        var results = resp.aggregations.country.buckets.map(function (hit) {
            // hit.highlight.first_name ? console.log('checking if first name exists') :console.log('first name doesnt exists');
            // if(hit.highlight["first_name.raw"]){
            //     console.log("printing the highlight object", hit.highlight["first_name.raw"][0])
            // }
            // return hit.highlight["first_name.raw"] ? hit.highlight["first_name.raw"][0] : hit._source.first_name + " " + hit.highlight["last_name.raw"] ? hit.highlight["last_name.raw"][0] : hit._source.last_name;
            return hit.key + ' ' + hit.doc_count;
        });
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
};

module.exports.autocompleteWithErrorsFn = function (req, res) {
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "match": {
                    "first_name.edge_ngrams": req.query.term
                }
            }
        }
    }).then(function (resp) {
        console.log(chalk.yellow(JSON.stringify(resp)));
        var results = resp.hits.hits.map(function (hit) {
            return hit._source.first_name + " " + hit._source.last_name;
        });
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
};

module.exports.autocompleteMatchPhraseFn = function (req, res) {
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "match_phrase_prefix": {
                    "query": req.query.term,
                    "fields": ["full_name.autocomplete"]
                }
            }
        }
    }).then(function (resp) {
        console.log(chalk.yellow(JSON.stringify(resp)));
        var results = resp.hits.hits.map(function (hit) {
            // hit.highlight.first_name ? console.log('checking if first name exists') :console.log('first name doesnt exists');
            // if(hit.highlight["first_name.raw"]){
            //     console.log("printing the highlight object", hit.highlight["first_name.raw"][0])
            // }
            // return hit.highlight["first_name.raw"] ? hit.highlight["first_name.raw"][0] : hit._source.first_name + " " + hit.highlight["last_name.raw"] ? hit.highlight["last_name.raw"][0] : hit._source.last_name;
            return hit._source.full_name
        });
        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
};


var a = {
    query: {
        or: [{
            match_phrase_prefix: {
                name: ''
            }
        }, {
            match_phrase_prefix: {
                surname: ""
            }
        }]
    }
}

var b = {
    "highlight": {
        // "pre_tags": ["<em>"],
        // "post_tags": ["</em>"],
        "fields": {
            "first_name.raw": {},
            "last_name.raw": {},
        }
    }
}