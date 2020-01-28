import React, { Fragment, PureComponent } from 'react';
import { Select, Spin } from 'antd';
import { connect } from 'dva';
import styles from './GeographicView.less';

const { Option } = Select;

const nullSlectItem = {
  label: '',
  key: '',
};

@connect(({ location, loading }) => {
  return {
    loading: loading.models.location
  };
})
class GeographicView extends PureComponent {
  state = {
    province: [],
    city: [],
    district: [],
    allDate: false,
    isValue: false,
    checkUpdate: false,
  }

  componentDidMount = () => {
    const { dispatch, location } = this.props;
    if (location && location.query) {
      this.setState({ checkUpdate: location.query.id });
    }
    dispatch({
      type: 'location/fetchALL',
    }).then((res) => {
      this.setState({
        province : res.result[0],
        city : res.result[1],
        district : res.result[2],
      })
    })
  };

  componentDidUpdate(preprops, prestate) {
    const { value } = this.props;
    const { province, checkUpdate} = this.state;
    if (!prestate.province.length && province.length && checkUpdate) {
      // 已获取详细地址
      if (this.state.isValue)
        this.setAddressKeys();
      else
        this.setState({ allDate: true });
    }
    if (!preprops.value && value && checkUpdate) {
      // 已请求完整省市区
      if (this.state.allDate)
        this.setAddressKeys();
      else
        this.setState({ isValue: true });
    }
  }

  setAddressKeys() {
    const { dispatch, value } = this.props;
    const { province, city} = this.state;
    const province_key = province.find(x => x.fullname === value.province.label);

    dispatch({
      type: 'location/fetchCity',
      payload: { id: province_key.id, data: { key:province_key.id, label: province_key.fullname} },
    }).then((res) => {
      this.setState({
        city: res.result[0]
      })
      const city_key = res.result[0].find(x => x.fullname === value.city.label);
      dispatch({
        type: 'location/fetchItem',
        payload: { id: city_key.id },
      }).then((resp) => {
        this.setState({
          district: resp.result[0]
        })
      })
    })
  }

  getProvinceOption() {
    const { province } = this.state;
    return this.getOption(province);
  }

  getCityOption = () => {
    const { city } = this.state;
    return this.getOption(city);
  };

  getCountyOption = () => {
    const { district } = this.state;
    return this.getOption(district);
  };

  getOption = list => {
    if (!list || list.length < 1) {
      return (
        <Option key={0} value={0}>
          没有找到选项
        </Option>
      );
    }
    return list.map(item => (
      <Option key={item.id} value={item.id}>
        {item.fullname}
      </Option>
    ));
  };

  selectProvinceItem = item => {
    const { dispatch, onChange } = this.props;
    dispatch({
      type: 'location/fetchCity',
      payload: { id: item.key, data: item },
    }).then((res) => {
      this.setState({
        city: res.result[0]
      })
    })
    onChange({
      province: item,
      city: nullSlectItem,
      district: nullSlectItem,
    });
  };

  selectCityItem = item => {
    const { dispatch, value, onChange } = this.props;
    dispatch({
      type: 'location/fetchItem',
      payload: { id: item.key },
    }).then((res) => {
      this.setState({
        district: res.result[0]
      })
    })
    onChange({
      province: value.province,
      city: item,
      district: nullSlectItem,
    });
  };

  selectCountyItem = item => {
    const { value, onChange } = this.props;
    onChange({
      province: value.province,
      city: value.city,
      district: item,
    });
  };

  conversionObject() {
    const { value } = this.props;
    if (!value) {
      return {
        province: nullSlectItem,
        city: nullSlectItem,
        district: nullSlectItem,
      };
    }
    const { province, city, district } = value;
    return {
      province: province || nullSlectItem,
      city: city || nullSlectItem,
      district: district || nullSlectItem,
    };
  }

  render() {
    const { province, city, district } = this.conversionObject();
    const { loading, onload } = this.props;
    return (
      <Spin spinning={Boolean(onload && loading)} wrapperClassName={styles.row}>
        <Select
          className={styles.item}
          style={{ width: 180}}
          value={province}
          labelInValue
          onSelect={this.selectProvinceItem}
        >
          {this.getProvinceOption()}
        </Select>
        <Select
          className={styles.item}
          style={{ width: 180}}
          value={city}
          labelInValue
          onSelect={this.selectCityItem}
        >
          {this.getCityOption()}
        </Select>
        <Select
          className={styles.item}
          style={{ width: 180}}
          value={district}
          labelInValue
          onSelect={this.selectCountyItem}
        >
          {this.getCountyOption()}
        </Select>
      </Spin>
    );
  }
}

export default GeographicView;
