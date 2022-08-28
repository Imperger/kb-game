export function msToMmss (ms: number): string {
  const seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);
  const remSeconds = Math.round(seconds - minutes * 60);
  return `${minutes.toString().padStart(2, '0')}:${remSeconds.toString().padStart(2, '0')}`;
}
