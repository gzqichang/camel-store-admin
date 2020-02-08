import React, {Component, Fragment} from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import {connect} from 'dva';
import GeographicView from './GeographicView';
import AreaView from './areaView';
import {
  Input,
  Form,
  Button,
  Card,
  message,
  Row,
  Col,
  Select, Table, Divider, Modal
} from 'antd';
import styles from '../shopsetting.less';

const nullSlectItem = {label: '', key: ''};
const nullItem = {
  province: nullSlectItem,
  city: nullSlectItem,
  district: nullSlectItem
};
const Option = Select.Option;
const formItemLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 18},
};
const FormItem = props => <Form.Item required {...formItemLayout} {...props} />;

@connect(({shopsetting, user, location, global, loading}) => ({
  adminlist: user.adminlist,
  storelist: shopsetting.storelist,
  storeicon: global.storeicon,
  loading: loading.effects['shopsetting/getStoreData'],
  locationload: loading.effects['location/convertlocation']
}))
class EditStore extends Component {
  state = {
    storeform: {
      // address: {...nullItem},
      delivery_range: []
    },
  };

  componentDidMount() {
    const {dispatch, location} = this.props
    const {storeform} = this.state
    let id = location.query.id
    dispatch({
      type: 'user/queryAdmingroup',
      payload: {
        page: 1,
        page_size: 100,
      },
    }).then(res => {
      if (res) {
        const result = res.results.filter(item => item.name === '管理员')
        dispatch({
          type: 'user/fetchAdmin',
          payload: {page: 1, page_size: 100, groups: result[0].id},
        })
      }
    });
    if (id) {
      dispatch({
        type: 'shopsetting/getStoreData',
        payload: {...location.query}
      }).then((res) => {
        if (res) {
          storeform.address = {
            province: {label: res.province, key: ''},
            city: {label: res.city, key: ''},
            district: {label: res.district, key: ''},
          };
          const delivery_range = res.delivery_range || [];
          delivery_range.forEach((item) => {
            if (item.lat && item.lng) {
              storeform.delivery_range.push(item)
            }
          })
          this.setState({storeform: { ...res, ...storeform }})
        }
      })
    }
  }

  //筛选省市区
  handleStoreform = (key, e) => {
    const {storeform} = this.state
    if (key === 'address') {
      storeform.address = {...e};
    } else {
      storeform[key] = e ? e : null
    }
    this.setState({storeform})
  }
  converhandle = () => {
    const {storeform} = this.state
    const {dispatch} = this.props
    let address = ''
    if (storeform.address && storeform.detail) {
      Object.keys(storeform.address).map(item => {
        address += storeform.address[item].label
      })
      address += storeform.detail
      this.setState({loadaddr: true})
      dispatch({
        type: 'location/convertlocation',
        payload: {addr: address}
      }).then((res) => {
        if (res && res.location) {
          storeform.addr = address
          storeform.lat = res.location.lat
          storeform.lng = res.location.lng
          message.success('转换成功,地址正确！');
          this.setState({
            storeform
          })
        }
      })
    } else {
      message.warning('请把信息补充完成！')
    }
  }

  validatingForm = (args) => {
    const {storeform} = this.state
    let tips = {
      'name': '门店名称不能为空',
      // 'delivery_range': '门店配送范围不能为空',
      'status': '门店状态不能为空',
      'province': '门店所在的省不能为空',
      'city': '门店所在的市不能为空',
      'district': '门店所在的区不能为空',
      'detail': '门店具体地址不能为空'
    };
    !storeform.lat ? tips.addr = '保存失败，请点击转换坐标完善门店坐标信息' : null
    let flag = true
    Object.keys(tips).map(item => {
      if (!args[item]) {
        message.error(tips[item]);
        flag = false
      }
    })
    if (args.delivery_divide === 'geometry') {
      if (!args.delivery_range) {
        message.error('请在地图上选择门店的配送范围');
        flag = false
      }
      if (flag && args.delivery_range && args.delivery_range.length < 3) {
        message.error('门店配送范围有误，请确保地图上有正确的区域');
        flag = false
      }
    }
    if (args.delivery_divide === 'radius' && !args.delivery_radius) {
      message.error('门店配送半径不能为空');
      flag = false
    }

    return flag;
  }
  handleSubmit = () => {
    const {dispatch, location} = this.props
    const {storeform} = this.state
    let id = location.query.id
    let _data = {};
    let submitform = {
      ...storeform,
      province: storeform.address && storeform.address.province.label || '',
      city: storeform.address && storeform.address.city.label || '',
      district: storeform.address && storeform.address.district.label || '',
      address: undefined,
      delivery_range: storeform.delivery_range.length ? storeform.delivery_range : null
    }
    let _type = id ? 'shopsetting/updateStore' : 'shopsetting/createStore'
    let flag = this.validatingForm({...submitform})
    if (flag) {
      _data = id ? {id, data: {...submitform}}
        : {data: {...submitform}}
      dispatch({
        type: _type,
        payload: {..._data}
      })
    }
  }

  render() {
    const {location, adminlist, storelist} = this.props
    const {storeform,} = this.state
    let id = location.query.id

    return (
      <PageHeaderWrapper>
        <Card className={styles.main} title={id ? '编辑门店' : '新增门店'}
              extra={[<Link to='/setting/storelist'><Button>取消</Button></Link>,
                <Button type='primary' style={{marginLeft: 8}} onClick={this.handleSubmit}>保存</Button>]}>
          <Form className={styles.editform}>
            <FormItem label="门店名称">
              <Input
                placeholder='请输入名称'
                value={storeform.name}
                onChange={(e) => this.handleStoreform('name', e.target.value)}
              />
            </FormItem>
            <FormItem label="门店地址">
              <GeographicView
                onload={true}
                value={storeform.address}
                onChange={(e) => this.handleStoreform('address', e)}
                location={location}/>
              <Input placeholder="具体地址"
                     value={storeform.detail}
                     onChange={(e) => this.handleStoreform('detail', e.target.value)}/>
              <Button onClick={this.converhandle} type="primary">转换坐标</Button>
            </FormItem>
            <FormItem label="门店坐标" style={storeform.lat || storeform.lng ? {} : {display: 'none'}}>
              <Fragment>
                <span style={{marginRight: 50}}>经度：{storeform.lng}</span>
                <span>纬度：{storeform.lat}</span>
              </Fragment>
            </FormItem>
            <FormItem label="门店运营范围设置">
              <Select
                style={{width: 200}}
                value={storeform.delivery_divide}
                onChange={(e) => this.handleStoreform('delivery_divide', e)}
              >
                <Option value="unlimit">不限</Option>
                <Option value="radius">半径划分</Option>
                <Option value="geometry">精确划分</Option>
              </Select>
            </FormItem>
            <FormItem label="服务半径（米）" style={storeform.delivery_divide === 'radius' ? {} : {display: 'none'}}>
              <Input placeholder="服务半径"
                     style={{width: 200}}
                     value={storeform.delivery_radius || 0}
                     onChange={(e) => this.handleStoreform('delivery_radius', e.target.value)}/>
            </FormItem>
            <FormItem label="门店配送区域" style={storeform.delivery_divide === 'geometry' ? {} : {display: 'none'}}>
              <AreaView
                edit={!!id}
                center={storeform.lng ? {lng: storeform.lng, lat: storeform.lat} : null}
                value={storeform.delivery_range}
                onChange={(e) => this.handleStoreform('delivery_range', e)}/>
              共{storeform.delivery_range.length}个点<a>（双击可删除节点）</a>
            </FormItem>
            <FormItem
              label="发货自提委托门店"
              required={false}
              style={{
                display: storelist && storelist.length > 1 ? 'block' : 'none',
              }}>
              <Select
                style={{width: 200}}
                value={storeform.entrust}
                onChange={(e) => this.handleStoreform('entrust', e)}
              >
                <Option key='0' value={null}>无</Option>
                {storelist.filter(item => item.id !== storeform.id && item.entrust === null)
                  .map(item => <Option key={item.url}>{item.name}</Option>)}
              </Select>
            </FormItem>
            <FormItem label="门店状态">
              <Select
                style={{width: 200}}
                value={storeform.status}
                onChange={(e) => this.handleStoreform('status', e)}
              >
                <Option value="open">营业中</Option>
                <Option value="close">休息中</Option>
              </Select>
            </FormItem>
            <FormItem label="门店管理员" required={false}>
              <Select
                mode="multiple"
                style={{width: 200}}
                value={storeform.admin}
                onChange={(e) => this.handleStoreform('admin', e)}
              >
                {adminlist.map(item => <Option key={item.url}>{item.username}</Option>)}
              </Select>
            </FormItem>
            <FormItem label="客服电话" required={false}>
              <Input placeholder="客服电话"
                     style={{width: 200}}
                     value={storeform.service_phone}
                     onChange={(e) => this.handleStoreform('service_phone', e.target.value)}/>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    )
  }
}

export default EditStore
