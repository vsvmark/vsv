<template>
  <div class="myinvite">
    <NavBar :title="$t('invite.myInvite')" />
    <ul class="menu">
      <li
        @click="onClick(item.route)"
        v-for="(item, index) in menuList"
        :key="index"
        class="menu-item"
      >
        <div class="menu-item__left">
          <i :class="item.icon"></i>
          <span>{{ item.title }}</span>
        </div>
        <i class="icon-chevron"></i>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "MyInvite",
  data() {
    return {
      menuList: [
        {
          title: this.$t("inviteLink"),
          icon: "icon-qrcode2",
          route: "/inviteshare"
        },
        {
          title: this.$t("myInviteList"),
          icon: "icon-record",
          route: "/teamperformance"
        }
      ]
    };
  },
  methods: {
    onClick(route) {
      if (route) {
        this.$router.push(route);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.menu {
  margin-top: 40px;
  &-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 50px;
    height: 100px;
    &__left {
      display: flex;
      flex-direction: row;
      align-items: center;
      font-size: 24px;
      i {
        margin-right: 30px;
      }
    }
  }
}
</style>
