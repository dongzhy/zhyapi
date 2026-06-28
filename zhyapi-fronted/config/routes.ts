export default [
  { path: '/', name: '主页', icon: 'smile', component: './Index' },
  { path: '/interface_info/:id', name: '查看接口', icon: 'smile', component: './InterfaceInfo' ,hideInMenu: true },

  {
    path: '/my',
    name: '我的',
    icon: 'crown',
    routes: [
      { name: '接口额度', icon: 'table', path: 'userInterface', component: './userInterface/my' },
      { name: '密钥管理', icon: 'analysis', path: 'apiKeyPage', component: './ApiKeyPage' },
    ],
  },
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './user/login' }],
  },

  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { name: '接口管理', icon: 'table', path: '/admin/interface', component: './Admin/InterfaceInfo' },
      { name: '接口分析', icon: 'analysis', path: '/admin/interface_analysis', component: './Admin/InterfaceAnalysis' },
      { name: '接口额度管理', icon: 'table', path: '/admin/userInterface', component: './Admin/userInterface' },
      {
        name: '充值流水对账(管理员)',
        path: '/admin/RechargeLog',
        component: './Admin/RechargeLog',
      },

    ],
  },

  { path: '/', redirect: '/' },
  { path: '*', layout: false, component: './404' },
];
