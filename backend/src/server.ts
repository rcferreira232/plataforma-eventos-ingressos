import app from "./app.ts";
import { env } from "./config/env";

const start = async () => {
  try {
    app.listen(env.port, () => {
      console.log(`Server is running on port: ${env.port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
