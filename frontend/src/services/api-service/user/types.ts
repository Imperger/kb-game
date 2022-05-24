export interface CurrentUser {
  username: string;
  email: string;
  registeredAt: Date;
  avatar: string,
  scopes: {
    assignScope: boolean;
    blockedUntil: Date;
    editScenario: boolean;
    moderateChat: boolean;
    mutedUntil: Date;
  }
}
