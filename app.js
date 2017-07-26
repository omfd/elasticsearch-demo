/**
 * Module dependencies.
 */

var express = require('express'),
    elasticsearch = require('elasticsearch'),
    url = require('url'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    path = require('path'),
    logger = require('morgan'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    errorHandler = require('errorhandler'),
    favicon = require('serve-favicon'),
    auto = require('./routes/autocomplete'),
    router = express.Router(),
    es = require('./connect');
fs = require('fs');

var chalk = require('chalk');
var connectionString = 'localhost:9200';

if (process.env.SEARCHBOX_URL) {
    // Heroku
    connectionString = process.env.SEARCHBOX_URL;
} else if (process.env.SEARCHLY_URL) {
    // CloudControl, Modulus
    connectionString = process.env.SEARCHLY_URL;
} else if (process.env.VCAP_SERVICES) {
    // Pivotal, Openshift
    connectionString = JSON.parse(process.env.VCAP_SERVICES)['searchly-n/a'][0]['credentials']['uri'];
}

// var client = new elasticsearch.Client({
//     host: connectionString,
//     log: 'debug'
// });
client = es.connection();
var _index = "company_demo";
var _type = 'employee';

// configuration
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());
console.log(chalk.red(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));

// Routes
app.get('/', function (req, res) {
    res.render('index', {"result": "", "title": ""})
});

app.get('/index', function (req, res) {

    client.indices.delete({index: _index});

    client.indices.create({
        index: _index,
        body: {
            "settings": {
                "analysis": {
                    "tokenizer": {
                        "edge_ngram_tokenizer": {
                            "type": "edge_ngram",
                            "min_gram": 2,
                            "max_gram": 10
                        }
                    },
                    "filter": {
                        "autocomplete_filter": {
                            "type": "ngram",
                            "min_gram": 2,
                            "max_gram": 50
                        },
                        "trigram_filter": {
                            "type": "ngram",
                            "min_gram": 3,
                            "max_gram": 3
                        },
                        "stemmer_filter": {
                            "type": "stemmer",
                            "name": "english"
                        },
                        "stopword_filter": {
                            "type": "stop",
                            "stopwords": "_english_"
                        },
                        "edge_ngram_filter": {
                            "type": "edge_ngram",
                            "min_gram": 2,
                            "max_gram": 10
                        },
                        "custom_stop": {
                            "type": "stop",
                            "stopwords": "_english_"
                        },
                        "custom_shingle": {
                            "type": "shingle",
                            "min_shingle_size": "2",
                            "max_shingle_size": "3"
                        }
                    },
                    "char_filter": {
                        "emoticons": {
                            "type": "mapping",
                            "mappings": [
                                ":) => _happy_",
                                ":( => _sad_"
                            ]
                        }
                    },
                    "analyzer": {
                        "autocomplete": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": [
                                "asciifolding",
                                "trim",
                                "lowercase",
                                "autocomplete_filter"
                            ]
                        },
                        "trigram": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": [
                                "asciifolding",
                                "trim",
                                "lowercase",
                                "trigram_filter"
                            ]
                        },
                        "stemmer": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": [
                                "asciifolding",
                                "trim",
                                "lowercase",
                                "stemmer_filter"
                            ]
                        },
                        "lower_keyword": {
                            "type": "custom",
                            "tokenizer": "keyword",
                            "filter": [
                                "asciifolding",
                                "trim",
                                "lowercase"
                            ]
                        },
                        "keywords": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "char_filter": [
                                "html_strip",
                                "emoticons"
                            ],
                            "filter": [
                                "asciifolding",
                                "trim",
                                "lowercase",
                                "stopword_filter",
                                "stemmer_filter"
                            ]
                        },
                        "reverse": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase", "reverse"]
                        },
                        "edge_ngram": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": [
                                "asciifolding",
                                "trim",
                                "lowercase",
                                "edge_ngram_filter"
                            ]
                        },
                        "tokenizer": {
                            "tokenizer": "standard",
                            "filter": [
                                "standard",
                                "lowercase",
                                "custom_stop",
                                "custom_shingle"
                            ]
                        }
                    }
                }
            },
            "mappings": {
                "employee": {
                    "properties": {
                        "city": {
                            "type": "text",
                            "analyzer": "autocomplete",
                            "fields": {
                                "raw": {
                                    "type": "keyword"
                                }
                            }
                        },
                        "country": {
                            "type": "text",
                            "analyzer": "autocomplete",
                            "fields": {
                                "raw": {
                                    "type": "keyword"
                                },
                                "edge_ngrams": {
                                    "type": "text",
                                    "analyzer": "edge_ngram"
                                }
                            }
                        },
                        "first_name": {
                            "type": "text",
                            "fields": {
                                "autocomplete": {
                                    "type": "text",
                                    "analyzer": "autocomplete"
                                },
                                "stemmer": {
                                    "type": "text",
                                    "analyzer": "stemmer"
                                },
                                "reverse": {
                                    "type": "text",
                                    "analyzer": "reverse"
                                },
                                "raw": {
                                    "type": "keyword"
                                },
                                "edge_ngrams": {
                                    "type": "text",
                                    "analyzer": "edge_ngram"
                                },
                                "token": {
                                    "type": "text",
                                    "analyzer": "tokenizer"
                                }
                            }
                        },
                        "last_name": {
                            "type": "text",
                            "fields": {
                                "autocomplete": {
                                    "type": "text",
                                    "analyzer": "autocomplete"
                                },
                                "stemmer": {
                                    "type": "text",
                                    "analyzer": "stemmer"
                                },
                                "reverse": {
                                    "type": "text",
                                    "analyzer": "reverse"
                                },
                                "raw": {
                                    "type": "keyword"
                                },
                                "edge_ngrams": {
                                    "type": "text",
                                    "analyzer": "edge_ngram"
                                },
                                "token": {
                                    "type": "text",
                                    "analyzer": "tokenizer"
                                }
                            }
                        },
                        "gender": {
                            "type": "keyword"
                        },
                        "job_title": {
                            "type": "text",
                            "fields": {
                                "autocomplete": {
                                    "type": "text",
                                    "analyzer": "autocomplete"
                                },
                                "stemmer": {
                                    "type": "text",
                                    "analyzer": "stemmer"
                                },
                                "reverse": {
                                    "type": "text",
                                    "analyzer": "reverse"
                                },
                                "raw": {
                                    "type": "keyword"
                                },
                                "edge_ngrams": {
                                    "type": "text",
                                    "analyzer": "edge_ngram"
                                },
                                "token": {
                                    "type": "text",
                                    "analyzer": "tokenizer"
                                }
                            }
                        },
                        "language": {
                            "type": "text",
                            "fields": {
                                "raw": {
                                    "type": "keyword"
                                }
                            }
                        },
                        "full_name": {
                            "type": "text",
                            "fields": {
                                "autocomplete": {
                                    "type": "text",
                                    "analyzer": "autocomplete"
                                },
                                "stemmer": {
                                    "type": "text",
                                    "analyzer": "stemmer"
                                },
                                "reverse": {
                                    "type": "text",
                                    "analyzer": "reverse"
                                },
                                "raw": {
                                    "type": "keyword"
                                },
                                "edge_ngrams": {
                                    "type": "text",
                                    "analyzer": "edge_ngram"
                                },
                                "token": {
                                    "type": "text",
                                    "analyzer": "tokenizer"
                                }
                            }
                        }
                    }
                }
            }
        }

    }, function (error, response) {
        fs.readFile('sample_data.json', 'utf8', function (err, data) {
            if (err) throw err;
            var sampleDataSet = JSON.parse(data);

            var body = [];

            sampleDataSet.forEach(function (item) {
                body.push({"index": {"_index": _index, "_type": _type}});
                item.full_name = item.first_name + ' ' + item.last_name;
                body.push(item);
            });

            client.bulk({
                body: body
            }, function (err, resp) {
                res.render('index', {result: 'Indexing Completed!'});
            })
        });
    })
});

app.get('/autocomplete', function (req, res) {
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "bool": {
                    "must": {
                        "multi_match": {
                            "query": req.query.term,
                            "fields": ["first_name^10", "last_name"]
                        }
                    }
                }
            }
            // ,
            // "filter":{
            //     "term":{
            //         "first_name": {}
            //     }
            // }
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
});

app.get('/search', function (req, res) {

    var aggValue = req.query.agg_value;
    var aggField = req.query.agg_field;

    var filter = {};
    filter[aggField] = aggValue;


    console.log(chalk.red('req : ', req.query.agg_field));
    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "bool": {
                    "must": {
                        "multi_match": {
                            "query": req.query.q,
                            "fields": ["first_name^100", "last_name^20", "country^5"]
                            // "fields": ["first_name^100", "last_name^20", "country^5", "city^3", "language^10", "job_title^50"],
                            // "fields": 'first_name',
                            // "fuzziness": 1
                        }
                    }
                    // ,
                    // "filter": {
                    //     "term": (aggField ? filter : undefined)
                    // }
                }

            },
            "aggregations": {
                "country": {
                    "terms": {
                        "field": "country.raw"
                    }
                }
                ,
                "city": {
                    "terms": {
                        "field": "city.raw"
                    }
                },
                "language": {
                    "terms": {
                        "field": "language.raw"
                    }
                },
                "job_title": {
                    "terms": {
                        "field": "job_title.raw"
                    }
                },
                "gender": {
                    "terms": {
                        "field": "gender"
                    }
                }
            },
            "suggest": {
                "text": req.query.q,
                "simple_phrase": {
                    "phrase": {
                        "field": "first_name.autocomplete",
                        "size": 1,
                        // "real_word_error_likelihood": 0.95,
                        // "max_errors": 0.5,
                        "gram_size": 2,
                        "direct_generator": [{
                            "field": "first_name.autocomplete",
                            "suggest_mode": "always",
                            "min_word_length": 1
                        }],
                        "highlight": {
                            "pre_tag": "<b><em>",
                            "post_tag": "</em></b>"
                        }
                    }
                }
            }
        }
    }).then(function (resp) {
        console.log('CHECKING THE RESPONSE')
        console.log(chalk.red(JSON.stringify(resp)));
        console.log('\n')
        res.render('search', {response: resp, query: req.query.q});
    }, function (err) {
        console.trace(err.message);
        res.render('search', {response: err.message});
    });
});

app.use('/1', auto.router);
router.get('/about', auto.fn);

app.get('/create', function (req, res) {
    res.render('index', {"result": "", "title": "Hello World"})
});

// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


