import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { reactive } from 'vue';

const API_CRYPTO_PATH = '/api/crypto';
const WDT_SUPPLY = 20_000_000;

const $axios = axios.create({ baseURL: process.env.API_URL, withCredentials: true });

const state = reactive({
  rewards: [],
  tokenBalance: '0',
  share: '0',
  account: null,
  web3: null,
  depositInfo: null,
  depositRequestIsActive: false,
  websocket: null,
  config: null,
  chosenNetwork: null,
});

const timer = reactive({ remaining: 0, interval: null });

const actions = {
  loadConfig: async () => {
    await $axios
      .get(`${API_CRYPTO_PATH}/deposit/config`)
      .then(r => {
        state.config = r.data;
        state.chosenNetwork = {
          name: `polygon-WDT`,
          value: {
            token: state.config.polygon.tokens.WDT,
            network: 'polygon',
          },
        };
      })
      .catch(e => console.error(e));
  },

  connectWebSocket: () => {
    state.websocket = new WebSocket(process.env.WSS_URL);

    state.websocket.onmessage = event => {
      const message = JSON.parse(event.data);

      if (message.id === state.depositInfo.id) {
        const confirmations = state.depositInfo.confirmations;

        state.depositInfo = message;
        state.depositInfo.confirmations = confirmations;
      }

      if (message.hash === state.depositInfo.tx.hash) {
        state.depositInfo.confirmations = message.confirmations;
      }
    };

    state.websocket.onerror = err => console.error(err);
  },

  disconnectWebSocket: () => {
    if (state.websocket) {
      state.websocket.close();
      state.websocket = null;
    }
  },

  listRewards: async () => {
    try {
      const r = await $axios.get(`${API_CRYPTO_PATH}/rewards`);

      state.rewards = r.data;
      state.tokenBalance = r.data.reduce((acc, v) => acc.plus(v.amount), new BigNumber('0')).toString();

      state.share = new BigNumber(state.tokenBalance).div(WDT_SUPPLY).multipliedBy(100).toFormat(6);
    } catch (e) {
      console.error(e);
    }
  },

  collectRewards: async () => {
    try {
      await $axios.post(`${API_CRYPTO_PATH}/collect`, { recipient: state.account });
      await actions.listRewards();
    } catch (e) {
      console.error(e);
    }
  },

  disconnectWallet: async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      });
      state.account = null;
    } catch (e) {
      console.error(e);
    }
  },

  connectWallet: async () => {
    try {
      const accounts = await state.web3.eth.requestAccounts();
      state.account = accounts[0];
    } catch (e) {
      console.error(e);
    }
  },

  tryReconnectWallet: async () => {
    try {
      const a = await state.web3.eth.getAccounts();
      if (a.length > 0) {
        await actions.connectWallet();
      }
    } catch (e) {
      console.error(e);
    }
  },

  requestCryptoDeposit: async amount => {
    state.depositRequestIsActive = true;

    await $axios
      .post(`${API_CRYPTO_PATH}/deposit`, {
        network: state.chosenNetwork.value.network,
        amount: new BigNumber(amount).shiftedBy(8).toString(),
        token: state.chosenNetwork.value.token,
      })
      .then(r => {
        state.depositInfo = r.data;

        const createTimestamp = new Date(r.data.createdAt).getTime();
        const dead = createTimestamp + state.config[state.chosenNetwork.value.network].waitingTime;
        timer.remaining = Math.floor((dead - Date.now()) / 1000);

        timer.interval = setInterval(() => {
          timer.remaining -= 1;

          if (timer.remaining === 0) {
            clearInterval(timer.interval);
          }
        }, 1000);
      })
      .catch(e => console.error(e));

    state.depositRequestIsActive = false;

    actions.connectWebSocket();
  },

  stopTimer: () => {
    clearInterval(timer.interval);
  },

  cancelDeposit: async () => {
    await $axios
      .post(`${API_CRYPTO_PATH}/deposit/cancel`, { id: state.depositInfo.id })
      .then(() => actions.stopTimer())
      .then(() => actions.disconnectWebSocket())
      .catch(e => console.error(e));
  },
};

export { actions, state, timer };
