import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import { getLocalStorage } from '@/utils/authority';
import moment from 'moment';
import { Button, Card, Col, Form, InputNumber, Modal, Row, Spin, Table } from 'antd';
import styles from '../orderlist.less';
import Link from 'umi/link';
import CountDown from '@/components/CountDown';
import OrderInfo from '../component/orderInfo';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const FormItem = props => <Form.Item {...formItemLayout} {...props} />;
const orderstatus_group = {
  build: '拼团中',
  done: '拼团成功',
  fail: '拼团失败',
};

@connect(({ costom, ptgroup, global, loading }) => ({
  shopid: global.shopid,
  orderLoading: loading.effects['ptgroup/fetchptListData'],
}))
class mixEditorder extends Component {
  state = {
    orderdata: { owner:{}, ladder:[] },
    orderdata_item: [],
    orderdata_item_form: {},
    edit_item: false,
    edit_order: false,
    personform: {},
    onLoading: false,
    edit_real_mount: false,
    real_mount: 0,
  };

  componentDidMount() {
    this.initData();
  }

  componentWillUpdate(prepros, nextState) {
    const { location } = this.props;
    let id = location.query.id;
    const { shopid } = this.props
    if(nextState.orderid !== id){
      this.initData()
    }
    if(prepros.shopid !== shopid && shopid !== '' && id){
      this.props.history.push('/order/mixOrderlist')
    }
  }

  initData = () => {
    const { dispatch, location } = this.props;
    let id = location.query.id;
    if (id) {
      this.setState({ onLoading: true });
      dispatch({
        type: 'ptgroup/fetchptListData',
        payload: { id },
      }).then(res => {
        this.setState({
          orderdata: {...res},
          orderdata_item: res.order,
          onLoading: false,
          personform:{ robot:res.robot, robot_goods:res.robot_goods}
        });
      });
    }
    this.setState({ orderid: id})
  };

  columns = [
    {
      title: '微信用户',
      dataIndex: 'user_info',
      key: 'user_info',
      align: 'left',
      render: (t) => (
        <Fragment>
          <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: t.id }} }>
            <img src={t.avatar_url} width="30" height="30" alt="" />
            <span style={{display:'inline-block',verticalAlign:'middle',maxWidth:'150px',
              overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',marginLeft: 10 }}>
              {t.nickname}
            </span>
          </Link>
        </Fragment>
      ),
    },
    {
      title: '拼团商品-规格',
      dataIndex: 'goods_info',
      key: 'goods_info',
      render: t => t.name,
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width:100,
      render: (t,r) => `￥${r.goods_info && r.goods_info.price.toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'num',
      key: 'num',
      render: (t,r) => r.goods_info && r.goods_info.num,
    },
    {
      title: '价格',
      dataIndex: 'order_amount',
      key: 'order_amount',
      width:100,
      render: (t,r) => `￥${r.goods_info && r.goods_info.order_amount.toFixed(2)}`,
    },
    {
      title: '订单号',
      dataIndex: 'order_sn',
      key: 'order_sn',
      width:100,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      width:60,
      render: (text, record) => (
        <Fragment>
          <span>
            <Link to={{
              pathname: record.model_type === 'ord' ? `/order/mixOrderlist/orderDetail` : `/order/mixOrderlist/suborderDetail`,
              query:{ id:record.id,is_pt:true} }}>
              查看
            </Link>
          </span>
        </Fragment>
      ),
    },
  ];

  //订单信息修改和保存
  personHandle = (e, key) => {
    const { personform } = this.state;
    personform[key] = e;
    this.setState({ personform });
  };
  //提交添加的拼团数据
  addDataModal = () => {
    const { dispatch } = this.props;
    const { personform, orderdata } = this.state
    const that = this
    Modal.confirm({
      title: '确认操作',
      content: '拼团数据一旦添加不可扣减，请确认是否添加',
      centered: true,
      okText: '确认',
      cancelText:'取消',
      onOk() {
        that.setState({ onLoading: true });
        dispatch({
          type:'costom/_putUrlData',
          payload:{
            url: orderdata.url,
            data:{ ...personform }
          }
        }).then((res) => {
          if(res){
            that.setState({ visible: false })
            that.initData()
          }
          that.setState({ onLoading: false });
        })
      }
    })
  }
  //倒计时结束提示
  onEndCount = () => {
    const { orderdata } = this.state;
    const that = this
    if(orderdata.status === 'build'){
      Modal.info({
        title: '消息提示',
        content: '拼团结束',
        okText: '确定',
        centered: true,
        onOk() {
          that.initData()
        },
      })
    }
  }
  //判断成团阶梯
  ladderLevel = () => {
    const { orderdata } = this.state
    let totalnum = orderdata.mode === 'people'
      ? orderdata.robot + orderdata.partake_count
      : orderdata.robot_goods + orderdata.goods_count
    let levelindex = 0, dvalue = 0
    orderdata.ladder.length > 0 && orderdata.ladder.map(item => {
      if(item.num <= totalnum){
        levelindex = Math.max(item.index,levelindex)
      }
    })

    if(orderdata.ladder.length > levelindex){
      dvalue = orderdata.ladder[levelindex].num - totalnum
    }
    const dlevel = dvalue ? (<span style={{color:'orange'}}>(差{dvalue}{orderdata.mode === 'people' ? '人' : '件商品'}到达阶梯{levelindex+1}要求)</span>) : null
    if(orderdata.status === 'build'){
      return <Fragment>{levelindex ? `阶梯${levelindex}` : '无'}{dlevel}</Fragment>;
    }
    else{
      if(levelindex) {
        return <Fragment>阶梯{levelindex}</Fragment>;
      }
      else{
        return <Fragment>无{dlevel}</Fragment>;
      }
    }
  }

  render() {
    const {
      orderdata,
      orderdata_item,
      personform,
    } = this.state;
    const { orderLoading } = this.props

    return (
      <PageHeaderWrapper>
        <Spin spinning={orderLoading} tip="正在加载数据中">
          <Card className={styles.main} title="商品信息">
            <Table
              dataSource={orderdata_item}
              columns={this.columns}
              rowKey="url"
              scroll={{ x: 800 }}
            />
          </Card>
          <Card className={styles.main} title="拼团信息"
                extra={ <Fragment>拼团倒计时：
                  <CountDown style={{ fontSize: 18, color:'red' }}
                             onEnd={this.onEndCount}
                             target={orderdata.end_time ? (new Date(orderdata.end_time).getTime()) : null} />
                </Fragment>}>
            <Form className={styles.editform}>
              <FormItem label="拼团号">
                <span>{orderdata.ptgroup_no}</span>
              </FormItem>
              <FormItem label="拼团商品">
                <span>{orderdata.goods_name}</span>
              </FormItem>
              <FormItem label="拼团发起人">
                <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: orderdata.owner && orderdata.owner.id }} }>
                  <img src={orderdata.owner &&orderdata.owner.avatar_url} width="30" height="30" alt="" />
                  <span style={{marginLeft:10}}>{orderdata.owner && orderdata.owner.nickname}</span>
                </Link>
              </FormItem>
              <FormItem label="拼团发起时间">
                <span>
                  {orderdata.add_time &&
                    moment(orderdata.add_time).format('YYYY-MM-DD kk:mm:ss')}
                </span>
              </FormItem>
              <FormItem label="拼团用户人数">
                <span>{orderdata.partake_count}{' '}人</span>
              </FormItem>
              <FormItem label="用户购买商品件数">
                <span>{orderdata.goods_count}{' '}件</span>
              </FormItem>
              <FormItem label="拼团机器人设置">
                <InputNumber value={personform.robot}
                             min={orderdata.robot || 0}
                             precision={0}
                             disabled={orderdata.status !== 'build'}
                             onChange={(e) => this.personHandle(e,'robot')}
                />
                <span style={{marginLeft:5}}>人</span>
              </FormItem>
              <FormItem label="拼团机器人购买商品设置">
                <InputNumber value={personform.robot_goods}
                             precision={0}
                             disabled={orderdata.status !== 'build'}
                             min={Math.max(personform.robot,orderdata.robot_goods) || 0}
                             onChange={(e) => this.personHandle(e,'robot_goods')}
                />
                <span style={{marginLeft:5}}>件</span>
              </FormItem>
              <FormItem label="拼团状态">
                <span>{orderstatus_group[orderdata.status]}</span>
              </FormItem>
              <FormItem label="拼团阶梯">
                <span>{ orderdata.ladder && orderdata.ladder.length > 0 && this.ladderLevel()}</span>
              </FormItem>
              {/*<FormItem label="拼团奖励积分">*/}
                {/*<span>{orderdata.integral}</span>*/}
              {/*</FormItem>*/}
            </Form>
            <Row><Col style={{ textAlign:'right' }}>
              <Link to={{pathname:'/order/mixOrderlist'}}>
              <Button style={{marginRight:10}}>返回</Button>
              </Link>
              <Button type="primary" onClick={() => this.addDataModal()}>保存</Button>
            </Col></Row>
          </Card>
          <OrderInfo formdata={orderdata} ordertype="pt"/>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default mixEditorder;
