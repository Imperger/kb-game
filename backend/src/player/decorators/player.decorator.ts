import { createParamDecorator } from '@nestjs/common';

export const Player = createParamDecorator(async (data, req) => {
  return (await req.getArgByIndex(0).user.populate('player')).player;
});
