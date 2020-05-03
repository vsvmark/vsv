<template>
  <div class="inviteshare">
    <NavBar />
    <div class="container">
      <div class="code-row">
        <span class="color1">("Welcome, {{ user.nickname }}!")</span>
      </div>
      <div class="code-row code-wrap">
        <span class="color1">{{ $t("invite.allLayerEffectiveUser") }}</span>
        <ul v-if="user.suns" class="code-ul">
          <li>
            <span>{{ $t("invite.firstLayer") }}</span>
            <span>{{ $t("invite.humanNum", [NumFormat(user.suns[0])]) }}</span>
          </li>
          <li>
            <span>{{ $t("invite.secondLayer") }}</span>
            <span>{{ $t("invite.humanNum", [NumFormat(user.suns[1])]) }}</span>
          </li>
          <li>
            <span>{{ $t("invite.thirdLayer") }}</span>
            <span>{{ $t("invite.humanNum", [NumFormat(user.suns[2])]) }}</span>
          </li>
          <li>
            <span>{{ $t("invite.fourthLayer") }}</span>
            <span>{{ $t("invite.humanNum", [NumFormat(user.suns[3])]) }}</span>
          </li>
          <li>
            <span>{{ $t("invite.fifthLayer") }}</span>
            <span>{{ $t("invite.humanNum", [NumFormat(user.suns[4])]) }}</span>
          </li>
          <li>
            <span>{{ $t("invite.sixthLayer") }}</span>
            <span>{{ $t("invite.humanNum", [NumFormat(user.suns[5])]) }}</span>
          </li>
          <li>
            <span>{{ $t("invite.seventhLayer") }}</span>
            <span>{{ $t("invite.humanNum", [NumFormat(user.suns[6])]) }}</span>
          </li>
        </ul>
      </div>
      <div class="code-row">
        <span
          v-html="
            $t('invite.allLv5', [user.referrer_v_5_all, user.referrer_v_5])
          "
          class="color1"
        >
        </span>
      </div>
      <div class="code-row">
        <span
          v-html="
            $t('invite.allNode', [user.referrer_node_all, user.referrer_node])
          "
          class="color1"
        >
        </span>
      </div>
      <div class="code-row">
        <span
          v-html="
            $t('invite.allPerformance', [NumFormat(user.market_performance)])
          "
          class="color1"
        >
        </span>
      </div>
      <div class="code-row code-wrap">
        <span class="color1">{{ $t("invite.myInviteLink") }}</span
        >&nbsp;
      </div>
      <div class="code-row">
        <div class="code-line color1">{{ inviteLink }}</div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span
          v-clipboard:copy="inviteLink"
          v-clipboard:success="onCopy"
          class="code-link color0"
          href="javascript:;"
          >{{ $t("copy") }}</span
        >
      </div>
      <div class="code-row list-head">
        <span class="color1">{{ $t("invite.termPerformanceList") }}</span>
      </div>
      <TeamPerformance />
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import TeamPerformance from "./TeamPerformance";

export default {
  name: "InviteShare",
  data() {
    return {
      imgUrl: ""
    };
  },
  components: {
    TeamPerformance
  },
  computed: {
    ...mapState("account", ["user", "token"]),
    inviteLink() {
      return "https://dmmm.io/#/?referrer=" + this.user.invite_code;
    }
  },
  methods: {
    qrcode() {},
    onCopy() {
      this.$toast(this.$t("invite.linkAlreadyCopied"));
    }
  }
};
</script>
<style lang="scss" scoped>
.container {
  padding: 30px;
}
.code-line {
  width: 500px;
  padding: 0.1rem 0.2rem;
  border: 0.01333rem solid #616063;
  word-break: break-all;
}
.code-wrap {
  display: inline-table;
  width: 100%;
  .code-ul {
    margin: 10px 0;
    li {
      float: left;
      margin: 5px 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      span {
        color: #0fa811;
      }
    }
  }
}
#qrcode {
  width: 129px;
  height: 129px;
  position: absolute;
  left: 180px;
  top: 20px;
  z-index: 99;
  img {
    width: 129px;
    height: 129px;
    border: #212121 solid 1px;
    display: block;
  }
}
.code-save {
  position: absolute;
  left: 400px;
  top: 110px;
  z-index: 2;
}
.list-head {
  margin-top: 20px;
}
</style>
