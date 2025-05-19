require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stake = require("./StakeModel");
const fetchStakeDeposits = require("./scanner"); // Función de escaneo

const app = express();
const port = process.env.PORT || 8080;
const mongoUri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error.message);
  }
};

// Ruta principal
app.get("/", (req, res) => {
  res.send("🚀 Backend de Staking funcionando correctamente!");
});

// Consultar NFTs en staking por usuario
app.get("/stakes/:user", async (req, res) => {
  try {
    const stakes = await Stake.find({ user: req.params.user });
    res.json(stakes);
  } catch (err) {
    res.status(500).json({ error: "Error al consultar staking" });
  }
});

// 🔁 Ruta secreta que dispara el escaneo manual
app.get("/scan", async (req, res) => {
  try {
    await fetchStakeDeposits();
    res.status(200).send("✅ Escaneo ejecutado correctamente");
  } catch (error) {
    console.error("❌ Error al ejecutar escaneo:", error.message);
    res.status(500).send("⛔ Error al escanear");
  }
});

// Iniciar servidor
app.listen(port, "0.0.0.0", async () => {
  await connectDB();
  console.log(`🚀 Servidor escuchando en el puerto ${port}`);

  // Escaneo inicial al levantar
  await fetchStakeDeposits();

  // Escaneo automático cada 5 minutos
  setInterval(fetchStakeDeposits, 5 * 60 * 1000);
});
