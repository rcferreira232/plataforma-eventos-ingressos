import express, { type Express } from "express";
import cors from "cors";
import morgan from "morgan";
import { userRouter } from "./routes/user-routes.js";
import { eventRouter } from "./routes/event-routes.js";
import { tmdbRouter } from "./routes/tmdb-routes.js";
import { reservationRouter } from "./routes/reservation-routes.js";
import { ticketRouter } from "./routes/ticket-routes.js";
import { errorHandler } from "./middlewares/error-middleware.js";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health-check-prisma.js";

const app: Express = express();

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
app.use("/health", healthRouter);

app.use(errorHandler);

export default app;
