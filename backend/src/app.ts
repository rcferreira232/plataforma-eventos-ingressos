import express, { type Express } from "express";
import cors from "cors";
import morgan from "morgan";

export const app: Express = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
