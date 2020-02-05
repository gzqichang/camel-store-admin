import React from 'react';
import {Button, Layout, LocaleProvider, message, notification, Modal, Popconfirm} from 'antd';
import DocumentTitle from 'react-document-title';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import {connect} from 'dva';
import {ContainerQuery} from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import {enquireScreen, unenquireScreen} from 'enquire-js';
import {formatMessage} from 'umi/locale';
import SiderMenu from '@/components/SiderMenu';
import Authorized from '@/utils/Authorized';
import {getLocalStorage, setLocalStorage} from '@/utils/authority';
import PERMISSION from '@/utils/permission';
import SettingDrawer from '@/components/SettingDrawer';
import logo from '../assets/icon.png';
import longlogo from '../assets/long_icon.png';
import Footer from './Footer';
import Header from './Header';
import Context from './MenuContext';
import Exception403 from '../pages/Exception/403';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

const {Content} = Layout;

// Conversion router to menu.
function formatter(data, parentPath = '', parentAuthority, parentName) {
  return data
    .map(item => {
      let locale = 'menu';
      if (parentName && item.name) {
        locale = `${parentName}.${item.name}`;
      } else if (item.name) {
        locale = `menu.${item.name}`;
      } else if (parentName) {
        locale = parentName;
      }
      if (item.path) {
        const result = {
          ...item,
          locale,
          authority: item.authority || parentAuthority,
        };
        if (item.routes) {
          const children = formatter(
            item.routes,
            `${parentPath}${item.path}/`,
            item.authority,
            locale
          );
          // Reduce memory usage
          result.children = children;
        }
        delete result.routes;
        return result;
      }

      return null;
    })
    .filter(item => item);
}

//memoizeOne记忆化技术，通过判断结果是否一样避免多次执行函数，isEqual=>参数通过isEqual的判断
const memoizeOneFormatter = memoizeOne(formatter, isEqual);

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

class BasicLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.getPageTitle = memoizeOne(this.getPageTitle);
    this.getBreadcrumbNameMap = memoizeOne(this.getBreadcrumbNameMap, isEqual);
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    this.matchParamsPath = memoizeOne(this.matchParamsPath, isEqual);
  }

  state = {
    rendering: true,
    // isMobile: false,
    menuData: [],
    config: {},
  };

  componentDidMount() {
    this.props.dispatch({type: 'global/queryConfig'});

    const token = getLocalStorage('token');
    if (!token) {
      this.props.history.push('/users/login');
    } else {
      const {dispatch} = this.props;
      dispatch({
        type: 'user/fetchCurrent',
      });
      dispatch({
        type: 'setting/getSetting',
      });
      dispatch({
        type: 'global/queryStorename',
      });
      dispatch({
        type: 'global/queryStorelogo',
      });
      dispatch({type: 'global/queryConfig'});
      dispatch({type: 'shopsetting/fetchStores', payload: {page: 1, page_size: 100}});
      dispatch({type: 'global/fetchAuthority'}).then(() => {
        const menuData = this.getMenuData();
        let _menuData = this.getAuth(menuData);
        this.setState({menuData: _menuData});
      });
    }
    this.renderRef = requestAnimationFrame(() => {
      this.setState({
        rendering: false,
      });
    });
    this.enquireHandler = enquireScreen(mobile => {
      const {dispatch, isMobile} = this.props;
      if (isMobile !== mobile) {
        dispatch({
          type: 'global/changeLayoutmobile',
          payload: {mobile},
        });
      }
    }, 'only screen and (max-width: 800.99px)');
    this.settimer = setTimeout(() => this.tick(), 1000 * 5);
    this.timer = setInterval(() => this.tick(), 1000 * 60);
  }

  tick = () => {
    const {dispatch, noticeclose} = this.props;
    let data = {page: 1, page_size: 100, send_type: 'sending', order__model_type: 'ord'};
    const shopid = getLocalStorage('shopid').split('#')[0];
    shopid !== 'all' ? (data.order__shop = shopid) : null;
    dispatch({
      type: 'global/sendingOrder',
      payload: {
        ...data,
      },
    });
    let feed = {solve: 'false'};
    shopid !== 'all' ? (feed.shop = shopid) : null;
    dispatch({
      type: 'global/fetchFeedback',
      payload: {...feed},
    }).then((res = []) => {
      const list = getLocalStorage('feedbacklist');
      if (list) {
        let listdata = list.split(','),
          flag = false;
        res.map(item => {
          if (!listdata.includes(item.id.toString())) {
            flag = true;
            listdata.push(item.id);
          }
        });
        if (flag && noticeclose) {
          dispatch({
            type: 'global/recordFeedback',
            payload: {noticeclose: false, newfeedback: true},
          });
          notification.info({
            message: '消息提示',
            description: '您有新反馈，请及时处理',
            duration: 0,
            onClose: () => {
              dispatch({
                type: 'global/recordFeedback',
                payload: {noticeclose: true},
              });
            },
          });
        }
        setLocalStorage('feedbacklist', listdata);
      } else {
        let listid = res.map(item => item.id);
        if (res.length > 0) {
          dispatch({
            type: 'global/recordFeedback',
            payload: {newfeedback: true},
          });
          notification.info({
            message: '消息提示',
            description: '您有反馈还未处理，请查看',
            duration: 0,
          });
        }
        setLocalStorage('feedbacklist', listid);
      }
    });
  };

  componentDidUpdate(preProps) {
    // After changing to phone mode,
    // if collapsed is true, you need to click twice to display
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    // const { isMobile } = this.state;
    const {collapsed, isMobile} = this.props;
    if (isMobile && !preProps.isMobile && !collapsed) {
      this.handleMenuCollapse(false);
    }
    const {dispatch, location, storelist} = this.props;
    let shopid = getLocalStorage('shopid');
    if (
      shopid === 'all' &&
      location.pathname !== '/dashboard' &&
      !location.pathname.includes('/setting/storelist')
    ) {
      if (storelist.length > 0) {
        let oneshop = `${storelist[0].id}#${storelist[0].url}`;
        dispatch({
          type: 'global/switchStore',
          payload: {shopurl: oneshop, shopid: storelist[0].id},
        });
      } else {
        message.error('你的门店列表为空，请先去添加门店！');
        this.props.history.push({pathname: `/setting/storelist`});
      }
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.renderRef);
    unenquireScreen(this.enquireHandler);
    clearInterval(this.timer);
    clearTimeout(this.settimer);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.state.config !== nextProps.config)
      this.setState(
        {
          config: nextProps.config,
        },
        () => {
          // 我也不知道为什么要这样写 反正不这样写就会 403
          this.props.dispatch({type: 'global/fetchAuthority'}).then(() => {
            const menuData = this.getMenuData();
            let _menuData = this.getAuth(menuData);
            this.setState({menuData: _menuData});
            // console.info(this.props.permissions, _menuData)
          });
          // const menuData = this.getMenuData();
          // let _menuData = this.getAuth(menuData);
          // this.setState({ menuData: _menuData });
        }
      );
  }

  getContext() {
    const {location} = this.props;
    return {
      location,
      breadcrumbNameMap: this.breadcrumbNameMap,
    };
  }

  /* eslint-disable camelcase, no-underscore-dangle */
  getMenuData() {
    let {
      route: {routes},
      // config: {subscription_switch, qr_pay_switch, store_type},
    } = this.props;
    const {
      config: {subscription_switch, qr_pay_switch, store_type},
    } = this.state;
    const subMenus = ['subscribeOrderlist', 'subscribegoodlist', 'subscribetemplete'];
    // const offlineMenus = ['offline'];
    // const cloudMenus = ['extensions', 'wechat'];
    // const camelMenus = ['doc'];
    let _excludeList = [];
    const excludeSelf = (arr, excludeList) =>
      arr.filter(x => !excludeList.includes(x.name)).map(x => ({
        ...x,
        routes: x.routes ? excludeSelf(x.routes, excludeList) : undefined,
      }));
    if (!subscription_switch) _excludeList = [..._excludeList, ...subMenus];
    // if (!qr_pay_switch) _excludeList = [..._excludeList, ...offlineMenus];
    // if (store_type !== 'cloud') _excludeList = [..._excludeList, ...cloudMenus];
    // if (store_type !== 'camel') _excludeList = [..._excludeList, ...camelMenus];
    routes = excludeSelf(routes, _excludeList);
    return memoizeOneFormatter(routes);
  }

  getAuth = (data = []) => {
    const {permissions} = this.props;
    // console.info(permissions.length)
    let _menuData = [];
    data.map(item => {
      if (item.path) {
        Object.keys(PERMISSION).map(reg => {
          if (reg === item.path) {
            const matchitem = PERMISSION[reg].filter(list => permissions.includes(list)) || [];
            item.authority = matchitem.length !== 0 ? undefined : [];
          }
          item.children = this.getAuth(item.children);
        });
      }
      _menuData.push(item);
    });
    return _menuData;
  };

  /**
   * 获取面包屑映射
   * @param {Object} menuData 菜单配置
   */
  getBreadcrumbNameMap() {
    const routerMap = {};
    const mergeMenuAndRouter = data => {
      data.forEach(menuItem => {
        if (menuItem.children) {
          mergeMenuAndRouter(menuItem.children);
        }
        // Reduce memory usage
        routerMap[menuItem.path] = menuItem;
      });
    };
    mergeMenuAndRouter(this.getMenuData());
    return routerMap;
  }

  matchParamsPath = pathname => {
    const pathKey = Object.keys(this.breadcrumbNameMap).find(key =>
      pathToRegexp(key).test(pathname)
    );
    return this.breadcrumbNameMap[pathKey];
  };

  getPageTitle = pathname => {
    const currRouterData = this.matchParamsPath(pathname);
    if (!currRouterData) {
      return ' ';
    }
    const message = formatMessage({
      id: currRouterData.locale || currRouterData.name,
      defaultMessage: currRouterData.name,
    });
    return `${message} - `;
  };

  getLayoutStyle = () => {
    // const { isMobile } = this.state;
    const {fixSiderbar, collapsed, isMobile, layout} = this.props;
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '256px',
      };
    }
    return null;
  };

  getContentStyle = () => {
    const {fixedHeader} = this.props;
    return {
      margin: '24px 24px 0',
      paddingTop: fixedHeader ? 64 : 0,
    };
  };

  handleMenuCollapse = collapsed => {
    const {dispatch} = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  getstoreSelect = e => {
    console.log(e);
    const {dispatch} = this.props;
    dispatch({type: 'global/switchStore', payload: {shopurl: e, shopid: e.split('#')[0]}});
  };

  renderSettingDrawer() {
    // Do not render SettingDrawer in production
    // unless it is deployed in preview.pro.ant.design as demo
    const {rendering} = this.state;
    if ((rendering || process.env.NODE_ENV === 'production') && APP_TYPE !== 'site') {
      return null;
    }
    return <SettingDrawer/>;
  }

  render() {
    const {
      navTheme,
      layout: PropsLayout,
      children,
      location: {pathname},
      storename,
      config,
    } = this.props;
    const {menuData} = this.state;
    const {isMobile} = this.props;
    const isTop = PropsLayout === 'topmenu';
    const routerConfig = this.matchParamsPath(pathname);
    const token = getLocalStorage('token');

    const layout = (
      <LocaleProvider locale={zh_CN}>
        <Layout>
          {isTop && !isMobile ? null : (
            <SiderMenu
              Authorized={Authorized}
              theme={navTheme}
              onCollapse={this.handleMenuCollapse}
              menuData={menuData}
              isMobile={isMobile}
              getstoreSelect={this.getstoreSelect}
              {...this.props}
            />
          )}
          <Layout
            style={{
              ...this.getLayoutStyle(),
              minHeight: '100vh',
            }}
          >
            <Header
              menuData={menuData}
              handleMenuCollapse={this.handleMenuCollapse}
              logo={logo}
              isMobile={isMobile}
              {...this.props}
            />
            <Content style={this.getContentStyle()}>
              <Authorized
                authority={routerConfig && routerConfig.authority}
                noMatch={<Exception403/>}
              >
                {token ? children : message.warning('登录超时，请重新登录！')}
              </Authorized>
            </Content>
            <Footer show={config && config.store_type === 'camel'}/>
          </Layout>
        </Layout>
      </LocaleProvider>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={this.getPageTitle(pathname) + storename}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
      </React.Fragment>
    );
  }
}

// {this.renderSettingDrawer()}
export default connect(({global, shopsetting, setting}) => ({
  collapsed: global.collapsed,
  isMobile: global.isMobile,
  config: global.config,
  storename: global.storename,
  storeicon: global.storeicon,
  storelist: shopsetting.storelist,
  permissions: global.permissions,
  sendorderlist: global.sendorderlist,
  sendorderCount: global.sendorderCount,
  feedback: global.noticefeedback,
  feedbackCount: global.noticefeedbackCount,
  newfeedback: global.newfeedback,
  noticeclose: global.noticeclose,
  shopurl: global.shopurl,
  shopid: global.shopid,
  superadmin: global.superadmin,
  layout: setting.layout,
  ...setting,
}))(BasicLayout);
