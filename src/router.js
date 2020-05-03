import Vue from "vue";
import Router from "vue-router";
import TabContainer from "./views/TabContainer.vue";
import store from "./store";

Vue.use(Router);

const routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error);
};

const router = new Router({
  base: process.env.BASE_URL,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
  routes: [
    {
      path: "/",
      name: "tabContainer",
      component: TabContainer,
      redirect: "/help",
      children: [
        {
          path: "/data",
          component: () => import("@/views/Data")
        },
        {
          path: "/help",
          component: () => import("@/views/Help")
        },
        {
          path: "/me",
          component: () => import("@/views/Me")
        }
      ]
    },
    {
      path: "/assetdetail",
      name: "assetDetail",
      component: () => import("./views/AssetDetail.vue")
    },
    {
      path: "/myinvite",
      name: "myinvite",
      component: () => import("./views/invite/MyInvite.vue")
    },
    {
      path: "/inviteshare",
      name: "inviteshare",
      component: () => import("./views/invite/InviteShare.vue")
    },
    {
      path: "/teamperformance",
      name: "teamperformance",
      component: () => import("./views/invite/TeamPerformance.vue")
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (to.query && to.query.referrer) {
    store.dispatch("account/setReferrer", to.query.referrer);
  }
  next();
});

export default router;
