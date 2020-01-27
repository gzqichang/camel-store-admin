import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import Link from "umi/link";
import { connect } from "dva";
import { setLocalStorage, getLocalStorage } from "@/utils/authority";
import moment from "moment";
import { Button, Card, Table, Modal, message, Divider } from "antd";
import styles from "../shopsetting.less";

const itemsPerPage = 10;

@connect(({ shopsetting, global, loading }) => ({
  qualist: shopsetting.qualist,
  qualistCount: shopsetting.qualistCount,
  searchform: global.searchform,
  quaLoading: loading.effects["shopsetting/fetchFaq"]
}))
class Qualist extends Component {
  state = {
    quaform: {}
  };

  columns = [
    {
      title: "问",
      dataIndex: "title",
      key: "title"
    },
    {
      title: "排序",
      dataIndex: "index",
      key: "index"
    },
    {
      title: "创建时间",
      dataIndex: "add_time",
      key: "add_time",
      render: t => moment(t).format("YYYY-MM-DD kk:mm:ss")
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      render: (t, r) => (
        <Fragment>
          <span onClick={() => this.delModal(r.id, r.title)}>
            <a>删除</a>
          </span>
          <Divider type="vertical" />
          <span>
            <Link
              to={{
                pathname: `/setting/quacontent/editqua`,
                query: { id: r.id }
              }}
            >
              编辑
            </Link>
          </span>
        </Fragment>
      )
    }
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "global/resetSearchFormKey",
      payload: { key: "qua" }
    }).then(() => {
      this.initData("init");
    });
  }

  initData = type => {
    const {
      dispatch,
      searchform: { qua }
    } = this.props;
    const { quaform } = this.state;
    let _quaform = {};
    if (type === "init") {
      _quaform = { ...qua };
      this.setState({ quaform: { ...qua } });
    } else {
      _quaform = { ...quaform };
    }
    dispatch({
      type: "shopsetting/fetchFaq",
      payload: {
        page_size: itemsPerPage,
        ..._quaform
      }
    });
  };

  componentWillUnmount() {
    const { quaform } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: "global/searchFormKey",
      payload: { qua: { ...quaform } }
    });
  }

  delModal = (id, name) => {
    const { dispatch } = this.props;
    const that = this;
    Modal.confirm({
      title: "确认删除 ",
      content: `确认删除 ${name} 问题`,
      centered: true,
      okText: "确认删除 ",
      okType: "danger",
      cancelText: "取消 ",
      onOk() {
        dispatch({
          type: "shopsetting/deleteFaqData",
          payload: { id: id }
        }).then(() => {
          that.initData();
          message.success("删除成功");
        });
      }
    });
  };

  render() {
    const { quaLoading, qualistCount, qualist } = this.props;
    const { quaform } = this.state;
    const pagination = {
      pageSize: itemsPerPage,
      current: quaform.page,
      total: qualistCount,
      onChange: page => {
        this.setState({ quaform: { ...quaform, page } });
        const { dispatch } = this.props;
        dispatch({
          type: "shopsetting/fetchFaq",
          payload: {
            ...quaform,
            page,
            page_size: itemsPerPage
          }
        });
      }
    };

    return (
      <PageHeaderWrapper>
        <Card className={styles.main}>
          <Link
            to={{
              pathname: `/setting/quacontent/editqua`,
              query: { id: null }
            }}
          >
            <Button type="primary" style={{ marginBottom: 20 }}>
              新增内容
            </Button>
          </Link>
          <Table
            loading={quaLoading}
            dataSource={qualist}
            columns={this.columns}
            pagination={pagination}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Qualist;
