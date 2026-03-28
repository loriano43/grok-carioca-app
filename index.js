const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Grok Carioca API rodando");
});

app.get("/api/test", (req, res) => {
  res.json({ mensagem: "Tudo funcionando" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("  Servidor rodando na porta " + PORT);
});