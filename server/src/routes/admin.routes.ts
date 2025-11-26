import { Router } from "express";
import {
  createMatch,
  startMatch,
  pushEvent,
} from "@/controllers/admin.controller";

const router = Router();

router.post("/matches", createMatch);
router.post("/matches/:id/start", startMatch);
router.post("/matches/:id/event", pushEvent);

export default router;
