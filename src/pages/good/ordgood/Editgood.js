import React, { Component } from 'react';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import GoodDetail from '../component/goodDetail';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

@connect(({ goods, upload, global }) => ({
  shopid: global.shopid,
  shopurl: global.shopurl,
}))
class Editgood extends Component {
  state = {
    gooddata: {
      ord_goods: { estimate_time: null },
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
      this.props.history.push('/good/ordgood/goodlist');
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
        onChange={res => this.handleGoodChange(res)}
        {...this.props}/>
    );
  }
}

export default DragDropContext(HTML5Backend)(Editgood);
