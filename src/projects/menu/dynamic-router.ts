export default [
  {
    path: '/',
    component: (r: any) =>
      (require as any).ensure([], () => r(require('@/components/Layout')), 'menu'),
    children: [
      {
        path: '',
        meta: {
          title: '基于vue-cli3.0的admin系统TS实现',
          requiresAuth: true,
          layoutTopHeight: 48,
          layoutTop: (r: any) =>
            (require as any).ensure(
              [],
              () => r(require('./views/index/Header')),
              'menu'
            ),
          layoutLeft: (r: any) =>
            (require as any).ensure(
              [],
              () => r(require('./views/components/Side')),
              'menu'
            )
        },
        component: (r: any) =>
          (require as any).ensure(
            [],
            () => r(require('@/components/MainContent')),
            'menu'
          )
      }
    ]
  },
  // {
  //   path: '*',
  //   redirect: '/404',
  //   hidden: true
  // },
  {
    path: '/404',
    component: (r: any) =>
      (require as any).ensure([], () => r(require('@/components/404')), 'error')
  },
  {
    path: '/login',
    meta: {
      title: '登录页',
      requiresAuth: false
    },
    component: (r: any) =>
      (require as any).ensure([], () => r(require('./views/login/index')), 'login')
  },
  {
    path: '/register',
    meta: {
      title: '注册页',
      requiresAuth: false
    },
    component: (r: any) =>
      (require as any).ensure([], () => r(require('./views/login/register')), 'login')
  },
  {
    path: '/index',
    meta: {
      title: '欢迎页',
      requiresAuth: false
    },
    component: (r: any) =>
      (require as any).ensure([], () => r(require('./views/index/index')), 'first')
  },
  {
    path: '/userManage',
    meta: {
      title: '用户管理',
      requiresAuth: true
    },
    component: (r: any) =>
      (require as any).ensure([], () => r(require('./views/userManage/index')), 'auth')
  },
  {
    path: '/Notify',
    meta: {
      title: '消息列表',
      requiresAuth: false
    },
    component: (r: any) =>
      (require as any).ensure([], () => r(require('./views/index/Notify')), 'notify')
  },
  {
    path: '/notiDetail',
    meta: {
      title: '消息详情',
      requiresAuth: false
    },
    component: (r: any) =>
      (require as any).ensure([], () => r(require('./views/index/notifyDetail')), 'notify')
  },
  {
    path: '/aceSer',
    meta: {
      title: '服务接入',
      requiresAuth: true
    },
    component: (r: any) =>
      (require as any).ensure([], () => r(require('./views/aceSer/index')), 'ace')
  },
  {
    path: '/aceCo',
    meta: {
      title: '企业接入',
      requiresAuth: true
    },
    component: (r: any) =>
      (require as any).ensure([], () => r(require('./views/aceCo/index')), 'ace')
  },
  {
    path: '/aceMenu',
    meta: {
      title: '菜单接入',
      requiresAuth: true
    },
    component: (r: any) =>
      (require as any).ensure([], () => r(require('./views/aceMenu/index')), 'ace')
  },
  {
    path: '/DBset',
    meta: {
      title: '权限内容',
      requiresAuth: false
    },
    component: (r: any) =>
      (require as any).ensure([], () => r(require('./views/DB/index')), 'db')
  },
  // {
  //   path: '/authUser',
  //   meta: {
  //     title: '用户授权',
  //     requiresAuth: true
  //   },
  //   component: (r: any) =>
  //     (require as any).ensure([], () => r(require('./views/authUser/index')), 'auth')
  // },
  // {
  //   path: '/authMenu',
  //   meta: {
  //     title: '菜单授权',
  //     requiresAuth: true
  //   },
  //   component: (r: any) =>
  //     (require as any).ensure([], () => r(require('./views/authMenu/index')), 'auth')
  // },
  {
    path: '/head',
    component: (r: any) =>
      (require as any).ensure([], () => r(require('@/projects/menu/views/components/HeadPic.vue')), 'head')
  },
  {
    path: '/about',
    component: (r: any) =>
      (require as any).ensure([], () => r(require('@/projects/menu/views/login/about.vue')), 'about')
  },
  {
    path: '/upload',
    component: (r: any) =>
      (require as any).ensure([], () => r(require('@/projects/menu/views/components/UpLoad.vue')), 'upload')
  },
  {
    path: '/map',
    component: (r: any) =>
      (require as any).ensure([], () => r(require('@/projects/menu/views/components/MapPosition.vue')), 'map')
  },
  {
    path: '/area',
    component: (r: any) =>
      (require as any).ensure([], () => r(require('@/projects/menu/views/components/CasAreaSelect.vue')), 'CasAreaSelect')
  },
  {
    path: '/back',
    component: (r: any) =>
      (require as any).ensure([], () => r(require('@/components/BackBtn.vue')), 'back')
  },
  // {
  //   path: '/datav',
  //   component: (r: any) =>
  //     (require as any).ensure([], () => r(require('@/projects/menu/views/datav/index.vue')), 'datav')
  // },
  {
    path: '/check',
    component: (r: any) =>
      (require as any).ensure([], () => r(require('@/projects/menu/views/components/firstCheck.vue')), 'check')
  },
  // {
  //   path: '/silder',
  //   component: (r: any) =>
  //     (require as any).ensure([], () => r(require('@/projects/menu/views/datav/MapSilder.vue')), 'silder')
  // },
  {
    path: '/newPages.html',
    component: (r: any) =>
      (require as any).ensure([], () => r(require('@/projects/multi-pages/newPages/newPages.vue')), 'appDownload')
  }
]
