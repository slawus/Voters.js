export = DecisionManager;

declare class DecisionManager {

    static defaultConfig: {defaultDecision: boolean, voters: Array<DecisionManager.VoterInterface>};

    constructor(config?: {
        defaultDecision?: boolean,
        voters?: Array<DecisionManager.VoterInterface>
    });

    registerVoter(voter: DecisionManager.VoterInterface);

    unregisterVoter(voter: DecisionManager.VoterInterface);

    isAllowed(user: any, resource: any, permission: any, callback: DecisionManager.VotingResult);
}

declare namespace DecisionManager {
    export interface VoterInterface {
        supportsResource(resource: any): boolean;
        supportsPermission(resource: any): boolean;
        vote(user: any, resource: any, permission: any, callback: VotingResult);
    }

    type VotingResult = (err: null|Error, result: boolean) => void;
}