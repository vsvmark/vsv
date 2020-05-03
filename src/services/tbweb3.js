import Web3 from "web3";
import { getToken } from "@/api/account";
import trackTx from "@/utils/trackTx";
import BN from "bn.js";
const reveal = require("eth-reveal");

function getRevertReason(err, vueInstance) {
  if (err.startsWith("0x")) err = Web3.utils.hexToString(err);
  if (err && err.message) {
    err = err.message;
  }
  if (err) {
    if (err.indexOf("User denied") >= 0) {
      err = "A0";
    }
    err = err.replace(/[^\x20-\x7E]/g, "").trim();
  }
  let reason = vueInstance.$t("err." + err);
  if (!reason || reason == "") {
    console.warn("Web run unknown error", err);
    reason = vueInstance.$t("err.Unknown", [err]);
  }
  return reason;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class TbWeb3 {
  instance = null;
  nbt = null;

  // for pending tx
  pendingTx = null;
  pendingOldSnapshot = null;
  pendingMethod = null;
  pendingMode = null;
  pendingUserID = "0";

  contract = null;
  currentAddr = null;
  config = null;
  isMdsApp = /MdsApp/.test(navigator.userAgent);
  isImToken = window.ethereum && window.ethereum.isImToken;
  isTrust = window.ethereum && window.ethereum.isTrust;
  isMobile =
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1;

  checkAccounts() {
    this.instance.eth.getAccounts((err, accounts) => {
      if (err) {
        console.warn("getAccounts", err);
      }
      if (this.currentAddr && this.currentAddr != accounts[0]) {
        this.saveOrClearPending(true);
        onchange && onchange();
      }
      setTimeout(() => {
        this.checkAccounts();
      }, 3000);
    });
  }

  async init(config, onchange) {
    const pendingTx = localStorage.getItem("pendingTx");
    if (pendingTx) {
      const obj = JSON.parse(pendingTx);
      this.pendingMethod = obj.method;
      this.pendingMode = obj.mode;
      this.pendingOldSnapshot = obj.old;
      this.pendingTx = obj.tx;
      this.pendingUserID = obj.userID;
    }
    return new Promise((resolve, reject) => {
      if (
        typeof window.ethereum !== "undefined" ||
        typeof window.web3 !== "undefined"
      ) {
        this.instance = new Web3(
          window.ethereum || window.web3.currentProvider
        );
      }

      this.config = config;

      if (this.instance) {
        this.nbt = new this.instance.eth.Contract(
          JSON.parse(config.erc20abi),
          config.token_address
        );
        this.adc = new this.instance.eth.Contract(
          JSON.parse(config.adc_abi),
          config.award_address
        );
        this.contract = new this.instance.eth.Contract(
          JSON.parse(config.abi),
          config.contract_address
        );
      }

      if (window.ethereum) {
        window.ethereum
          .enable()
          .then(accounts => {
            this.currentAddr = accounts[0];
            if (window.ethereum.on) {
              window.ethereum.on("accountsChanged", act => {
                if (act[0] != this.currentAddr) {
                  this.saveOrClearPending(true);
                  onchange && onchange();
                }
              });
            } else {
              this.checkAccounts();
            }
            console.warn("System inited:", this.currentAddr);
            resolve();
          })
          .catch(reject);
      } else if (window.web3) {
        this.instance.eth.getAccounts((err, accounts) => {
          if (err) {
            reject(err);
          }
          this.currentAddr = accounts[0];
          this.checkAccounts();
          console.warn("System inited:", this.currentAddr);
          resolve();
        });
      } else {
        reject(new Error("Ethereum instance not found"));
      }
    });
  }

  dollar2cent(usdAmt) {
    return usdAmt * 100000;
  }

  cent2dollar(usdAmt) {
    return usdAmt / 100000;
  }

  wei2ether(weiAmt) {
    return Web3.utils.fromWei(weiAmt);
  }

  toWei(ether) {
    return Web3.utils.toWei(ether);
  }

  async T2U(tokenAmt) {
    if (!tokenAmt) {
      return "0";
    }
    return new Promise((resolve, reject) => {
      this.contract.methods.T2U(tokenAmt).call((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async T2E(tokenAmt) {
    if (!tokenAmt) {
      return "0";
    }
    return new Promise((resolve, reject) => {
      this.contract.methods.T2E(tokenAmt).call((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async E2U(etherAmt) {
    if (!etherAmt) {
      return "0";
    }
    return new Promise((resolve, reject) => {
      this.contract.methods.E2U(etherAmt).call((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async balanceOf(addr) {
    if (!addr) {
      return "0";
    }
    return new Promise((resolve, reject) => {
      this.nbt.methods.balanceOf(addr).call((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async U2T(usdAmt) {
    if (!usdAmt) {
      return "0";
    }
    return new Promise((resolve, reject) => {
      this.contract.methods.U2T(usdAmt).call((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async E2T(ether) {
    if (!ether) {
      return "0";
    }
    return new Promise((resolve, reject) => {
      this.contract.methods.E2T(ether).call((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async getUserStatus(userID) {
    return new Promise((resolve, reject) => {
      this.contract.methods.getUserStatus(userID).call((err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  }

  async getNodeIncomeBalance(userID) {
    return new Promise((resolve, reject) => {
      this.contract.methods.getNodeIncomeBalance(userID).call((err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  }

  async bonusFund() {
    return new Promise((resolve, reject) => {
      this.contract.methods.bonusFund().call((err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  }

  async getIDByAddr() {
    return new Promise((resolve, reject) => {
      this.contract.methods.getIDByAddr(this.currentAddr).call((err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  }

  async getSign(config) {
    return new Promise((resolve, reject) => {
      const signData = JSON.stringify({
        user: this.currentAddr,
        token: this.nbt.address
      });

      let sendParams, signType;
      if (this.isImToken || this.isMdsApp || this.isTrust) {
        let params = [this.currentAddr, config.message.nonce + signData];
        if (this.isMdsApp || this.isTrust) {
          params = [
            this.instance.utils.toHex(config.message.nonce + signData),
            this.currentAddr
          ];
        }
        sendParams = {
          method: "personal_sign",
          params: params,
          from: this.currentAddr
        };
        signType = 2;
      } else {
        let data = {
          types: config.types,
          domain: {
            name: config.domain.name,
            version: config.domain.version,
            chainId: config.domain.chainId
          },
          primaryType: config.primaryType,
          message: {
            nonce: config.message.nonce,
            data: signData
          }
        };
        sendParams = {
          method: "eth_signTypedData_v3",
          params: [this.currentAddr, JSON.stringify(data)],
          from: this.currentAddr
        };
        signType = 1;
      }
      window.web3.currentProvider.sendAsync(sendParams, (err, res_sign) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            data: signData,
            nonce: config.message.nonce,
            sign: res_sign.result,
            sign_type: signType
          });
        }
      });
    });
  }

  async setNbtInfo() {
    const token = await getToken({
      token: this.nbt.address
    });
    token.active_token_price = await this.U2T(
      this.dollar2cent(token.active_usd_price)
    );
    token.show_active_token_price = this.wei2ether(token.active_token_price);
    token.match_pool_usd = this.cent2dollar(
      await this.T2U(this.toWei(token.match_pool_token))
    );
    token.reserve_addr_eth = this.wei2ether(
      await this.instance.eth.getBalance(this.config.reserve_address)
    );
    token.reserve_addr_usd = this.cent2dollar(
      await this.E2U(this.toWei(token.reserve_addr_eth))
    );
    token.market_maker_addr_eth = this.wei2ether(
      await this.instance.eth.getBalance(this.config.market_maker_address)
    );
    token.market_maker_addr_eth_usd = this.cent2dollar(
      await this.E2U(this.toWei(token.market_maker_addr_eth))
    );
    token.market_maker_addr_eth2 = this.wei2ether(
      await this.instance.eth.getBalance(this.config.market_maker_address2)
    );
    token.market_maker_addr_eth_usd2 = this.cent2dollar(
      await this.E2U(this.toWei(token.market_maker_addr_eth2))
    );
    token.market_maker_addr_token = this.wei2ether(
      await this.balanceOf(this.config.market_maker_address)
    );
    token.market_maker_addr_token_usd = this.cent2dollar(
      await this.T2U(this.toWei(token.market_maker_addr_token))
    );
    token.security_pool_usd = this.cent2dollar(
      await this.T2U(this.toWei(token.security_pool_token))
    );
    token.match_pool_usd = this.cent2dollar(
      await this.T2U(this.toWei(token.match_pool_token))
    );
    token.award_pool_eth = new BN(
      await this.instance.eth.getBalance(this.config.award_address)
    );
    token.award_pool_eth = token.award_pool_eth.add(
      new BN(await this.T2E(await this.bonusFund()))
    );
    token.award_pool_usd = this.cent2dollar(
      await this.E2U(token.award_pool_eth.toString())
    );
    token.award_pool_eth = this.wei2ether(token.award_pool_eth);
    token.source_pool_usd = this.cent2dollar(
      await this.T2U(this.toWei(token.source_pool_token))
    );
    this.nbt.info = token;
    return token;
  }

  isSame(addr) {
    return addr.toLowerCase() == this.currentAddr.toLowerCase();
  }

  async checkApprove() {
    return new Promise(resolve => {
      this.nbt.methods
        .allowance(this.currentAddr, this.config.contract_address)
        .call(
          {
            from: this.currentAddr
          },
          (err, res) => {
            if (!res || res < this.nbt.info.ticket_token_price) {
              resolve(false);
            } else {
              resolve(true);
            }
          }
        );
    });
  }

  async getSnapshot() {
    return new Promise(async resolve => {
      switch (this.pendingMethod) {
        case ("userWithdrawNode", "userWithdrawSuperNode"):
          resolve(
            this.pendingUserID > 0
              ? await this.getNodeIncomeBalance(this.pendingUserID)
              : {}
          );
          return;

        case "ensureUserActive":
          resolve(await this.getIDByAddr(this.currentAddr));
          return;

        default:
          resolve(
            this.pendingUserID > 0
              ? await this.getUserStatus(this.pendingUserID)
              : {}
          );
          return;
      }
    });
  }

  saveOrClearPending(clear) {
    if (clear) {
      localStorage.setItem(
        "pendingTx",
        JSON.stringify({
          method: "",
          mode: "",
          old: null,
          tx: "",
          userID: "0"
        })
      );
    } else {
      localStorage.setItem(
        "pendingTx",
        JSON.stringify({
          method: this.pendingMethod,
          mode: this.pendingMode,
          old: this.pendingOldSnapshot,
          tx: this.pendingTx,
          userID: this.pendingUserID
        })
      );
    }
  }

  async checkSnapshot() {
    this.pendingUserID =
      this.pendingUserID != "0" ? this.pendingUserID : await this.getIDByAddr();
    let currentStatus = await this.getSnapshot();
    while (
      JSON.stringify(this.pendingOldSnapshot) == JSON.stringify(currentStatus)
    ) {
      this.pendingUserID =
        this.pendingUserID != "0"
          ? this.pendingUserID
          : await this.getIDByAddr();
      currentStatus = await this.getSnapshot();
      await sleep(500);
    }
    console.log("checkSnapshot", currentStatus, this.pendingOldSnapshot);
  }

  async run(options) {
    const { mode, method, args, callback, vueInstance } = options;

    console.warn("web3 call", mode, method, args);
    return new Promise(async (resolve, reject) => {
      let proc = false;
      let receipt = {};

      this.pendingUserID = await this.getIDByAddr();
      this.pendingMethod = method;
      this.pendingMode = mode;
      this.pendingOldSnapshot = await this.getSnapshot();

      let callOpts = {
        from: this.currentAddr
      };
      if (this.isImToken && method == "transfer") {
        callOpts.gas = 2000000;
      }
      callback && callback(1);
      if (this.isMobile) {
        this[mode].methods[method](...args)
          .send(callOpts)
          .on("transactionHash", hash => {
            callback && callback(2);
            this.pendingTx = hash;
            this.saveOrClearPending();
            trackTx({
              web3: this.instance,
              txHash: this.pendingTx,
              contract: this[mode == "nbt" ? "contract" : mode],
              callback: async (err, done) => {
                console.log("trackTx", proc, err, done);
                if (proc) return;
                this.saveOrClearPending(true);
                this.pendingTx = null;
                proc = true;
                if (done) {
                  callback && callback(3);
                  await this.checkSnapshot();
                  this.pendingOldSnapshot = null;
                  callback && callback(4);
                  resolve();
                } else {
                  this.pendingOldSnapshot = null;
                  reject(getRevertReason(err, vueInstance));
                }
              }
            });
          })
          .on("error", err => {
            if (proc || this.pendingTx) return;
            this.saveOrClearPending(true);
            if (err && err.message.indexOf("Failed to subscribe") < 0) {
              proc = true;
              reject(getRevertReason(err, vueInstance));
            }
          });
      } else {
        this[mode].methods[method](...args)
          .send(callOpts)
          .once("transactionHash", hash => {
            console.warn("transactionHash", hash);
            callback && callback(2);
            this.pendingTx = hash;
            this.saveOrClearPending();
          })
          .on("receipt", async rec => {
            console.warn("receipt", rec);
            if (proc) return;
            proc = true;
            this.saveOrClearPending(true);
            this.pendingTx = null;
            callback && callback(3);
            receipt = rec;
            const events = await this[
              mode == "nbt" ? "contract" : mode
            ].getPastEvents("onError", {
              fromBlock: receipt.blockNumber,
              toBlock: receipt.blockNumber
            });
            console.warn("reveal", events);
            if (events && events.length > 0) {
              this.pendingOldSnapshot = null;
              reject(getRevertReason(events[0].reason, vueInstance));
            } else {
              await this.checkSnapshot();
              this.pendingOldSnapshot = null;
              resolve();
            }
          })
          .on("error", async err => {
            console.warn("onError", err);
            if (proc) return;
            proc = true;
            this.saveOrClearPending(true);
            if (this.pendingTx) {
              const { errorMessage, revertReason } = await reveal({
                hash: this.pendingTx,
                network: "mainnet"
                // etherscanKey: ,
              });
              this.pendingTx = null;
              this.pendingOldSnapshot = null;
              console.warn("reveal", errorMessage, revertReason);
              reject(
                getRevertReason(
                  revertReason ? revertReason : errorMessage,
                  vueInstance
                )
              );
              return;
            }
            this.pendingTx = null;
            this.pendingOldSnapshot = null;
            reject(getRevertReason(err, vueInstance));
          });
      }
    });
  }
}

export default new TbWeb3();
