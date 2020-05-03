<template>
  <div>
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
          <span>{{ $t("component.improveInfoTitle") }}</span>
        </div>
        <div class="editinfo-body">
          <InputCell
            :placeholder="
              $t('component.inviteCode') + lastSixString(userInfo.address)
            "
            type="text"
            :disabled="true"
          />
          <InputCell
            icon="user"
            :placeholder="$t('component.inputNickname')"
            v-model="userInfo.nickname"
          />
        </div>
        <div class="editinfo-footer">
          <a @mousedown="submit" class="editinfo-btn" href="javascript:;">
            {{ $t("component.submitInfo") }}
          </a>
        </div>
      </div>
    </Popup>
    <Progress :title="progresTitle" ref="progress"></Progress>
  </div>
</template>
<script>
import { Popup } from "vant";
import { mapState, mapActions } from "vuex";
import { updateUser } from "@/api/account";
import emitter from "@/services/emitter";
import tbweb3 from "@/services/tbweb3";

export default {
  name: "ImproveInfo",
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
      forceUpdate: false,
      progresTitle: "",
      userInfo: {
        nickname: "",
        phone: "",
        verify: "",
        address: ""
      },
      TITLES: {
        improve: this.$t("component.complateUserInfo"),
        edit: this.$t("component.editUserInfo")
      }
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
    },
    referrer() {
      this.setReferrer();
    },
    value() {
      if (this.showModal && !this.isImprove) {
        const { nickname, referrer } = this.user;
        this.userInfo.nickname = nickname || "";
        this.userInfo.address = referrer || "";
      }
    },
    user() {
      if (this.isImprove && this.user.status === 1) {
        this.forceUpdate = true;
        this.setReferrer();
      }
    }
  },
  methods: {
    ...mapActions("account", ["fetchUser"]),
    lastSixString: function(value) {
      if (!value || value.toString().length < 6) {
        return value;
      }
      return value.toString().substring(value.length - 6);
    },
    setReferrer() {
      if (this.isImprove && this.referrer) {
        this.userInfo.address = this.referrer;
      }
    },
    onClose() {
      if (this.forceUpdate) {
        this.$notify(this.$t("component.pleaseComplateUserInfo"));
      } else {
        this.$emit("toggle", false);
      }
    },
    async submit() {
      const { nickname, address } = this.userInfo;
      if (this.isImprove && !address) {
        return this.$notify(this.$t("component.inviteCodeCanNotEmpty"));
      }
      if (!nickname) {
        return this.$notify(this.$t("component.pleaseInputNickname"));
      }

      try {
        await updateUser({
          nickname
        });
        this.$emit("toggle", false);
        if (this.isImprove) {
          await this.bindAddr();
        }
        this.forceUpdate = false;
        await this.fetchUser();
        emitter.emit("SYSTEM_INITED");
      } catch (err) {
        this.showModal = true;
        this.$notify(
          typeof err === "string" ? err : this.$t("component.submitFailed")
        );
      }
    },
    async bindAddr() {
      return new Promise(async (resolve, reject) => {
        try {
          this.progresTitle = this.$t("component.bindAddrTitle");
          this.$refs.progress.progresStep = 0;
          this.$refs.progress.show = true;
          await tbweb3.run({
            mode: "contract",
            method: "register",
            vueInstance: this,
            callback: step => {
              this.$refs.progress.progresStep = step;
            },
            args: [this.userInfo.address]
          });
          this.$notify({
            message: this.$t("component.bindAddrOk"),
            background: "#07c160"
          });
          resolve();
        } catch (err) {
          reject(this.$t("component.bindAddrFailed") + err);
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

  &-header {
    font-size: 24px;
    color: #c6c6c6;
    padding-top: 58px;
    padding-left: 26px;
  }
  &-btn {
    width: 300px;
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
