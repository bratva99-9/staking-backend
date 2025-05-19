const mongoose = require("mongoose");
const fetch = require("node-fetch");
const Stake = require("./StakeModel");

const mongoUri = process.env.MONGO_URI;
const OWNER = "nightclub.gm";
const MEMO = "staking";

const runScanner = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB conectado");

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

    process.exit(0);
  } catch (error) {
    console.error("⛔ Error:", error.message);
    process.exit(1);
  }
};

runScanner();
