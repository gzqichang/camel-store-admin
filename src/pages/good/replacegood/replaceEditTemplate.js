import React, { Component } from "react";
import { connect } from "dva";
import { setLocalStorage, getLocalStorage } from "@/utils/authority";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";
import GoodDetail from "../component/goodDetail";

@connect(({ goods, upload, global, loading }) => ({
  bonus_switch: global.bonus_switch,
  rebate_switch: global.rebate_switch,
  permissions: global.permissions,
  shopid: global.shopid,
  categorylist: goods.list,
  GoodsLoading: loading.models.upload
}))
class subscribeEditTemplate extends Component {
  state = {
    gooddata: {
      repl_goods: { postage_setup: "free" },
      index: 1,
      status: "is_sell",
      postage: null,
      groupbuy: false,
      groupbuy_info: null,
      delivery_method: [],
      fictitious: false
    }
  };

  componentDidMount() {}

  handleGoodChange = res => {
    this.setState({ gooddata: res });
  };

  render() {
    const { gooddata } = this.state;
    const { location } = this.props;
    let id = location.query.id;

    return (
      <GoodDetail
        gooddata={gooddata}
        id={id}
        model_type="replace"
        is_template={true}
        onChange={res => this.handleGoodChange(res)}
        {...this.props}
      />
    );
  }
}

export default DragDropContext(HTML5Backend)(subscribeEditTemplate);
