import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import {
  Button,
  Card,
  Table,
  Modal,
  Divider,
  message} from 'antd'
import styles from './editswiper.less'

const itemsPerPage = 10;

@connect(({ trade, global, loading }) => ({
  swiperList: trade.swiperlist,
  swiperlistCount: trade.swiperlistCount,
  shopid: global.shopid,
  searchform: global.searchform,
  swiperLoading: loading.effects['trade/fetchSwiper'],
}))
class Swiperlist extends Component {
  state = {
    swiperform:{},
    swiperList:[]
  }

  columns = [
    {
      title: '商品名',
      dataIndex: 'goods_name',
      key: 'goods_name',
      render: (t,r) => ( <span>{r.goods.name}</span> )
    },{
      title: '排序',
      dataIndex: 'index',
      key: 'index',
    }, {
      title: '轮播图',
      dataIndex: 'image',
      key: 'image',
      render: (t) => (
        <img src={t.file} width={80} />
      )
    }, {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Fragment>
           <span onClick={() => this.deleteModal(record.id,record.goods.name)}>
             <a>删除</a>
           </span>
           <Divider type="vertical" />
           <span>
             <Link to={{pathname:`/trade/swiperlist/editswiper`, query: { id: record.id}}} >编辑
             </Link>
           </span>
         </Fragment>
     ),
  }];

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type:'global/resetSearchFormKey',
      payload:{ key:'swiper' }
    }).then(() => { this.init('init') })
  }

  init = (type) => {
    const { dispatch, searchform:{ swiper } } = this.props;
    const { swiperform } = this.state
    let _swiperform = {}
    if(type === 'init'){
      _swiperform = { ...swiper }
      this.setState({ swiperform:{ ...swiper } })
    }
    else{
      _swiperform = { ...swiperform }
    }
    let data = {
      ..._swiperform,
      page_size:itemsPerPage
    }
    let shopid = getLocalStorage('shopid').split('#')[0]
    shopid !== 'all' ? data.shop = shopid : null
    dispatch({
      type: 'trade/fetchSwiper',
      payload: {
        ...data
      }
    })
  }

  componentDidUpdate(preprops) {
    const { shopid } = this.props
    if(preprops.shopid !== shopid && shopid !== ''){
      this.init('reset')
    }
  }

  componentWillUnmount(){
    const { swiperform } = this.state
    const { dispatch } = this.props
    dispatch({
      type:'global/searchFormKey',
      payload:{ swiper: {...swiperform } }
    })
  }

  deleteModal = (id,name) => {
    const { dispatch } = this.props
    const that = this
    Modal.confirm({
      title: '确认删除 ',
      content: `确认删除 ${name} 商品首页海报图`,
      centered: true,
      okText: '确认删除 ',
      okType: 'danger',
      cancelText: '取消 ',
      onOk() {
        dispatch({
          type: 'trade/delSwiperdata',
          payload:{ id },
        }).then(() => {
          that.init()
          message.success('删除成功');
        });
      },
    });
  }

  render(){
    const { swiperlistCount, swiperLoading, swiperList } = this.props
    const { swiperform } = this.state
    const pagination = {
      pageSize: itemsPerPage,
      current: swiperform.page,
      total: swiperlistCount,
      onChange: (page) => {
        this.setState({ swiperform:{ ...swiperform, page } });
        const { dispatch } = this.props
        dispatch({
          type: 'trade/fetchSwiper',
          payload: {
            ...swiperform,
            page,
            page_size:itemsPerPage,
          }
        })
      },
    };

    return(
      <PageHeaderWrapper>
      <Card className={styles.main}>
        <Link to={{pathname:`/trade/swiperlist/editswiper`, query: { id:null } }} >
          <Button type='primary' style={{ marginBottom: 20 }}>新增</Button>
        </Link>
        <Table
          loading={swiperLoading}
          dataSource={swiperList}
          columns={this.columns}
          pagination={pagination}
        />
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default Swiperlist
