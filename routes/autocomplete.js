var chalk = require('chalk');
var express = require('express');
var router = express.Router();
var elastic = require('elasticsearch');
var autocomplete =  require('../api/autocomplete');

// /*Controller Section*/
// var mainCtrl = require('../controllers/main');
// var locationsCtrl = require('../controllers/locations');
// var othersCtrl = require('../controllers/others');


// /*Controller Routing Linkage Section*/
// /*Location Page Routing*/
// router.get('/', locationsCtrl.homeList);
// router.get('/location/:locationId', locationsCtrl.locationInfo);
// router.get('/location/:locationId/review/new', locationsCtrl.addReviewScreen);
// router.post('/location/:locationId/review/new', locationsCtrl.addReview);
// /*Others Page Routing*/
// router.get('/others', othersCtrl.othersInfo);
// router.get('/about', othersCtrl.aboutInfo);
//
// module.exports = router;

var _index = 'company';
var _type = 'employee';
router.get('/best-match', autocomplete.autocompleteMultiBestMatchFn);
router.get('/most-match', autocomplete.autocompleteMultiMostMatchFn);
router.get('/edge-ngram', autocomplete.autocompleteMultiMatchEdgeNGramsFn);
router.get('/ngram', autocomplete.autocompleteMultiMatchNGramsFn);
router.get('/shingle', autocomplete.autocompleteMultiMatchShingleFn);

router.get('/example', autocomplete.autocompleteMultiFieldMatchingFn);
router.get('/fuzzy', autocomplete.autocompleteMultiBestMatchWithFuzinessFn);

fn = function (req, res) {
    console.log('------------------------------------------------');
    console.log(chalk.green('__entering the autocomplete module__'));
    console.log('------------------------------------------------');
    // res.send({a:"I am awesome"});
};

module.exports.fn = fn;
module.exports.router = router;