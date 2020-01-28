import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import moment from 'moment';
import { Button, Card, Select, Spin, DatePicker, Input, Col, Row } from 'antd';
import styles from '../orderlist.less';
import OrdertableList from '../component/ordertableList';
import CollapseItem from '@/components/CostomCom/collapseItem';

const Option = Select.Option;
const { RangePicker } = DatePicker;
const itemsPerPage = 20;

@connect(({ order, global, loading }) => ({
  replorderlist: order.replorderlist,
  replorderlistCount: order.replorderlistCount,
  orderlistCount: order.orderlistCount,
  shopid: global.shopid,
  searchform: global.searchform,
  orderLoading: loading.effects['order/fetchOrder'],
}))
class replOrderlist extends Component {
  state = {
    endOpen: false,
    orderform: {},
    loading: false,
  };

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type:'global/resetSearchFormKey',
      payload:{ key:'replorder' }
    }).then(() => { this.initData('init') })
  }
  initData = type => {
    const {
      dispatch, searchform:{ replorder } } = this.props;
    const { orderform } = this.state;
    let _orderform = {};
    if(type === 'init'){
      _orderform = { ...replorder }
      this.setState({ orderform:{ ...replorder } })
    }
    else if(type === 'reset'){
      this.setState({ orderform:{} })
    }
    else if(type === 'search'){
      _orderform = { ...orderform, page: 1 }
      this.setState({ orderform:{ ..._orderform } })
    }
    else{
      _orderform = { ...orderform }
    }
    let shopid = getLocalStorage('shopid').split('#')[0]
    shopid !== 'all' ? _orderform.shop = shopid : null
    dispatch({
      type: 'order/fetchOrder',
      payload: {
        page_size: itemsPerPage,
        model_type: 'repl',
        ..._orderform,
      },
    });
  };

  componentDidUpdate(preprops, nextstate) {
    const { shopid } = this.props
    if(preprops.shopid !== shopid && shopid !== ''){
      this.initData('reset')
    }
  }

  componentWillUnmount() {
    const { orderform } = this.state
    const { dispatch } = this.props
    dispatch({
      type:'global/searchFormKey',
      payload:{ replorder: {...orderform} }
    })
  }

  handleOrderform = (e, key) => {
    const { orderform } = this.state;
    orderform[key] = e.target.value;
    this.setState({ orderform });
  };
  ondateChange = (date, dateString) => {
    const { orderform } = this.state;
    orderform['add_time_after'] = dateString[0];
    orderform['add_time_before'] = dateString[1];
    this.setState({ orderform });
  };
  searchSubmit = () => {
    this.initData('search')
  };

  createFile = file => {
    const ws = XLSX.utils.aoa_to_sheet(file);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
    XLSX.writeFile(wb, '订单列表.xlsx');
  };
  handleExport = () => {
    const { dispatch } = this.props;
    const { orderform } = this.state;
    let shopid = getLocalStorage('shopid')
    shopid !== 'all' ? orderform.order__shop = shopid.split("#")[0] : null
    this.setState({ loading: true });
    dispatch({
      type: 'order/fetchExportList',
      payload: {
        page: 1,
        page_size: 500,
        order__model_type: 'ord',
        ...orderform,
      },
    }).then(() => {
      this.createFile(this.props.exportList);
      this.setState({ loading: false });
    });
  };

  render() {
    const { replorderlist, replorderlistCount, orderLoading, location } = this.props;
    const { loading, orderform } = this.state;
    let shopid = getLocalStorage('shopid')
    const pagination = {
      pageSize: itemsPerPage,
      current: orderform.page || 1,
      total: replorderlistCount,
      onChange: page => {
        this.setState({ orderform:{ ...orderform, page } });
        const { dispatch } = this.props;
        shopid !== 'all' ? orderform.shop = shopid.split("#")[0] : null
        dispatch({
          type: 'order/fetchOrder',
          payload: {
            ...orderform,
            page: page,
            page_size: itemsPerPage,
            model_type:'repl',
          },
        });
      },
    };

    return (
      <PageHeaderWrapper>
        <Spin spinning={loading} tip="数据整理中">
          <Card className={styles.main}>
            <Spin spinning={false}>
              <CollapseItem
                renderSimpleForm={() =>
                  <Fragment>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>订单编号: </span>
                      <Input
                        value={orderform.order_sn}
                        onChange={e => {
                          this.handleOrderform(e, 'order_sn');
                        }}
                        placeholder="请输入订单编号"
                        style={{ width: 200 }}
                      />
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>微信用户: </span>
                      <Input
                        value={orderform.user}
                        onChange={e => {
                          this.handleOrderform(e, 'user');
                        }}
                        placeholder="请输入用户名"
                        style={{ width: 200 }}
                      />
                    </div>
                  </Fragment>}
                renderAdvancedForm={() =>
                  <Fragment>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>商品名称: </span>
                      <Input
                        value={orderform.goods_name}
                        onChange={e => {
                          this.handleOrderform(e, 'goods_name');
                        }}
                        placeholder="请输入商品名"
                        style={{ width: 200 }}
                      />
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>规格名称: </span>
                      <Input
                        value={orderform.gtype_name}
                        onChange={e => {
                          this.handleOrderform(e, 'gtype_name');
                        }}
                        placeholder="请输入规格"
                        style={{ width: 200 }}
                      />
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>订单状态: </span>
                      <Select
                        value={orderform.status}
                        onChange={e => {
                          this.handleOrderform({ target: { value: e } }, 'status');
                        }}
                        style={{ width: 200 }}
                      >
                        <Option value="paying">待付款</Option>
                        <Option value="has paid">待发货</Option>
                        <Option value="receiving">待收货</Option>
                        <Option value="done">交易成功</Option>
                        <Option value="close">交易关闭</Option>
                      </Select>
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>下单时间: </span>
                      <RangePicker
                        value={orderform.add_time_after ? [moment(orderform.add_time_after, 'YYYY-MM-DD'), moment(orderform.add_time_before, 'YYYY-MM-DD')] : null}
                        onChange={this.ondateChange} />
                    </div>
                  </Fragment>
                }/>
            </Spin>
            <Row>
              <Col style={{ textAlign: 'right',marginBottom: 20 }}>
                <Button type="primary" style={{ marginLeft: 30 }} onClick={this.searchSubmit}>
                  查询
                </Button>
                <Button type="danger" style={{ marginLeft: 20 }} onClick={() => this.initData('reset')}>
                  重置
                </Button>
              </Col>
            </Row>
            {/*<Button type="primary" style={{ marginBottom: 20 }} onClick={this.handleExport}>*/}
              {/*导出报表*/}
            {/*</Button>*/}
            <OrdertableList
              loading={orderLoading}
              dataSource={replorderlist}
              pagination={pagination}
              path="/order/replOrderlist/editreplorder"
              goodtype="repl"
              location={location}
              initData={() => this.initData()}
            />
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default replOrderlist;
