import React, { Component, Fragment } from "react";
import { permissionAuth } from "@/utils/permission";
import { Select } from "antd";
import { connect } from "dva";
import { getLocalStorage } from "../../utils/authority";

const Option = Select.Option;

@connect(({ goods }) => ({
  categorylist: goods.list
}))
class categorySelect extends Component {
  state = {};

  componentDidMount = () => {
    const { dispatch } = this.props;
    let shopid = getLocalStorage("shopid");
    let data = {
      page: 1,
      page_size: 1000
    };
    shopid !== "all" ? (data.shop = shopid.split("#")[0]) : null;
    dispatch({ type: "goods/fetchCategory", payload: { ...data } });
  };

  handleChange = e => {
    const { onChange, type, categorylist } = this.props;
    if (type) {
      onChange(e);
    } else {
      categorylist.map(item => {
        if (item.url === e) {
          onChange(item);
        }
      });
    }
  };

  //处理传值
  conversionObject() {
    const { value } = this.props;
    if (!value) {
      return {
        value: ""
      };
    }
    return {
      value
    };
  }

  render() {
    const { categorylist, newprops, type } = this.props;
    const { value } = this.conversionObject();
    const groups = categorylist.map(item => (
      <Option key={item.id} value={item.id}>
        {item.name}
      </Option>
    ));
    const urlgroups = categorylist.map(item => (
      <Option key={item.url} value={item.url}>
        {item.name}
      </Option>
    ));

    return (
      <Fragment>
        <Select
          style={{ width: 250 }}
          value={value}
          onChange={e => {
            this.handleChange(e);
          }}
          {...newprops}
        >
          {type === "search" ? groups : urlgroups}
        </Select>
      </Fragment>
    );
  }
}

export default categorySelect;
