// https://umijs.org/config/
import os from "os";
import pageRoutes from "./router.config";
import webpackplugin from "./plugin.config";
import defaultSettings from "../src/defaultSettings";

export default {
  // add for transfer to umi
  plugins: [
    [
      "umi-plugin-react",
      {
        antd: true,
        dva: {
          hmr: true
        },
        targets: {
          ie: 11
        },
        locale: {
          enable: true, // default false
          default: "zh-CN", // default zh-CN
          baseNavigator: true // default true, when it is true, will use `navigator.language` overwrite default
        },
        dynamicImport: {
          loadingComponent: "./components/PageLoading/index"
        },
        ...(!process.env.TEST && os.platform() === "darwin"
          ? {
              dll: {
                include: ["dva", "dva/router", "dva/saga", "dva/fetch"],
                exclude: ["@babel/runtime"]
              },
              hardSource: true
            }
          : {})
      }
    ],
    [
      "umi-plugin-ga",
      {
        code: "UA-72788897-6",
        judge: () => false
      }
    ]
  ],
  targets: {
    ie: 11
  },
  define: {
    APP_TYPE: process.env.APP_TYPE || ""
  },
  // 路由配置
  routes: pageRoutes,
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: {
    "primary-color": defaultSettings.primaryColor
  },
  history: "hash",
  hash: true,
  externals: {
    "@antv/g2": "G2",
    "@antv/data-set": "DataSet",
    bizcharts: "BizCharts",
    echarts: "echarts",
    XLSX: "xlsx"
  },
  proxy: {
    "/api": {
      // target: '',
      changeOrigin: true
    }
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, localIdentName, localName) => {
      if (
        context.resourcePath.includes("node_modules") ||
        context.resourcePath.includes("ant.design.pro.less") ||
        context.resourcePath.includes("global.less")
      ) {
        return localName;
      }
      const match = context.resourcePath.match(/src(.*)/);
      if (match && match[1]) {
        const antdProPath = match[1].replace(".less", "");
        const arr = antdProPath
          .split("/")
          .map(a => a.replace(/([A-Z])/g, "-$1"))
          .map(a => a.toLowerCase());
        return `antd-pro${arr.join("-")}-${localName}`.replace(/--/g, "-");
      }
      return localName;
    }
  },
  manifest: {
    name: "骆驼小店",
    background_color: "#FFF",
    description:
      "An out-of-box UI solution for enterprise applications as a React boilerplate.",
    display: "standalone",
    start_url: "/index.html",
    icons: [
      {
        src: "/icon.png",
        sizes: "48x48",
        type: "image/png"
      }
    ]
  },

  chainWebpack: webpackplugin,
  cssnano: {
    mergeRules: false
  }
};
