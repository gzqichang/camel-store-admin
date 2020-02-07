export default [
  // user
  {
    path: '/users',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/users', redirect: '/users/login' },
      { path: '/users/login', component: './User/Login' },
      // { path: '/users/register', component: './User/Register' },
      // { path: '/users/register-result', component: './User/RegisterResult' },
    ],
  },

  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['admin'],
    routes: [
      // dashboard
      {
        path: '/',
        redirect: '/dashboard',
      },
      {
        path: '/dashboard',
        icon: 'home',
        name: 'analysis',
        component: './Dashboard/dashboard',
        // authority: ['admin', 'user'],
      },
      {
        path: '/order',
        icon: 'bars',
        name: 'order',
        routes: [
          {
            path: '/order/orderlist',
            name: 'orderlist',
            component: './order/ordorder/Orderlist',
          },
          {
            path: '/order/mixOrderlist',
            name: 'mixOrderlist',
            component: './order/mixorder/mixOrderlist',
          },
          {
            path: '/order/replOrderlist',
            name: 'replOrderlist',
            component: './order/replorder/replOrderlist',
          },
          {
            path: '/order/orderlist/editorder',
            name: 'editorder',
            component: './order/ordorder/Editorder',
            hideInMenu: true,
          },
          {
            path: '/order/replOrderlist/editreplorder',
            name: 'editreplorder',
            component: './order/replorder/Editreplorder',
            hideInMenu: true,
          },
          {
            path: '/order/mixOrderlist/mixEditorder',
            name: 'mixEditorder',
            component: './order/mixorder/mixEditorder',
            hideInMenu: true,
          },
          {
            path: '/order/mixOrderlist/orderDetail',
            name: 'mixorderDetail',
            component: './order/ordorder/Editorder',
            hideInMenu: true,
          },
        ],
      },
      {
        path: '/good',
        icon: 'shop',
        name: 'good',
        routes: [
          {
            path: '/good/ordgood/goodlist',
            name: 'goodlist',
            component: './good/ordgood/Goodlist',
          },
          {
            path: '/good/ordgood/goodlist/editgood',
            name: 'editgood',
            component: './good/ordgood/Editgood',
            hideInMenu: true,
          },
          {
            path: '/good/replacegood/replacegoodlist',
            name: 'replacegood',
            component: './good/replacegood/replaceGoodlist',
          },
          {
            path: '/good/replacegood/replacegoodlist/editreplacegood',
            name: 'editreplacegood',
            component: './good/replacegood/replaceEditgood',
            hideInMenu: true,
          },
          {
            path: '/good/categorylist',
            name: 'categorylist',
            component: './good/Categorylist',
          },
          {
            path: '/good/categorylist/editpage',
            name: 'editpage',
            component: './good/Editpage',
            hideInMenu: true,
          },
          {
            path: '/good/template',
            name: 'template',
            routes: [
              {
                path: '/good/template/goodlistTemplate',
                name: 'goodlistTem',
                component: './good/ordgood/GoodlistTemplate',
              },
              {
                path: '/good/template/goodlistTemplate/editgoodTemplate',
                name: 'editgoodTemplate',
                component: './good/ordgood/EditgoodTemplate',
                hideInMenu: true,
              },
              {
                path: '/good/template/replacetemplete',
                name: 'replacetemplete',
                component: './good/replacegood/replaceTemplatelist',
              },
              {
                path: '/good/template/replacetemplete/replaceEditTemplete',
                name: 'replaceEditTem',
                component: './good/replacegood/replaceEditTemplate',
                hideInMenu: true,
              },
            ]
          },
        ],
      },
      {
        path: '/video',
        icon: 'play-square',
        name: 'video',
        routes: [
          {
            path: '/video/videolist',
            name: 'videolist',
            component: './video/videolist',
          },
          // {
          //   path: '/video/ordgood/goodlist/editgood',
          //   name: 'editvideo',
          //   component: './good/ordgood/Editgood',
          //   hideInMenu: true,
          // },
        ],
      },
      {
        path: '/source',
        name: 'source',
        icon: 'appstore',
        component: './shopsetting/source/sourceStock',
      },
      {
        path: '/trade',
        icon: 'pay-circle',
        name: 'trade',
        routes: [
          {
            path: '/trade/userlevel',
            name: 'userlevel',
            component: './trade/userlevel',
          },
          {
            path: '/trade/prerecharge',
            name: 'prerecharge',
            component: './trade/prerecharge',
          },
          {
            path: '/trade/share',
            name: 'share',
            component: './trade/share/expand',
            // routes: [
            //   {
            //     path: '/trade/share/expand',
            //     name: 'expand',
            //     component: './trade/share/expand',
            //   },
            //   {
            //     path: '/trade/share/profie',
            //     name: 'profie',
            //     component: './trade/tradeprofie',
            //   },
            // ]
          },
          {
            path: '/trade/distribution',
            name: 'distribution',
            routes: [
              {
                path: '/trade/distribution/expand',
                name: 'expand',
                component: './trade/distribution/expand',
              },
              {
                path: '/trade/distribution/profie',
                name: 'tradeprofie',
                component: './trade/tradeprofie',
              },
              {
                path: '/trade/distribution/teamlist',
                name: 'team',
                component: './trade/distribution/teamlist',
              },
              {
                path: '/trade/distribution/teamlist/teamdetail',
                name: 'teamDetail',
                component: './trade/distribution/teamDetail',
                hideInMenu: true
              },
            ],
          },
          {
            path: '/trade/shopmessage',
            name: 'shopmessage',
            component: './trade/message/msglist',
          },
          {
            path: '/trade/shopmessage/editmessage',
            name: 'editmessage',
            component: './trade/message/Editmsg',
            hideInMenu: true,
          },
          {
            path: '/trade/swiperlist',
            name: 'swiperlist',
            component: './trade/swiper/Swiperlist',
          },
          {
            path: '/trade/swiperlist/editswiper',
            name: 'editswiper',
            component: './trade/swiper/Editswiper',
            hideInMenu: true,
          },
          {
            path: '/trade/indexpage',
            name: 'indexpage',
            component: './trade/indexpage',
          },
          {
            path: '/trade/hotword',
            name: 'hotword',
            component: './trade/hotword/hotword',
          },
        ],
      },
      {
        path: '/finance',
        icon: 'dollar',
        name: 'finance',
        routes: [
          {
            path: '/finance/recharge',
            name: 'recharge',
            component: './finance/recharge',
          },
          {
            path: '/finance/profile',
            name: 'financeprofile',
            component: './finance/profile',
          },
          {
            path: '/finance/money',
            name: 'trademoney',
            component: './finance/trademoney',
          },
        ]
      },
      {
        path: '/user',
        icon: 'team',
        name: 'user',
        routes: [
          {
            path: '/user/userlist',
            name: 'userlist',
            component: './User/Userlist',
          },
          {
            path: '/user/userlist/edituser',
            name: 'edituser',
            component: './User/Edituser',
            hideInMenu: true,
          },
          {
            path: '/user/feedback',
            name: 'feedback',
            component: './User/feedback',
          },
        ],
      },
      {
        path: '/statistic',
        name: 'statistic',
        icon: 'area-chart',
        component: './statistic'
      },
      {
        path: '/setting',
        name: 'setting',
        icon: 'setting',
        routes: [
          {
            path: '/setting/quacontent',
            name: 'quacontent',
            component: './shopsetting/qua/Qualist',
          },
          {
            path: '/setting/quacontent/editqua',
            name: 'editqua',
            component: './shopsetting/qua/editqua',
            hideInMenu: true,
          },
          {
            path: '/setting/storelist',
            name: 'storelist',
            component: './shopsetting/stores/storelist',
          },
          {
            path: '/setting/storelist/EditStore',
            name: 'editstore',
            component: './shopsetting/stores/EditStore',
            hideInMenu: true,
          },
          {
            path: '/setting/adminlist',
            name: 'adminuser',
            component: './shopsetting/admin/adminlist',
          },
          {
            path: '/setting/adminlist/editadmin',
            name: 'editadmin',
            component: './shopsetting/admin/Editadmin',
            hideInMenu: true,
          },
          {
            path: '/setting/logo',
            name: 'logo',
            component: './shopsetting/logo/logo',
          },
          {
            path: '/setting/extensions',
            name: 'extensions',
            component: './shopsetting/extensions',
            hideInMenu: true,
          },
        ],
      },
      // {
      //   path: '/wechat',
      //   name: 'wechat',
      //   icon: 'wechat',
      //   routes: [
      //     {
      //       path: '/wechat/base',
      //       name: 'base',
      //       component: './shopsetting/wechat/wechat',
      //     },
      //     {
      //       path: '/wechat/pay',
      //       name: 'pay',
      //       component: './shopsetting/wechat/pay',
      //     },
      //   ],
      // },
      {
        path: '/person',
        name: 'person',
        icon: 'appstore',
        hideInMenu: true,
        routes: [
          {
            path: '/person/Editpwd',
            name: 'personpwd',
            component: './User/Editpwd',
          },
        ],
      },
    ],
  },
];
