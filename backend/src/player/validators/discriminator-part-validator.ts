export function isValidDisriminatorPart(discriminator: number): boolean {
  return discriminator >= 1 && discriminator <= 999;
}
