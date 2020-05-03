<template>
  <Popup
    v-model="show"
    overlay
    :close-on-click-overlay="false"
    style="background-color:transparent;overflow:visible;"
  >
    <div class="mm-progress">
      <div v-if="title" class="code-row">
        <span class="color2">// {{ title }}</span>
      </div>
      <div class="code-row">
        <span class="color0">{{ $t("component.progressGetSign") }}</span>
        <i v-if="progresStep >= 1" class="mm-progress-check"></i>
        <div v-if="progresStep < 1" class="lds-dual-ring"></div>
      </div>
      <div class="code-row">
        <span class="color0">{{ $t("component.progressWriteChain") }}</span>
        <i v-if="progresStep >= 2" class="mm-progress-check"></i>
        <div v-if="progresStep < 2" class="lds-dual-ring"></div>
      </div>
      <div class="code-row">
        <span class="color0">{{ $t("component.progressPack") }}</span>
        <i v-if="progresStep >= 3" class="mm-progress-check"></i>
        <div v-if="progresStep < 3" class="lds-dual-ring"></div>
      </div>
      <div class="code-row">
        <span class="color0">{{ $t("component.progressVerify") }}</span>
        <i v-if="progresStep >= 4" class="mm-progress-check"></i>
        <div v-if="progresStep < 4" class="lds-dual-ring"></div>
      </div>
      <div class="code-row">
        <span class="color1">{{ $t("component.progressWaiting") }}</span>
      </div>
    </div>
  </Popup>
</template>
<script>
import { Popup } from "vant";

export default {
  name: "Progress",
  components: {
    Popup
  },
  props: ["title"],
  data() {
    return {
      show: false,
      progresStep: 0
    };
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.lds-dual-ring {
  padding: 34px 30px;
  display: inline-block;
  width: 40px;
  height: 40px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 20px;
  height: 20px;
  margin: 8px;
  border-radius: 50%;
  border: 4px solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.mm-progress {
  padding: 40px 34px;
  padding-top: 60px;
  background-color: rgba($color: #0c093a, $alpha: 1);
  width: 608px;
  box-sizing: border-box;
  &-check {
    background-image: url("../assets/img/check.png");
    background-size: 18px 20px;
    width: 70px;
    height: 70px;
    background-repeat: no-repeat;
    background-position: center;
    float: right;
  }
}
</style>
