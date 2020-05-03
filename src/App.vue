<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
    <Confirm
      :title="$t('app.newMsg')"
      :desc="desc"
      v-model="notification"
      v-on:confirm="onConfirm"
    />
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
import tbweb3 from "@/services/tbweb3";
import emitter from "@/services/emitter";
import Cookies from "js-cookie";
import { getNotification, readNotification } from "@/api/account";

export default {
  name: "App",
  computed: {
    ...mapState("account", ["config", "user"])
  },
  data() {
    return {
      notification: false,
      id: 0,
      desc: ""
    };
  },
  async created() {
    let isGoing = false;
    let loading = this.$toast.loading({
      duration: 0,
      mask: true,
      message: this.$t("app.loading")
    });
    emitter.on("SYSTEM_INITED", () => {
      this.checkPendingTx();
    });
    emitter.on("ON_USER_LOGIN", this.fetchNotification);
    emitter.on("EVENT_LOGIN_INVALID", async () => {
      if (isGoing) return;
      tbweb3.saveOrClearPending(true);
      if (!Cookies.get("dmmm_token")) {
        loading.clear();
        return;
      }
      try {
        isGoing = true;
        await this.login();
        loading.clear();
        emitter.emit("ON_USER_LOGIN");
      } catch (error) {
        loading.clear();
        console.warn("user login failed", error);
      } finally {
        isGoing = false;
      }
    });

    try {
      await this.initConfig();
      await tbweb3.init(this.config, this.reload);
      emitter.emit("SYSTEM_INITED");
      await this.checkUser();
      loading.clear();
      emitter.emit("ON_USER_LOGIN");
    } catch (err) {
      console.info("App created", err);
      emitter.emit("EVENT_LOGIN_INVALID");
    }
  },
  methods: {
    ...mapActions("account", [
      "initConfig",
      "login",
      "checkUser",
      "checkPendingTx"
    ]),
    reload() {
      Cookies.set("dmmm_token", "changed", {
        domain:
          process.env.NODE_ENV === "production"
            ? "dmmm.io"
            : `${window.location.host.split(":")[0]}`,
        path: "/"
      });
      window.location.reload();
    },
    fetchNotification() {
      setInterval(async () => {
        try {
          if (this.notification) return;
          const noti = await getNotification();
          if (noti.length > 0) {
            const item = noti[0];
            this.id = item.ID;
            switch (item.event_type) {
              case 1:
                this.desc = this.$t("app.levelUpgrade", [item.ext_data]);
                break;
              case 2:
                this.desc = this.$t("app.becameNode");
                break;
              case 3:
                this.desc = this.$t("app.becameSuperNode");
                break;
              default:
                this.desc = JSON.stringify(item);
                break;
            }
            this.notification = true;
          }
        } catch (_) {
          // ingore error
        }
      }, 10000);
    },
    async onConfirm() {
      try {
        await readNotification(this.id);
      } catch (_) {
        // ignore error
      } finally {
        this.desc = "";
        this.id = 0;
        this.notification = false;
      }
    }
  }
};
</script>
<style>
body {
  background-color: #15023e;
  -webkit-tap-highlight-color: transparent;
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: 750px;
  margin: 0 auto;
  color: #00f6ff;
  background-image: url("./assets/img/starbg.png");
  background-repeat: repeat;
}
</style>
