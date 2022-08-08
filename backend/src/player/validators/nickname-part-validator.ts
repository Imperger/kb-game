export function isValidNicknamePart(nickname: string): boolean {
  return /^[\w]{3,16}$/.test(nickname);
}
