import React, { Component } from 'react';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import GoodDetail from '../component/goodDetail';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

@connect(({ goods, upload, global }) => ({
  permissions:global.permissions,
  shopid: global.shopid,
  shopurl: global.shopurl,
}))
class replaceEditgood extends Component {
  state = {
    gooddata:{
      repl_goods:{},
      index:1,
      postage:null,
      postage_setup: 'free',
      groupbuy: false,
      groupbuy_info: null,
      delivery_method: [],
      fictitious:false,
    },
  };

  componentDidMount() {}

  componentDidUpdate(preprops,prestats) {
    const { shopid } = preprops;
    const { location } = this.props;
    let id = location.query.id
    if(shopid !== this.props.shopid && shopid !== '' && id){
      this.props.history.push('/good/subgood/subscribegood')
    }
  }

  handleGoodChange = (res) => {
    this.setState({ gooddata: res })
  }

  render(){
    const { gooddata } = this.state
    const { location } = this.props
    let id = location.query.id

    return(
      <GoodDetail
        gooddata={gooddata}
        id={id}
        model_type="replace"
        onChange={res => this.handleGoodChange(res)}
        {...this.props}/>
    )
  }
}

export default DragDropContext(HTML5Backend)(replaceEditgood);
