import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import Link from "umi/link";
import { connect } from "dva";
import moment from "moment";
import {
  Input,
  Button,
  Table,
  message,
  Card,
  Icon,
  Row,
  Col,
  Spin,
  Modal
} from "antd";
import { setLocalStorage } from "@/utils/authority";
import { permissionAuth } from "@/utils/permission";
import styles from "../trade.less";

const itemsPerPage = 10;

@connect(({ user, trade, global, loading }) => ({
  bonus_switch: global.bonus_switch,
  rebate_switch: global.rebate_switch,
  permissions: global.permissions,
  searchform: global.searchform,
  userlist: user.userlist,
  userlistCount: user.userlistCount,
  UserlistLoading: loading.effects["user/fetch"]
}))
class teamlist extends Component {
  state = {
    searchform: {},
    page: 1,
    _columns: [],
    _switch: {},
    fixed: 0
  };

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
                maxWidth: "150px",
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
      title: "介绍人",
      dataIndex: "referrer",
      key: "referrer",
      align: "left",
      render: t =>
        t.id && (
          <Fragment>
            <Link
              style={{ color: "rgba(0, 0, 0, 0.65)" }}
              to={{ pathname: `/user/userlist/edituser`, query: { id: t.id } }}
            >
              {t.avatar_url && (
                <img src={t.avatar_url} width="30" height="30" alt="" />
              )}
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

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "global/resetSearchFormKey",
      payload: { key: "teamuser" }
    }).then(() => {
      this.initdata("init");
    });
  }

  initdata = type => {
    const {
      dispatch,
      searchform: { teamuser }
    } = this.props;
    const { searchform } = this.state;
    let _searchform = {};
    if (type === "init") {
      _searchform = { ...teamuser };
      this.setState({ searchform: { ...teamuser } });
    } else if (type === "reset") {
      this.setState({ searchform: {} });
    } else if (type === "search") {
      _searchform = { ...searchform, page: 1 };
      this.setState({ searchform: { ..._searchform } });
    } else {
      _searchform = { ...searchform };
    }
    dispatch({
      type: "user/fetch",
      payload: {
        page_size: itemsPerPage,
        ..._searchform
      }
    });
  };

  componentDidUpdate(preprops, prestats) {
    const { userlist } = this.props;
    const { fixed } = this.state;
    if (userlist.length > 0 && !fixed) {
      this.timer = setTimeout(() => {
        this.setState({ fixed: 1 });
      }, 200);
    }
  }

  componentWillUnmount() {
    const { searchform } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: "global/searchFormKey",
      payload: { teamuser: { ...searchform } }
    });
  }

  handleSearchChange = (e, key) => {
    const { searchform } = this.state;
    searchform[key] = e;
    this.setState({ searchform });
  };

  ondateChange = (date, stringData) => {
    const { searchform } = this.state;
    searchform.date_joined_after = stringData[0];
    searchform.date_joined_before = stringData[1];
    this.setState({ searchform });
  };

  handleSearch = () => {
    this.initdata("search");
  };

  render() {
    const { searchform } = this.state;
    const { userlist, userlistCount, UserlistLoading } = this.props;

    const pagination = {
      pageSize: itemsPerPage,
      current: searchform.page,
      total: userlistCount,
      onChange: page => {
        this.setState({ searchform: { ...searchform, page } });
        const { dispatch } = this.props;
        dispatch({
          type: "user/fetch",
          payload: {
            ...searchform,
            page,
            page_size: itemsPerPage
          }
        });
      }
    };

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.trademain}>
            <Spin spinning={false}>
              <Row>
                <Col span={12} tyle={{ textAlign: "left" }}>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>微信用户: </span>
                    <Input
                      onChange={e => {
                        this.handleSearchChange(e.target.value, "nickname");
                      }}
                      value={searchform.nickname}
                      placeholder="请输入微信用户"
                      style={{ width: 200 }}
                    />
                  </div>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Button
                    type="primary"
                    style={{ marginRight: 30 }}
                    onClick={this.handleSearch}
                  >
                    查询
                  </Button>
                  <Button type="danger" onClick={() => this.initdata("reset")}>
                    重置
                  </Button>
                </Col>
              </Row>
            </Spin>
            <div style={{ marginBottom: 20 }} />
            <Table
              loading={UserlistLoading}
              dataSource={userlist}
              columns={this.columns}
              pagination={pagination}
              rowKey="url"
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default teamlist;
