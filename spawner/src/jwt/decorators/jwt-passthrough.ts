import { createParamDecorator } from '@nestjs/common';

export const JwtPassthrough = createParamDecorator((data, req) => {
    return req.getArgByIndex(0).user;
});