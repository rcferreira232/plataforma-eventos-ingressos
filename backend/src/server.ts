import { app } from "./app.ts";

const start = async () => {
  try {
    app.listen(3000, () => {
      console.log(`Server is running on ${process.env.APP_PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
