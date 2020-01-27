import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import { connect } from "dva";
import moment from "moment";
import {
  Button,
  Card,
  Table,
  Modal,
  Select,
  message,
  Row,
  Col,
  DatePicker,
  Input,
  Spin,
  Divider
} from "antd";
import styles from "./finance.less";
import CollapseItem from "@/components/CostomCom/collapseItem";
import Link from "umi/link";

const Option = Select.Option;
const { RangePicker } = DatePicker;
const itemsPerPage = 10;
const statusgroup = ["提现中", "已提现", "提现失败"];

@connect(({ finance, global, loading }) => ({
  withdrawallist: finance.withdrawallist,
  withdrawallistCount: finance.withdrawallistCount,
  searchform: global.searchform,
  withdrawalLoading: loading.effects["finance/getwithdrawalList"]
}))
class Orderlist extends Component {
  state = {
    page: 1,
    loading: false,
    tradeform: {},
    visible: false,
    remark: "",
    id: ""
  };

  columns = [
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
      title: "微信号",
      dataIndex: "wx_code",
      key: "wx_code"
    },
    {
      title: "提现金额",
      dataIndex: "amount",
      key: "amount"
    },
    {
      title: "提现发起时间",
      dataIndex: "add_time",
      key: "add_time",
      render: t => moment(t).format("YYYY-MM-DD kk:mm:ss")
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (t, r) => <span>{statusgroup[r.status]}</span>
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      render: (t, r) => (
        <Fragment>
          {r.status === 0 ? (
            <Fragment>
              <a
                onClick={() => this.statusChange(r.user_info.nickname, r.id, 1)}
              >
                已提现
              </a>
              <Divider type="vertical" />
              <a
                style={{ color: "red" }}
                onClick={() => this.statusChange(r.user_info.nickname, r.id, 2)}
              >
                提现失败
              </a>
            </Fragment>
          ) : r.status === 2 ? (
            <a
              style={{ color: "red" }}
              onClick={() => this.remarkModal(r.remark)}
            >
              失败原因
            </a>
          ) : null}
          {r.operation_log && (
            <Fragment>
              {r.status !== 1 && <Divider type="vertical" />}
              <a onClick={() => this.checkLog(r)}>查看日志</a>
            </Fragment>
          )}
        </Fragment>
      )
    }
  ];

  logcolumns = [
    {
      title: "操作管理员",
      dataIndex: "admin_name",
      key: "admin_name"
    },
    {
      title: "操作时间",
      dataIndex: "add_time",
      key: "add_time",
      width: 180,
      render: t => moment(t).format("YYYY-MM-DD kk:mm:ss")
    },
    {
      title: "执行操作",
      dataIndex: "operation",
      key: "operation"
    }
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "global/resetSearchFormKey",
      payload: { key: "money" }
    }).then(() => {
      this.initData("init");
    });
  }
  initData = type => {
    const {
      dispatch,
      searchform: { money }
    } = this.props;
    let { tradeform } = this.state;
    let _tradeform = {};
    if (type === "init") {
      _tradeform = { ...money };
      this.setState({ tradeform: { ...money } });
    } else if (type === "reset") {
      this.setState({ tradeform: {} });
    } else if (type === "search") {
      _tradeform = { ...tradeform, page: 1 };
      this.setState({ tradeform: { ..._tradeform } });
    } else {
      _tradeform = { ...tradeform };
    }
    dispatch({
      type: "finance/getwithdrawalList",
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
      payload: { money: { ...tradeform } }
    });
  }

  //提现申请的操作，成功、失败
  statusChange = (e, id, statusnum) => {
    const { dispatch } = this.props;
    const that = this;
    if (statusnum === 2) {
      //提现失败
      this.setState({ visible: true, id });
    } else {
      Modal.confirm({
        title: "确认提示 ",
        content: `确认用户 ${e} 提现成功`,
        centered: true,
        okText: "确认",
        okType: "danger",
        cancelText: "取消",
        onOk() {
          dispatch({
            type: "finance/withdrawalDataStatus",
            payload: {
              id,
              status: statusnum,
              remark: ""
            }
          })
            .then(res => {
              message.success(res);
              that.initData();
            })
            .catch(err => {
              message.error(err);
            });
        }
      });
    }
  };
  handleOk = () => {
    const { dispatch } = this.props;
    const { remark, id } = this.state;
    dispatch({
      type: "finance/withdrawalDataStatus",
      payload: {
        id,
        status: 2,
        remark
      }
    })
      .then(res => {
        message.success(res);
        this.setState({ visible: false, loading: false });
        this.initData();
      })
      .catch(err => {
        this.setState({ visible: false, loading: false });
        message.error(err);
      });
  };
  //失败原因弹窗
  remarkModal = remark => {
    Modal.error({
      title: "提现失败原因 ",
      content: remark,
      okText: "确认",
      centered: true
    });
  };
  //查看日志
  checkLog = record => {
    Modal.info({
      title: "操作记录",
      content: (
        <Table
          dataSource={record.operation_log || []}
          columns={this.logcolumns}
          rowKey="add_time"
          size="small"
        />
      ),
      okText: "确认",
      width: "60%",
      centered: true
    });
  };

  //筛选条件
  handletradeform = (e, key) => {
    const { tradeform } = this.state;
    tradeform[key] = e.target.value;
    this.setState({ tradeform });
  };
  ondateChange = (date, dateString) => {
    const { tradeform } = this.state;
    tradeform["date_after"] = dateString[0];
    tradeform["date_before"] = dateString[1];
    this.setState({ tradeform });
  };
  searchSubmit = () => {
    this.initData("search");
  };

  render() {
    const {
      withdrawallist,
      withdrawallistCount,
      withdrawalLoading
    } = this.props;
    const { tradeform, remark, loading } = this.state;

    const pagination = {
      pageSize: itemsPerPage,
      current: tradeform.page,
      total: withdrawallistCount,
      onChange: page => {
        this.setState({ tradeform: { ...tradeform, page } });
        const { dispatch } = this.props;
        dispatch({
          type: "finance/getwithdrawalList",
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
                    <span className={styles.searchitem_span}>微信号: </span>
                    <Input
                      value={tradeform.wx_code}
                      onChange={e => {
                        this.handletradeform(e, "wx_code");
                      }}
                      placeholder="请输入微信号"
                      style={{ width: 200 }}
                    />
                  </div>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>微信用户: </span>
                    <Input
                      value={tradeform.wxuser}
                      onChange={e => {
                        this.handletradeform(e, "wxuser");
                      }}
                      placeholder="请输入用户名"
                      style={{ width: 200 }}
                    />
                  </div>
                </Fragment>
              )}
              renderAdvancedForm={() => (
                <Fragment>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>状态: </span>
                    <Select
                      value={tradeform.status}
                      onChange={e => {
                        this.handletradeform(
                          { target: { value: e } },
                          "status"
                        );
                      }}
                      style={{ width: 200 }}
                    >
                      <Option value="0">提现中</Option>
                      <Option value="1">已提现</Option>
                      <Option value="2">提现失败</Option>
                    </Select>
                  </div>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>提现时间: </span>
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
            loading={withdrawalLoading}
            dataSource={withdrawallist}
            columns={this.columns}
            pagination={pagination}
            rowKey="url"
            scroll={{ x: 900 }}
          />
          <Modal
            title="提现失败"
            centered={true}
            visible={this.state.visible}
            onOk={() =>
              !this.state.loading &&
              this.setState({ loading: true }, () => this.handleOk())
            }
            onCancel={() => this.setState({ visible: false })}
          >
            <Input
              placeholder="请输入提现失败原因"
              value={remark}
              onChange={e => this.setState({ remark: e.target.value })}
            />
          </Modal>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Orderlist;
