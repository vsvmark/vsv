<template>
  <div class="invite-list">
    <div class="code-list" v-if="list && list">
      <div class="code-group" :key="index" v-for="(item, index) in list">
        <div class="code-row">
          <span
            v-html="
              $t('invite.provideHelp', [
                item.nickname,
                NumFormat(item.investment_usd)
              ])
            "
            class="color0"
          ></span>
        </div>
        <div
          v-html="
            $t('blockToTime', [item.block, DateFormat(item.investment_at)])
          "
          class="code-row"
        ></div>
      </div>
    </div>
    <div v-if="limit && (!list || !list.length)" class="code-row">
      <span class="color0">{{ $t("emptyData") }}</span>
    </div>
    <InfiniteLoading
      v-if="!limit"
      forceUseInfiniteWrapper
      @infinite="infiniteHandler"
    >
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
  </div>
</template>
<script>
import { getTeamPerformance } from "@/api/account";
import InfiniteLoading from "vue-infinite-loading";
import { mapState } from "vuex";
const LIMIT = 10;

export default {
  name: "TeamPerformance",
  data() {
    return {
      page: 0,
      list: []
    };
  },
  components: {
    InfiniteLoading
  },

  props: ["limit"],
  computed: {
    ...mapState("account", ["data", "user", "token"])
  },
  watch: {
    user() {
      if (this.user) {
        this.load();
      }
    }
  },
  methods: {
    async load() {
      this.list = await getTeamPerformance({
        limit: this.limit || 10,
        offset: 0
      });
    },

    async infiniteHandler($state) {
      this.page += 1;
      try {
        let list = await getTeamPerformance({
          limit: LIMIT,
          offset: (this.page - 1) * LIMIT
        });
        if (list && list.length > 0) {
          this.list = this.list.concat(list);
        }
        if (list == null || list.length < LIMIT) {
          $state.complete();
        } else {
          $state.loaded();
        }
      } catch (_) {
        // catch
      }
    }
  }
};
</script>
<style lang="scss" scoped></style>
