import dva from 'dva';
import { Component } from 'react';
import createLoading from 'dva-loading';
import history from '@tmp/history';

let app = null;

export function _onCreate() {
  const plugins = require('umi/_runtimePlugin');
  const runtimeDva = plugins.mergeConfig('dva');
  app = dva({
    history,
    
    ...(runtimeDva.config || {}),
    ...(window.g_useSSR ? { initialState: window.g_initialData } : {}),
  });
  
  app.use(createLoading());
  (runtimeDva.plugins || []).forEach(plugin => {
    app.use(plugin);
  });
  
  app.model({ namespace: 'cloud', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/cloud.js').default) });
app.model({ namespace: 'costom', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/costom.js').default) });
app.model({ namespace: 'dashboard', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/dashboard.js').default) });
app.model({ namespace: 'finance', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/finance.js').default) });
app.model({ namespace: 'global', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/global.js').default) });
app.model({ namespace: 'goods', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/goods.js').default) });
app.model({ namespace: 'list', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/list.js').default) });
app.model({ namespace: 'location', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/location.js').default) });
app.model({ namespace: 'login', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/login.js').default) });
app.model({ namespace: 'order', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/order.js').default) });
app.model({ namespace: 'project', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/project.js').default) });
app.model({ namespace: 'ptgroup', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/ptgroup.js').default) });
app.model({ namespace: 'setting', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/setting.js').default) });
app.model({ namespace: 'shopsetting', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/shopsetting.js').default) });
app.model({ namespace: 'trade', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/trade.js').default) });
app.model({ namespace: 'upload', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/upload.js').default) });
app.model({ namespace: 'user', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/user.js').default) });
app.model({ namespace: 'video', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/video.js').default) });
app.model({ namespace: 'wechat', ...(require('/Users/laiyonghao/github-work/camel-store/admin/src/models/wechat.js').default) });
  return app;
}

export function getApp() {
  return app;
}

export class _DvaContainer extends Component {
  render() {
    const app = getApp();
    app.router(() => this.props.children);
    return app.start()();
  }
}
