<template>
  <div :class="['cell', disabled ? 'disabled' : '']">
    <input
      :value="value"
      @click="onClick"
      @blur="onBlur"
      @input="onInput"
      :placeholder="placeholder"
      :type="type"
    />
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "InputCell",
  data() {
    return {
      scrollTop: 0
    };
  },
  props: {
    icon: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: "text"
    },
    placeholder: {
      type: String,
      default: ""
    },
    value: {},
    disabled: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: "value",
    event: "change"
  },
  methods: {
    onClick() {
      this.scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
    },
    onBlur() {
      let isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
      if (isIOS) {
        window.scrollTo(0, this.scrollTop);
      }
    },
    onInput(ev) {
      this.$emit("change", ev.srcElement.value);
    }
  }
};
</script>
<style lang="scss" scoped>
.cell {
  width: 268px;
  height: 62px;
  background-size: 100% 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 30px;
  border: 1px solid #0fa811;
  padding: 0 28px;
  box-sizing: border-box;

  &.disabled {
    pointer-events: none;
    border-color: #767777;
    input {
      color: #767777;
      &::placeholder {
        color: #767777;
      }
    }
  }
  input {
    flex: 1;
    color: #e8eeef;
    background-color: transparent;
    font-size: 24px;
    border: none;
    width: 100%;
    &::placeholder {
      color: #e8eeef;
    }
  }
}
</style>
