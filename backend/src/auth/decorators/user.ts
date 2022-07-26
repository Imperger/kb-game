import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((data, req) => {
  return req.getArgByIndex(0).user;
});
