var _ = require('lodash');
var async = require('async');
var Interface = require('./Interface');
var VoterInterface = require('./VoterInterface');

exports = module.exports = (function () {

    /**
     * Voting decision values.
     *
     * @member
     * @readonly
     * @enum {number}
     */
    const DECISION = {
        ACCESS_GRANTED: true,
        ACCESS_ABSTAIN: undefined,
        ACCESS_DENIED: false
    };


    /**
     * Wraps voters into one control service.
     *
     * @class
     * @name VotersStack
     * @constructor
     * @param {Object} config - Config object. If any key will be missing, default value will be copied from {@link VotersStack#defaultConfig}.
     * @param {DECISION} config.defaultDecision - default decision, used when none of the voters can make decision.
     * @param {Array} config.voters initial list of voters
     */
    function VotersStack(config) {
        this.config = _.defaults(config, VotersStack.defaultConfig);

        this.voters = [];
        for (var i = 0, len = this.config.voters.length; i < len; i++) {
            this.registerVoter(this.config.voters[i]);
        }
    }
    /**
     * Default config for VotersStack.
     *
     * @static
     * @name VotersStack#defaultConfig
     * @property {DECISION} defaultDecision - default decision, used when none of the voters can make decision.
     * @property {Array} voters initial list of voters
     * @default {
        defaultDecision: DECISION.ACCESS_DENIED,
        voters: []
    };
     */
    VotersStack.defaultConfig = {
        defaultDecision: DECISION.ACCESS_DENIED,
        voters: []
    };


    /**
     * Register new voter. Voter will be used in decision making.
     *
     * @method
     * @name VotersStack#registerVoter
     * @param {Object} voter - voter, should implement methods from VoterInterface
     */
    VotersStack.prototype.registerVoter = function (voter) {
        Interface.ensureImplements(voter, VoterInterface);
        this.voters.push(voter);
    };

    /**
     * Unregister voter. Voter will no longer be used in decision making.
     *
     * @method
     * @name VotersStack#unregisterVoter
     * @param {Object} voter - voter, should implement methods from VoterInterface
     */
    VotersStack.prototype.unregisterVoter = function (voter) {
        this.voters = _.without(this.voters, voter);
    };

    /**
     * Check if user has permission to perform action on resource.
     *
     * @method
     * @name VotersStack#isAllowed
     *
     * @param {*} user
     * @param {*} resource
     * @param {*} permissions
     * @param {VotersStack~votingCallback} cb
     */
    VotersStack.prototype.isAllowed = function (user, resource, permissions, cb) {

        if (!_.isArray(permissions)) {
            permissions = [permissions];
        }

        async.map(permissions, function (permission, callback) {
            isUserAllowed.call(this, user, resource, permission, callback);
        }.bind(this), function (err, result) {

            //change all ABSTAIN do options.defaultValue
            result = _.map(result, function (el) {
                return (el == DECISION.ACCESS_ABSTAIN) ? this.config.defaultDecision : el;
            }.bind(this));

            //format response
            if (permissions.length > 1) {
                cb(null, _.zipObject(permissions, result)); //if multiple permissions, return { permission: decision } object
            } else {
                cb(null, result[0]); //otherwise return decision
            }
        }.bind(this));

        function isUserAllowed(user, resource, permission, cb) {
            var voters = this.voters;
            async.waterfall([
                function (callback) {
                    filterVoters.call(this, voters, resource, permission, function (err, filteredVoters) {
                        callback(err, filteredVoters, user, resource, permission);
                    })
                },
                iterateThroughVoters
            ], cb);
        }

        function filterVoters(voters, resource, permission, cb) {
            async.filter(voters, function (voter, cb) {
                cb(voter.supportsResource(resource) && voter.supportsPermission(permission));
            }, function (results) {
                cb(null, results);
            });
        }

        function iterateThroughVoters(voters, user, resource, permission, cb) {
            var decision = DECISION.ACCESS_ABSTAIN;
            var i = 0;

            async.whilst(
                function () {
                    return (decision == DECISION.ACCESS_ABSTAIN) && (i < voters.length);
                },
                function (callback) {
                    var voter = voters[i++];

                    voter.vote(user, resource, permission, function (err, result) {
                        if (err) {
                            return callback(err)
                        }

                        decision = result;
                        callback(null);
                    });
                },
                function (err) {
                    cb(null, decision);
                }
            )
        }
    };

    VotersStack.DECISION = DECISION;

    /**
     * Callback called after voting.
     *
     * @callback VotersStack~votingCallback
     * @param {null|object} error
     * @param {DECISION} decision - Voting decision.
     */

    return VotersStack;
})();