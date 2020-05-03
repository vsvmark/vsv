const reveal = require("eth-reveal");

async function trackTx(data) {
  const { web3, contract, txHash, callback } = data;
  console.warn("trackTx", txHash);
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  let notReceipt = true;
  while (notReceipt) {
    web3.eth.getTransactionReceipt(txHash, async (err, data) => {
      if ((err !== null || (data && data.blockNumber)) && notReceipt) {
        notReceipt = false;
        console.warn("trackTx", txHash, err, data);
        if (err || !data.status) {
          const { errorMessage, revertReason } = await reveal({
            hash: txHash,
            network: "mainnet"
          });
          console.warn("reveal", errorMessage, revertReason);
          callback(revertReason ? revertReason : errorMessage, false);
        } else if (data.status) {
          let events = [];
          let flag = false;
          while (!flag && contract) {
            try {
              events = await contract.getPastEvents("onError", {
                fromBlock: data.blockNumber,
                toBlock: data.blockNumber
              });
              flag = true;
            } catch (err) {
              console.log("getPastEvents", err);
              await sleep(1000);
            }
          }
          console.warn("getPastEvents", events);
          if (events && events.length > 0) {
            callback(events[0].returnValues.reason, false);
          }
          callback(null, true);
        } else {
          callback(err, false);
        }
      }
    });
    await sleep(1000);
  }
}

export default trackTx;
