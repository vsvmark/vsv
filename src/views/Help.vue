<template>
  <div class="help">
    <NavBar />
    <PullRefresh
      :pulling-text="$t('pullToRefresh')"
      :loosing-text="$t('loosingToRefresh')"
      :loading-text="$t('refreshing')"
      v-on:refresh="refresh('pull')"
      v-model="isRefreshing"
    >
      <div class="header">
        <div class="code-row">
          <span class="color1">("Welcome, dMMM!")</span>
        </div>
        <div class="code-row">
          <span class="color1">{{ $t("latestBlockNumber") }}</span>
          <pre>&nbsp;</pre>
          <span class="color3">#{{ lastestBlock }}</span>
        </div>
        <div v-if="gameStatus.status > 1" class="code-row">
          <span class="color1">
            <span class="color1" v-html="$t('isRunning')"></span>
            <span class="color5"
              >{{ gameStatus.running }}&nbsp;{{ $t("blocks") }} ≈</span
            >
            <span class="color6">
              &nbsp;{{ gameStatus.running | BlockToSecond | SecondFormat }}
            </span>
          </span>
        </div>
        <div v-if="gameStatus.status == 1" class="code-row">
          <span
            v-html="
              $t('blockToOpenGame', [
                gameStatus.running,
                SecondFormat(BlockToSecond(gameStatus.running))
              ])
            "
            class="color1"
          ></span>
        </div>
        <div v-if="gameStatus.status == 2" class="code-row">
          <span class="color1">
            <span v-html="$t('currentTermID', [currentTerm.id])"></span>
            &nbsp;#{{ currentTerm.start }}&nbsp;-&nbsp;#{{ currentTerm.end }}
          </span>
        </div>
        <div class="code-row">
          <span class="color1">
            {{ $t("totalInvestmentUsd") }}
            <span class="color3"
              >${{ data.total_usd_amount || 0 | NumFormat }}</span
            >
          </span>
        </div>
        <div
          v-html="$t('allUserCount', [NumFormat(data.human)])"
          class="code-row"
        ></div>
        <div class="code-row">
          <span class="color1">// 1 dMMM</span>
          <pre>&nbsp;＝&nbsp;</pre>
          <span class="color3">${{ rate | NumFormat(5) }}</span>
        </div>
        <div class="code-row">
          <span class="color1">// 1&nbsp;ETH</span>
          <pre>&nbsp;＝&nbsp;</pre>
          <span class="color3">₥{{ eth2coin_rate | NumFormat(5) }}</span>
        </div>
        <span class="code-row">
          <span class="color1"
            >{{ $t("marketMakerAddress") }}&nbsp;:&nbsp;{{
              config.market_maker_address
            }}</span
          >&nbsp;
          <span
            v-clipboard:copy="config.market_maker_ens"
            v-clipboard:success="onCopy"
            class="code-link color0"
            href="javascript:;"
            >{{ $t("copy") }}</span
          >
        </span>
        <span class="code-row">
          <span class="color1"
            >{{ $t("marketMakerENS") }}&nbsp;:&nbsp;{{
              config.market_maker_ens
            }}</span
          >&nbsp;
          <span
            v-clipboard:copy="config.market_maker_ens"
            v-clipboard:success="onCopy"
            class="code-link color0"
            href="javascript:;"
            >{{ $t("copy") }}</span
          >
        </span>
      </div>

      <div class="terminal">
        <div class="terminal-content">
          <template v-if="gameStatus.status == 1 || gameStatus.status == 2">
            <template v-if="!userStatus.status && !user.addr">
              <div class="terminal-title">Auth</div>
              <a
                @click="onLogin()"
                v-bind:class="{
                  'terminal-btn': true,
                  'terminal-btn--disabled': this.pendingTx
                }"
                href="javascript:;"
              >
                {{ this.pendingTx ? $t("pending") : $t("walletAuth") }}
              </a>
              <div class="code-row">
                <span class="color0">{{ $t("dmmmIs") }}</span>
              </div>
              <div class="code-row">
                <span class="color0">{{ $t("joinUs") }}</span>
              </div>
            </template>
            <template v-if="!userStatus.status && user.addr">
              <div class="terminal-title">Login</div>
              <a
                @click="onEdit()"
                v-bind:class="{
                  'terminal-btn': true,
                  'terminal-btn--disabled': this.pendingTx
                }"
                href="javascript:;"
              >
                {{ this.pendingTx ? $t("pending") : $t("regNow") }}
              </a>
              <div class="code-row">
                <span class="color0">{{ $t("dmmmIs") }}</span>
              </div>
              <div class="code-row">
                <span class="color0">{{ $t("joinUs") }}</span>
              </div>
            </template>
            <template v-if="userStatus.status == 1">
              <div class="terminal-title">Start</div>
              <a
                @click="onBtnClick()"
                v-bind:class="{
                  'terminal-btn': true,
                  'terminal-btn--disabled': this.pendingTx
                }"
                href="javascript:;"
                >{{ this.pendingTx ? $t("pending") : $t("activeAccount") }}</a
              >
              <div class="code-row">
                <span class="color0">{{ $t("activeAccountDesc") }}</span>
              </div>
              <div class="code-row">
                <span class="color0">{{ $t("activeAccountNeed") }}</span>
                <span class="color3"
                  >&nbsp;${{ token.active_usd_price | NumFormat }}</span
                >
                <pre>&nbsp;＝&nbsp;</pre>
                <span class="color4"
                  >₥{{ token.show_active_token_price | NumFormat }}</span
                >
              </div>
            </template>
            <template v-if="gameStatus.status == 1 && userStatus.status == 2">
              <div class="terminal-title">Wait</div>
              <a
                class="terminal-btn terminal-btn--disabled"
                href="javascript:;"
                >{{ $t("waitBtn") }}</a
              >
              <div class="code-row">
                <span class="color0">{{ $t("waitDesc") }}</span>
              </div>
              <div class="code-row">
                <span class="color0">{{ $t("waitDescSub") }}</span>
              </div>
            </template>
          </template>
          <template v-if="gameStatus.status == 2">
            <template v-if="userStatus.status == 2 && termStatus.status == 1">
              <div class="terminal-title">Now</div>
              <GearSelector
                :btnText="$t('investNowBtn')"
                v-on:select="onGearSelect"
                v-on:submit="onGearSubmit"
              />
              <div
                v-html="$t('canInvestNow', [termStatus.term])"
                class="code-row"
              ></div>
              <div class="code-row">
                <span
                  v-html="
                    $t('investDesc', [
                      currentGearItem.usd_num,
                      NumFormat(
                        currentGearItem.usd_num +
                          currentGearItem.static_income +
                          currentGearItem.usd_bring_out
                      )
                    ])
                  "
                  class="color0"
                ></span>
              </div>
              <div class="code-row">
                <span class="color0">
                  {{ $t("canGetDynIncome") }}
                  <span class="color4">
                    &nbsp;${{
                      currentGearItem.usd_bring_out | NumFormat
                    }} </span
                  >;
                </span>
              </div>
            </template>
            <template
              v-if="
                userStatus.status == 2 &&
                  user.invest_income == '0' &&
                  termStatus.status == 2
              "
            >
              <div class="terminal-title">Newbie</div>
              <GearSelector
                :btnText="$t('newbieBtn')"
                v-on:select="onGearSelect"
                v-on:submit="onGearSubmit"
              />
              <div
                v-html="$t('newbieDesc', [termStatus.term])"
                class="code-row"
              ></div>
              <div class="code-row" style="display:table-row">
                <span
                  v-html="
                    $t('investDesc', [
                      currentGearItem.usd_num,
                      NumFormat(
                        currentGearItem.usd_num +
                          currentGearItem.static_income +
                          currentGearItem.usd_bring_out
                      )
                    ])
                  "
                  class="color0"
                ></span>
              </div>
              <div class="code-row">
                <div class="color0">
                  {{ $t("canGetDynIncome") }}
                  <span class="color4">
                    &nbsp;${{
                      currentGearItem.usd_bring_out | NumFormat
                    }} </span
                  >;
                </div>
              </div>
            </template>
            <template
              v-if="
                userStatus.status == 2 &&
                  (termStatus.status == 3 ||
                    (user.invest_income != '0' && termStatus.status == 2))
              "
            >
              <div class="terminal-title">Give</div>
              <GearSelector
                :btnText="$t('giveBtn')"
                v-on:submit="onGearSubmit"
                v-on:select="onGearSelect"
              />
              <div
                v-html="$t('fullTermDesc', [currentTerm.id])"
                class="code-row"
              ></div>
              <div
                v-html="$t('preOrderDesc', [termStatus.term])"
                class="code-row"
              ></div>
              <div
                v-html="
                  $t('blockToNewTerm', [
                    termStatus.newTerm,
                    termStatus.newQuota,
                    SecondFormat(BlockToSecond(termStatus.newQuota))
                  ])
                "
                class="code-row"
              ></div>
              <div
                v-if="user.invest_income == '0'"
                v-html="
                  $t('blockToNewbie', [
                    termStatus.newbieStart - lastestBlock > 0
                      ? termStatus.newbieStart - lastestBlock
                      : 0,
                    SecondFormat(
                      BlockToSecond(
                        termStatus.newbieStart - lastestBlock > 0
                          ? termStatus.newbieStart - lastestBlock
                          : 0
                      )
                    )
                  ])
                "
                class="code-row"
                style="display:table-row"
              ></div>
            </template>
            <template v-if="userStatus.status == 2 && termStatus.status == 4">
              <div class="terminal-title">Full</div>
              <a
                class="terminal-btn terminal-btn--disabled"
                href="javascript:;"
                >{{ $t("fullGameBtn") }}</a
              >
              <div class="code-row">
                <span class="color0">{{ $t("fullGameDesc") }}</span>
              </div>
              <div
                v-html="
                  $t('blockToTerm', [
                    termStatus.newTerm,
                    termStatus.newQuota,
                    SecondFormat(BlockToSecond(termStatus.newQuota))
                  ])
                "
                class="code-row"
              ></div>
              <div
                v-if="user.invest_income == '0'"
                class="code-row"
                v-html="
                  $t('blockToNewbie', [
                    termStatus.newbieStart - lastestBlock > 0
                      ? termStatus.newbieStart - lastestBlock
                      : 0,
                    SecondFormat(
                      BlockToSecond(
                        termStatus.newbieStart - lastestBlock > 0
                          ? termStatus.newbieStart - lastestBlock
                          : 0
                      )
                    )
                  ])
                "
              ></div>
            </template>
            <template v-if="userStatus.status == 3">
              <div class="terminal-title">Queue</div>
              <a
                class="terminal-btn terminal-btn--disabled"
                href="javascript:;"
                >{{ $t("queueBtn") }}</a
              >
              <div
                class="code-row"
                style="display:table-row"
                v-html="$t('queueDesc', [userStatus.term])"
              ></div>
              <div
                class="code-row"
                style="display:table-row"
                v-html="
                  $t('blockToIntoTerm', [
                    userStatus.delay,
                    SecondFormat(BlockToSecond(userStatus.delay))
                  ])
                "
              ></div>
            </template>
            <template v-if="userStatus.status == 4">
              <div class="terminal-title">Help</div>
              <a
                @click="onBtnClick()"
                class="terminal-btn terminal-btn--disabled"
                href="javascript:;"
                >{{ $t("helpBtn") }}</a
              >
              <div class="code-row">
                <span class="color0">{{ $t("helpDesc") }}</span>
              </div>
              <div
                class="code-row"
                v-html="
                  $t('blockToOut', [
                    userStatus.delay,
                    SecondFormat(BlockToSecond(userStatus.delay)),
                    NumFormat(user.term_income)
                  ])
                "
              ></div>
              <div class="code-row">
                <span class="color0">
                  {{ $t("canGetDynIncome") }}
                  <span class="color4"
                    >&nbsp;${{ NumFormat(user.available_bring_out) }}</span
                  >
                </span>
              </div>
            </template>
            <template v-if="userStatus.status == 5">
              <div class="terminal-title">Money</div>
              <a
                @click="onBtnClick()"
                v-bind:class="{
                  'terminal-btn': true,
                  'terminal-btn--disabled': this.pendingTx
                }"
                href="javascript:;"
                >{{ this.pendingTx ? $t("pending") : $t("withdrawBtn") }}</a
              >
              <div class="code-row">
                <span class="color0">{{ $t("withdrawDesc") }}</span>
              </div>
              <div class="code-row">
                <span class="color0">{{ $t("withdrawAmt") }}</span>
                <pre>&nbsp;</pre>
                <span class="color3">+${{ user.term_income | NumFormat }}</span>
              </div>
              <div class="code-row">
                <span class="color0">{{ $t("withdrawDyn") }}</span>
                <pre>&nbsp;</pre>
                <span class="color3"
                  >+${{ user.available_bring_out | NumFormat }}</span
                >
              </div>
            </template>
            <template v-if="userStatus.status == 6">
              <div class="terminal-title">Out</div>
              <a
                @click="onBtnClick()"
                v-bind:class="{
                  'terminal-btn': true,
                  'terminal-btn--disabled': this.pendingTx
                }"
                href="javascript:;"
                >{{ this.pendingTx ? $t("pending") : $t("reRegBtn") }}</a
              >
              <div class="code-row">
                <span class="color0">("Welcome, {{ user.nickname }}！")</span>
              </div>
              <div class="code-row">
                <span class="color0">{{ $t("reRegDesc") }}</span>
              </div>
              <div class="code-row">
                <span class="color0">{{ $t("reRegDescSub") }}</span>
              </div>
            </template>
          </template>

          <template v-if="gameStatus.status == 3">
            <template>
              <div class="terminal-title terminal-title--bankrupt">Close</div>
              <a
                @click="onBtnClick()"
                v-bind:class="{
                  'terminal-btn': true,
                  'terminal-btn--bankrupt': true,
                  'terminal-btn--disabled':
                    this.pendingTx ||
                    !userStatus.hasBankruptcy ||
                    userStatus.bankruptcy
                }"
                href="javascript:;"
                >{{ this.pendingTx ? $t("pending") : $t("bankruptcyBtn") }}</a
              >
              <div class="code-row">
                <span class="color0">{{ $t("bankruptcyDesc") }}</span>
              </div>
              <a
                @click="onBtnClick(1)"
                v-bind:class="{
                  'terminal-btn': true,
                  'terminal-btn--disabled':
                    this.pendingTx || !userStatus.hasAward || userStatus.award
                }"
                href="javascript:;"
                >{{ this.pendingTx ? $t("pending") : $t("awardBtn") }}</a
              >
              <div class="code-row">
                <span class="color0">{{ $t("awardDesc") }}</span>
              </div>
            </template>
          </template>

          <template v-if="gameStatus.status == 4">
            <template>
              <div class="terminal-title terminal-title--bankrupt">Over</div>
              <a
                class="terminal-btn terminal-btn--bankrupt terminal-btn--disabled"
                href="javascript:;"
                >{{ $t("overBtn") }}</a
              >
              <div class="code-row">
                <span class="color0">{{ $t("overBtnDesc") }}</span>
              </div>
              <div class="code-row">
                <span class="color2">{{ $t("overBtnDescSub") }}</span>
              </div>
            </template>
          </template>
        </div>
      </div>

      <div class="title">{{ titled }}</div>
      <Data />

      <div class="title">{{ titleme }}</div>
      <Me :active="user.active" />
      <div class="footer">
        <div class="code-row">
          <span class="color1">/*</span>
        </div>
        <div class="code-row">
          <span class="color1">// Copyright dMMM</span>
        </div>
      </div>
    </PullRefresh>

    <Confirm
      :title="confirmInfo.title"
      :desc="confirmInfo.desc"
      v-model="confirmShow"
      v-on:confirm="onConfirm"
    />

    <Progress :title="progresTitle" ref="progress"></Progress>

    <OkDialog v-model="helpOk">
      <div class="code-row">
        <span
          class="color0"
          v-html="
            $t('investOk', [
              confirmInfo.gearItem ? confirmInfo.gearItem.usd_num : 0
            ])
          "
        ></span>
      </div>
      <div class="code-row">
        <span
          class="color0"
          v-html="
            $t('investStatic', [
              confirmInfo.gearItem
                ? confirmInfo.gearItem.usd_num + confirmInfo.gearItem.usd_income
                : 0
            ])
          "
        ></span>
      </div>
      <div class="code-row">
        <span
          class="color0"
          v-html="
            $t('investDyn', [
              confirmInfo.gearItem ? confirmInfo.gearItem.usd_bring_out : 0
            ])
          "
        ></span>
      </div>
    </OkDialog>

    <OkDialog v-model="withdrawOk">
      <div class="code-row">
        <span class="color0">{{ $t("withdrawOk") }}</span>
      </div>
    </OkDialog>
    <ImproveInfo v-model="editShow" :modalShow="editShow" @toggle="change" />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import tbweb3 from "@/services/tbweb3";
import Data from "./Data";
import emitter from "@/services/emitter";
import Me from "./Me";
import Cookies from "js-cookie";
import { PullRefresh } from "vant";
export default {
  name: "Help",
  components: {
    Data,
    Me,
    PullRefresh
  },
  data() {
    return {
      userStatus: {},
      gameStatus: {},
      termStatus: {},
      currentTerm: {},
      confirmShow: false,
      confirmInfo: {},
      gearShow: false,
      progresTitle: "",
      withdrawShow: false,
      res_token: {},
      okShow: false,
      rate: 0,
      eth2coin_rate: 0,
      lastestBlock: 0,
      helpOk: false,
      withdrawOk: false,
      okInfo: { title: "", desc1: "", desc2: "" },
      isRefreshing: false,
      currentGearItem: {},
      titled: " < dMMM Data >",
      titleme: " < Me >",
      editShow: false,
      firstOpen: true
    };
  },
  computed: {
    ...mapState("account", [
      "user",
      "config",
      "gameInfo",
      "token",
      "data",
      "pendingTx"
    ])
  },
  watch: {
    user() {
      this.load();
    }
  },
  created() {
    emitter.on("ON_USER_LOGIN", async () => {
      await this.load();
      await this.systemInited();
    });
    emitter.on("SYSTEM_INITED", async () => {
      await this.systemInited();
    });
  },
  methods: {
    ...mapActions("account", ["fetchUser", "login", "fetchGame", "fetchData"]),
    change(value) {
      this.editShow = value;
    },
    onCopy() {
      this.$toast(this.$t("invite.addressAlreadyCopied"));
    },
    onEdit() {
      this.editShow = true;
    },
    async onLogin() {
      Cookies.set("dmmm_token", "changed", {
        domain:
          process.env.NODE_ENV === "production"
            ? "dmmm.io"
            : `${window.location.host.split(":")[0]}`,
        path: "/"
      });
      emitter.emit("EVENT_LOGIN_INVALID");
    },
    async systemInited() {
      const res = await tbweb3.T2U(tbweb3.toWei("1"));
      this.rate = tbweb3.cent2dollar(res).toFixed(5);
      const lastestBlock = await tbweb3.instance.eth.getBlock("latest");
      this.lastestBlock = lastestBlock.number || 0;
      this.eth2coin_rate = tbweb3.wei2ether(
        await tbweb3.E2T(tbweb3.toWei("1"))
      );
      tbweb3.contract.methods.getCurrentTermID().call((err, res) => {
        if (err) {
          console.error(`err to get current term id`, err);
          return;
        }
        this.currentTerm = res;
      });
      tbweb3.contract.methods.getGameStatus().call((err, res) => {
        if (err) console.error(`err to get game status`, err);
        this.gameStatus = res;
        console.warn(`gameStatus`, this.gameStatus);
      });
      tbweb3.contract.methods
        .getAvailableTermID(
          !this.user.invest_income || this.user.invest_income == "0"
        )
        .call((err, res) => {
          if (err) {
            console.error("err to get available term", err);
            return;
          }
          this.termStatus = res;
          // TODO: remove hard code
          this.termStatus.newbieStart -= 5760;
          this.termStatus.newbieEnd -= 5760;
          console.warn(
            `get available term`,
            res,
            "new user",
            this.user,
            !this.user.invest_income || this.user.invest_income == "0"
          );
        });
    },
    async load() {
      this.res_token = tbweb3.nbt.info;
      if (this.user && this.user.id) {
        tbweb3.contract.methods.getUserStatus(this.user.id).call((err, res) => {
          if (err) console.error("err to get user status", err);
          this.userStatus = res;
          console.warn("userStatus", res);
        });
      }
      this.fetchGame();
      this.fetchData();
      this.$forceUpdate();
    },
    async refresh(type) {
      if (type && type != "pull") {
        //pull
        return;
      }
      if (!this.user.addr) {
        return;
      }
      try {
        this.isRefreshing = true;
        await this.fetchUser();
        await this.systemInited();
      } catch (err) {
        console.error("err to refresh", err);
      } finally {
        this.isRefreshing = false;
      }
      this.$forceUpdate();
    },
    onClose() {
      this.withdrawShow = false;
      this.gearShow = false;
    },
    onBtnClick(type) {
      switch (type) {
        case 1:
          this.award();
          return;

        default:
          break;
      }
      switch (this.gameStatus.status) {
        case "3":
          this.withdrawBreak();
          return;
      }
      switch (this.userStatus.status) {
        case "1":
          this.activeAccount();
          break;
        case "2":
          this.gearShow = true;
          break;
        case "5":
          this.withdrawShow = true;
          this.onWithdrawSubmit();
          break;
        case "6":
          this.selfRelease();
          break;
      }
    },
    async onConfirm() {
      if (this.confirmInfo.func) {
        this.confirmInfo.func();
      }
    },
    async activeAccount() {
      this.progresTitle = this.$t("dialog.activating");
      this.$refs.progress.progresStep = 0;
      this.$refs.progress.show = true;
      try {
        await tbweb3.run({
          mode: "nbt",
          method: "transfer",
          vueInstance: this,
          callback: step => {
            this.$refs.progress.progresStep = step;
          },
          args: [this.config.contract_address, this.token.active_token_price]
        });
        await this.refresh();
        this.onClose();
      } catch (err) {
        this.$notify(this.$t("dialog.activationFailed") + err);
      } finally {
        this.$refs.progress.show = false;
      }
    },
    onWithdrawSubmit() {
      this.confirmShow = true;
      this.confirmInfo = {
        title: this.$t("dialog.confirmWithdraw"),
        func: this.withdraw
      };
    },
    async onWithdraw() {
      if (this.token.status === 3 && this.userStatus.status === 8) {
        this.progresTitle = this.$t("dialog.withdrawing");
        this.$refs.progress.progresStep = 0;
        this.$refs.progress.show = true;
        try {
          await tbweb3.run({
            mode: "contract",
            method: "userWithdraw",
            vueInstance: this,
            callback: step => {
              this.$refs.progress.progresStep = step;
            },
            args: ["0x0000000000000000000000000000000000000000"]
          });
          await this.refresh();
          this.$notify({
            message: this.$t("dialog.withdrawOk"),
            background: "#07c160"
          });
        } catch (err) {
          this.$notify(this.$t("dialog.withdrawFailed") + err);
        } finally {
          this.$refs.progress.show = false;
        }
      }
    },
    async selfRelease() {
      this.progresTitle = this.$t("dialog.reReging");
      this.$refs.progress.progresStep = 0;
      this.$refs.progress.show = true;
      try {
        await tbweb3.run({
          mode: "contract",
          method: "ensureUserActive",
          vueInstance: this,
          callback: step => {
            this.$refs.progress.progresStep = step;
          },
          args: [this.user.id, false]
        });
        await this.refresh();
        this.$notify({
          message: this.$t("dialog.reRegOk"),
          background: "#07c160"
        });
        window.location.reload();
      } catch (err) {
        this.$notify(this.$t("dialog.reRegFailed") + err);
      } finally {
        this.$refs.progress.show = false;
      }
    },
    async award() {
      this.progresTitle = this.$t("dialog.awarding");
      this.$refs.progress.progresStep = 0;
      this.$refs.progress.show = true;
      try {
        await tbweb3.run({
          mode: "adc",
          method: "getLast100Bonus",
          vueInstance: this,
          callback: step => {
            this.$refs.progress.progresStep = step;
          },
          args: []
        });
        await this.refresh();
        this.$notify({
          message: this.$t("dialog.awardOk"),
          background: "#07c160"
        });
      } catch (err) {
        this.$notify(this.$t("dialog.awardFailed") + err);
      } finally {
        this.$refs.progress.show = false;
      }
    },
    async withdrawBreak() {
      this.progresTitle = this.$t("dialog.bankruptcing");
      this.$refs.progress.progresStep = 0;
      this.$refs.progress.show = true;
      try {
        await tbweb3.run({
          mode: "contract",
          method: "userWithdrawBreak",
          vueInstance: this,
          callback: step => {
            this.$refs.progress.progresStep = step;
          },
          args: ["0x0000000000000000000000000000000000000000"]
        });
        await this.refresh();
        this.$notify({
          message: this.$t("dialog.bankruptcyOk"),
          background: "#07c160"
        });
      } catch (err) {
        this.$notify(this.$t("dialog.bankruptcyFailed") + err);
      } finally {
        this.$refs.progress.show = false;
      }
    },
    onGearSubmit(gearItem) {
      this.confirmShow = true;
      this.confirmInfo = {
        title: this.$t("dialog.confirmInvest"),
        func: this.buyGear,
        gearItem
      };
    },
    onGearSelect(gearItem) {
      this.currentGearItem = gearItem;
    },
    async withdraw() {
      this.progresTitle = this.$t("dialog.withdrawing");
      this.$refs.progress.progresStep = 0;
      this.$refs.progress.show = true;
      try {
        await tbweb3.run({
          mode: "contract",
          method: "userWithdraw",
          vueInstance: this,
          callback: step => {
            this.$refs.progress.progresStep = step;
          },
          args: ["0x0000000000000000000000000000000000000000"]
        });
        await this.refresh();
        this.onClose();
        this.withdrawOk = true;
      } catch (err) {
        this.$notify(this.$t("dialog.withdrawFailed") + err);
      } finally {
        this.$refs.progress.show = false;
      }
    },
    async buyGear() {
      this.progresTitle = this.$t("dialog.investing");
      this.$refs.progress.progresStep = 0;
      this.$refs.progress.show = true;
      const { usd_num } = this.confirmInfo.gearItem;
      try {
        let token_price = await tbweb3.U2T(tbweb3.dollar2cent(usd_num));
        await tbweb3.run({
          mode: "nbt",
          method: "transfer",
          vueInstance: this,
          callback: step => {
            this.$refs.progress.progresStep = step;
          },
          args: [this.config.contract_address, token_price]
        });
        await this.refresh();
        this.onClose();
        this.helpOk = true;
      } catch (err) {
        this.$notify(this.$t("dialog.investFailed") + err);
      } finally {
        this.$refs.progress.show = false;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.help {
  padding: 0 30px;
  padding-bottom: 30px;
}
.header {
  margin-top: 57px;
}
.title {
  margin-bottom: 20px;
  margin-top: 110px;
  color: #0fa811;
  font-size: 41px;
}
.footer {
  margin-top: 100px;
}
.terminal {
  width: 690px;
  background: url("../assets/img/border-top.png"),
    url("../assets/img/border-center.png"),
    url("../assets/img/border-bottom.png");
  padding-top: 162px;
  padding-bottom: 13px;
  background-repeat: no-repeat, repeat-y, no-repeat;
  background-size: 100% 164px, 100% 2px, 100% 15px;
  background-position: left top, left top, left bottom;
  background-clip: border-box, content-box, border-box;
  margin-top: 30px;
  &-content {
    padding-left: 60px;
    padding-right: 15px;
    padding-top: 0;
    margin-top: -110px;
    padding-bottom: 30px;
  }
  &-title {
    font-size: 148px;
    font-family: Bahnschrift;
    color: #0fa811;
    text-align: center;
    &--bankrupt {
      font-size: 109px;
      color: #782306;
    }
  }
  &-btn {
    margin: 0 auto;
    width: 300px;
    height: 60px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: #0fa811;
    color: #fefefe;
    font-size: 29px;
    margin: 60px auto;
    &--bankrupt {
      background-color: #782306;
      &.terminal-btn--disabled {
        color: #782306 !important;
        border: 1px solid #782306 !important;
        background-color: transparent !important;
        pointer-events: none !important;
      }
    }
    &:active {
      opacity: 0.5;
    }
    &--disabled {
      background-color: transparent;
      pointer-events: none;
      color: #0fa811;
      border: 1px solid #0fa811;
    }
  }
}
</style>
