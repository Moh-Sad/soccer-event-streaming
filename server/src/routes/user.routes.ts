import { Router } from "express";
import { listMatches, streamMatch } from "@/controllers/matches.controller";

const router = Router();

router.get("/matches", listMatches);
router.get("/matches/:id/stream", streamMatch);

export default router;
