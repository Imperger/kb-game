export interface CurrentUser {
  username: string;
  email: string;
  registeredAt: Date;
  avatar: string,
  hasPassword: boolean,
  scopes: {
    assignScope: boolean;
    serverMaintainer: boolean;
    blockedUntil: Date;
    editScenario: boolean;
    moderateChat: boolean;
    mutedUntil: Date;
  }
}
