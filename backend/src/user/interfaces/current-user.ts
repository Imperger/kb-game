export interface CurrentUser {
  username: string;
  email: string;
  avatar: string;
  registeredAt: Date;
  hasPassword: boolean;
  scopes: {
    assignScope: boolean;
    serverMaintainer: boolean;
    blockedUntil: Date;
    editScenario: boolean;
    moderateChat: boolean;
    mutedUntil: Date;
  };
}
