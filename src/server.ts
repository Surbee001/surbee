import express from "express";
import bodyParser from "body-parser";
import { buildSurvey } from "./orchestrator";

const app = express();
app.use(bodyParser.json());

app.post("/ai/survey/build", async (req, res) => {
  try {
    const userMessage: string = req.body?.message ?? "";
    const out = await buildSurvey(userMessage);
    res.json(out);
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "unknown_error" });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Surbee AI server running on :${port}`);
});

export default app;
