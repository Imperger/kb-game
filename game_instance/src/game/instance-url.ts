export function instanceUrl(): string {
  return `wss://${new URL(process.env.SPAWNER_API).host}/${
    process.env.INSTANCE_ID
  }`;
}
