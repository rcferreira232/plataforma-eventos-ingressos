import express, { type Express } from "express";
import cors from "cors";
import morgan from "morgan";
import { userRouter } from "./routes/user-routes.ts";
import { eventRouter } from "./routes/event-routes.ts";
import { tmdbRouter } from "./routes/tmdb-routes.ts";
import { reservationRouter } from "./routes/reservation-routes.ts";
import { ticketRouter } from "./routes/ticket-routes.ts";
import { errorHandler } from "./middlewares/error-middleware.ts";
import { env } from "./config/env.ts";

export const app: Express = express();

const corsOptions = {
  origin: env.allowOrigin,
  credentials: true,
};

app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.use("/users", userRouter);
app.use("/events", eventRouter);
app.use("/tmdb", tmdbRouter);
app.use("/reservations", reservationRouter);
app.use("/tickets", ticketRouter);

app.use(errorHandler);
