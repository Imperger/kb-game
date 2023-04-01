export async function delay(value: number) {
  return new Promise<void>(ok => setTimeout(() => ok(), value));
}
