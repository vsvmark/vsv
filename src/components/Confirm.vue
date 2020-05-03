<template>
  <Popup
    :style="{ backgroundColor: 'transparent', overflow: 'visible' }"
    v-model="confirmShow"
    v-on:close="onClose"
    :close-on-click-overlay="false"
  >
    <div class="confirm">
      <i @click="onClose" class="confirm-close"></i>
      <div class="confirm-body">
        <div v-if="title" class="code-row">
          <span class="color0">// {{ title }}</span>
        </div>
        <div v-if="desc" class="code-row">
          <span class="color0">// {{ desc }}</span>
        </div>
      </div>
      <div class="confirm-footer">
        <a
          @click="onClose"
          class="confirm-btn confirm-btn--cancel"
          href="javascript:;"
          >{{ $t("cancel") }}</a
        >
        <a
          style="border-width:1px;"
          @click="onConfirm"
          class="confirm-btn"
          href="javascript:;"
          >{{ $t("confirm") }}</a
        >
      </div>
    </div>
  </Popup>
</template>
<script>
import { Popup } from "vant";
export default {
  name: "Confirm",
  components: {
    Popup
  },
  props: ["value", "title", "desc"],
  model: {
    prop: "value",
    event: "toggle"
  },
  data() {
    return {
      confirmShow: false
    };
  },
  watch: {
    value() {
      this.confirmShow = this.value;
    }
  },
  methods: {
    onClose() {
      this.$emit("toggle", false);
    },
    onConfirm() {
      this.onClose();
      this.$emit("confirm");
    }
  }
};
</script>
<style lang="scss" scoped>
.confirm {
  padding: 40px 34px;
  padding-top: 60px;
  background-color: rgba($color: #0c093a, $alpha: 1);
  width: 608px;
  box-sizing: border-box;
  &-footer {
    margin-top: 100px;
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
  }
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
