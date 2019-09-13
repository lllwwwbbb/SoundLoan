import defaultSettings from './defaultSettings'; // https://umijs.org/config/

import slash from 'slash2';
import webpackPlugin from './plugin.config';
import { Icon } from 'antd';
const { pwa, primaryColor } = defaultSettings; // preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;
const isAntDesignProPreview = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site';
const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      locale: {
        // default false
        enable: true,
        // default zh-CN
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        baseNavigator: false,
      },
      dynamicImport: {
        loadingComponent: './components/PageLoading/index',
        webpackChunkName: true,
        level: 3,
      },
      pwa: pwa
        ? {
            workboxPluginMode: 'InjectManifest',
            workboxOptions: {
              importWorkboxFrom: 'local',
            },
          }
        : false, // default close dll, because issue https://github.com/ant-design/ant-design-pro/issues/4665
      // dll features https://webpack.js.org/plugins/dll-plugin/
      // dll: {
      //   include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
      //   exclude: ['@babel/runtime', 'netlify-lambda'],
      // },
    },
  ],
  [
    'umi-plugin-pro-block',
    {
      moveMock: false,
      moveService: false,
      modifyRequest: true,
      autoAddMenu: true,
    },
  ],
]; // 针对 preview.pro.ant.design 的 GA 统计代码

if (isAntDesignProPreview) {
  plugins.push([
    'umi-plugin-ga',
    {
      code: 'UA-72788897-6',
    },
  ]);
  plugins.push([
    'umi-plugin-pro',
    {
      serverUrl: 'https://ant-design-pro.netlify.com',
    },
  ]);
}

export default {
  plugins,
  block: {
    defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
  },
  hash: true,
  targets: {
    ie: 11,
  },
  devtool: isAntDesignProPreview ? 'source-map' : false,
  // umi routes: https://umijs.org/zh/guide/router.html
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
      routes: [
        {
          path: 'login',
          component: './user/login',
        },
        {
          path: 'register',
          component: './user/register',
        },
        {
          component: './404',
        },
      ],
    },
    {
      path: '/',
      component: '../layouts/BasicLayout',
      // Routes: ['src/pages/Authorized'],
      // authority: ['admin', 'user'],
      routes: [
        {
          name: '个人信息',
          icon: 'profile',
          path: '/personalManagement',
          authority: ['person'],
          routes: [
            {
              name: '个人空间',
              path: 'center',
              icon: 'user',
              component: './personalManagement/center',
            },
            {
              name: '我的贷款',
              path: 'loans',
              icon: 'pay-circle',
              component: './personalManagement/loans',
            },
            {
              name: '合同详情',
              path: 'content',
              component: './personalManagement/contracts/content',
              icon: 'edit', // hideInMenu: true,
            },
            {
              name: '我的合同',
              path: 'contracts',
              icon: 'audit',
              component: './personalManagement/contracts',
            },
            {
              name: '账户设置',
              path: 'settings',
              icon: 'setting',
              component: './personalManagement/settings',
            },
          ],
        },
        {
          name: '企业空间',
          path: '/companySpace',
          icon: 'bank',
          routes: [
            {
              name: '企业信息',
              path: 'coInfo',
              component: './companySpace/coInfo',
            },
            {
              name: '企业评价',
              path: 'coEval',
              component: './companySpace/coEval',
            },
            {
              name: '企业合同',
              path: 'coCtrct',
              component: './companySpace/coCtrct',
            },
            {
              name: '用户申请',
              path: 'userApply',
              component: './companySpace/userApply',
            },
            {
              name: '修改密码',
              path: 'changePassword',
              component: './companySpace/changePassword',
            },
            {
              component: './404',
            },
          ],
        },
        {
          name: '企业查询',
          icon: 'database',
          path: '/entInfo/inquiry',
          component: './entInfo/inquiry',
          authority: ['person'],
        },
        {
          path: '/entInfo/details',
          hideInMenu: true,
          component: './entInfo/details',
        },
        {
          path: '/requireLoan',
          name: '我要借款',
          icon: 'money-collect',
          component: './requireLoan/components/requireLoan',
          authority: ['person'],
        },
        {
          path: '/askLoanInfo',
          component: './requireLoan/components/loanInfo',
        },
        {
          path: '/entPay',
          name: '企业付款(临时路由)',
          component: './entPay/index',
        },
        {
          path: '/contractDetect',
          name: '合同检测',
          icon: 'audit',
          component: './step-form',
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': primaryColor,
  },
  define: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION:
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION || '', // preview.pro.ant.design only do not use in your production ; preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, _, localName) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }

      const match = context.resourcePath.match(/src(.*)/);

      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = slash(antdProPath)
          .split('/')
          .map(a => a.replace(/([A-Z])/g, '-$1'))
          .map(a => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }

      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },
  chainWebpack: webpackPlugin,
  proxy: {
    '/api/': {
      target: 'http://47.103.113.144:7777/',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    },
  },
};
