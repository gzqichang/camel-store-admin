import React, { Component, Fragment } from "react";
import { permissionAuth } from "@/utils/permission";
import { Table, message, Select, Divider, Modal } from "antd";
import moment from "moment";
import Link from "umi/link";
import { connect } from "dva";
import "../editpage.less";

const statusgroup = {
  is_sell: "在售",
  preview: "预览",
  not_enough: "库存不足",
  not_sell: "下架"
};
const Option = Select.Option;

@connect(({ costom, global }) => ({
  permissions: global.permissions
}))
class tableList extends Component {
  state = { count: 0, loading: null };

  componentDidUpdate() {
    const { dataSource, loading } = this.props;
    const { count } = this.state;
    if (loading !== this.state.loading && !this.state.loading) {
      this.setState({ count: 0, loading });
    }
    if (dataSource.length > 0 && count < 30) {
      this.timer = setTimeout(() => {
        this.setState({ count: count + 1 });
      }, 500);
    } else {
      clearTimeout(this.timer);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  handleStatus = (e, record) => {
    const { dispatch, initData } = this.props;
    dispatch({
      type: "costom/_putUrlData",
      payload: {
        url: record.url,
        data: { ...record, status: e }
      }
    }).then(res => {
      res && initData();
    });
  };

  deleteModal = (key, name, id) => {
    const { isTemplate } = this.props;
    const edit = this.getAuth("createTemplate");
    if (edit) {
      this.deleteMothod(key, name, id);
    } else {
      isTemplate
        ? message.error("你没有进行该操作的权限")
        : this.deleteMothod(key, name, id);
    }
  };

  deleteMothod = (key, name, id) => {
    const { dispatch, initData, isTemplate } = this.props;
    let data = isTemplate ? { is_template: true } : {};
    Modal.confirm({
      title: "确认删除 ",
      content: `确认删除 ${name} 商品`,
      centered: true,
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        dispatch({
          type: "goods/delGoodsData",
          payload: { id, data: { ...data } }
        }).then(() => {
          initData();
          message.success("删除成功");
        });
      }
    });
  };

  getAuth = key => {
    const { permissions } = this.props;
    return permissions.includes(permissionAuth[key]);
  };

  //处理传值
  conversionObject() {
    const {
      loading,
      dataSource,
      pagination,
      path,
      isTemplate,
      replacegood = false
    } = this.props;
    return {
      loading,
      dataSource,
      pagination,
      path,
      isTemplate,
      replacegood
    };
  }

  render() {
    const {
      loading,
      dataSource,
      pagination,
      path,
      isTemplate,
      replacegood
    } = this.conversionObject();

    const statuscolumns = [
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (t, r) => (
          <Select
            value={statusgroup[t]}
            style={{ width: 100 }}
            onChange={e => this.handleStatus(e, r)}
          >
            <Option value="is_sell">在售</Option>
            <Option value="preview">预览</Option>
            <Option value="not_sell">下架</Option>
          </Select>
        )
      }
    ];
    const startcolumns = [
      {
        title: "商品名",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "排序",
        dataIndex: "index",
        key: "index"
      },
      {
        title: "商品类别",
        dataIndex: "category",
        key: "category",
        render: (t, r) =>
          replacegood ? "积分商品" : r.category && r.category.name
      },
      {
        title: "封面图",
        dataIndex: "banner",
        key: "banner",
        render: (t, r) =>
          (t[0] && t[0].image && <img src={t[0].image.file} width={120} />) ||
          null
      }
    ];
    const endcolumns = [
      {
        title: "添加时间",
        dataIndex: "add_time",
        key: "add_time",
        width: 190,
        render: t => (t ? moment(t).format("YYYY-MM-DD kk:mm:ss") : null)
      },
      {
        title: "操作",
        dataIndex: "action",
        key: "action",
        fixed: "right",
        width: 130,
        render: (text, record) => (
          <Fragment>
            <span
              onClick={() =>
                this.deleteModal(record.key, record.name, record.id)
              }
            >
              <a>删除</a>
            </span>
            <Divider type="vertical" />
            <span>
              <Link to={{ pathname: path, query: { id: record.id } }}>
                编辑
              </Link>
            </span>
          </Fragment>
        )
      }
    ];

    return (
      <Fragment>
        <Table
          loading={loading}
          dataSource={dataSource}
          columns={
            isTemplate
              ? [...startcolumns, ...endcolumns]
              : [...startcolumns, ...statuscolumns, ...endcolumns]
          }
          pagination={pagination}
          rowKey="url"
          scroll={{ x: 900 }}
        />
      </Fragment>
    );
  }
}

export default tableList;
