declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_BOT_TOKEN: string;
      DISCORD_BOT_NAME: string;
      DISCORD_SCHEDULE_BOT_TOKEN: string;
      MONGODB_URI: string;
    }
  }
}

export {};
