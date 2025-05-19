const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stake = require("./StakeModel");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI;

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

// Ruta raíz rápida
app.get("/", (req, res) => {
  res.send("🚀 Backend de Staking funcionando correctamente!");
});

// Consultar stakes
app.get("/stakes/:user", async (req, res) => {
  try {
    const stakes = await Stake.find({ user: req.params.user });
    res.json(stakes);
  } catch (err) {
    res.status(500).json({ error: "Error al consultar staking" });
  }
});

// Iniciar servidor
app.listen(port, "0.0.0.0", async () => {
  await connectDB();
  console.log(`🚀 Servidor escuchando en el puerto ${port}`);
});
