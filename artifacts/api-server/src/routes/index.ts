import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import grokCariocaRouter from "./grok-carioca";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/openai", openaiRouter);
router.use("/grok-carioca", grokCariocaRouter);

export default router;
