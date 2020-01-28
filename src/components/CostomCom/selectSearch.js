import React, { Component } from 'react';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import { connect } from 'dva';
import { Select } from 'antd';

const Option = Select.Option;
let timeout;

@connect(({ goods, global }) => ({
  shopid: global.shopid,
  shopurl: global.shopurl,
}))

class selectSearch extends Component {
  state = {
    data: [],
  }

  fetch = (e, callback) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    const fake = () => {
      const { dispatch, dispatchType, modelType, payload = {} } = this.props;
      let data = [];
      let shopid = getLocalStorage('shopid');
      let _data = {
        page: 1,
        page_size: 30,
        name: e,
        model_type: modelType ? modelType : undefined,
        ...payload
      };
      shopid !== 'all' ? (_data.shop = shopid.split('#')[0]) : null;
      dispatch({
        type: dispatchType,
        payload: {
          ..._data,
        },
      }).then(res => {
        res.forEach(r => {
          dispatchType === 'goods/fetchCategory'
            ? r.is_active && data.push({ url: r.url, name: r.name, })
            : data.push({ url: r.url, name: r.name, })
        });
        callback(data);
      });
    };
    timeout = setTimeout(fake, 600);
  };

  handleSearch = e => {
    const { dispatchType } = this.props
    if(dispatchType){
      this.fetch(e, data => this.setState({ data }));
    }
  };

  render() {
    const {
      disabled,
      value,
      datalist,
      onChange,
      extra,
      ...restProps
    } = this.props;
    const { data } = this.state;
    const style = { width: '300px', ...restProps.style };
    const position = restProps.position || 'bottom';

    const datagroup =
      data.length === 0
        ? datalist.map(d => <Option key={d.url} value={d.url}>{d.name || d.label}</Option>)
        : data.map(d => <Option key={d.url} value={d.url}>{d.name || d.label}</Option>);
    const _extra = extra
      ? extra.map(item => <Option key={item.key} value={item.name || item.label}>{item.name || item.label}</Option>)
      : null;

    return (
      <Select value={value} disabled={disabled} style={style}
              showSearch
              allowClear={true}
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onFocus={() => this.setState({data:[]})}
              onChange={(e) => onChange(e)}
              onSearch={(e) => this.handleSearch(e)}>
        { position === 'top' && _extra}
        { datagroup }
        { position === 'bottom' && _extra}
      </Select>
    );
  }
}

export default selectSearch;
