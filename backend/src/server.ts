import app from "./app.js";
import { env } from "./config/env.js";

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
