import express, { type Express } from "express";
import cors from "cors";
import morgan from "morgan";
import { userRouter } from "./routes/user-routes.ts";
import { eventRouter } from "./routes/event-routes.ts";
import { errorHandler } from "./middlewares/error-middleware.ts";

export const app: Express = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/users", userRouter);
app.use("/events", eventRouter);

app.use(errorHandler);
