var express = require('express');
var router = express.Router();
var accessControl = require('./voters');
var async = require('async');
var model = require('./model');
var _ = require('lodash');

var newsCollection = [];

router.post('/news', function (req, res) {
    var news = new model.News(req.body.news.title, req.body.news.content, req.user);
    if (accessControl.isAllowed(req.user, news, 'ADD', function (err, allowed) {
            if (!allowed) {
                return res.status(403).send();
            }

            newsCollection.unshift(news);
            res.status(201).send(news);
        }));
});

router.delete('/news/:id', function (req, res) {
    var pos = _.findIndex(newsCollection, { 'id': req.params.id });
    var news = newsCollection[pos];
    if (accessControl.isAllowed(req.user, news, 'DELETE', function (err, allowed) {
            if (!allowed) {
                return res.status(403).send();
            }

            newsCollection.splice(pos, 1);
            res.status(204).send();
        }));
});

router.get('/news', function (req, res) {
    async.filterSeries(newsCollection, function(entry, cb) {
        accessControl.isAllowed(req.user, entry, 'VIEW', function(err, allowed) {
            cb(allowed);
        });
    }, function(visibleNews) {
        res.status(200).send(visibleNews);
    });
});

exports = module.exports = router;