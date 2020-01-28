import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Layout, message } from 'antd';
import Animate from 'rc-animate';
import { connect } from 'dva';
// import router from 'umi/router';
import GlobalHeader from '@/components/GlobalHeader';
import TopNavHeader from '@/components/TopNavHeader';
import styles from './Header.less';
import Authorized from '@/utils/Authorized';
import { getLocalStorage, setLocalStorage } from '@/utils/authority';
import { routerRedux } from 'dva/router';

const { Header } = Layout;

class HeaderView extends PureComponent {
  state = {
    visible: true,
    // NoticVisible:false,
  };

  static getDerivedStateFromProps(props, state) {
    if (!props.autoHideHeader && !state.visible) {
      return {
        visible: true,
      };
    }
    return null;
  }

  componentDidMount() {
    document.addEventListener('scroll', this.handScroll, { passive: true });
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handScroll);
  }

  getHeadWidth = () => {
    const { isMobile, collapsed, setting } = this.props;
    const { fixedHeader, layout } = setting;
    if (isMobile || !fixedHeader || layout === 'topmenu') {
      return '100%';
    }
    return collapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)';
  };

  handleNoticeClear = type => {
    message.success(`${formatMessage({ id: 'component.noticeIcon.cleared' })} ${formatMessage({ id: `component.globalHeader.${type}` })}`);
    const { dispatch } = this.props;
    dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
    // this.setState({ NoticVisible: false })
  };

  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    console.log('logout')
    dispatch({
      type: 'global/logout',
    });
    console.log('dispatch')
  };

  handleNoticeVisibleChange = visible => {
    if (visible) {
      const { dispatch } = this.props;
      dispatch({
        type: 'global/fetchNotices',
      });
    }
  };

  toNoticedata = (item, tabProps) => {
    const { dispatch } = this.props
    if(tabProps.name === 'feedbacklist'){
      let listdata = getLocalStorage('feedbacklist') || ""
      dispatch({
        type:'global/searchFormKey',
        payload:{ feedback: { id: item.id } }
      }).then(() => this.props.history.push({ pathname: `/user/feedback` }) )
    }
    else {
      let order = item.order_id
      let listdata = getLocalStorage('sendorderlist') || ""
      let shopid = getLocalStorage('shopid').split('#')[0]
      listdata = listdata.split(',')
      listdata.push(item.id)
      setLocalStorage('sendorderlist', listdata)

      this.props.dispatch(routerRedux.push({ pathname: '/order/orderlist/editorder', query: { id: order } }))
      let data = { page: 1, page_size: 100, send_type: 'sending', order__model_type: 'ord' }
      shopid !== 'all' ? data.order__shop = shopid : null
      dispatch({
        type: 'global/sendingOrder',
        payload: {
          ...data
        }
      })
    }
  }

  toOrderpage = (item) => {
    const { dispatch } = this.props
    if(item === 'feedbacklist'){
      dispatch({
        type:'global/searchFormKey',
        payload:{ feedback: { solve: 'false' } }
      }).then(() => this.props.history.push({ pathname: `/user/feedback` }) )
    }
    else{
      dispatch({
        type:'global/searchFormKey',
        payload:{ order: { status: 'has paid' } }
      }).then(() => this.props.history.push({ pathname: `/order/orderlist` }) )
    }
  }

  audioControl = () => {
    const { dispatch } = this.props
    dispatch({ type: 'global/audioFeedback' })
  }

  handScroll = () => {
    const { autoHideHeader } = this.props;
    const { visible } = this.state;
    if (!autoHideHeader) {
      return;
    }
    const scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (!this.ticking) {
      requestAnimationFrame(() => {
        if (this.oldScrollTop > scrollTop) {
          this.setState({
            visible: true,
          });
          this.scrollTop = scrollTop;
          return;
        }
        if (scrollTop > 300 && visible) {
          this.setState({
            visible: false,
          });
        }
        if (scrollTop < 300 && !visible) {
          this.setState({
            visible: true,
          });
        }
        this.oldScrollTop = scrollTop;
        this.ticking = false;
      });
    }
    this.ticking = false;
  };

  render() {
    const { isMobile, handleMenuCollapse, setting } = this.props;
    const { navTheme, layout, fixedHeader } = setting;
    const { visible, NoticVisible } = this.state;
    const isTop = layout === 'topmenu';
    const width = this.getHeadWidth();
    const HeaderDom = visible ? (
      <Header style={{ padding: 0, width }} className={fixedHeader ? styles.fixedHeader : ''}>
        {isTop && !isMobile ? (
          <TopNavHeader
            theme={navTheme}
            mode="horizontal"
            Authorized={Authorized}
            onCollapse={handleMenuCollapse}
            onNoticeClear={this.handleNoticeClear}
            toOrderpage={this.toOrderpage}
            onMenuClick={this.handleMenuClick}
            onNoticeVisibleChange={this.handleNoticeVisibleChange}
            visible={NoticVisible}
            toNoticedata={this.toNoticedata}
            audioControl={this.audioControl}
            {...this.props}
          />
        ) : (
          <GlobalHeader
            onCollapse={handleMenuCollapse}
            onNoticeClear={this.handleNoticeClear}
            toOrderpage={this.toOrderpage}
            onMenuClick={this.handleMenuClick}
            onNoticeVisibleChange={this.handleNoticeVisibleChange}
            visible={NoticVisible}
            toNoticedata={this.toNoticedata}
            audioControl={this.audioControl}
            {...this.props}
          />
        )}
      </Header>
    ) : null;
    return (
      <Animate component="" transitionName="fade">
        {HeaderDom}
      </Animate>
    );
  }
}

export default connect(({ user, global, shopsetting, setting, loading }) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  superadmin: global.superadmin,
  shopid: global.shopid,
  shopurl: global.shopurl,
  storelist: shopsetting.storelist,
  sendorderlist:global.sendorderlist,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
  setting,
}))(HeaderView);
