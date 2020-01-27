import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import { connect } from "dva";
import moment from "moment";
import { Button, Card, Table, Row, Col, DatePicker, Input, Spin } from "antd";
import styles from "./finance.less";
import CollapseItem from "@/components/CostomCom/collapseItem";
import Link from "umi/link";

const itemsPerPage = 10;
const { RangePicker } = DatePicker;

@connect(({ finance, global, loading }) => ({
  rechargelist: finance.rechargelist,
  rechargeCount: finance.rechargeCount,
  searchform: global.searchform,
  rechargeloading: loading.effects["finance/getRecgargelist"]
}))
class Recharge extends Component {
  state = {
    page: 1,
    loading: false,
    tradeform: {},
    date: null
  };

  columns = [
    {
      title: "序号",
      dataIndex: "key",
      key: "key"
    },
    {
      title: "微信用户",
      dataIndex: "user_info",
      key: "user_info",
      align: "left",
      render: t => (
        <Fragment>
          <Link
            style={{ color: "rgba(0, 0, 0, 0.65)" }}
            to={{ pathname: `/user/userlist/edituser`, query: { id: t.id } }}
          >
            <img src={t.avatar_url} width="30" height="30" alt="" />
            <span
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                maxWidth: "150px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                marginLeft: 10
              }}
            >
              {t.nickname}
            </span>
          </Link>
        </Fragment>
      )
    },
    {
      title: "充值金额",
      dataIndex: "amount",
      key: "amount"
    },
    {
      title: "支付金额",
      dataIndex: "real_pay",
      key: "real_pay"
    },
    {
      title: "微信支付流水号",
      dataIndex: "trade_no",
      key: "trade_no"
    },
    {
      title: "充值时间",
      dataIndex: "create_time",
      key: "create_time",
      render: t => moment(t).format("YYYY-MM-DD kk:mm:ss")
    }
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "global/resetSearchFormKey",
      payload: { key: "recharge" }
    }).then(() => {
      this.initData("init");
    });
  }
  initData = type => {
    const {
      dispatch,
      searchform: { recharge }
    } = this.props;
    const { tradeform } = this.state;
    let _tradeform = {};
    if (type === "init") {
      _tradeform = { ...recharge };
      this.setState({ tradeform: { ...recharge } });
    } else if (type === "reset") {
      this.setState({ tradeform: {}, date: null });
    } else if (type === "search") {
      _tradeform = { ...tradeform, page: 1 };
      this.setState({ tradeform: { ..._tradeform } });
    } else {
      _tradeform = { ...tradeform };
    }
    dispatch({
      type: "finance/getRecgargelist",
      payload: {
        page_size: itemsPerPage,
        ..._tradeform
      }
    });
  };

  componentWillUnmount() {
    const { tradeform } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: "global/searchFormKey",
      payload: { recharge: { ...tradeform } }
    });
  }

  ondateChange = (date, dateString) => {
    const { tradeform } = this.state;
    tradeform["date_after"] = dateString[0];
    tradeform["date_before"] = dateString[1];
    this.setState({ tradeform });
  };
  handletradeform = (e, key) => {
    const { tradeform } = this.state;
    tradeform[key] = e.target.value;
    this.setState({ tradeform });
  };
  searchSubmit = () => {
    this.initData("search");
  };

  render() {
    const { rechargelist, rechargeCount, rechargeloading } = this.props;
    const { tradeform } = this.state;

    const pagination = {
      pageSize: itemsPerPage,
      current: tradeform.page,
      total: rechargeCount,
      onChange: page => {
        this.setState({ tradeform: { ...tradeform, page } });
        const { dispatch } = this.props;
        dispatch({
          type: "finance/getRecgargelist",
          payload: {
            ...tradeform,
            page,
            page_size: itemsPerPage
          }
        });
      }
    };

    return (
      <PageHeaderWrapper>
        <Card className={styles.main}>
          <Spin spinning={false}>
            <CollapseItem
              renderSimpleForm={() => (
                <Fragment>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>
                      微信用户昵称:{" "}
                    </span>
                    <Input
                      value={tradeform.wxuser}
                      onChange={e => {
                        this.handletradeform(e, "wxuser");
                      }}
                      placeholder="请输入微信用户昵称"
                      style={{ width: 200 }}
                    />
                  </div>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>充值时间: </span>
                    <RangePicker
                      value={
                        tradeform.date_after
                          ? [
                              moment(tradeform.date_after, "YYYY-MM-DD"),
                              moment(tradeform.date_before, "YYYY-MM-DD")
                            ]
                          : null
                      }
                      onChange={this.ondateChange}
                    />
                  </div>
                </Fragment>
              )}
              renderAdvancedForm={() => (
                <Fragment>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>
                      微信支付流水号:{" "}
                    </span>
                    <Input
                      value={tradeform.trade_no}
                      onChange={e => {
                        this.handletradeform(e, "trade_no");
                      }}
                      placeholder="请输入微信支付流水号"
                      style={{ width: 200 }}
                    />
                  </div>
                </Fragment>
              )}
            />
          </Spin>
          <Row>
            <Col span={24} style={{ textAlign: "right" }}>
              <div style={{ marginBottom: 20 }}>
                <Button
                  type="primary"
                  style={{ marginLeft: 30 }}
                  onClick={this.searchSubmit}
                >
                  查询
                </Button>
                <Button
                  type="danger"
                  style={{ marginLeft: 20 }}
                  onClick={() => this.initData("reset")}
                >
                  重置
                </Button>
              </div>
            </Col>
          </Row>
          <Table
            loading={rechargeloading}
            dataSource={rechargelist}
            columns={this.columns}
            pagination={pagination}
            scroll={{ x: 800 }}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Recharge;
