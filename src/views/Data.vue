<template>
  <div class="data">
    <div class="code-row">
      <span class="code-num">1</span>
      <span class="color1">{{ $t("data.exContract") }} 1</span>
    </div>
    <div class="code-row">
      <span class="code-num">2</span>
      <span
        class="color3 underline"
        @click="openBlockExplorer('market_maker_address')"
        >{{ token.market_maker_addr_eth | NumFormat }}&nbsp;ETH</span
      >
      <pre>&nbsp;＝&nbsp;</pre>
      <span class="color4"
        >${{ token.market_maker_addr_eth_usd | NumFormat }}</span
      >
    </div>
    <div class="code-row">
      <span class="code-num">3</span>
      <span
        class="color3 underline"
        @click="openBlockExplorer('market_maker_address')"
        >₥{{ token.market_maker_addr_token | NumFormat }}</span
      >
      <pre>&nbsp;＝&nbsp;</pre>
      <span class="color4"
        >${{ token.market_maker_addr_token_usd | NumFormat }}</span
      >
    </div>
    <div class="code-row">
      <span class="code-num">4</span>
      <span class="color1">{{ $t("data.exContract") }} 2</span>
    </div>
    <div class="code-row">
      <span class="code-num">5</span>
      <span
        class="color3 underline"
        @click="openBlockExplorer('market_maker_address2')"
        >{{ token.market_maker_addr_eth2 | NumFormat }}&nbsp;ETH</span
      >
      <pre>&nbsp;＝&nbsp;</pre>
      <span class="color4"
        >${{ token.market_maker_addr_eth_usd2 | NumFormat }}</span
      >
    </div>
    <div class="code-row">
      <span class="code-num">6</span>
      <span class="color1">{{ $t("data.matchPool") }}</span>
    </div>
    <div class="code-row">
      <span class="code-num">7</span>
      <span class="color3">${{ token.match_pool_usd | NumFormat }}</span>
      <pre>&nbsp;＝&nbsp;</pre>
      <span
        class="color4 underline"
        @click="openBlockExplorer('contract_address')"
        >₥{{ token.match_pool_token | NumFormat }}</span
      >
    </div>

    <div class="code-row">
      <span class="code-num">8</span>
      <span class="color1">{{ $t("data.securityPool") }}</span>
    </div>
    <div class="code-row">
      <span class="code-num">9</span>
      <span class="color3">${{ token.security_pool_usd | NumFormat }}</span>
      <pre>&nbsp;＝&nbsp;</pre>
      <span
        class="color4 underline"
        @click="openBlockExplorer('contract_address')"
        >₥{{ token.security_pool_token | NumFormat }}</span
      >
    </div>

    <div class="code-row">
      <span class="code-num">10</span>
      <span class="color1">{{ $t("data.sourcePool") }}</span>
    </div>
    <div class="code-row">
      <span class="code-num">11</span>
      <span class="color3 ">${{ token.source_pool_usd | NumFormat }}</span>
      <pre>&nbsp;＝&nbsp;</pre>
      <span
        class="color4 underline"
        @click="openBlockExplorer('contract_address')"
        >₥{{ token.source_pool_token | NumFormat }}</span
      >
    </div>

    <div class="code-row">
      <span class="code-num">12</span>
      <span class="color1">{{ $t("data.awardPool") }}</span>
    </div>
    <div class="code-row">
      <span class="code-num">13</span>
      <span class="color3 underline" @click="openBlockExplorer('award_address')"
        >{{ token.award_pool_eth | NumFormat(8) }}&nbsp;ETH</span
      >
      <pre>&nbsp;＝&nbsp;</pre>
      <span class="color4">${{ token.award_pool_usd | NumFormat }}</span>
    </div>

    <div class="code-row">
      <span class="code-num">14</span>
      <span class="color1">{{ $t("data.nodePool") }}</span>
    </div>
    <div class="code-row">
      <span class="code-num">15</span>
      <span
        class="color3 underline"
        @click="openBlockExplorer('contract_address')"
        >${{ token.node_pool | NumFormat }}</span
      >
      <pre>&nbsp;&nbsp;</pre>
      <span class="color5">{{
        $t("data.nodeNum", [NumFormat(token.node_num)])
      }}</span>
    </div>

    <div class="code-row">
      <span class="code-num">16</span>
      <span class="color1">{{ $t("data.superNodePool") }}</span>
    </div>
    <div class="code-row">
      <span class="code-num">17</span>
      <span
        class="color3 underline"
        @click="openBlockExplorer('contract_address')"
        >${{ token.super_node_pool | NumFormat }}</span
      >
      <pre>&nbsp;&nbsp;</pre>
      <span class="color5"
        >{{ $t("data.superNodeNum", [NumFormat(token.super_node_num)]) }}
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Data",
  computed: {
    ...mapState("account", ["data", "user", "token", "config"])
  },
  methods: {
    openBlockExplorer(what) {
      window.location.href =
        "https://etherscan.io/address/" + this.config[what];
    }
  }
};
</script>
<style lang="scss" scoped>
.underline {
  border-bottom: 1px solid #ccc;
}
</style>
