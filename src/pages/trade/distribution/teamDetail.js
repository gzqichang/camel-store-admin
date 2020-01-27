import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import Link from "umi/link";
import { connect } from "dva";
import moment from "moment";
import { Form, Button, Card, Spin, Table, Row, Col } from "antd";
import styles from "../trade.less";

const FormItem = props => <Form.Item className={styles.items} {...props} />;

@connect(({ user, global, loading }) => ({
  bonus_switch: global.bonus_switch,
  rebate_switch: global.rebate_switch,
  userLoading: loading.models.user
}))
class EditUser extends Component {
  state = {
    userdata: {},
    userform: {},
    _switch: {},
    relList: [],
    id: ""
  };

  componentDidMount() {
    const { location } = this.props;
    let id = location.query.id;
    if (id) {
      this.setState({ id });
      this.initData("init");
    }
  }

  componentDidUpdate(preprops, prestats) {
    const { location } = this.props;
    let id = location.query.id;
    if (id !== this.state.id && this.state.id) {
      this.setState({ id });
      this.initData("init");
    }
  }

  columns = [
    {
      title: "微信用户",
      dataIndex: "avatar_url",
      key: "avatar_url",
      align: "left",
      render: (t, r) => (
        <Fragment>
          <Link
            style={{ color: "rgba(0, 0, 0, 0.65)" }}
            to={{ pathname: `/user/userlist/edituser`, query: { id: r.id } }}
          >
            <img src={t} width="30" height="30" alt="" />
            <span
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                maxWidth: "100px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                marginLeft: 10
              }}
            >
              {r.nickname}
            </span>
          </Link>
        </Fragment>
      )
    },
    {
      title: "加入时间",
      dataIndex: "date_joined",
      key: "date_joined",
      render: t => (t ? moment(t).format("YYYY-MM-DD kk:mm:ss") : null)
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      render: (t, r) => (
        <Fragment>
          <Link
            to={{
              pathname: `/trade/distribution/teamlist/teamdetail`,
              query: { id: r.url.split("/").reverse()[1] }
            }}
          >
            <span>查看</span>
          </Link>
        </Fragment>
      )
    }
  ];

  initData = type => {
    const { dispatch, location } = this.props;
    let id = location.query.id;
    dispatch({
      type: "user/fetchUser",
      payload: { id }
    }).then(res => {
      this.setState({
        userdata: res,
        userform: {
          bonus_right: res.bonus_right,
          rebate_right: res.rebate_right,
          testers: res.testers
        }
      });
      if (type === "init") {
        this.fetchReferral(res);
      }
    });
  };
  fetchReferral = result => {
    const { dispatch } = this.props;
    dispatch({
      type: "user/AccountCreditlist",
      payload: { url: result.url, type: "referrals_list" }
    }).then(res => {
      if (res) {
        this.setState({ relList: res });
      }
    });
  };

  render() {
    const { userdata, relList } = this.state;
    const { userLoading } = this.props;

    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 }
    };

    return (
      <PageHeaderWrapper>
        <Spin spinning={userLoading}>
          <Card>
            <Card type="innner" title="用户基本信息">
              <Form>
                <FormItem label="用户信息" {...formItemLayout}>
                  <span>
                    <Link
                      style={{ marginLeft: 10, color: "rgba(0, 0, 0, 0.65)" }}
                      to={{
                        pathname: `/user/userlist/edituser`,
                        query: { id: userdata.id }
                      }}
                    >
                      <img
                        src={userdata.avatar_url}
                        width="30"
                        height="30"
                        alt=""
                      />
                      <span style={{ marginLeft: 10 }}>
                        {userdata.nickname}
                      </span>
                    </Link>
                  </span>
                </FormItem>
                <FormItem label="介绍人" {...formItemLayout}>
                  {userdata.referrer &&
                    userdata.referrer.id && (
                      <span>
                        <Link
                          style={{
                            marginLeft: 10,
                            color: "rgba(0, 0, 0, 0.65)"
                          }}
                          to={{
                            pathname: `/user/userlist/edituser`,
                            query: { id: userdata.referrer.id }
                          }}
                        >
                          {userdata.referrer.avatar_url && (
                            <img
                              src={userdata.referrer.avatar_url}
                              width="30"
                              height="30"
                              alt=""
                            />
                          )}
                          <span style={{ marginLeft: 10, marginRight: 20 }}>
                            {userdata.referrer.nickname}
                          </span>
                        </Link>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() =>
                            this.props.history.push({
                              pathname:
                                "/trade/distribution/teamlist/teamdetail",
                              query: { id: userdata.referrer.id }
                            })
                          }
                        >
                          他的团队
                        </Button>
                      </span>
                    )}
                </FormItem>
              </Form>
            </Card>
            <Card
              type="innner"
              title={`队员列表 总共${relList.length}人`}
              style={{ margin: "15px 0" }}
            >
              <div className={styles.trademain}>
                <Table
                  size="small"
                  columns={this.columns}
                  dataSource={relList}
                  rowKey="url"
                />
              </div>
            </Card>
            <Row>
              <Col span={24} style={{ textAlign: "right", marginTop: 10 }}>
                <Button onClick={() => this.props.history.go(-1)}>返回</Button>
              </Col>
            </Row>
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default EditUser;
