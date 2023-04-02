import { isValidDisriminatorPart } from './discriminator-part-validator';
import { isValidNicknamePart } from './nickname-part-validator';

export function isValidNickname(
  nickname: string,
  discriminator: number
): boolean {
  return (
    isValidNicknamePart(nickname) && isValidDisriminatorPart(discriminator)
  );
}
