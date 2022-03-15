export const scopeMetaId = Symbol('scope');

/**
 * User scopes
 */
export enum Scope { 
    /**
     * Possibility to edit scopes of another users
     */
    AssignScope, 
    /**
     * Possibility to take part in games
     */
    PlayGame, 
    /**
     * Possibility to write to non-game and game chat
     */
    WriteToChat,
    /**
     * Possibility to manage game texts
     */
    EditScenario, 
    /**
     * Possibility to mute users for some time period, remove messages, etc
     */
    ModerateChat
};