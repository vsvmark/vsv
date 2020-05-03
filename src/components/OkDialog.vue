<template>
  <Popup
    v-on:close="onClose"
    v-model="show"
    style="background-color:transparent;overflow:visible;"
  >
    <div class="okdialog">
      <i @click="onClose" class="okdialog-close"></i>
      <slot></slot>
      <a
        @click="onClose"
        style="border-width:1px;"
        class="okdialog-btn"
        href="javascript:;"
        >{{ $t("confirm") }}</a
      >
    </div>
  </Popup>
</template>
<script>
import { Popup } from "vant";

export default {
  name: "OkDialog",
  components: {
    Popup
  },
  props: ["value"],
  data() {
    return {
      show: false
    };
  },
  model: {
    prop: "value",
    event: "toggle"
  },
  watch: {
    value() {
      this.show = this.value;
    }
  },
  created() {
    if (this.value) {
      this.show = this.value;
    }
  },
  methods: {
    onClose() {
      this.$emit("toggle", false);
    }
  }
};
</script>
<style lang="scss" scoped>
.okdialog {
  padding: 40px 34px;
  padding-top: 60px;
  background-color: rgba($color: #0c093a, $alpha: 1);
  width: 608px;
  box-sizing: border-box;
  &-btn {
    width: 163px;
    height: 45px;
    margin: 0 auto;
    display: block;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-color: #ffffff;
    border-style: solid;
    color: white;
    margin-top: 100px;
  }
  &-close {
    background-image: url("../assets/img/dialogclose.png");
    background-size: 18px 20px;
    width: 70px;
    height: 70px;
    position: absolute;
    right: 0;
    top: 0;
    background-repeat: no-repeat;
    background-position: center;
  }
}
</style>
