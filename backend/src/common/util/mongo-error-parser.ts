export const ExtractDuplicateKey = (msg: string) => {
  const start = msg.indexOf(':', msg.indexOf(':') + 1) + 2;
  const end = msg.indexOf(' ', start);
  return msg.substring(start, end);
};
