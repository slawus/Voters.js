var Interface = require('./Interface');

/**
 * Desctibes interface for voter.
 * Voter object implement 3 methods:
 *
 * @interface VoterInterface
 *
 * @type {Interface|exports|module.exports}
 */
var VoterInterface = new Interface('VoterInterface', ['vote', 'supportsResource', 'supportsPermission']);


/**
 * Decide if User has Permission to perform action on Resource.
 *
 * @function
 * @name VoterInterface#vote
 * @param {*} user
 * @param {*} resource
 * @param {*} permission
 * @param {VoterInterface~votingCallback} cb
 */

/**
 * Check if voter supports resource.
 *
 * @function
 * @name VoterInterface#supportsResource
 * @param {*} resource
 * @return {boolean} resource support state
 */

/**
 * Check if voter supports permission.
 *
 * @function
 * @name VoterInterface#supportsPermission
 * @param {*} permission
 * @return {boolean} permission support state
 */

/**
 * Callback called after vote by single voter.
 *
 * @callback VoterInterface~votingCallback
 * @param {null|object} error
 * @param {DECISION} voting decision.
 */

exports = module.exports = VoterInterface;