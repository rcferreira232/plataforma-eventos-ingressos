import app from "./app";
import { env } from "./config/env";

const start = async () => {
  try {
    app.listen(3000, () => {
      console.log(`Server is running on port: ${env.port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
