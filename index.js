const fetch = require("node-fetch");
const connectDB = require('./db');
const Stake = require('./StakeModel');

const OWNER = "nightclub.gm";
const MEMO = "staking";

async function fetchStakeDeposits() {
  await connectDB();

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
}

fetchStakeDeposits();
