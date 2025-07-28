import express from "express";
import cors from "cors";
import { Chain } from "./main.js";
import dotenv from "dotenv";
import  {formatConvHistory}  from "./util/formatConvHistory.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req,res) => {
  try {
    const {question,history} = req.body;
     const convo = formatConvHistory(history);
    const response = await Chain.invoke({question,conv_history: convo,})
    res.json({ response });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3001)