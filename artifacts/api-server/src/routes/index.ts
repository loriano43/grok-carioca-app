import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import chatRouter from "./chat";
import grokCariocaRouter from "./grok-carioca";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/openai", openaiRouter);
router.use("/chat", chatRouter);
router.use("/grok-carioca", grokCariocaRouter);

export default router;
