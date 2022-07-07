import { Player } from "@/player/schemas/player.schema";

export const playerStub = (): Player => ({ 
  nickname: 'well_known',
  discriminator: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}) as Player;  