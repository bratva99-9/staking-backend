const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fetch = require("node-fetch");
const Stake = require("./StakeModel");

const app = express();
const port = process.env.PORT || 3000;

const OWNER = "nightclub.gm";
const MEMO = "staking";

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
const mongoUri = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error);
  }
};

// Escanear blockchain
const fetchStakeDeposits = async () => {
  try {
    const url = `https://wax.eosrio.io/v2/history/get_actions?account=${OWNER}&filter=atomicassets:transfer&sort=desc&limit=50`;
    const res = await fetch(url);
    const result = await res.json();

    if (!result || !Array.isArray(result.actions)) return;

    for (const action of result.actions) {
      const act = action.act.data;
      if (
        act &&
        act.memo &&
        act.to === OWNER &&
        act.memo.toLowerCase() === MEMO
      ) {
        const alreadyStored = await Stake.findOne({ tx: action.trx_id });
        if (!alreadyStored) {
          const stake = new Stake({
            user: act.from,
            asset_ids: act.asset_ids,
            memo: act.memo,
            tx: action.trx_id,
            timestamp: new Date(action["@timestamp"]),
          });
          await stake.save();
          console.log("✅ NFT en staking guardado:", stake);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error al escanear la blockchain:", err.message);
  }
};

// Rutas
app.get("/", (req, res) => {
  res.send("🚀 Backend de Staking funcionando correctamente!");
});

app.get("/stakes/:user", async (req, res) => {
  try {
    const stakes = await Stake.find({ user: req.params.user });
    res.json(stakes);
  } catch (err) {
    res.status(500).json({ error: "Error al consultar staking" });
  }
});

// Iniciar servidor y tareas programadas
app.listen(port, () => {
  connectDB();
  console.log(`🚀 Servidor escuchando en el puerto ${port}`);

  // Llamar luego de 5 segundos para evitar interferencia en arranque
  setTimeout(fetchStakeDeposits, 5000);
});
