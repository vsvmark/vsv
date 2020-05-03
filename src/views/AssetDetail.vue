<template>
  <div :class="['assetdetail', limit ? 'assetdetail--limit' : '']">
    <template v-if="!limit">
      <NavBar />
      <div class="code-row">
        <span class="color1">("Welcome, {{ user.nickname }}!")</span>
      </div>
      <div class="code-row">
        <span class="color1">{{ $t("asset.walletAddr") }}</span>
      </div>
      <div class="code-row" style=" margin: 15px 0">
        <span class="code-line color2" style="width:300px">
          {{ user.addr }}
        </span>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span class="code-link color0" href="javascript:;" @click="onEdit()">{{
          $t("asset.change")
        }}</span>
      </div>
      <div class="code-row">
        <span class="color1">{{ $t("asset.billingList") }}</span>
      </div>
    </template>
    <div class="code-list" v-if="list.length">
      <div class="code-group" v-for="(item, index) in list" :key="index">
        <div class="code-row">
          <span v-if="item.from && item.from != user.id"
            >>> "{{ item.nickname }}"</span
          >
          <span class="color1">
            {{ item.title }}
            <span class="color3">${{ item.usd_amount | NumFormat }}</span>
            <span>&nbsp;＝&nbsp;</span>
            <span class="color4 underline" @click="onClick(item.tx)">
              ₥{{
                item.token_amount == 0
                  ? item.usd_amount * token.show_exchange_rate
                  : item.token_amount | NumFormat
              }}
            </span>
            <span v-if="item.fee != '0'"
              >&nbsp;{{ $t("asset.fee") }} ${{ item.fee | NumFormat }}</span
            >
          </span>
        </div>
        <div
          v-html="$t('blockToTime', [item.block, DateFormat(item.created_at)])"
          class="code-row"
        ></div>
      </div>
    </div>
    <div v-if="limit && (!list || !list.length)" class="code-row">
      <span class="color0">{{ $t("emptyData") }}</span>
    </div>
    <InfiniteLoading v-if="!limit" @infinite="infiniteHandler">
      <div slot="no-more">
        <div class="code-row">
          <span class="color0">{{ $t("noMoreData") }}</span>
        </div>
      </div>
      <div slot="no-results">
        <div class="code-row">
          <span class="color0">{{ $t("emptyData") }}</span>
        </div>
      </div>
    </InfiniteLoading>

    <Exchangeaddr v-model="editShow" :modalShow="editShow" @toggle="change" />
  </div>
</template>
<script>
import InfiniteLoading from "vue-infinite-loading";
import { mapState } from "vuex";
import tbweb3 from "@/services/tbweb3";
import { getBillings } from "@/api/account";

const LIMIT = 10;
export default {
  name: "AssetDetail",
  components: {
    InfiniteLoading
  },
  props: ["limit"],
  data() {
    return {
      page: 0,
      list: [],
      editShow: false,
      TYPE_JSON: {
        1: {
          title: this.$t("asset.dynIncome")
        },
        2: {
          title: this.$t("asset.active")
        },
        3: {
          title: this.$t("asset.bringOut")
        },
        4: {
          title: this.$t("asset.withdrawNode")
        },
        5: {
          title: this.$t("asset.withdrawSuperNode")
        },
        6: {
          title: this.$t("asset.invest")
        },
        7: {
          title: this.$t("asset.withdraw")
        },
        8: {
          title: this.$t("asset.bankruptcy")
        }
      }
    };
  },
  watch: {
    user() {
      if (this.user) {
        this.load();
      }
    }
  },
  computed: {
    ...mapState("account", ["data", "user", "token", "config"])
  },
  methods: {
    onClick(tx) {
      window.location.href = "https://etherscan.io/tx/" + tx;
    },
    change(value) {
      this.editShow = value;
    },
    onEdit() {
      this.editShow = true;
    },
    async load() {
      let list = await getBillings({
        limit: this.limit,
        offset: 0
      });
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item.token_amount == 0) {
          item.token_amount = tbweb3.wei2ether(
            await tbweb3.U2T(tbweb3.dollar2cent(item.usd_amount))
          );
        }
        if (item.usd_amount == 0) {
          item.usd_amount = tbweb3.cent2dollar(
            await tbweb3.T2U(tbweb3.toWei(item.token_amount.toString()))
          );
        }
        list[i] = item;
      }
      this.list = list.map(item => {
        return {
          ...item,
          ...this.TYPE_JSON[item.type]
        };
      });
    },
    async infiniteHandler($state) {
      this.page += 1;
      try {
        let list = await getBillings({
          limit: LIMIT,
          offset: (this.page - 1) * LIMIT
        });

        for (let i = 0; i < list.length; i++) {
          let item = list[i];
          if (item.token_amount == 0) {
            item.token_amount = tbweb3.wei2ether(
              await tbweb3.U2T(tbweb3.dollar2cent(item.usd_amount))
            );
          }
          if (item.usd_amount == 0) {
            item.usd_amount = tbweb3.cent2dollar(
              await tbweb3.T2U(tbweb3.toWei(item.token_amount))
            );
          }
          list[i] = item;
        }
        list = list.map(item => {
          return {
            ...item,
            ...this.TYPE_JSON[item.type]
          };
        });
        this.list = this.list.concat(list);
        if (list.length < LIMIT) {
          $state.complete();
        } else {
          $state.loaded();
        }
      } catch (_) {
        // ingore error
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.assetdetail {
  padding: 30px;
  &--limit {
    padding: 0;
  }
}
.code-list {
  margin-top: 30px;
}
.code-line {
  width: 500px;
  padding: 0.1rem 0.2rem;
  border: 0.01333rem solid #616063;
  word-break: break-all;
}
.underline {
  border-bottom: 1px solid #ccc;
}
</style>
