type Env = {
  port: number;
};

export const env: Env = {
  port: Number(process.env.APP_PORT) || NaN,
};
