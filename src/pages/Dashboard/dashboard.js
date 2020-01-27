import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import Link from "umi/link";
import { connect } from "dva";
import {
  Card,
  Row,
  Col,
  Icon,
  DatePicker,
  Spin,
  Button,
  Tabs,
  Modal,
  message
} from "antd";
import { getLocalStorage } from "@/utils/authority";
import styles from "./dashboard.less";

const { Meta } = Card;
const { RangePicker } = DatePicker;
let myChart;

@connect(({ dashboard, global, loading, wechat }) => ({
  isMobile: global.isMobile,
  shopurl: global.shopurl,
  config: global.config,
  wechatInfo: wechat.info,
  wechatConfig: wechat.value,
  appQRCode: global.appQRCode,
  superadmin: global.superadmin,
  permissions: global.permissions,
  chartslist: dashboard.chartslist,
  countform: dashboard.countform,
  allform: dashboard.allform,
  AppQRCodeLoading:
    loading.effects["global/fetchAppQRCode"] ||
    loading.effects["wechat/fetchConfig"],
  CountLoading: loading.effects["dashboard/fetchCount"],
  TotalCountLoading: loading.effects["dashboard/fetchTotalCount"]
}))
class dashboard extends Component {
  state = {
    init: "init",
    shopid: "",
    date: [],
    option: {},
    amount: 0,
    order_count: 0
  };

  componentDidMount() {
    const { permissions, dispatch } = this.props;
    dispatch({ type: "global/fetchAppQRCode" });

    if (permissions.length > 0) {
      this.init();
    }
  }
  init = () => {
    const { dispatch, shopurl } = this.props;
    let shopid = getLocalStorage("shopid").split("#")[0];
    this.setState({ shopid: shopurl });
    dispatch({ type: "dashboard/fetchCount", payload: { shop: shopid } }).then(
      () => {
        this.initChart();
      }
    );
    dispatch({ type: "dashboard/fetchTotalCount", payload: { shop: shopid } });
    dispatch({
      type: "dashboard/fetchOrderGoodCount",
      payload: { shop: shopid }
    });
  };

  initChart = () => {
    const { chartslist } = this.props;
    const date = chartslist.map(item => item.date);
    const amount = chartslist.map(item => item.amount);
    const order_count = chartslist.map(item => item.order_count);
    let _amount = 0,
      _order_count = 0;
    chartslist.map(item => {
      _amount += Number(item.amount);
      _order_count += Number(item.order_count);
    });
    this.setState({
      amount: _amount.toFixed(2),
      order_count: _order_count.toFixed(2)
    });
    myChart = echarts.init(document.getElementById("main"));
    let option = {
      title: {
        text: "运营数据"
      },
      tooltip: {
        trigger: "axis"
      },
      legend: {
        show: true,
        selected: {
          支付金额: true,
          支付订单数: true
        },
        data: ["支付金额", "支付订单数"]
      },
      color: ["#1890ff", "#13c2c2", "#facc14"],
      series: [
        {
          name: "支付金额",
          type: "line",
          yAxisIndex: 0,
          smooth: 0.5,
          data: amount
        },
        {
          name: "支付订单数",
          type: "line",
          yAxisIndex: 1,
          smooth: 0.5,
          markLine: {
            data: [{ type: "average", name: "平均值" }]
          },
          data: order_count
        }
      ],
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: date
      },
      yAxis: [
        {
          type: "value",
          name: "支付金额(元)",
          axisLabel: {
            formatter: "{value}",
            color: "#000"
          },
          splitLine: {
            show: true
          }
        },
        {
          type: "value",
          name: "支付订单数(笔)",
          axisLabel: {
            formatter: "{value}",
            color: "#000000"
          },
          splitLine: {
            show: false
          }
        }
      ]
    };
    myChart.setOption(option);
    this.setState({ option });
    window.onresize = function() {
      myChart.resize();
    };
  };

  componentDidUpdate(preprops, prestate) {
    const { shopurl, permissions, superadmin } = this.props;
    if (permissions.length > 0) {
      if (shopurl !== this.state.shopid && preprops.shopurl !== shopurl) {
        this.init();
      }
      if (shopurl === "all" && shopurl !== this.state.shopid && superadmin) {
        this.init();
      }
    }
  }

  timeChange = value => {
    const { dispatch } = this.props;
    const { date } = this.state;
    let shopid = getLocalStorage("shopid").split("#")[0];
    if (!date[0] || date[0] !== value[0] || date[1] !== value[1]) {
      this.setState({ date: value });
      dispatch({
        type: "dashboard/fetchCount",
        payload: { shop: shopid, start: value[0], end: value[1] }
      }).then(() => {
        this.initChart();
      });
    }
  };

  handleSubmit = () => {
    const { dispatch } = this.props;
    Modal.confirm({
      title: "提审当前版本",
      content:
        "由于微信审核机制所限，请务必先录入所有商品数据之后再提交审核，否则会导致小程序审核不通过无法正常上线。",
      centered: true,
      okText: "确认",
      cancelText: "取消 ",
      onOk() {
        dispatch({ type: "wechat/submitWxapp" }).then(res => {
          if (res.audit_status === 2)
            // 审核中
            message.success("提审成功");
        });
      }
    });
  };

  toItempage = (route, key, searchform) => {
    const { dispatch } = this.props;
    dispatch({
      type: "global/searchFormKey",
      payload: { [key]: { ...searchform } }
    }).then(() => {
      this.props.history.push({ pathname: route });
    });
  };

  handlecharts = key => {
    let { option } = this.state;
    let flag = false,
      index = 0;
    option.yAxis.map(item => {
      item.splitLine = { show: false };
      if (item.name.includes(key) && !option.legend.selected[key]) {
        item.splitLine = { show: true };
        flag = true;
      }
    });
    if (!flag) {
      option.yAxis.map((item, inNum) => {
        if (!item.name.includes(key)) {
          index = inNum;
        }
      });
      option.yAxis[index].splitLine = { show: true };
    }
    option.legend.selected[key] = !option.legend.selected[key];
    this.setState({ option });
    myChart.setOption(option);
  };

  render() {
    const {
      countform,
      TotalCountLoading,
      allform,
      CountLoading,
      appQRCode,
      AppQRCodeLoading,
      config,
      wechatInfo,
      wechatConfig
    } = this.props;
    const { option, amount, order_count } = this.state;

    const Carditem = props => (
      <Card
        className={styles.cardtab}
        style={{ marginLeft: 0, marginRight: "1%" }}
        bordered={false}
        hoverable={true}
        bodyStyle={{ boxShadow: "0px 0px 1px rgba(238,238,238,1)" }}
        {...props}
      />
    );

    const divStyle = {
      display: "inline-flex",
      justifyContent: "space-between",
      width: "100%"
    };
    const labelStyle = { display: "inline-block", width: "70px" };
    const detailStyle = { color: "orangered", display: "inline-block" };

    return (
      <PageHeaderWrapper>
        <Spin spinning={TotalCountLoading}>
          <Card bordered={false}>
            <Row>
              <Col span={6} sm={5} md={4}>
                <Carditem
                  style={{ width: "100%" }}
                  hoverable={false}
                  loading={AppQRCodeLoading}
                >
                  {(config &&
                    config.store_type === "cloud" &&
                    wechatConfig &&
                    wechatConfig.wx_lite_secret) ||
                  (config && config.store_type === "camel") ? (
                    <Fragment>
                      <Tabs tabPosition="bottom" size="small">
                        <Tabs.TabPane
                          tab="正式版"
                          key="1"
                          forceRender
                          disabled={!appQRCode.official}
                        >
                          <img
                            style={{
                              width: "100%",
                              maxWidth: 130,
                              display: "block",
                              margin: "auto"
                            }}
                            alt=""
                            src={
                              "data:image/png;base64," + appQRCode.official ||
                              ""
                            }
                          />
                        </Tabs.TabPane>
                        <Tabs.TabPane
                          tab="体验版"
                          key="2"
                          forceRender
                          disabled={!appQRCode.preview}
                        >
                          <img
                            style={{
                              width: "100%",
                              maxWidth: 130,
                              display: "block",
                              margin: "auto"
                            }}
                            alt=""
                            src={
                              "data:image/png;base64," + appQRCode.preview || ""
                            }
                          />
                        </Tabs.TabPane>
                      </Tabs>
                      {// 要是云店版本
                      config &&
                        config.store_type === "cloud" &&
                        // 要能提审
                        (wechatInfo &&
                          wechatInfo.audit_status === 5 && (
                            <Button
                              style={{ marginTop: 4 }}
                              block
                              onClick={this.handleSubmit}
                            >
                              提交审核
                            </Button>
                          ))}
                    </Fragment>
                  ) : (
                    <div>
                      <p>小程序尚未正确设置基础信息，无法预览</p>
                      <Link to="/wechat/base">前往设置</Link>
                    </div>
                  )}
                </Carditem>
              </Col>
              <Col span={18} sm={19} md={20}>
                <Carditem
                  style={{ marginLeft: "1%", marginRight: "1%" }}
                  onClick={() =>
                    this.toItempage("order/orderlist", "order", {
                      status: "has paid"
                    })
                  }
                >
                  <Meta
                    avatar={
                      <div
                        className={styles.cardcover}
                        style={{ background: "#1890ff" }}
                      >
                        <Icon
                          type="file-sync"
                          theme="outlined"
                          className={styles.cardicon}
                        />
                      </div>
                    }
                    title="待发货普通订单(个)"
                    description={(allform.ord_orders || 0).toString()}
                  />
                </Carditem>
                <Carditem
                  onClick={() =>
                    this.toItempage("user/feedback", "feedback", {
                      solve: "false"
                    })
                  }
                >
                  <Meta
                    avatar={
                      <div
                        className={styles.cardcover}
                        style={{ background: "#f04864" }}
                      >
                        <Icon type="inbox" className={styles.cardicon} />
                      </div>
                    }
                    title="未解决用户反馈(条)"
                    description={(allform.feedback || 0).toString()}
                  />
                </Carditem>
                <Carditem
                  style={{ marginLeft: "1%", marginRight: "1%" }}
                  onClick={() =>
                    this.toItempage("good/ordgood/goodlist", "good", {
                      status: "is_sell"
                    })
                  }
                >
                  <Meta
                    avatar={
                      <div
                        className={styles.cardcover}
                        style={{ background: "#1890ff" }}
                      >
                        <Icon
                          type="file-sync"
                          theme="outlined"
                          className={styles.cardicon}
                        />
                      </div>
                    }
                    title="在售普通商品(个)"
                    description={(allform.ord_goods || 0).toString()}
                  />
                </Carditem>
                <Carditem>
                  <Meta
                    avatar={
                      <div
                        className={styles.cardcover}
                        style={{ background: "#f04864" }}
                      >
                        <Icon type="inbox" className={styles.cardicon} />
                      </div>
                    }
                    title="用户可提现金额(元)"
                    description={(allform.asset || 0).toString()}
                  />
                </Carditem>
              </Col>
            </Row>
          </Card>
        </Spin>

        <Card bordered={false} style={{ marginTop: "20px" }}>
          <Carditem
            style={
              option.legend && option.legend.selected["支付订单数"]
                ? {
                    boxShadow: "0px 0px 5px rgba(24,144,255,1)",
                    marginLeft: "1%",
                    marginRight: "1%"
                  }
                : {
                    boxShadow: "0px 0px 1px rgba(238,238,238,1)",
                    marginLeft: "1%",
                    marginRight: "1%"
                  }
            }
            headStyle={{ border: "none" }}
            bodyStyle={{ paddingTop: 0 }}
            title={
              <div
                className={styles.cardcover}
                style={{ background: "#faad14" }}
              >
                <Icon
                  type="database"
                  theme="outlined"
                  className={styles.cardicon}
                />
              </div>
            }
            extra={"支付订单数(个)"}
            className={styles.cardtabBig}
            onClick={() => this.handlecharts("支付订单数")}
          >
            <div style={divStyle}>
              <span style={labelStyle}>昨日：</span>
              <span style={detailStyle}>
                {countform.order_count && countform.order_count.yesterday}
              </span>
            </div>
            <div style={divStyle}>
              <span style={labelStyle}>过去一周：</span>
              <span style={detailStyle}>
                {countform.order_count && countform.order_count.week_ago}
              </span>
            </div>
            <div style={divStyle}>
              <span style={labelStyle}>总计：</span>
              <span style={detailStyle}>{order_count}</span>
            </div>
          </Carditem>
          <Carditem
            className={styles.cardtabBig}
            extra={"支付金额(元)"}
            onClick={() => this.handlecharts("支付金额")}
            headStyle={{ border: "none" }}
            bodyStyle={{ paddingTop: 0 }}
            title={
              <div
                className={styles.cardcover}
                style={{ background: "#faad14" }}
              >
                <Icon
                  type="database"
                  theme="outlined"
                  className={styles.cardicon}
                />
              </div>
            }
            style={
              option.legend && option.legend.selected["支付金额"]
                ? {
                    boxShadow: "0px 0px 5px rgba(24,144,255,1)",
                    marginLeft: 0,
                    marginRight: "1%"
                  }
                : {
                    boxShadow: "0px 0px 1px rgba(238,238,238,1)",
                    marginLeft: 0,
                    marginRight: "1%"
                  }
            }
          >
            <div style={divStyle}>
              <span style={labelStyle}>昨日：</span>
              <span style={detailStyle}>
                {countform.turnovers && countform.turnovers.yesterday}
              </span>
            </div>
            <div style={divStyle}>
              <span style={labelStyle}>过去一周：</span>
              <span style={detailStyle}>
                {countform.turnovers && countform.turnovers.week_ago}
              </span>
            </div>
            <div style={divStyle}>
              <span style={labelStyle}>总计：</span>
              <span style={detailStyle}>{amount}</span>
            </div>
          </Carditem>
          <Carditem
            className={styles.cardtabBig}
            extra={"提现支出"}
            headStyle={{ border: "none" }}
            bodyStyle={{
              paddingTop: 0,
              boxShadow: "0px 0px 1px rgba(238,238,238,1)"
            }}
            title={
              <div
                className={styles.cardcover}
                style={{ background: "#faad14" }}
              >
                <Icon
                  type="database"
                  theme="outlined"
                  className={styles.cardicon}
                />
              </div>
            }
          >
            <div style={divStyle}>
              <span style={labelStyle}>昨日：</span>
              <span style={detailStyle}>
                {countform.expenditure && countform.expenditure.yesterday}
              </span>
            </div>
            <div style={divStyle}>
              <span style={labelStyle}>过去一周：</span>
              <span style={detailStyle}>
                {countform.expenditure && countform.expenditure.week_ago}
              </span>
            </div>
            <div style={divStyle}>
              <span style={labelStyle} />
              <span style={detailStyle} />
            </div>
          </Carditem>
          <Row>
            <Col
              style={{ textAlign: "right", marginBottom: 10, marginRight: 5 }}
            >
              <RangePicker
                style={{ textAlign: "center" }}
                onChange={(e, str) => this.timeChange(str)}
              />
            </Col>
          </Row>
          <Spin spinning={CountLoading} tip="数据加载中">
            <div id="main" style={{ width: "100%", height: "400px" }} />
          </Spin>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default dashboard;
