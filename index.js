// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stake = require("./StakeModel");
const connectDB = require("./db");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB
connectDB();

// ✅ Ruta base
app.get("/", (req, res) => {
  res.send("Servidor de Staking funcionando");
});

// Endpoint para consultar los stakes de un usuario
app.get("/stakes/:user", async (req, res) => {
  try {
    const stakes = await Stake.find({ user: req.params.user });
    res.json(stakes);
  } catch (err) {
    console.error("Error al obtener stakes:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor backend escuchando en el puerto ${port}`);
});
