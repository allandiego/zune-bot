declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      DISCORD_BOT_NAME: string;
      MONGODB_URI: string;
    }
  }
}

export {};
