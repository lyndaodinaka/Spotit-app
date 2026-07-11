import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getNhsIntegrationStatus, testNhsIntegration } from "../services/nhs";

export const integrationRouter = Router();

integrationRouter.use(requireAuth);

integrationRouter.get("/nhs/status", (_request, response) => {
  response.json(getNhsIntegrationStatus());
});

integrationRouter.post("/nhs/test", async (_request, response) => {
  response.json(await testNhsIntegration());
});
