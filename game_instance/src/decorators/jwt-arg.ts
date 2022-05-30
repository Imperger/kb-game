import { createParamDecorator } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

export const JwtArg = createParamDecorator((data, req) => {
  return new Promise((resolve, reject) => {
    verify(req.getArgByIndex(1), process.env.SPAWNER_SECRET, (err, payload) =>
      err ? reject(err) : resolve(payload),
    );
  });
});
