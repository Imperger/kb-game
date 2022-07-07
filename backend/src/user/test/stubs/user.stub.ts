import { playerStub } from "@/player/test/stubs/player.stub";
import { User } from "@/user/schemas/user.schema";

const secret = {
  salt: '',
  hash: '',
  updatedAt: new Date()
};

const scopes = {
  assignScope: false,
  serverMaintainer: false,
  editScenario: false,
  moderateChat: false,
  blockedUntil: new Date(),
  mutedUntil: new Date()
};

export const userStub = (confirmed = true): User => {
  return { 
    id: confirmed? 1: 2,
    username: 'well_known',
    email: 'well_known@mail.com',
    confirmed,
    avatar: '',
    secret,
    scopes,
    player: playerStub(),
    createdAt: new Date(),
    updatedAt: new Date()
  } as User;
};
