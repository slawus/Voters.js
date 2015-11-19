var app = require('../../examples/news-system');
var request = require('supertest');

var user = 'Emma';
var testEntry = {
    'title': 'Test title',
    'content': 'Test content'
};
describe('ACCEPTANCE/news-system/api', function () {
    describe('POST /news', function () {
        it('should add news if Authenticated', function (done) {
            request(app)
                .post('/api/news')
                .set('X-User', user)
                .send({
                    'news': testEntry
                })
                .expect(201, done);
        });

        it('should return 403 if Anonymous', function (done) {
            request(app)
                .post('/api/news')
                .send({
                    'news': testEntry
                })
                .expect(403, done);
        });
    });

    describe('GET /news', function () {
        it('should return added news', function (done) {
            var entry = testEntry;
            entry.author = user;
            request(app)
                .get('/api/news')
                .expect(200, done);
        });
    });

    describe('DELETE /news/:id', function () {

        it('should remove news if user is admin', function (done) {
            //add entry
            request(app)
                .post('/api/news')
                .set('X-User', user)
                .send({
                    'news': testEntry
                })
                .end(function (err, res) {
                    //remove entry
                    request(app)
                        .del('/api/news/' + res.body.id)
                        .set('X-User', 'admin')
                        .expect(204, done);
                });
        });

        it('should remove news if user is author', function (done) {
            //add entry
            request(app)
                .post('/api/news')
                .set('X-User', user)
                .send({
                    'news': testEntry
                })
                .end(function (err, res) {
                    //remove entry
                    request(app)
                        .del('/api/news/' + res.body.id)
                        .set('X-User', user)
                        .expect(204, done);
                });
        });

        it('should return 403 on delete if user is not author', function (done) {
            //add entry
            request(app)
                .post('/api/news')
                .set('X-User', user)
                .send({
                    'news': testEntry
                })
                .end(function (err, res) {
                    //remove entry
                    request(app)
                        .del('/api/news/' + res.body.id)
                        .set('X-User', 'Another user')
                        .expect(403, done);
                });
        });

        it('should return 403 on delete if user is anonymous', function (done) {
            //add entry
            request(app)
                .post('/api/news')
                .set('X-User', user)
                .send({
                    'news': testEntry
                })
                .end(function (err, res) {
                    //remove entry
                    request(app)
                        .del('/api/news/' + res.body.id)
                        .expect(403, done);
                });
        });
    });
});