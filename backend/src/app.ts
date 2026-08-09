import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";

export const app: Express = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
