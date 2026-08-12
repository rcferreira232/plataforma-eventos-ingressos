type Env = {
  postgresUrl: string;
  port: number;
  jwtSecret: string;
  tmdbApiKey: string;
  allowOrigin: string;
};

export const env: Env = {
  port: Number(process.env.APP_PORT) || NaN,
  postgresUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  tmdbApiKey: process.env.TMDB_API_KEY || "",
  allowOrigin: process.env.ALLOW_ORIGIN || "",
};
