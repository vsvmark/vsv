import {
  getConfig,
  getUser,
  getNonce,
  userLogin,
  getGears,
  getGame,
  getData
} from "@/api/account";

import tbweb3 from "@/services/tbweb3";
import trackTx from "@/utils/trackTx";
const reveal = require("eth-reveal");

const state = {
  config: {},
  user: {},
  gameInfo: {
    stepList: []
  },
  gears: [],
  data: {},
  pendingTx: false,
  token: {},
  referrer: ""
};

async function specUser(user) {
  user.total_income =
    parseFloat(user.invest_income) +
    parseFloat(user.node_income) +
    parseFloat(user.supernode_income);
  return user;
}

const mutations = {
  UPDATE_CONFIG: (state, config) => {
    state.config = config;
  },

  UPDATE_USER: (state, user) => {
    state.user = { ...state.user, ...user };
  },
  UPDATE_GAME: (state, gameInfo) => {
    state.gameInfo = gameInfo;
  },
  UPDATE_GEARS: (state, gears) => {
    state.gears = gears;
  },
  UPDATE_DATA: (state, data) => {
    state.data = data;
  },
  UPDATE_PENDING: (state, pendingTx) => {
    state.pendingTx = pendingTx;
  },
  UPDATE_TOKEN: (state, token) => {
    state.token = token;
  },
  UPDATE_REFERRER: (state, referrer) => {
    state.referrer = referrer;
  }
};

const actions = {
  initConfig: async ({ commit }) => {
    const json = await getConfig();
    commit("UPDATE_CONFIG", json);
    return json;
  },

  fetchUser: async ({ commit }) => {
    const user = await getUser();
    commit("UPDATE_USER", await specUser(user));
    commit("UPDATE_TOKEN", await tbweb3.setNbtInfo());
    return true;
  },

  checkPendingTx: async ({ commit }) => {
    if (!tbweb3.pendingTx) {
      console.log("no pending tx");
      commit("UPDATE_PENDING", false);
      return;
    }
    console.log("hasPendingTx", tbweb3.pendingTx);
    try {
      commit("UPDATE_PENDING", true);
      const { errorMessage, revertReason, status } = await reveal({
        hash: tbweb3.pendingTx,
        network: "mainnet"
        // etherscanKey: ,
      });
      tbweb3.saveOrClearPending(true);
      if (status == 1) {
        await tbweb3.checkSnapshot();
        const user = await getUser();
        commit("UPDATE_USER", await specUser(user));
        commit("UPDATE_TOKEN", await tbweb3.setNbtInfo());
      }
      commit("UPDATE_PENDING", false);
      console.log("reveal", errorMessage, revertReason, status);
    } catch (error) {
      console.log("reveal error", error);
      if (error.toString().indexOf("No transaction found") >= 0) {
        tbweb3.saveOrClearPending(true);
        proc = true;
        commit("UPDATE_PENDING", false);
        return;
      }
    }
    let proc = false;
    trackTx({
      web3: tbweb3.instance,
      txHash: tbweb3.pendingTx,
      contract:
        tbweb3[tbweb3.pendingMode == "nbt" ? "contract" : tbweb3.pendingMode],
      callback: async (err, done) => {
        console.log("trackTx done", proc, err, done);
        if (proc) return;
        tbweb3.saveOrClearPending(true);
        proc = true;
        commit("UPDATE_PENDING", false);
        if (done) {
          await tbweb3.checkSnapshot();
          const user = await getUser();
          commit("UPDATE_USER", await specUser(user));
          commit("UPDATE_TOKEN", await tbweb3.setNbtInfo());
        }
      }
    });
  },

  fetchData: async ({ commit }) => {
    const res = await getData();
    commit("UPDATE_DATA", res);
  },

  fetchGame: async ({ commit }) => {
    const res = await getGame({
      uid: state.user.id,
      limit: 7
    });

    let stepDesc = "",
      userCount = 0,
      stepList = [];

    commit("UPDATE_GAME", {
      stepDesc,
      waitingUsers: res.waiting_users || 0,
      blockNumber: res.heightest_block_number,
      userCount,
      currentGame: res.current_game,
      incomeRate: 100 + Number(res.expected_rate_of_return),
      userCountHelpedMe: res.user_count_helped_me,
      userCountIHelped: res.user_count_i_helped,

      stepList
    });

    return true;
  },

  fetchGears: async ({ commit }) => {
    const res = await getGears();
    let gears = res.gears.reverse();
    gears.forEach(item => {
      item.enabled = false;
      if (
        item.level <= state.user.level &&
        item.level >= state.user.max_gear_history
      ) {
        item.enabled = true;
      }
      item.total = item.usd_num + item.usd_income;
    });
    commit("UPDATE_GEARS", gears);
    return true;
  },

  checkUser: async ({ commit }) => {
    let user = await getUser();
    user = await specUser(user);
    commit("UPDATE_TOKEN", await tbweb3.setNbtInfo());
    return new Promise(async (resolve, reject) => {
      try {
        if (!tbweb3.isSame(user.addr)) {
          throw new Error("account not match");
        }
        commit("UPDATE_USER", user);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  login: async ({ commit }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const nonce = await getNonce();
        const postData = await tbweb3.getSign(nonce);
        const res = await userLogin(postData);

        commit("UPDATE_USER", await specUser(res.user));
        commit("UPDATE_TOKEN", await tbweb3.setNbtInfo());
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
  setReferrer: ({ commit }, value) => {
    commit("UPDATE_REFERRER", value);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
