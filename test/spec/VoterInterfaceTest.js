require('chai').should();
var sprintf = require('sprintf-js').sprintf;

describe('SPEC/AccessControl/VoterInterface', function() {

    var VoterInterface = require('../../lib/VoterInterface');

    var methods = ['vote', 'supportsResource', 'supportsPermission'];
    methods.forEach(function(method) {
        it(sprintf('declares "%s" method', method), function() {
            VoterInterface.methods.should.contain(method);
        });
    });
});