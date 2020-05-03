<template>
  <Popup
    position="bottom"
    v-model="showModal"
    v-on:close="onClose"
    :close-on-click-overlay="!forceUpdate"
    :style="{ backgroundColor: 'transparent' }"
    closeable
    close-icon="close"
  >
    <div class="editinfo">
      <i @click="onClose" class="icon-close"></i>
      <div class="editinfo-header">
        <span>{{ $t("component.changeAddr") }}</span>
      </div>
      <div class="editinfo-body">
        <InputCell
          :placeholder="
            $t('component.currentAddr') + (userInfo.nowaddress || 0)
          "
          type="text"
          :disabled="true"
        />
        <InputCell
          icon="user"
          :placeholder="$t('component.inputAddr')"
          v-model="userInfo.newaddress"
        />
        <InputCell
          icon="user"
          :placeholder="$t('component.confirmAddr')"
          v-model="userInfo.confirmaddr"
        />
      </div>
      <div class="editinfo-footer">
        <a @click="submit" class="editinfo-btn" href="javascript:;">
          {{ $t("component.changeAddrBtn") }}
        </a>
      </div>
    </div>
    <Progress :title="progresTitle" ref="progress"></Progress>
    <Confirm
      :title="confirmInfo.title"
      :desc="confirmInfo.desc"
      v-model="confirmShow"
      v-on:confirm="onConfirm"
    />
  </Popup>
</template>
<script>
import { Popup } from "vant";
import { mapState, mapActions } from "vuex";
import tbweb3 from "@/services/tbweb3";

export default {
  name: "Exchangeaddr",
  components: {
    Popup
  },
  props: {
    value: {},
    mode: {
      type: String,
      default: "improve"
    },
    modalShow: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: "value",
    event: "toggle"
  },
  data() {
    return {
      showModal: this.modalShow,
      confirmShow: false,
      forceUpdate: false,
      progresTitle: "",
      userInfo: {
        nickname: "",
        newaddress: "",
        confirmaddr: ""
      },
      TITLES: {
        improve: this.$t("component.complateUserInfo"),
        edit: this.$t("component.editUserInfo")
      },
      confirmInfo: {}
    };
  },
  computed: {
    ...mapState("account", ["user", "config", "referrer"]),
    title() {
      return this.TITLES[this.mode];
    },
    isImprove() {
      return this.mode === "improve";
    }
  },
  watch: {
    modalShow(value) {
      this.setReferrer();
      this.showModal = value;
    },
    showModal(value) {
      if (value) {
        return false;
      } else {
        this.$emit("toggle", false);
      }
    }
  },
  methods: {
    ...mapActions("account", ["fetchUser"]),
    setReferrer() {
      if (this.isImprove) {
        const { addr } = this.user;
        this.userInfo.nowaddress = addr || "";
      }
    },
    onClose() {
      this.showModal = false;
    },
    onWithdrawSubmit() {
      this.confirmShow = true;
      this.confirmInfo = {
        title: this.$t("component.sureToComfirmEdit")
      };
    },
    async onConfirm() {
      this.bindAddr();
    },
    async submit() {
      const { confirmaddr, newaddress } = this.userInfo;
      if (this.isImprove && !newaddress && !confirmaddr) {
        return this.$notify(this.$t("component.addrCanNotEmpty"));
      } else if (confirmaddr != newaddress) {
        return this.$notify(this.$t("component.addrNotEqual"));
      } else {
        this.onWithdrawSubmit();
      }
    },

    async bindAddr() {
      return new Promise(async (resolve, reject) => {
        try {
          this.progresTitle = this.$t("component.changeAddrTitle");
          this.$refs.progress.progresStep = 0;
          this.$refs.progress.show = true;
          await tbweb3.run({
            mode: "contract",
            method: "transferAccount",
            vueInstance: this,
            callback: step => {
              this.$refs.progress.progresStep = step;
            },
            args: [this.userInfo.newaddress]
          });
          this.$notify({
            message: this.$t("component.changeAddrOk"),
            background: "#07c160"
          });
          this.forceUpdate = false;
          this.showModal = false;
          resolve();
        } catch (err) {
          this.$notify({
            message: this.$t("component.changeAddrFailed") + err,
            background: "#f00"
          });
          this.showModal = true;
          reject(this.$t("component.changeAddrFailed") + err);
        } finally {
          this.$refs.progress.show = false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.editinfo {
  margin: 40px 24px;
  background-color: rgba($color: #0c093a, $alpha: 0.5);
  padding-bottom: 36px;
  .cell {
    width: 600px;
  }

  &-header {
    font-size: 24px;
    color: #c6c6c6;
    padding-top: 58px;
    padding-left: 26px;
  }
  &-btn {
    width: 600px;
    background-color: #0fa811;
    border-radius: 4px;
    font-size: 29px;
    color: white;
    text-align: center;
    letter-spacing: 4px;
    line-height: 67px;
  }
  &-body {
    margin-top: 73px;
    align-items: center;
    flex-direction: column;
    display: flex;
  }
  &-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 48px;
  }
}
</style>
