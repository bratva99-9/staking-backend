// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stake = require("./StakeModel");

const app = express();
const port = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CONEXIÓN A MONGODB
const mongoUri = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error);
  }
};

// ENDPOINT DE PRUEBA
app.get("/", (req, res) => {
  res.send("Servidor de Staking funcionando");
});

// ENDPOINT: Obtener NFTs en staking por usuario
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
  connectDB();
  console.log(`🚀 Servidor escuchando en el puerto ${port}`);
});
