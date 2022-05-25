export interface CurrentUser {
    username: string;
    email: string;
    avatar: string;
    registeredAt: Date;
    scopes: {
        assignScope: boolean;
        blockedUntil: Date;
        editScenario: boolean;
        moderateChat: boolean;
        mutedUntil: Date;
    }
}