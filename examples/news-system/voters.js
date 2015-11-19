var Voters = require('../../lib/index');
var model = require('./model');

/**
 * News access logic.
 *
 * @type {{supportsResource: Function, supportsPermission: Function, vote: Function}}
 */
var newsVoter = {
    supportsResource: function (resource) {
        return (resource instanceof model.News);
    },
    supportsPermission: function (permission) {
        var permissions = ['VIEW', 'ADD', 'DELETE'];

        return permissions.indexOf(permission) != -1;
    },
    vote: function (user, news, permission, cb) {
        var allowedPermissions = [];
        if(!user) {
            allowedPermissions = ['VIEW'];
        } else {
            allowedPermissions = ['VIEW', 'ADD'];
            if(user == news.author) {
                allowedPermissions.push('DELETE')
            }
        }

        var decision = (allowedPermissions.indexOf(permission) != -1) ? Voters.DECISION.ACCESS_GRANTED : Voters.DECISION.ACCESS_ABSTAIN;
        cb(null, decision);
    }
};

/**
 * Voter for Admin -> allow to everything.
 *
 * @type {{supportsResource: Function, supportsPermission: Function, vote: Function}}
 */
var adminVoter = {
    supportsResource: function (resource) {
        return true;
    },
    supportsPermission: function (permission) {
        return true;
    },
    vote: function (user, news, permission, cb) {
        if(user == 'admin') {
            cb(null, Voters.DECISION.ACCESS_GRANTED);
        }
        else {
            cb(null, Voters.DECISION.ACCESS_ABSTAIN);
        }
    }
};

exports = module.exports = new Voters({
    voters: [adminVoter, newsVoter],
    defaultDecision: Voters.DECISION.ACCESS_DENIED
});