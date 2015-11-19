var _ = require('lodash');
var expect = require('chai').expect;
var VotersStack = require('../../index');
var Sinon = require('sinon');

var TestVoter = {
    vote: function (user, resource, permission, cb) {
        cb(null, VotersStack.DECISION.ACCESS_GRANTED);
    },
    supportsResource: function (resource) {
        return true;
    },
    supportsPermission: function (permission) {
        return true;
    }
};


describe('SPEC/VotersStack', function () {

    var sandbox;
    beforeEach(function () {
        sandbox = Sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('Configuration', function () {
        it('Registers voters from configuration', function () {
            sandbox.spy(VotersStack.prototype, 'registerVoter');
            var ac = new VotersStack({
                voters: [TestVoter]
            });

            expect(ac.registerVoter.calledWith(TestVoter)).to.be.true;
        });

        it('Returns defaultValue, in none of the Voters allowed/disallowed', function (done) {
            var ac = new VotersStack({
                voters: [],
                defaultDecision: VotersStack.DECISION.ACCESS_GRANTED
            });

            ac.isAllowed('user', 'res', 'create', function (err, decision) {
                expect(decision).to.be.equal(VotersStack.DECISION.ACCESS_GRANTED);
                done();
            });
        })
    });

    it('Should check if voter implements VoterInterface on voter register', function () {
        var WrongVoter = {
            randomMethod: function () {
            }
        };

        var ac = new VotersStack({});
        expect(function () {
            ac.registerVoter(WrongVoter)
        }).to.throw();
    });

    it('Should return decision of first defined voter (that supports resource & permissions)', function (done) {
        var voterMaster = _.clone(TestVoter);
        sandbox.stub(voterMaster, 'vote').yields(null, VotersStack.DECISION.ACCESS_GRANTED);
        var voterSlave = _.clone(TestVoter);
        sandbox.stub(voterSlave, 'vote').yields(null, VotersStack.DECISION.ACCESS_DENIED);

        var ac = new VotersStack({
            voters: [
                voterMaster,
                voterSlave
            ]
        });
        ac.isAllowed('test-user', 'test-resource', 'CREATE', function (err, decision) {
            expect(decision).to.be.equal(VotersStack.DECISION.ACCESS_GRANTED);
            done();
        });
    });

    it('Should check if voter supports permission, before calling ::vote', function (done) {
        var voter = _.clone(TestVoter);
        sandbox.stub(voter, 'supportsPermission').returns(false);
        sandbox.spy(voter, 'vote');
        sandbox.spy(voter, 'supportsResource');

        var ac = new VotersStack({
            voters: [voter]
        });
        ac.isAllowed('test-user', 'test-resource', 'CREATE', function (err, decision) {
            expect(voter.supportsPermission.called).to.be.true;
            expect(voter.vote.called).to.be.false;
            done();
        });
    });

    it('Should check if voter supports resource, before calling ::vote', function (done) {
        var voter = _.clone(TestVoter);
        sandbox.stub(voter, 'supportsResource').returns(false);
        sandbox.spy(voter, 'vote');
        sandbox.spy(voter, 'supportsPermission');

        var ac = new VotersStack({
            voters: [voter]
        });
        ac.isAllowed('test-user', 'test-resource', 'CREATE', function (err, decision) {
            expect(voter.supportsResource.called).to.be.true;
            expect(voter.vote.called).to.be.false;
            done();
        });
    });

    it('Should use Voter registered with ::registerVoter', function(done) {
        var voter = _.clone(TestVoter);
        sandbox.stub(voter, 'supportsResource').returns(true);
        sandbox.stub(voter, 'supportsPermission').returns(true);
        sandbox.stub(voter, 'vote').yields(null, VotersStack.DECISION.ACCESS_DENIED);

        var ac = new VotersStack({});
        ac.registerVoter(voter);
        ac.isAllowed('user', 'test-resource', 'test-permission', function(err, decision) {
            expect(voter.supportsPermission.called).to.be.true;
            expect(voter.supportsResource.called).to.be.true;
            expect(voter.vote.called).to.be.true;
            done();
        });
    });

    it('Should not use Voter after ::unregisterVoter', function(done) {
        var voter = _.clone(TestVoter);
        sandbox.stub(voter, 'supportsResource').returns(true);
        sandbox.stub(voter, 'supportsPermission').returns(true);
        sandbox.stub(voter, 'vote').yields(null, VotersStack.DECISION.ACCESS_DENIED);

        var ac = new VotersStack({
            voters: [voter]
        });
        ac.unregisterVoter(voter);
        ac.isAllowed('user', 'test-resource', 'test-permission', function(err, decision) {
            expect(voter.supportsPermission.called).to.be.false;
            expect(voter.supportsResource.called).to.be.false;
            expect(voter.vote.called).to.be.false;
            done();
        });
    });

    it('Should return {permission: decision} map, when calling ::vote with array of permissions', function(done) {
        var voter = _.clone(TestVoter);
        var ac = new VotersStack({
            voters: [voter]
        });

        var permissions = ['eat', 'sleep', 'code'];
        ac.isAllowed('user', 'test-resource', permissions, function(err, decisionsMap) {
            expect(decisionsMap).to.be.object;
            expect(decisionsMap).to.have.all.keys(permissions);
            expect(_.valuesIn(decisionsMap)).to.satisfy( function valuesAreCorrect(decisions) {
                var allowedValues = _.valuesIn(VotersStack.DECISION);
                return _.difference(decisions, allowedValues).length == 0;
            });
            done();
        });
    })
});