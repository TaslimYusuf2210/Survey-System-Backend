import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger.js";

const router = Router();

// Serve Swagger UI
router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "Eye_Patch Survey System - API Docs",
  customCss: ".swagger-ui .topbar { display: none }",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
}));

// Serve raw OpenAPI JSON
router.get("/openapi.json", (_req, res) => {
  res.json(swaggerSpec);
});

export default router;
