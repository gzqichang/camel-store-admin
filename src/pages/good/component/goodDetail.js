import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import { permissionAuth } from '@/utils/permission';
import { InitGoodData, imageTransform, imageRequest, timeRange, delSign,copy, validatingForm } from '@/utils/_utils';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import {
  Input,
  InputNumber,
  Form,
  Button,
  Card,
  Spin,
  message,
  Select,
  Switch,
  Radio,
  Tabs, Modal, DatePicker, TimePicker, Checkbox,
} from 'antd';
import moment from 'moment';
import styles from '../editpage.less';
import CategorySelect from '@/components/CostomCom/categorySelect';
import ImageGroup from '../component/ImageGroup';
import GType from '../component/gType';
import DeliveryData from '../component/deliveryData';
import PostageType from '../component/postageType';
import BookTime from '../component/bookTime';
import GroupBuy from '../component/groupBuy';
import AttachField from '../component/attachField';
import PropTypes from 'prop-types';

const formItemLayout = {
  labelCol: { md: { span: 5 }, lg:{ span: 5 }, xxl:{ span: 3 } },
  wrapperCol: { md: { span: 18 }, lg:{ span: 18 }, xxl:{ span: 20 } },
};
const FormItem = props => <Form.Item required {...formItemLayout} {...props} />;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
const textSwitch = {
  ord:{ label:'普通', key: 'ord_goods'},
  sub:{ label:'订阅式', key: 'sub_goods'},
  replace:{ label:'积分', key: 'repl_goods'},
}

@connect(({ goods, upload, ptgroup, global, shopsetting, loading }) => ({
  bonus_switch: global.bonus_switch,
  rebate_switch: global.rebate_switch,
  permissions: global.permissions,
  shopid: global.shopid,
  config: global.config,
  shopurl: global.shopurl,
  categorylist: goods.list,
  goodslist: goods.goodslist,
  storelist: shopsetting.storelist,
  GoodsLoading: loading.models.goods,
  upLoading: loading.models.upload,
}))
class goodDetail extends Component {
  state = {
    goodid: null,
    url: null,
    _switch:{},
    delivery_data: {},
    goodform: {},
    listdata: [],
    templete: '',
    is_build: false,
    len: 0,
    request: true,
  }

  componentDidMount() {
    this.init();
    const { dispatch, id, model_type, is_template } = this.props;
    if(!id && !is_template){   //创建商品且不是模板页时，获取该商品类型model_type的模板
      dispatch({
        type: 'goods/fetchGoods',
        payload: { page: 1, page_size: 100, is_template: true, model_type },
      }).then(res => this.setState({ listdata: res }));
    }
  }

  init = e => {
    const { dispatch, id, model_type, onChange, is_template } = this.props;
    const { delivery_data } = this.state
    //获取商品，或者模板信息（id是商品，e是模板）
    if (id || e) {
      dispatch({
        type: 'goods/fetchGoodsdata',
        payload: {
          id: e ? e : id,
          data: {
            model_type,
            is_template:is_template || e ? true : undefined,
          },
        },
      }).then(res => {
        if (res) {
          //InitGoodData处理获取的商品数据
          const gooddata = InitGoodData(res);

          /*订阅商品选择“配送日期”时，使用delivery_data对象记录两种情况的值，提交时根据date_setup选择提交给delivery_data_set
            配送时间设置：delivery_setup -> date配送日期 / interval固定间隔
            配送日期设置 date_setup -> specific具体日期 / weekly每周设置
            delivery_data: { specific:[], weekly: [] }
           */
          if(model_type === 'sub'){
            res.sub_goods.delivery_setup && res.sub_goods.delivery_setup === 'date'
              ? delivery_data[res.sub_goods.date_setup] = res.sub_goods.delivery_data_set
              : null
          }

          //该商品的开启拼团设置，而且不是积分商品
          if(id && (res.groupbuy || res.groupbuy_info) && model_type !== 'replace' && !is_template){
            this.checkPtgood(id)
          }

          //从模板导入的数据清除分类
          if(!id && !is_template){
            gooddata.category = null
          }

          this.setState({
            delivery_data,
            goodid: res.id,
            url: res.url,
            onUpload: false,
            len: res.groupbuy ? res.groupbuy_info.ladder_list.length : 0
          });
          onChange(gooddata)
        }
      });
    }
  };

  //检查该商品是否正在拼团
  checkPtgood = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ptgroup/fetchptgroup',
      payload: { ptgoods: id, status: 'build' },
    }).then((res) => {
      if(res && res.length > 0){
        this.setState({ is_build: true })
      }
    });
  }

  getAuth = key => {
    const { permissions } = this.props
    return permissions.includes(permissionAuth[key])
  }

  //订阅商品的“持续订阅时间”的“具体日期”
  changeTemTime = (date, dateString) => {
    const { gooddata, onChange } = this.props
    gooddata.sub_goods.duration_start= dateString[0]
    gooddata.sub_goods.duration_end = dateString[1]
    onChange(gooddata)
  }

  /*检测商品数据的变化
    e: 新的值
    key: 变化键值
    subkey: 变化二级键值
    type: specific / weekly 仅针对订阅商品的配送设置
  */
  chnangegooddata = (e, key, subkey, type) => {
    const { len, delivery_data } = this.state;
    const { gooddata, model_type, onChange } = this.props;
    if(type){
      delivery_data[type] = e
      this.setState({ delivery_data })
    }
    if (subkey) {
      //针对拼团阶梯的处理
      if(key === 'groupbuy_info'){
        gooddata[key][subkey] = e
        //拼团等级变化
        if(subkey === 'ladder_list'){
          let nowlen = gooddata[key][subkey].length
          //删除等级时，规格删除一个等级价格
          if(len > nowlen) {
            gooddata[textSwitch[model_type].key].gtypes && gooddata[textSwitch[model_type].key].gtypes.map(item => {
              item[subkey] = item[subkey].slice(0, gooddata[key][subkey].length)
            })
          }
          //添加等级或者修改等级信息，规格添加一个新的等级在后面
          else{
            gooddata[textSwitch[model_type].key].gtypes && gooddata[textSwitch[model_type].key].gtypes.map(item => {
              !item.ladder_list ? item.ladder_list = [] : null
              for (let i = len; i < nowlen; i++) {
                item.ladder_list.push({index: i + 1, price: null })
              }
            })
          }
          this.setState({ len: nowlen})
        }
      }
      else{
        gooddata[key][subkey] = e
      }
    } else {
      gooddata[key] = e;
      if(key === 'groupbuy' && e){
        !gooddata.groupbuy_info ? gooddata.groupbuy_info = {mode: 'people'} : null
      }
    }
    onChange(gooddata)
  };

  //保存、创建商品
  handleSubmit = () => {
    const { is_build, delivery_data } = this.state;
    const { gooddata, id, model_type, is_template ,config} = this.props
    const that = this;
    let _gooddata = {
      ...gooddata,
      add_time:id ? gooddata.add_time : undefined,
      is_template,
      model_type,
      groupbuy_info: is_build
        ? {...gooddata.groupbuy_info}
        : ( gooddata.groupbuy ? {...gooddata.groupbuy_info}  : null )   //商品正在拼团可以取消拼团设置，不可更改阶梯数据
    }
    //订阅商品配送日期设置的处理
    if(model_type === 'sub'){
      if(_gooddata.sub_goods.delivery_setup === 'date'){
        _gooddata.sub_goods.delivery_data_set = delivery_data[gooddata.sub_goods.date_setup]
      }
      else{
        _gooddata.sub_goods.delivery_data_set = null
        _gooddata.sub_goods.date_setup = null
      }
    }
    //检验商品数据
    let flag = validatingForm(_gooddata)
    // 积分商品不校验分类
    if(flag && model_type !== 'replace'){
      if(!_gooddata.category){
        flag = false;
        message.error('分类不能为空');
      }
    }
    !flag && this.setState({ request:true });

    //虚拟商品的配置
    if(gooddata.fictitious && flag){
      _gooddata = {
        ..._gooddata,
        delivery_method: ['express'],
        postage_setup: 'free',
        postage: null,
      }
      _gooddata[textSwitch[model_type].key] = { ...gooddata[textSwitch[model_type].key],estimate_time: null}
      if((!gooddata.attach || gooddata.attach.length === 0) && (config && config.attach_switch)){
        Modal.confirm({
          title: '确认操作',
          content: '虚拟商品不要求购买用户提供收货信息。是否需要设置自定义字段收集用户相关信息',
          okText: '去设置',
          cancelText: '不，直接创建商品',
          centered: true,
          onOk() {that.setState({ request:true })},
          onCancel() { that.verifysubmit(_gooddata) }
        })
      }
      else{
        is_template ? this.verifyTemsubmit(_gooddata) : this.verifysubmit(_gooddata)
      }
    }
    else{
      is_template ? flag && this.verifyTemsubmit(_gooddata) : flag && this.verifysubmit(_gooddata)
    }
  };
  //验证通过商品提交
  verifysubmit = (_gooddata) => {
    const { dispatch, id, storelist, gooddata } = this.props;
    let shopid = getLocalStorage('shopid');
    let _data = {
      ..._gooddata,
      detail: imageRequest(gooddata.detail),
      banner: imageRequest(gooddata.banner),
    };
    let newdata = {};
    if (!id) {
      newdata = delSign({ ..._data });  //delSign:新建的商品提交前需去掉除了图片以外的id,url
    }
    if (shopid === 'all' && !id) {
      this.setState({ request: true })
      message.warning('请选择要添加的门店');
    } else {
      let shop = {};
      storelist.map(item => {
        if (item.url === shopid.split('#')[1]) {
          shop = item;
        }
      });
      newdata = { ...newdata, shop };
      let postdata = id ? { id, data: { ..._data } } : newdata;
      dispatch({
        type: id ? 'goods/updateGoodsdata' : 'goods/createGoodsdata',
        payload: {
          ...postdata,
        },
      }).then(res => {
        this.setState({ request: true })
        if (res) {
          this.goBack(-1);
        }
      })
    }
  }

  //验证通过模板提交
  verifyTemsubmit = (_gooddata) => {
    const { dispatch, id, gooddata } = this.props;
    let _data = {
      ..._gooddata,
      detail: imageRequest(gooddata.detail),
      banner: imageRequest(gooddata.banner),
    };
    let shopid = getLocalStorage('shopid');
    const createTem = this.getAuth('createTemplate');
    if (createTem) {
      if (shopid !== 'all' && !id) {
        message.info('注意：创建的模板是所有门店都可以使用');
      }
      let postdata = id ? { id, data: { ..._data } } : _data;
      dispatch({
        type: id ? 'goods/updateGoodsdata' : 'goods/createGoodsdata',
        payload: {
          ...postdata,
        },
      }).then(res => {
        this.setState({ request: true })
        if (res) {
          this.goBack(-1);
        }
      })
    }
    else{
      this.setState({ request: true })
      message.error("您没有进行该操作的权限！")
    }
  }

  //选择模板加载数据
  selectTemplete = e => {
    this.setState({ templete: e });
    const { gooddata, onChange } = this.props
    if(gooddata.groupbuy){    //清空原本拼团阶梯，再加载模板的数据
      gooddata.groupbuy_info.ladder_list = []
    }
    onChange(gooddata)
    setTimeout(() => this.init(e), 500)
  };
  //返回上一页
  goBack = (n) => {
    isNaN(n)
      ? this.props.history.push({ pathname: n })
      : this.props.history.go(n);
  }

  //处理传值
  conversionObject() {
    const { gooddata, id, model_type = 'ord' } = this.props;
    return {
      gooddata,
      id,
      model_type
    };
  }

  render(){
    const { gooddata, id, model_type } = this.conversionObject();
    const { upLoading, GoodsLoading, is_template } = this.props;
    const { templete, listdata, is_build, delivery_data, request } = this.state;
    const createTem = this.getAuth('createTemplate');

    const goodgroups = listdata.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>);
    const statusgroup = {
      is_sell: '在售',
      preview: '预览',
      not_enough: '库存不足',
      not_sell: '下架'
    };

    return(
      <PageHeaderWrapper>
        <Card className={styles.main}
              title={id ? `编辑${textSwitch[model_type].label}商品信息` : `新增${textSwitch[model_type].label}商品信息`}
              extra={[
                <Button onClick={() => this.goBack(-1)}>取消</Button>,
                <Button type="primary" style={{ marginLeft: 8 }}
                        onClick={() => request
                          && this.setState({request:false},
                            () => this.handleSubmit())}>
                  {id == null ? '创建' : '保存'}
                </Button>
              ]}>
          <Spin spinning={Boolean(GoodsLoading || upLoading)} tip="正在操作中">
            <Tabs defaultActiveKey="1" type="card">
              <TabPane tab="基本信息" key="1" forceRender={true}>
                <Form>
                  { !is_template &&
                    <FormItem label="商品模板选择" required={false} style={id ? { display: 'none' } : {}}>
                      <Select
                        style={{ width: '60%'}}
                        value={templete}
                        onChange={e => {this.selectTemplete(e) }}>
                        {goodgroups}
                      </Select>
                    </FormItem>
                  }
                  {model_type !== 'replace' &&
                    <FormItem label="商品类别">
                      <CategorySelect
                        value={(gooddata.category && gooddata.category.name) || gooddata.category}
                        onChange={e => this.chnangegooddata(e, 'category')}
                      />
                    </FormItem>
                  }
                  { model_type !== 'replace' &&
                    <FormItem label="接力拼团商品" required={false}>
                      <Switch
                        disabled={!createTem}
                        checked={gooddata.groupbuy}
                        onChange={e => {
                          this.chnangegooddata(e, 'groupbuy');
                        }}
                      />{' '}
                      {is_build ? <a>该商品仍然有人在拼团，可以关闭拼团功能，不可更改拼团数据设置</a> : null}
                    </FormItem>
                  }
                  <FormItem label="虚拟商品" required={false}>
                    <Switch
                      disabled={!createTem}
                      checked={gooddata.fictitious}
                      onChange={e => {
                        this.chnangegooddata(e, 'fictitious');
                      }}
                    />
                  </FormItem>
                  {model_type !== 'replace' &&
                    <FormItem label="热门商品" required={false}>
                      <Switch
                        disabled={!createTem}
                        checked={gooddata.recommendation}
                        onChange={e => {
                          this.chnangegooddata(e, 'recommendation');
                        }}
                      />
                    </FormItem>
                  }
                  <FormItem label="商品名">
                    <Input
                      disabled={!createTem}
                      style={{ width: 250 }}
                      placeholder="请输入商品名称"
                      value={gooddata.name}
                      onChange={e => {
                        this.chnangegooddata(e.target.value, 'name');
                      }}
                    />
                  </FormItem>
                  <FormItem label="排序" required={false}>
                    <InputNumber
                      min={0}
                      style={{ width: 150 }}
                      placeholder="请输入排序"
                      value={gooddata.index}
                      onChange={e => {
                        this.chnangegooddata(e, 'index');
                      }}
                    />
                  </FormItem>
                  <FormItem label="商品描述">
                    <Input.TextArea
                      disabled={!createTem}
                      style={{ width: 500 }}
                      rows={3}
                      placeholder="请输入商品描述"
                      value={gooddata.goods_brief}
                      onChange={e => {
                        this.chnangegooddata(e.target.value, 'goods_brief');
                      }}
                    />
                  </FormItem>
                  {!is_template ?
                    <FormItem label="商品状态">
                      <Select
                        style={{ width: 150 }}
                        value={statusgroup[gooddata.status]}
                        onChange={e => {
                          this.chnangegooddata(e, 'status');
                        }}
                      >
                        <Option value="is_sell">在售</Option>
                        <Option value="preview">预览</Option>
                        <Option value="not_sell">下架</Option>
                      </Select>
                    </FormItem>
                    : null
                  }
                  { model_type === 'sub' &&
                    <FormItem label="订阅持续时间">
                      <RadioGroup onChange={(e) => {
                        this.chnangegooddata(e.target.value, 'sub_goods', 'duration')
                      }}
                                  value={gooddata.sub_goods.duration}
                                  disabled={!createTem}>
                        <Radio value="long_term">长期</Radio>
                        <Radio value="time_frame">具体日期</Radio>
                        <RangePicker size="small"
                                     disabled={!createTem || !(gooddata.sub_goods.duration === "time_frame")}
                                     value={gooddata.sub_goods.duration_start ? [moment(gooddata.sub_goods.duration_start), moment(gooddata.sub_goods.duration_end)] : null}
                                     onChange={this.changeTemTime}/>
                      </RadioGroup>
                    </FormItem>
                  }
                  <ImageGroup
                    video={gooddata.video ? [gooddata.video] : []}
                    goodimg={[]}
                    poster={gooddata.poster ? [gooddata.poster] : []}
                    detailgroup={gooddata.detail || []}
                    bannergroup={gooddata.banner || []}
                    onChange={(e, key) => this.chnangegooddata(e, key)}
                    disabled={!createTem}
                  />
                </Form>
              </TabPane>

              <TabPane tab="商品规格" key="4" forceRender={true}>
                <GType
                  mode={id ? 'edit' : 'new'}
                  type={textSwitch[model_type].key}
                  disabled={is_build}
                  isMixed={gooddata.groupbuy}
                  model_type={model_type}
                  ladder_list={gooddata.groupbuy_info && gooddata.groupbuy_info.ladder_list || []}
                  gtypes={gooddata[textSwitch[model_type].key].gtypes || []}
                  onChange={e => this.chnangegooddata(e, textSwitch[model_type].key, 'gtypes')}
                />
              </TabPane>

              {model_type !== 'replace' &&
              <TabPane tab="拼团设置" disabled={!gooddata.groupbuy} key="3" forceRender={true}>
                <Form>
                  <GroupBuy
                    disabled={is_build}
                    groupbuy_info={gooddata.groupbuy_info}
                    onChange={(e, label) => this.chnangegooddata(e, 'groupbuy_info', label)}
                  />
                </Form>
              </TabPane>
              }

              {
                this.props.config && this.props.config.attach_switch && (
                  <TabPane tab="自定义商品信息" key="5" forceRender={true}>
                    <AttachField
                      attach={gooddata.attach || []}
                      onChange={(e) => this.chnangegooddata(e, 'attach')}
                    />
                  </TabPane>
                )
              }

              <TabPane tab="配送设置" disabled={model_type !== 'sub' && gooddata.fictitious} key="2" forceRender={true}>
                <Form>
                  { model_type === 'sub' &&
                    <Fragment>
                      <FormItem label="配送时间设置">
                        <RadioGroup onChange={(e) => { this.chnangegooddata(e.target.value,'sub_goods','delivery_setup')}}
                                    value={gooddata.sub_goods.delivery_setup}
                                    disabled={!createTem}>
                          <Radio value="date">配送日期</Radio>
                          <Radio value="interval">固定间隔</Radio>
                        </RadioGroup>
                      </FormItem>
                      <FormItem label="配送日期设置">
                        <RadioGroup onChange={(e) => { this.chnangegooddata(e.target.value,'sub_goods','date_setup')}}
                                    value={gooddata.sub_goods.date_setup}
                                    disabled={!createTem || !(gooddata.sub_goods.delivery_setup === 'date')}>
                          <Radio value="specific">具体日期</Radio>
                          <Radio value="weekly">每周设置</Radio>
                        </RadioGroup>
                        { gooddata.sub_goods.delivery_setup === 'date' && gooddata.sub_goods.date_setup === 'specific'
                          ? <DeliveryData specific={delivery_data.specific || []}
                                          limit={gooddata.sub_goods.duration === "time_frame" ? [gooddata.sub_goods.duration_start,gooddata.sub_goods.duration_end] : null}
                                          onChange={(e) => this.chnangegooddata(e,'sub_goods','delivery_data','specific')} />
                          : null
                        }
                        <div style={gooddata.sub_goods.delivery_setup === 'date' && gooddata.sub_goods.date_setup === 'weekly' ? {} : {display:'none'}}>
                          <CheckboxGroup
                            value={delivery_data.weekly}
                            onChange={(e) => this.chnangegooddata(e,'sub_goods','delivery_data','weekly')}>
                            <Checkbox value="1">周一</Checkbox>
                            <Checkbox value="2">周二</Checkbox>
                            <Checkbox value="3">周三</Checkbox>
                            <Checkbox value="4">周四</Checkbox>
                            <Checkbox value="5">周五</Checkbox>
                            <Checkbox value="6">周六</Checkbox>
                            <Checkbox value="0">周日</Checkbox>
                          </CheckboxGroup>
                        </div>
                      </FormItem>
                      <FormItem label="固定间隔/天">
                        <InputNumber
                          disabled={!createTem || !(gooddata.sub_goods.delivery_setup === 'interval')}
                          style={{ width: 250 }}
                          placeholder='请输入两次配送的时间间距'
                          value={gooddata.sub_goods.interval}
                          onChange={(e) => { this.chnangegooddata(e,'sub_goods','interval')}}
                        />
                      </FormItem>
                      <FormItem label="配送日的配送时间" required={false}>
                        <TimePicker
                          format='HH:mm:ss'
                          value={gooddata.sub_goods.send_start ? moment(gooddata.sub_goods.send_start, 'HH:mm:ss') : null }
                          onChange={(e,str) => { this.chnangegooddata(str,'sub_goods','send_start')}} />
                        <span style={{marginLeft: 10,marginRight: 10}}>-</span>
                        <TimePicker
                          format='HH:mm:ss'
                          value={gooddata.sub_goods.send_end ? moment(gooddata.sub_goods.send_end, 'HH:mm:ss') : null }
                          onChange={(e,str) => { this.chnangegooddata(str,'sub_goods','send_end')}} />
                      </FormItem>
                    </Fragment>
                  }
                  { !gooddata.fictitious &&
                    <Fragment>
                      <FormItem label="配送方式">
                        <CheckboxGroup
                          onChange={e => {
                            this.chnangegooddata(e, 'delivery_method');
                          }}
                          value={gooddata.delivery_method}
                          disabled={!createTem}
                        >
                          <Checkbox
                            value="own"
                            disabled={gooddata.delivery_method &&gooddata.delivery_method.includes('express')}
                          >
                            自配送
                          </Checkbox>
                          <Checkbox
                            value="express"
                            disabled={gooddata.delivery_method &&gooddata.delivery_method.includes('own')}
                          >
                            快递物流
                          </Checkbox>
                          <Checkbox value="buyer">自提</Checkbox>
                        </CheckboxGroup>
                      </FormItem>
                      {gooddata.delivery_method && gooddata.delivery_method.includes('own') && model_type !== 'sub' ? (
                        <FormItem label="自配送预计时间" required={false}>
                          <BookTime
                            estimate_time={gooddata[textSwitch[model_type].key].estimate_time || []}
                            disabled={!createTem}
                            onChange={e => this.chnangegooddata(e, textSwitch[model_type].key, 'estimate_time')}
                          />
                        </FormItem>
                      ) : null}
                      {/*<FormItem label="是否允许自提">*/}
                        {/*<Switch*/}
                          {/*disabled={!createTem}*/}
                          {/*checked={gooddata.pick_up}*/}
                          {/*onChange={e => {*/}
                            {/*this.chnangegooddata(e, 'pick_up');*/}
                          {/*}}*/}
                        {/*/>*/}
                      {/*</FormItem>*/}
                      <FormItem label="运费设置" style={model_type === 'replace' ? {display: 'none'} : {}}>
                        <RadioGroup
                          onChange={e => {
                            this.chnangegooddata(e.target.value, 'postage_setup');
                          }}
                          value={gooddata.postage_setup || (model_type === 'replace' && 'free')}
                          disabled={!createTem || model_type === 'replace'}
                        >
                          <Radio value="free">免邮</Radio>
                          <Radio value="distance">按配送距离设置</Radio>
                          <Radio value={3} disabled>
                            物流公司
                          </Radio>
                        </RadioGroup>
                        {gooddata.postage_setup === 'distance' ? (
                          <PostageType
                            set_postage={gooddata.postage || []}
                            disabled={!createTem}
                            onChange={e => this.chnangegooddata(e, 'postage')}
                          />
                        ) : null}
                      </FormItem>
                    </Fragment>
                  }
                </Form>
              </TabPane>

              {
                id && (
                  <TabPane tab="小程序" key="6" forceRender={true}>
                    <FormItem label="页面路径" help={`/pages/util/index?pid=${id}`} required={false}>
                      <Button size='small' onClick={() => copy(`/pages/util/index?pid=${id}`)}>
                        复制
                      </Button>
                    </FormItem>
                  </TabPane>
                )
              }
            </Tabs>
          </Spin>
        </Card>
      </PageHeaderWrapper>
    )
  }
}
goodDetail.propTypes = {
  gooddata: PropTypes.object.isRequired,  //商品的所有信息
  id: PropTypes.string.isRequired,        //商品的id,undefined则是新建的商品
  model_type: PropTypes.string.isRequired,//商品的类型: ord/sub/replace
  onChange: PropTypes.func.isRequired,    //商品值改变
  is_template: PropTypes.bool,            //是否商品的模板
};
export default goodDetail
