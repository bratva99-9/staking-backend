const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stake = require("./StakeModel");
const connectDB = require("./db");

const app = express();
const port = process.env.PORT || 3000;

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// CONEXIÓN A MONGODB
connectDB();

// ENDPOINT raíz para verificar que funcione
app.get("/", (req, res) => {
  res.send("✅ Servidor de Staking en WAX activo");
});

// ENDPOINT para ver NFTs en staking por usuario
app.get("/stakes/:user", async (req, res) => {
  const user = req.params.user;
  try {
    const stakes = await Stake.find({ user });
    res.status(200).json(stakes);
  } catch (error) {
    console.error("❌ Error al obtener stakes:", error);
    res.status(500).json({ error: "Error al obtener stakes" });
  }
});

// INICIAR SERVIDOR
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${port}`);
});
