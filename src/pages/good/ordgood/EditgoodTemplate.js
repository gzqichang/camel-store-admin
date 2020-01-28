import React, { Component } from 'react';
import { connect } from 'dva';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import GoodDetail from '../component/goodDetail';

@connect(({ goods, upload, global }) => ({
  permissions: global.permissions,
  shopid: global.shopid,
  shopurl: global.shopurl,
}))
class EditgoodTemplate extends Component {
  state = {
    gooddata: {
      ord_goods: { estimate_time: null },
      status: 'is_sell',
      index:1,
      postage: null,
      groupbuy:false,
      groupbuy_info: { mode:'people',ladder_list: [] },
      delivery_method: [],
      fictitious:false,
    },
  };

  componentDidMount() {}

  componentDidUpdate(preprops, prestats) {
    const { shopid } = preprops;
    const { location } = this.props;
    let id = location.query.id;
    if (shopid !== this.props.shopid && shopid !== '' && id) {
      this.props.history.push('/good/template/goodlistTemplate');
    }
  }

  handleGoodChange = (res) => {
    this.setState({ gooddata: res })
  }

  render() {
    const { gooddata } = this.state;
    const { location } = this.props;
    let id = location.query.id;

    return (
      <GoodDetail
        gooddata={gooddata}
        id={id}
        model_type="ord"
        is_template={true}
        onChange={res => this.handleGoodChange(res)}
        {...this.props}/>
    );
  }
}

export default DragDropContext(HTML5Backend)(EditgoodTemplate);
