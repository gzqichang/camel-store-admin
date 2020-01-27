import React from "react";
import {
  Router as DefaultRouter,
  Route,
  Switch,
  StaticRouter
} from "react-router-dom";
import dynamic from "umi/dynamic";
import renderRoutes from "umi/lib/renderRoutes";
import history from "@@/history";
import RendererWrapper0 from "/Users/laiyonghao/github-work/camel-store/admin/src/pages/.umi/LocaleWrapper.jsx";
import _dvaDynamic from "dva/dynamic";

const Router = require("dva/router").routerRedux.ConnectedRouter;

const routes = [
  {
    path: "/users",
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () => import("../../layouts/UserLayout"),
          LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
            .default
        })
      : require("../../layouts/UserLayout").default,
    routes: [
      {
        path: "/users",
        redirect: "/users/login",
        exact: true
      },
      {
        path: "/users/login",
        component: __IS_BROWSER
          ? _dvaDynamic({
              app: require("@tmp/dva").getApp(),
              models: () => [
                import("/Users/laiyonghao/github-work/camel-store/admin/src/pages/User/models/register.js").then(
                  m => {
                    return { namespace: "register", ...m.default };
                  }
                )
              ],
              component: () => import("../User/Login"),
              LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                .default
            })
          : require("../User/Login").default,
        exact: true
      },
      {
        component: () =>
          React.createElement(
            require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
              .default,
            { pagesPath: "src/pages", hasRoutesInConfig: true }
          )
      }
    ]
  },
  {
    path: "/",
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () => import("../../layouts/BasicLayout"),
          LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
            .default
        })
      : require("../../layouts/BasicLayout").default,
    Routes: [require("../Authorized").default],
    authority: ["admin"],
    routes: [
      {
        path: "/",
        redirect: "/dashboard",
        exact: true
      },
      {
        path: "/dashboard",
        icon: "home",
        name: "analysis",
        component: __IS_BROWSER
          ? _dvaDynamic({
              app: require("@tmp/dva").getApp(),
              models: () => [
                import("/Users/laiyonghao/github-work/camel-store/admin/src/pages/Dashboard/models/activities.js").then(
                  m => {
                    return { namespace: "activities", ...m.default };
                  }
                ),
                import("/Users/laiyonghao/github-work/camel-store/admin/src/pages/Dashboard/models/chart.js").then(
                  m => {
                    return { namespace: "chart", ...m.default };
                  }
                ),
                import("/Users/laiyonghao/github-work/camel-store/admin/src/pages/Dashboard/models/monitor.js").then(
                  m => {
                    return { namespace: "monitor", ...m.default };
                  }
                )
              ],
              component: () => import("../Dashboard/dashboard"),
              LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                .default
            })
          : require("../Dashboard/dashboard").default,
        exact: true
      },
      {
        path: "/order",
        icon: "bars",
        name: "order",
        routes: [
          {
            path: "/order/orderlist",
            name: "orderlist",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../order/ordorder/Orderlist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../order/ordorder/Orderlist").default,
            exact: true
          },
          {
            path: "/order/mixOrderlist",
            name: "mixOrderlist",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../order/mixorder/mixOrderlist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../order/mixorder/mixOrderlist").default,
            exact: true
          },
          {
            path: "/order/replOrderlist",
            name: "replOrderlist",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../order/replorder/replOrderlist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../order/replorder/replOrderlist").default,
            exact: true
          },
          {
            path: "/order/orderlist/editorder",
            name: "editorder",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../order/ordorder/Editorder"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../order/ordorder/Editorder").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/order/replOrderlist/editreplorder",
            name: "editreplorder",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../order/replorder/Editreplorder"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../order/replorder/Editreplorder").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/order/mixOrderlist/mixEditorder",
            name: "mixEditorder",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../order/mixorder/mixEditorder"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../order/mixorder/mixEditorder").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/order/mixOrderlist/orderDetail",
            name: "mixorderDetail",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../order/ordorder/Editorder"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../order/ordorder/Editorder").default,
            hideInMenu: true,
            exact: true
          },
          {
            component: () =>
              React.createElement(
                require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                  .default,
                { pagesPath: "src/pages", hasRoutesInConfig: true }
              )
          }
        ]
      },
      {
        path: "/good",
        icon: "shop",
        name: "good",
        routes: [
          {
            path: "/good/ordgood/goodlist",
            name: "goodlist",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../good/ordgood/Goodlist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../good/ordgood/Goodlist").default,
            exact: true
          },
          {
            path: "/good/ordgood/goodlist/editgood",
            name: "editgood",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../good/ordgood/Editgood"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../good/ordgood/Editgood").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/good/replacegood/replacegoodlist",
            name: "replacegood",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () =>
                    import("../good/replacegood/replaceGoodlist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../good/replacegood/replaceGoodlist").default,
            exact: true
          },
          {
            path: "/good/replacegood/replacegoodlist/editreplacegood",
            name: "editreplacegood",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () =>
                    import("../good/replacegood/replaceEditgood"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../good/replacegood/replaceEditgood").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/good/categorylist",
            name: "categorylist",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../good/Categorylist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../good/Categorylist").default,
            exact: true
          },
          {
            path: "/good/categorylist/editpage",
            name: "editpage",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../good/Editpage"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../good/Editpage").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/good/template",
            name: "template",
            routes: [
              {
                path: "/good/template/goodlistTemplate",
                name: "goodlistTem",
                component: __IS_BROWSER
                  ? _dvaDynamic({
                      component: () =>
                        import("../good/ordgood/GoodlistTemplate"),
                      LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                        .default
                    })
                  : require("../good/ordgood/GoodlistTemplate").default,
                exact: true
              },
              {
                path: "/good/template/goodlistTemplate/editgoodTemplate",
                name: "editgoodTemplate",
                component: __IS_BROWSER
                  ? _dvaDynamic({
                      component: () =>
                        import("../good/ordgood/EditgoodTemplate"),
                      LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                        .default
                    })
                  : require("../good/ordgood/EditgoodTemplate").default,
                hideInMenu: true,
                exact: true
              },
              {
                path: "/good/template/replacetemplete",
                name: "replacetemplete",
                component: __IS_BROWSER
                  ? _dvaDynamic({
                      component: () =>
                        import("../good/replacegood/replaceTemplatelist"),
                      LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                        .default
                    })
                  : require("../good/replacegood/replaceTemplatelist").default,
                exact: true
              },
              {
                path: "/good/template/replacetemplete/replaceEditTemplete",
                name: "replaceEditTem",
                component: __IS_BROWSER
                  ? _dvaDynamic({
                      component: () =>
                        import("../good/replacegood/replaceEditTemplate"),
                      LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                        .default
                    })
                  : require("../good/replacegood/replaceEditTemplate").default,
                hideInMenu: true,
                exact: true
              },
              {
                component: () =>
                  React.createElement(
                    require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                      .default,
                    { pagesPath: "src/pages", hasRoutesInConfig: true }
                  )
              }
            ]
          },
          {
            component: () =>
              React.createElement(
                require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                  .default,
                { pagesPath: "src/pages", hasRoutesInConfig: true }
              )
          }
        ]
      },
      {
        path: "/video",
        icon: "play-square",
        name: "video",
        routes: [
          {
            path: "/video/videolist",
            name: "videolist",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../video/videolist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../video/videolist").default,
            exact: true
          },
          {
            path: "/video/cloudsave",
            name: "cloudsave",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../video/cloudsave"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../video/cloudsave").default,
            exact: true
          },
          {
            component: () =>
              React.createElement(
                require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                  .default,
                { pagesPath: "src/pages", hasRoutesInConfig: true }
              )
          }
        ]
      },
      {
        path: "/source",
        name: "source",
        icon: "appstore",
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import("../shopsetting/source/sourceStock"),
              LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                .default
            })
          : require("../shopsetting/source/sourceStock").default,
        exact: true
      },
      {
        path: "/trade",
        icon: "pay-circle",
        name: "trade",
        routes: [
          {
            path: "/trade/userlevel",
            name: "userlevel",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../trade/userlevel"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../trade/userlevel").default,
            exact: true
          },
          {
            path: "/trade/prerecharge",
            name: "prerecharge",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../trade/prerecharge"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../trade/prerecharge").default,
            exact: true
          },
          {
            path: "/trade/share",
            name: "share",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../trade/share/expand"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../trade/share/expand").default,
            exact: true
          },
          {
            path: "/trade/distribution",
            name: "distribution",
            routes: [
              {
                path: "/trade/distribution/expand",
                name: "expand",
                component: __IS_BROWSER
                  ? _dvaDynamic({
                      component: () => import("../trade/distribution/expand"),
                      LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                        .default
                    })
                  : require("../trade/distribution/expand").default,
                exact: true
              },
              {
                path: "/trade/distribution/profie",
                name: "tradeprofie",
                component: __IS_BROWSER
                  ? _dvaDynamic({
                      component: () => import("../trade/tradeprofie"),
                      LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                        .default
                    })
                  : require("../trade/tradeprofie").default,
                exact: true
              },
              {
                path: "/trade/distribution/teamlist",
                name: "team",
                component: __IS_BROWSER
                  ? _dvaDynamic({
                      component: () => import("../trade/distribution/teamlist"),
                      LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                        .default
                    })
                  : require("../trade/distribution/teamlist").default,
                exact: true
              },
              {
                path: "/trade/distribution/teamlist/teamdetail",
                name: "teamDetail",
                component: __IS_BROWSER
                  ? _dvaDynamic({
                      component: () =>
                        import("../trade/distribution/teamDetail"),
                      LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                        .default
                    })
                  : require("../trade/distribution/teamDetail").default,
                hideInMenu: true,
                exact: true
              },
              {
                component: () =>
                  React.createElement(
                    require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                      .default,
                    { pagesPath: "src/pages", hasRoutesInConfig: true }
                  )
              }
            ]
          },
          {
            path: "/trade/shopmessage",
            name: "shopmessage",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../trade/message/msglist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../trade/message/msglist").default,
            exact: true
          },
          {
            path: "/trade/shopmessage/editmessage",
            name: "editmessage",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../trade/message/Editmsg"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../trade/message/Editmsg").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/trade/swiperlist",
            name: "swiperlist",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../trade/swiper/Swiperlist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../trade/swiper/Swiperlist").default,
            exact: true
          },
          {
            path: "/trade/swiperlist/editswiper",
            name: "editswiper",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../trade/swiper/Editswiper"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../trade/swiper/Editswiper").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/trade/indexpage",
            name: "indexpage",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../trade/indexpage"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../trade/indexpage").default,
            exact: true
          },
          {
            path: "/trade/hotword",
            name: "hotword",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../trade/hotword/hotword"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../trade/hotword/hotword").default,
            exact: true
          },
          {
            component: () =>
              React.createElement(
                require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                  .default,
                { pagesPath: "src/pages", hasRoutesInConfig: true }
              )
          }
        ]
      },
      {
        path: "/finance",
        icon: "dollar",
        name: "finance",
        routes: [
          {
            path: "/finance/recharge",
            name: "recharge",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../finance/recharge"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../finance/recharge").default,
            exact: true
          },
          {
            path: "/finance/profile",
            name: "financeprofile",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../finance/profile"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../finance/profile").default,
            exact: true
          },
          {
            path: "/finance/money",
            name: "trademoney",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../finance/trademoney"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../finance/trademoney").default,
            exact: true
          },
          {
            component: () =>
              React.createElement(
                require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                  .default,
                { pagesPath: "src/pages", hasRoutesInConfig: true }
              )
          }
        ]
      },
      {
        path: "/user",
        icon: "team",
        name: "user",
        routes: [
          {
            path: "/user/userlist",
            name: "userlist",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  app: require("@tmp/dva").getApp(),
                  models: () => [
                    import("/Users/laiyonghao/github-work/camel-store/admin/src/pages/User/models/register.js").then(
                      m => {
                        return { namespace: "register", ...m.default };
                      }
                    )
                  ],
                  component: () => import("../User/Userlist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../User/Userlist").default,
            exact: true
          },
          {
            path: "/user/userlist/edituser",
            name: "edituser",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  app: require("@tmp/dva").getApp(),
                  models: () => [
                    import("/Users/laiyonghao/github-work/camel-store/admin/src/pages/User/models/register.js").then(
                      m => {
                        return { namespace: "register", ...m.default };
                      }
                    )
                  ],
                  component: () => import("../User/Edituser"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../User/Edituser").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/user/feedback",
            name: "feedback",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  app: require("@tmp/dva").getApp(),
                  models: () => [
                    import("/Users/laiyonghao/github-work/camel-store/admin/src/pages/User/models/register.js").then(
                      m => {
                        return { namespace: "register", ...m.default };
                      }
                    )
                  ],
                  component: () => import("../User/feedback"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../User/feedback").default,
            exact: true
          },
          {
            component: () =>
              React.createElement(
                require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                  .default,
                { pagesPath: "src/pages", hasRoutesInConfig: true }
              )
          }
        ]
      },
      {
        path: "/statistic",
        name: "statistic",
        icon: "area-chart",
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import("../statistic"),
              LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                .default
            })
          : require("../statistic").default,
        exact: true
      },
      {
        path: "/setting",
        name: "setting",
        icon: "setting",
        routes: [
          {
            path: "/setting/quacontent",
            name: "quacontent",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../shopsetting/qua/Qualist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/qua/Qualist").default,
            exact: true
          },
          {
            path: "/setting/quacontent/editqua",
            name: "editqua",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../shopsetting/qua/editqua"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/qua/editqua").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/setting/storelist",
            name: "storelist",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../shopsetting/stores/storelist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/stores/storelist").default,
            exact: true
          },
          {
            path: "/setting/storelist/EditStore",
            name: "editstore",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../shopsetting/stores/EditStore"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/stores/EditStore").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/setting/adminlist",
            name: "adminuser",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../shopsetting/admin/adminlist"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/admin/adminlist").default,
            exact: true
          },
          {
            path: "/setting/adminlist/editadmin",
            name: "editadmin",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../shopsetting/admin/Editadmin"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/admin/Editadmin").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/setting/logo",
            name: "logo",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../shopsetting/logo/logo"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/logo/logo").default,
            exact: true
          },
          {
            path: "/setting/extensions",
            name: "extensions",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../shopsetting/extensions"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/extensions").default,
            hideInMenu: true,
            exact: true
          },
          {
            path: "/setting/shortMessage",
            name: "shortMessage",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () =>
                    import("../shopsetting/message/shortMessage"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/message/shortMessage").default,
            exact: true
          },
          {
            component: () =>
              React.createElement(
                require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                  .default,
                { pagesPath: "src/pages", hasRoutesInConfig: true }
              )
          }
        ]
      },
      {
        path: "/wechat",
        name: "wechat",
        icon: "wechat",
        routes: [
          {
            path: "/wechat/base",
            name: "base",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../shopsetting/wechat/wechat"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/wechat/wechat").default,
            exact: true
          },
          {
            path: "/wechat/pay",
            name: "pay",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import("../shopsetting/wechat/pay"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../shopsetting/wechat/pay").default,
            exact: true
          },
          {
            component: () =>
              React.createElement(
                require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                  .default,
                { pagesPath: "src/pages", hasRoutesInConfig: true }
              )
          }
        ]
      },
      {
        path: "/person",
        name: "person",
        icon: "appstore",
        hideInMenu: true,
        routes: [
          {
            path: "/person/Editpwd",
            name: "personpwd",
            component: __IS_BROWSER
              ? _dvaDynamic({
                  app: require("@tmp/dva").getApp(),
                  models: () => [
                    import("/Users/laiyonghao/github-work/camel-store/admin/src/pages/User/models/register.js").then(
                      m => {
                        return { namespace: "register", ...m.default };
                      }
                    )
                  ],
                  component: () => import("../User/Editpwd"),
                  LoadingComponent: require("/Users/laiyonghao/github-work/camel-store/admin/src/components/PageLoading/index")
                    .default
                })
              : require("../User/Editpwd").default,
            exact: true
          },
          {
            component: () =>
              React.createElement(
                require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
                  .default,
                { pagesPath: "src/pages", hasRoutesInConfig: true }
              )
          }
        ]
      },
      {
        path: "http://luotuoxiaodian.com/doc.html",
        name: "doc",
        icon: "file",
        target: "_blank",
        exact: true
      },
      {
        component: () =>
          React.createElement(
            require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
              .default,
            { pagesPath: "src/pages", hasRoutesInConfig: true }
          )
      }
    ]
  },
  {
    component: () =>
      React.createElement(
        require("/Users/laiyonghao/github-work/camel-store/admin/node_modules/umi-build-dev/lib/plugins/404/NotFound.js")
          .default,
        { pagesPath: "src/pages", hasRoutesInConfig: true }
      )
  }
];
window.g_routes = routes;
const plugins = require("umi/_runtimePlugin");
plugins.applyForEach("patchRoutes", { initialValue: routes });

export { routes };

export default class RouterWrapper extends React.Component {
  unListen() {}

  constructor(props) {
    super(props);

    // route change handler
    function routeChangeHandler(location, action) {
      plugins.applyForEach("onRouteChange", {
        initialValue: {
          routes,
          location,
          action
        }
      });
    }
    this.unListen = history.listen(routeChangeHandler);
    // dva 中 history.listen 会初始执行一次
    // 这里排除掉 dva 的场景，可以避免 onRouteChange 在启用 dva 后的初始加载时被多执行一次
    const isDva =
      history.listen
        .toString()
        .indexOf("callback(history.location, history.action)") > -1;
    if (!isDva) {
      routeChangeHandler(history.location);
    }
  }

  componentWillUnmount() {
    this.unListen();
  }

  render() {
    const props = this.props || {};
    return (
      <RendererWrapper0>
        <Router history={history}>{renderRoutes(routes, props)}</Router>
      </RendererWrapper0>
    );
  }
}
