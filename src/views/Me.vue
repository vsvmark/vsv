<template>
  <div class="me">
    <div v-if="!user.active" class="code-row">
      <span class="code-num">1</span>
      <span class="color0">{{ $t("me.activeToShow") }}</span>
    </div>

    <template v-if="user.active">
      <div class="code-row">
        <span class="code-num">1</span>
        <span class="color1">
          {{ $t("me.myLevel") }}
          <span class="color7">Level={{ user.level || 0 }}</span>
          <span v-if="user.last_withdraw_node_income > 0" class="color7"
            >&nbsp;{{ $t("me.node") }}</span
          >
          <span v-if="user.last_withdraw_super_node_income > 0" class="color7"
            >&nbsp;{{ $t("me.superNode") }}</span
          >
        </span>
      </div>

      <div class="code-row">
        <span class="code-num">2</span>
        <span class="color1">{{ $t("me.totalIncome") }}</span>
        <span class="color1">
          <span class="color3">${{ user.total_income | NumFormat }}</span>
        </span>
      </div>

      <div class="code-row">
        <span class="code-num">3</span>
        <span class="color1">{{ $t("me.dynBalance") }}</span>
        <span class="color1">
          <span class="color3"
            >${{ user.dynamic_income_balance | NumFormat }}</span
          >
        </span>
      </div>

      <div class="code-row">
        <span class="code-num">4</span>
        <span class="color1">{{ $t("me.nodeIncomeHistory") }}</span>
        <span class="color1">
          <span class="color3">
            ${{
              (parseFloat(user.node_income) +
                parseFloat(user.node_income_balance))
                | NumFormat
            }}
          </span>
        </span>
        <pre>&nbsp;&nbsp;&nbsp;</pre>
        <span @click="onWithdrawNode" class="code-link color0">
          <span class="color3"
            >${{ user.node_income_balance | NumFormat }}</span
          >
          {{ $t("me.available") }}
        </span>
      </div>

      <div class="code-row">
        <span class="code-num">5</span>
        <span class="color1">{{ $t("me.superNodeIncomeHistory") }}</span>
        <span class="color1">
          <span class="color3">
            ${{
              (parseFloat(user.supernode_income) +
                parseFloat(user.supernode_income_balance))
                | NumFormat
            }}
          </span>
        </span>
        <pre>&nbsp;&nbsp;&nbsp;</pre>
        <span @click="onWithdrawSuperNode" class="code-link color0">
          <span class="color3"
            >${{ user.supernode_income_balance | NumFormat }}</span
          >
          {{ $t("me.available") }}
        </span>
      </div>

      <div class="code-row">
        <span class="code-num">6</span>
        <span class="color1">
          // UID =
          <span class="color7">"{{ user.id }}"</span>
          &nbsp;Name&nbsp;=&nbsp;
          <span class="color7">"{{ user.nickname }}"</span>
        </span>
        <pre>&nbsp;</pre>
        <span @click="onEdit" class="color0 code-link">{{ $t("edit") }}</span>
      </div>

      <div class="code-row">
        <span class="code-num">7</span>
        <span class="color1">
          {{ $t("me.tokenBalance") }}
          <span class="color3">${{ balanceUSD | NumFormat }}＝</span>
          <span class="color4">₥{{ balance | NumFormat }}</span>
        </span>
      </div>

      <Confirm
        :title="confirmInfo.title"
        :desc="confirmInfo.desc"
        v-model="confirmShow"
        v-on:confirm="onConfirm"
      />

      <Progress :title="progresTitle" ref="progress"></Progress>

      <div class="mt70"></div>
      <div class="code-row">
        <span class="color1">{{ $t("asset.billingList") }}</span>
        <pre>&nbsp;&nbsp;&nbsp;</pre>
        <span @click="openAssetDetail" class="code-link color0">
          {{ $t("me.totalRecord") }}
        </span>
      </div>
      <div class="mt30"></div>
      <AssetDetail limit="5" />

      <div class="mt70"></div>
      <div class="code-row">
        <span class="color1">{{ $t("me.myInvite") }}</span>
        <pre>&nbsp;&nbsp;&nbsp;</pre>
        <span @click="openShare" class="code-link color0">
          {{ $t("me.totalInviteRecord") }}
        </span>
      </div>
      <div class="mt30"></div>
      <team-performance limit="5" />
    </template>

    <ImproveInfo
      v-model="editShow"
      mode="edit"
      @toggle="change"
      :modalShow="editShow"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import AssetDetail from "./AssetDetail";
import TeamPerformance from "./invite/TeamPerformance";
import tbweb3 from "@/services/tbweb3";
import emitter from "@/services/emitter";

export default {
  name: "Me",
  data() {
    return {
      editShow: false,
      balance: 0,
      balanceUSD: 0,
      progresTitle: "",
      confirmInfo: {},
      confirmShow: false
    };
  },
  components: {
    AssetDetail,
    TeamPerformance
  },
  computed: {
    ...mapState("account", ["user", "token", "gears"])
  },
  watch: {
    user() {
      if (this.user.id > 0 && this.user.last_withdraw_node_income != "0") {
        tbweb3.contract.methods
          .getNodeIncomeBalance(this.user.id)
          .call()
          .then(res => {
            this.user.node_income_balance = tbweb3.cent2dollar(
              res.nodeIncomeBalance
            );
            this.user.supernode_income_balance = tbweb3.cent2dollar(
              res.superNodeIncomeBalance
            );
          });
      }
    }
  },
  created() {
    emitter.on("ON_USER_LOGIN", async () => {
      tbweb3.nbt.methods
        .balanceOf(this.user.addr)
        .call()
        .then(async res => {
          this.balance = tbweb3.instance.utils.fromWei(res.toString());
          this.balanceUSD = tbweb3.cent2dollar(await tbweb3.T2U(res));
        });
      await this.fetch();
    });
  },
  methods: {
    ...mapActions("account", ["fetchGears", "fetchUser"]),
    async fetch() {
      await this.fetchUser();
      this.fetchGears();
    },
    onMenuClick(route) {
      if (route) {
        this.$router.push(route);
      }
    },
    async onConfirm() {
      if (this.confirmInfo.func) {
        this.confirmInfo.func();
      }
    },
    onWithdrawNode() {
      if (
        !this.user.node_income_balance ||
        parseInt(this.user.node_income_balance) == 0
      ) {
        this.$notify(this.$t("me.noNodeIncome"));
        return;
      }
      this.confirmShow = true;
      this.confirmInfo = {
        title: this.$t("me.confirmWithdrawNodeIncome"),
        func: this.withdrawNode,
        isSuperNode: false
      };
    },
    onWithdrawSuperNode() {
      if (
        !this.user.supernode_income_balance ||
        parseInt(this.user.supernode_income_balance) == 0
      ) {
        this.$notify(this.$t("me.noSuperNodeIncome"));
        return;
      }
      this.confirmShow = true;
      this.confirmInfo = {
        title: this.$t("me.confirmWithdrawSuperNodeIncome"),
        func: this.withdrawNode,
        isSuperNode: true
      };
    },
    async withdrawNode() {
      this.progresTitle = this.$t("dialog.withdrawing");
      this.$refs.progress.progresStep = 0;
      this.$refs.progress.show = true;
      try {
        await tbweb3.run({
          mode: "contract",
          vueInstance: this,
          method: this.confirmInfo.isSuperNode
            ? "userWithdrawSuperNode"
            : "userWithdrawNode",
          callback: step => {
            this.$refs.progress.progresStep = step;
          },
          args: ["0x0000000000000000000000000000000000000000"]
        });
        this.$notify({
          message: this.$t("dialog.withdrawOk"),
          background: "#07c160"
        });
      } catch (err) {
        this.$notify(this.$t("dialog.withdrawFailed") + err);
      } finally {
        this.$refs.progress.show = false;
        await this.fetch();
      }
    },
    change(value) {
      this.editShow = value;
    },
    onEdit() {
      this.editShow = true;
    },
    openShare() {
      this.$router.push("/inviteshare");
    },
    openAssetDetail() {
      this.$router.push("/assetdetail");
    }
  }
};
</script>
<style lang="scss" scoped>
.mt70 {
  margin-top: 70px;
}
.mt30 {
  margin-top: 30px;
}
</style>
