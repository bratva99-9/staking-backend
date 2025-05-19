// scanner.js
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const Stake = require("./StakeModel");

const mongoUri = process.env.MONGO_URI;
const OWNER = "nightclub.gm";
const MEMO = "staking";

// Función reutilizable
async function fetchStakeDeposits() {
  try {
    const url = `https://wax.eosrio.io/v2/history/get_actions?account=${OWNER}&filter=atomicassets:transfer&sort=desc&limit=50`;
    const res = await fetch(url);
    const result = await res.json();

    for (const action of result.actions || []) {
      const act = action.act.data;
      if (
        act?.memo &&
        act.to === OWNER &&
        act.memo.toLowerCase() === MEMO
      ) {
        const exists = await Stake.findOne({ tx: action.trx_id });
        if (!exists) {
          const stake = new Stake({
            user: act.from,
            asset_ids: act.asset_ids,
            memo: act.memo,
            tx: action.trx_id,
            timestamp: new Date(action["@timestamp"]),
          });
          await stake.save();
          console.log("✅ Guardado:", stake.tx);
        }
      }
    }
  } catch (error) {
    console.error("⛔ Error en fetchStakeDeposits:", error.message);
  }
}

// Exporta la función para usar en index.js
module.exports = fetchStakeDeposits;

// Si se ejecuta directamente (node scanner.js), conecta y corre
if (require.main === module) {
  require("dotenv").config();
  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      console.log("✅ Conectado a MongoDB");
      await fetchStakeDeposits();
      mongoose.disconnect();
    })
    .catch((err) => {
      console.error("❌ Error conectando a MongoDB:", err.message);
    });
}
