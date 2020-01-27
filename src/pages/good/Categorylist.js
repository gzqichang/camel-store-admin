import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import Link from "umi/link";
import { connect } from "dva";
import { setLocalStorage, getLocalStorage } from "@/utils/authority";
import { Button, Card, Table, Modal, Divider, Icon, message } from "antd";
import styles from "./editpage.less";

const itemsPerPage = 1000;

@connect(({ goods, global, loading }) => ({
  categorylist: goods.list,
  categorylistCount: goods.categorylistCount,
  shopid: global.shopid,
  isMobile: global.isMobile,
  CategoryLoading: loading.effects["goods/fetchCategory"]
}))
class Categorylist extends Component {
  state = {
    page: 1
  };

  componentDidMount() {
    this.init("init");
  }

  init = type => {
    const { dispatch } = this.props;
    const { page } = this.state;
    let data = {
      page: type ? 1 : page,
      page_size: itemsPerPage
    };
    let shopid = getLocalStorage("shopid");
    shopid !== "all" ? (data.shop = shopid.split("#")[0]) : null;
    dispatch({
      type: "goods/fetchCategory",
      payload: {
        ...data
      }
    });
  };

  componentDidUpdate(preprops) {
    const { shopid } = this.props;
    if (preprops.shopid !== shopid && preprops.shopid !== "") {
      this.init("init");
    }
  }

  statusChange = (is_active, id, name) => {
    const { dispatch } = this.props;
    const that = this;
    Modal.confirm({
      title: "确认操作 ",
      content: `确认${is_active ? `禁用` : `启用`} ${name} 类别${
        is_active ? `，下架此分类所有商品` : ``
      }`,
      centered: true,
      okText: "确认",
      okType: "danger",
      cancelText: "取消 ",
      onOk() {
        dispatch({
          type: "goods/changeCategorystatus",
          payload: {
            id,
            is_active: !is_active
          }
        }).then(res => {
          if (res) {
            that.init();
          }
        });
      }
    });
  };

  deleteModal = (name, id) => {
    const { dispatch } = this.props;
    const that = this;
    Modal.confirm({
      title: "确认删除 ",
      content: `确认删除 ${name} 类别`,
      okText: "确认删除 ",
      okType: "danger",
      cancelText: "取消 ",
      onOk() {
        dispatch({
          type: "goods/deleteCategoryData",
          payload: { id: id }
        }).then(() => {
          that.init();
          message.success("删除成功");
        });
      }
    });
  };

  render() {
    const { categorylist, CategoryLoading, isMobile } = this.props;

    const columns = [
      {
        title: "类别名",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "排序",
        dataIndex: "index",
        key: "index"
      },
      {
        title: "是否启用",
        dataIndex: "is_active",
        key: "is_active",
        render: (t, r) => (
          <span
            onClick={() => this.statusChange(t, r.id, r.name)}
            style={{ cursor: "pointer" }}
          >
            {t ? (
              <Icon
                type="check-circle"
                theme="filled"
                style={{ color: "green" }}
              />
            ) : (
              <Icon
                type="close-circle"
                theme="filled"
                style={{ color: "red" }}
              />
            )}
          </span>
        )
      },
      {
        title: "操作",
        dataIndex: "action",
        key: "action",
        width: 120,
        fixed: isMobile ? "right" : false,
        render: (text, record) => (
          <Fragment>
            <span onClick={() => this.deleteModal(record.name, record.id)}>
              <a>删除</a>
            </span>
            <Divider type="vertical" />
            <span>
              <Link
                to={{
                  pathname: `/good/categorylist/editpage`,
                  query: { id: record.id }
                }}
              >
                编辑
              </Link>
            </span>
          </Fragment>
        )
      }
    ];

    return (
      <PageHeaderWrapper>
        <Card className={styles.main}>
          <Link
            to={{
              pathname: `/good/categorylist/editpage`,
              query: { id: null }
            }}
          >
            <Button type="primary" style={{ marginBottom: 20 }}>
              新增类别
            </Button>
          </Link>
          <Table
            loading={CategoryLoading}
            dataSource={categorylist}
            columns={columns}
            rowKey="id"
            scroll={isMobile ? { x: 600 } : {}}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Categorylist;
