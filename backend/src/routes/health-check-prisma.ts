import { Router } from "express";
import { prisma } from "@/libs/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

router.get("/prisma", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro na conexão com o banco:", error);
    return res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

export { router as healthRouter };
