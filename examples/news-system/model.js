var crypto = require('crypto');

exports = module.exports = {
    News: function(title, content, author) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.date = Date();
        this.id = crypto.randomBytes(20).toString('hex');
    }
};