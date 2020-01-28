import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import {
  Card,
  Row,
  Col,
  Spin,
  Table,
  DatePicker
} from 'antd';
import moment from 'moment';
import { getLocalStorage } from '@/utils/authority';

const RangePicker = DatePicker.RangePicker;
const colorList = ['#1890ff', '#13c2c2', '#facc14', '#f04864', '#2FC25B', '#FFA07A', '#F6CB90'];

@connect(({ dashboard, global, loading, }) => ({
  isMobile: global.isMobile,
  shopurl: global.shopurl,
  superadmin: global.superadmin,
  permissions: global.permissions,
  noticefeedback: global.noticefeedback && global.noticefeedback.slice(0,5),
  noticefeedbackCount: global.noticefeedbackCount,
  chartslist:dashboard.chartslist,
  countform: dashboard.countform,
  allform: dashboard.allform,
  loadingdash: loading.models.dashboard,
}))
class statistic extends Component {
  state = {
    init: 'init',
    shopid: '',
    orderdate: [],
    userdate: [],
    feedbackdate: [],
    withdrawdate: [],
    rechargedate: [],
    option: {},
  }

  componentDidMount(){
    const { permissions } = this.props
    if(permissions.length > 0){
      this.init()
    }
  }
  init = () => {
    this.DispatchData('feedback',['new_num','solve_num'])
    this.DispatchData('withdraw',['withdraw_num','succ_num'])
    this.DispatchData('recharge',['amount_total'])
    this.DispatchData('wxuser',['new_user_num','user_total'])
    this.DispatchData('level',['level'])
    this.DispatchData('order',['ord_num', 'sub_num', 'repl_num', 'qrpay_num', 'total'])
    this.DispatchData('turnovers',['ord_turnovers','sub_turnovers','qrpay_turnovers', 'turnovers'])
  }
  DispatchData = (type,keylist) => {
    const { dispatch, shopurl } = this.props
    const { orderdate, userdate, withdrawdate, rechargedate, feedbackdate } = this.state;
    let shopid = getLocalStorage('shopid').split('#')[0]
    this.setState({ shopid:shopurl })
    const valuedate = (type === 'order' || type === 'turnovers') ? orderdate
      : (type === 'wxuser' || type === 'level') ? userdate
        : type === 'feedback' ? feedbackdate
          : type === 'withdraw' ? withdrawdate
            : type === 'recharge' ? rechargedate : undefined
    dispatch({
      type:'dashboard/fetchStatistic',
      payload: {
        type,
        data: {
          shop: shopid,
          start: valuedate && valuedate[0] || undefined,
          end: valuedate && valuedate[1] || undefined
        }
      }
    }).then((res) => {
      if(res){
        keylist && type !== 'level' && this.initChart(type,res,keylist)
        keylist && (type === 'order' || type === 'turnovers' || type === 'level')
          ? this.initChartPic(`${type}Pic`,res,keylist.slice(0,-1)) : null
      }
    })
  }

  initChart = (idname,res,keylist) => {
    const date = res.map(item => item.date)
    let numlist = [], _series = [], _yAxis = [], _selected = {}, len = keylist.length;
    const textlist = {
      feedback: { title: '用户反馈数据', label:['新增反馈/个','处理反馈/个'], color: colorList.slice(2,5),xAxis: true },
      wxuser: { title: '新增用户数量', label:['新增用户','用户总数'], xAxis: true},
      withdraw: { label:['申请提现','完成提现'], xAxis: true },
      recharge: { label: ['充值'], showtype:['bar'], xAxis: true },
      order: { title:'订单数',label:['普通订单','订阅商品订单','积分商品订单','线下支付订单','总订单'],
        showtype:['bar','bar','bar','bar','line'],
        stack:['order','order','order','order',undefined],
        xAxis: true
      },
      turnovers: { title:'销售额',label: ['普通商品销售额','订阅商品销售额','线下销售额','总销售额'],
        showtype:['bar','bar','bar','line'],
        stack:['turnovers','turnovers','turnovers',undefined],
        color: [colorList[0], colorList[1], colorList[3], colorList[4]],
        xAxis: true
      }
    }
    textlist[idname].label.map((item, index) => {
      if(textlist[idname].stack && !textlist[idname].stack[index]){
        _selected[item] = false
      }
    })
    keylist && keylist.map((item,index) => {
      if(item){
        numlist[index] = res.map(item_in => item_in[item]);
        _series[index] = {
          name: textlist[idname].label[index],
          type: (textlist[idname].showtype && textlist[idname].showtype[index]) || 'line',
          stack: (textlist[idname].stack && textlist[idname].stack[index]) || undefined,
          yAxisIndex: len > 2 ? undefined : index,
          smooth:0.5,
          data:res.map(item_in => item_in[item]),
        };
        _yAxis[index] = {
          type : 'value',
          name : len > 2 ? undefined : textlist[idname].label[index],
        };
      }
    })
    let myChart = echarts.init(document.getElementById(idname));
    let option = {
      title: {
        text: textlist[idname].title || undefined,
        textStyle:{ fontWeight:'normal', fontSize: 14 }
      },
      tooltip : {
        trigger: textlist[idname].trigger || 'axis',
      },
      legend: {
        show:true,
        selected:{ ..._selected },
        padding: [20,20,0,0],
        data:textlist[idname].label
      },
      color: textlist[idname].color || colorList,
      series: [ ..._series ],
      calculable : true,
      xAxis: textlist[idname].xAxis ? {
        type : 'category',
        axisLabel: textlist[idname].axisLabel || {},
        data: date
      } : undefined,
      yAxis: [ ..._yAxis ],
      grid:{
        containLabel: true,
      }
    };
    myChart.setOption(option);
    window.onresize = function () {
      myChart.resize();
    };
  };

  //饼状图
  initChartPic = (idname, res, keylist) => {
    let data = [];
    const textlist = {
      orderPic: {
        label:['普通订单','订阅商品订单','积分商品订单','线下支付订单'],
      },
      turnoversPic: {
        label: ['普通商品销售额','订阅商品销售额','线下销售额'],
        color: [colorList[0], colorList[1], colorList[3], colorList[4]],
        fixed: 2
      },
      levelPic: {
        radius: '55%',
        color: colorList.slice(0).reverse(),
      }
    }
    idname !== 'levelPic' && keylist && keylist.map((item,index) => {
      let value = 0
      res.map(item_in => {
        value = (Number(value) + Number(item_in[item])).toFixed(textlist[idname].fixed || 0)
      })
      data.push({ value, name: textlist[idname].label[index]})
    })
    idname === 'levelPic' && res.map(item => {
      data.push({ value:item.num, name: item.level !== 'null' ? item.level : '普通会员(无等级)' })
    })
    let myChartPic = echarts.init(document.getElementById(idname));
    let option = {
      title: {
        text: textlist[idname].title || undefined,
        textStyle:{ fontWeight:'normal', fontSize: 14 },
        x:'center'
      },
      tooltip : {
        trigger: 'item',
        formatter: "{b} : {c} ({d}%)",
      },
      legend: {
        orient : 'vertical',
        x : 'right',
        data:textlist[idname].label
      },
      color: textlist[idname].color || colorList,
      series: [{
        name:textlist[idname].title,
        type:'pie',
        radius : textlist[idname].radius || '50%',
        center: ['55%', '60%'],
        startAngle: 100,
        data:[ ...data ]
      }],
      calculable : true,
      grid:{
        containLabel: true,
      }
    };
    myChartPic.setOption(option);
    window.onresize = function () {
      myChartPic.resize();
    };
  }

  componentDidUpdate(preprops,prestate){
    const { shopurl, permissions, superadmin } = this.props
    if(permissions.length > 0){
      if(shopurl !== this.state.shopid && preprops.shopurl !== shopurl) {
        this.init()
      }
      if(shopurl === 'all' && shopurl !== this.state.shopid && superadmin){
        this.init()
      }
    }
  }

  timeChange = async (value,key) => {
    const valuedate = [key]
    if(!valuedate[0] || valuedate[0] !== value[0] || valuedate[1] !== value[1]){
      if(key === 'orderdate'){
        await this.setState({ orderdate: value })
        await this.DispatchData('order',['ord_num', 'sub_num', 'repl_num', 'total'])
        await this.DispatchData('turnovers',['ord_turnovers','sub_turnovers','turnovers'])
      }
      else if(key === 'userdate'){
        await this.setState({ userdate: value })
        await this.DispatchData('wxuser',['new_user_num', 'user_total'])
      }
      else if(key === 'feedbackdate'){
        await this.setState({ feedbackdate: value })
        await this.DispatchData('feedback',['new_num','solve_num'])
      }
      else if(key === 'withdrawdate'){
        await this.setState({ withdrawdate: value })
        await this.DispatchData('withdraw',['withdraw_num','succ_num'])
      }
      else if(key === 'rechargedate'){
        await this.setState({ rechargedate: value })
        await this.DispatchData('recharge',['amount_total'])
      }
    }
  }

  toFeedback = () => {
    const { dispatch } = this.props;
    dispatch({
      type:'global/searchFormKey',
      payload:{ feedback: { solve: 'false' } }
    }).then(() => this.props.history.push({ pathname: `/user/feedback` }) )
  }

  render(){
    const { loadingdash, noticefeedback, noticefeedbackCount } = this.props
    const colSpan = { sm:{span: 24}, md:{span:24}, lg:{span:14}, };
    const colSpanRight = { sm:{span: 24}, md:{span:24}, lg:{span:10}, };
    // console.log(noticefeedback)

    const feedbackColumn = [
      {
        title: '反馈时间',
        dataIndex: 'add_time',
        key: 'add_time',
        render: (t) => moment(t).format('YYYY-MM-DD kk:mm:ss')
      },
      {
        title: '用户',
        dataIndex: 'user_info',
        key: 'user_info',
        render: (t) => t && t.nickname
      },
    ]

    return(
      <PageHeaderWrapper>
        <Card bordered={false} title="订单销售情况" style={{marginTop:'20px'}}>
          <Spin spinning={loadingdash} tip="数据加载中">
            <Row gutter={16}>
              <Col style={{textAlign:'right',marginBottom:10,marginRight:5}}>
                <RangePicker style={{textAlign:'center'}} onChange={(e,str) => this.timeChange(str,'orderdate')}/>
              </Col>
              <Col {...colSpan}>
                <div id="turnovers" style={{width: '100%',height:'300px'}}/>
              </Col>
              <Col {...colSpanRight}>
                <div id="turnoversPic" style={{width: '100%',height:'300px'}}/>
              </Col>
              <Col {...colSpan}>
                <div id="order" style={{width: '100%',height:'300px'}}/>
              </Col>
              <Col {...colSpanRight}>
                <div id="orderPic" style={{width: '100%',height:'300px'}}/>
              </Col>
            </Row>
          </Spin>
        </Card>
        <Card bordered={false} title="用户情况" style={{marginTop:'20px'}}>
          <Spin spinning={loadingdash} tip="数据加载中">
            <Row gutter={16}>
              <Col style={{textAlign:'right',marginBottom:10,marginRight:5}}>
                <RangePicker style={{textAlign:'center'}} onChange={(e,str) => this.timeChange(str,'userdate')}/>
              </Col>
              <Col {...colSpan}>
                <div id="wxuser" style={{width: '100%',height:'350px'}}/>
              </Col>
              <Col {...colSpanRight}>
                <div id="levelPic" style={{width: '100%',height:'350px'}}/>
              </Col>
            </Row>
          </Spin>
        </Card>
        <Card bordered={false} title="用户反馈情况" style={{marginTop:'20px'}}>
          <Spin spinning={loadingdash} tip="数据加载中">
            <Row gutter={16}>
              <Col style={{textAlign:'right',marginBottom:10,marginRight:5}}>
                <RangePicker style={{textAlign:'center'}} onChange={(e,str) => this.timeChange(str,'feedbackdate')}/>
              </Col>
              <Col {...colSpan}>
                <div id="feedback" style={{width: '100%',height:'350px'}}/>
              </Col>
              <Col {...colSpanRight}>
                <div style={{margin:'10px 0'}}>
                  待处理反馈（{noticefeedbackCount}）
                  <a style={{marginLeft: 20}} onClick={() => this.toFeedback()}>查看全部</a>
                </div>
                <Table
                  size="small"
                  dataSource={noticefeedback}
                  columns={feedbackColumn}
                  pagination={false}
                />
              </Col>
            </Row>
          </Spin>
        </Card>

        <Card bordered={false} title="充值统计（元）" style={{marginTop:'20px'}}>
          <Spin spinning={loadingdash} tip="数据加载中">
            <Row gutter={16}>
              <Col style={{textAlign:'right',marginBottom:10,marginRight:5}}>
                <RangePicker style={{textAlign:'center'}} onChange={(e,str) => this.timeChange(str,'rechargedate')}/>
              </Col>
            </Row>
            <div id="recharge" style={{width: '100%',height:'300px'}}/>
          </Spin>
        </Card>
        <Card bordered={false} title="提现统计（笔）" style={{marginTop:'20px'}}>
          <Row gutter={16}>
            <Col style={{textAlign:'right',marginBottom:10,marginRight:5}}>
              <RangePicker style={{textAlign:'center'}} onChange={(e,str) => this.timeChange(str,'withdrawdate')}/>
            </Col>
          </Row>
          <Spin spinning={loadingdash} tip="数据加载中">
            <div id="withdraw" style={{width: '100%',height:'300px'}}/>
          </Spin>
        </Card>
      </PageHeaderWrapper>
    )
  }
}

export default statistic;
