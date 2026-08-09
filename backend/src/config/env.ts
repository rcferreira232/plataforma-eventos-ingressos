type Env = {
  postgresUrl: string;
  port: number;
};

export const env: Env = {
  port: Number(process.env.APP_PORT) || NaN,
  postgresUrl: process.env.DATABASE_URL || "",
};
