const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stake = require("./StakeModel");
const connectDB = require("./db");

const app = express();
const port = process.env.PORT || 3000; // Railway escucha este puerto

app.use(cors());
app.use(express.json());

// Conexión a la base de datos
connectDB();

// Ruta principal
app.get("/", (req, res) => {
  res.send("Servidor de Staking funcionando");
});

// Obtener stakes por usuario
app.get("/stakes/:user", async (req, res) => {
  try {
    const stakes = await Stake.find({ user: req.params.user });
    res.json(stakes);
  } catch (error) {
    console.error("❌ Error al obtener stakes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${port}`);
});
