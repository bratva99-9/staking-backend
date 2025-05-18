const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fetch = require("node-fetch");
const Stake = require("./StakeModel");

const app = express();
const port = process.env.PORT || 3000;

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

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Servidor de Staking funcionando");
});

// Ruta para consultar los NFTs en staking por usuario
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

// Función para escanear blockchain y guardar nuevos stakes
async function fetchStakeDeposits() {
  const OWNER = "nightclub.gm";
  const MEMO = "staking";

  try {
    const url = `https://wax.eosrio.io/v2/history/get_actions?account=${OWNER}&filter=atomicassets:transfer&sort=desc&limit=50`;
    const res = await fetch(url);
    const result = await res.json();

    if (!result || !Array.isArray(result.actions)) {
      console.log("❌ No se recibieron datos.");
      return;
    }

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
    console.error("❌ Error al consultar transacciones:", err.message);
  }
}

// Iniciar servidor y escanear periódicamente
app.listen(port, async () => {
  await connectDB();
  console.log(`🚀 Servidor escuchando en el puerto ${port}`);

  // Escanear cada 1 minuto
  fetchStakeDeposits();
  setInterval(fetchStakeDeposits, 60 * 1000);
});
