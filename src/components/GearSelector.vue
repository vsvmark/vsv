<template>
  <div>
    <div class="gear-list">
      <div
        v-html="
          $t('component.gearInfo', [
            this.selectedItem.usd_num,
            this.selectedItem.usd_income + this.selectedItem.usd_num
          ])
        "
        class="gear-info"
      ></div>
      <div
        @click="onSelect(item, index)"
        v-for="(item, index) in gears"
        :key="index"
        style="border-width:1px;"
        :class="[
          'gear-item',
          !item.enabled && 'disabled',
          selectIndex === index && 'active'
        ]"
      >
        {{ gearName[index] }}
      </div>
    </div>
    <a
      v-bind:class="{
        'terminal-btn': true,
        'terminal-btn--disabled': this.pendingTx
      }"
      @click="onConfirm()"
      href="javascript:;"
      >{{ this.pendingTx ? $t("pending") : btnText }}</a
    >
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "GearSelector",
  components: {},
  props: ["btnText"],
  data() {
    return {
      gearShow: false,
      selectIndex: -1,
      gearName: ["A", "B", "C", "D", "E"]
    };
  },
  computed: {
    ...mapState("account", ["gears", "user", "pendingTx"]),
    selectedItem() {
      if (this.selectIndex !== -1) {
        return this.gears[this.selectIndex];
      } else {
        return {};
      }
    }
  },
  watch: {
    gears() {
      if (this.gears) {
        const list = this.gears.filter(item => {
          return item.enabled;
        });
        if (list.length >= 1) {
          this.selectIndex = this.user.level - 1;
          this.$emit("select", this.gears[this.selectIndex]);
        }
      }
    }
  },
  async created() {
    await this.fetchGears();
  },
  methods: {
    ...mapActions("account", ["fetchGears"]),
    onSelect(item, index) {
      if (!item.enabled) return;
      this.selectIndex = index;
      this.$emit("select", this.gears[this.selectIndex]);
    },
    onConfirm() {
      this.$emit("submit", this.gears[this.selectIndex]);
    }
  }
};
</script>
<style lang="scss" scoped>
.gear-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 35px;
}
.gear-info {
  height: 62px;
  width: 170px;
  background-color: #0fa811;
  color: #ffffff;
  font-size: 21px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 7px;
  span:last-child {
    font-size: 16px;
    margin-top: 7px;
  }
}
.gear-item {
  width: 62px;
  height: 62px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-style: solid;
  border-color: #0fa811;
  margin: 0 7px;
  color: #e8eeef;
  font-size: 19px;
  &.active {
    background-color: #0fa811;
  }
  &.disabled {
    background-color: #2e2e3a;
    pointer-events: none;
    border-color: #2e2e3a;
  }
}
.terminal-btn {
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
  margin: 20px auto;

  &--disabled {
    background-color: transparent;
    pointer-events: none;
    color: #0fa811;
    border: 1px solid #0fa811;
  }
}
</style>
