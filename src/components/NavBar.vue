<template>
  <div>
    <div style="border-bottom-width:1px;" class="navbar">
      <img class="navbar__logo" src="../assets/img/dmmm.png" />
      <a
        @click="showLangSelector = true"
        class="navbar__more"
        href="javascript:;"
      >
        <i class="navbar__dots"></i>
      </a>
    </div>
    <div class="navbar-spacer"></div>
    <ActionSheet
      :cancel-text="$t('cancel')"
      v-model="showLangSelector"
      :actions="actions"
      @select="changeLocale"
    />
  </div>
</template>
<script>
import { ActionSheet } from "vant";

export default {
  name: "NavBar",
  components: {
    ActionSheet
  },
  props: {
    showQrcode: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      showLangSelector: false,
      actions: [{ name: "English" }]
    };
  },
  methods: {
    onBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    },
    onShare() {
      this.$router.push("/inviteshare");
    },
    changeLocale(item) {
      const langs = {
        English: "en-US"
      };
      this.$i18n.locale = langs[item.name];
      localStorage.setItem("locale", this.$i18n.locale);
      this.showLangSelector = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  background-color: #15023e;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  max-width: 750px;
  margin: 0 auto;
  height: 84px;
  background-image: url("../assets/img/starbg.png");
  background-repeat: repeat;
  border-bottom-color: #2e952f;
  border-bottom-style: solid;

  &__more {
    height: 84px;
    width: 84px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;
  }
  &__dots {
    background-image: url("../assets/img/dots.png");
    width: 4px;
    height: 25px;
    display: block;
    background-size: 4px 25px;
    background-repeat: no-repeat;
  }

  &__logo {
    width: 165px;
  }
}
.van-action-sheet {
  .van-action-sheet__item {
    border-bottom: 1px solid #ccc;
  }
}
.navbar-spacer {
  height: 84px;
}
</style>
