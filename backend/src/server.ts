import { app } from "./app.ts";
import { env } from "./config/env.ts";

const start = async () => {
  try {
    app.listen(env.port, () => {
      console.log(`Server is running on ${env.port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
