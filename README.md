## COVID-19 Epidemic Trend Simulation and Integrated Public Opinion Analysis Visualization Platform

### scripts

``` shell
yarn
yarn start

# make package
yarn build
```

### 目录结构

```
.
├── README.md
├── config
├── jsconfig.json
├── package.json
├── public
├── scripts
├── src
│   ├── components
│   ├── index.js
│   ├── layout
│   ├── pages
│   ├── router
│   ├── serviceWorker.js
│   ├── setupProxy.js
│   ├── setupTests.js
│   ├── services
│   ├── style
│   └── utils
└── yarn.lock
```

#### `src`目录：
- components: 公共组件
- layout：页面布局组件，菜单在这里修改
- pages： 页面级组件，在router中引入
- router/index： 路由配置
- services: axios请求实例；集成API
- style: 全局样式
- utils：工具函数库



