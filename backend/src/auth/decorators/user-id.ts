import { createParamDecorator } from '@nestjs/common';

export const UserId = createParamDecorator((data, req) => {
  return req.getArgByIndex(0).user.id;
});
