import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import {
  Switch,
  InputNumber,
  Form,
  Button,
  Card,
  message,
  Row,
  Col,
  Spin,
  Radio, Modal,
} from 'antd';
import styles from './editswiper.less';
import SelectSearch from '@/components/CostomCom/selectSearch';
import UploadImage from '@/components/CostomCom/uploadImage';
import SourceImageTab from '@/components/CostomCom/sourceImage';
import CButton from '@/components/CostomCom/cButton';

const formItemLayout = {
  labelCol: { span: 3 }
};
const FormItem = props => <Form.Item required {...formItemLayout} {...props}/>;

@connect(({ goods, trade, upload, global, loading }) => ({
  shopid: global.shopid,
  shopurl: global.shopurl,
  config: global.config,
  Upload: loading.models.upload,
  swiperLoading: loading.effects['trade/getSwiperdata'],
}))
class Editswiper extends Component {
  state = {
    goodslist:[],
    subgoodslist:[],
    swiperdata:{
      goods:{model_type: 'ord'},
      is_active: true,
      index:0,
    },
    gooditem:null,
    data:[],
    subdata: [],
    selectList: [],
    _selectList: [],
    visible: false
  };

  componentDidMount() {
    const { location, dispatch } = this.props
    let id = location.query.id
    let shopid = getLocalStorage("shopid")
    let _data = {page:1,page_size:100}
    shopid !== 'all' ? _data.shop = shopid.split("#")[0] : null
    dispatch({ type:'goods/fetchGoods',payload:{..._data,model_type:'ord'} })
      .then((res) => {this.setState({ goodslist:res })})
    dispatch({ type:'goods/fetchGoods',payload:{..._data,model_type:'sub'} })
      .then((res) => {this.setState({ subgoodslist:res })})
    if(id){
      dispatch({
        type:'trade/getSwiperdata',
        payload:{
          id
        }
      }).then((res) => {
        const swiperdata = {
          ...res,
        }
        swiperdata.goods && swiperdata.goods.model_type === 'ord'
          ? swiperdata.goods_name = swiperdata.goods.url
          : swiperdata.subgood_name = swiperdata.goods.url
        this.setState({ swiperdata })
      })
    }
  }

  componentDidUpdate(preprops){
    const { shopid, location } = this.props
    let id = location.query.id
    if(preprops.shopid !== shopid && shopid !== '' && id){
      this.props.history.push('/trade/swiperlist')
    }
  }

  //打开图片墙弹窗
  openModal = (openSource) => {
    if(openSource){
      this.setState({
        visible:true,
        selectList: [],
        _selectList: []
      })
    }
  }
  //选好图片，点击确定导入到详情中
  handleSelect = () => {
    const { _selectList } = this.state
    this.handleswiper({ ..._selectList[0], index:undefined, key:undefined }, 'image')
    this.setState({ visible: false,_selectList:[] })
  }

  handleswiper = (e,key,subkey) => {
    const { swiperdata } = this.state
    const that = this
    if(subkey){
      swiperdata[key][subkey] = e
    }
    else{
      if(key === 'is_active' && e && swiperdata.goods){
        if(swiperdata.goods.status === 2 || swiperdata.goods.status === 1){
          const content = swiperdata.goods.status === 1 ? '此商品为预览商品，确定重新启用' : '此商品链接已下架，确定重新启用'
          Modal.confirm({
            title: '确认操作',
            content: content,
            centered: true,
            onOk(){
              swiperdata[key] = e
              that.setState({ swiperdata })
            }
          })
        }
        else{
          swiperdata[key] = e
        }
      }
      else{
        swiperdata[key] = e
      }
    }
    this.setState({ swiperdata })
  }

  handleUpload = (res,key,list) => {
    const del = !!list
    let arrlist = del ? null : {...res}
    this.handleswiper(arrlist, key)
  }

  validatingForm = (args) => {
    let tips = {
      'name': '商品名不能为空',
      'imageurl': '图片不能为空',
    };

    let flag = true
    Object.keys(tips).map(item => {
      if(!args[item]){
        message.error(tips[item]);
        flag = false
      }
    })
    return flag;
  }
  handleSubmit = () => {
    const { dispatch, location } = this.props
    const { swiperdata } = this.state
    let id  = location.query.id
    let shopid = getLocalStorage('shopid')
    let flag = this.validatingForm({
      name:swiperdata.goods.model_type === 'ord' ? swiperdata.goods_name : swiperdata.subgood_name,
      imageurl: swiperdata.image && swiperdata.image.file
    })
    if(flag){
      const data = { ...swiperdata }
      swiperdata.goods.model_type === 'ord'
        ? data.goods = {url: swiperdata.goods_name}
        : data.goods = {url: swiperdata.subgood_name}
      delete data.goods_name
      delete data.subgood_name
      // console.log(data)
      if(id){
        dispatch({
          type:'trade/updateSwiperdata',
          payload:{
            id,
            data
          }
        })
      }
      else{
        if(shopid === 'all'){
          message.warning("请选择要添加的店铺")
        }
        else{
          data.shop = shopid.split('#')[1]
          delete data.id
          delete data.url
          dispatch({
            type:'trade/createSwiperdata',
            payload:{ ...data }
          })
        }
      }
    }
  }

  render(){
    const { swiperdata, goodslist, subgoodslist, visible } = this.state
    const { location, swiperLoading, Upload, config} = this.props
    let id  = location.query.id

    const wh = window.screen.height;

    return(
      <PageHeaderWrapper >
        <Spin spinning={Boolean(Upload || swiperLoading)} tip='操作中'>
        <Card className={styles.main} title={id ? '编辑首页海报' : '新建首页海报'}>
          <Form className={styles.editform}>
            {/*<FormItem wrapperCol={{offset: 3}}>*/}
            {/*  <Radio.Group buttonStyle="solid" value={swiperdata.goods.model_type}*/}
            {/*               onChange={(e) => this.handleswiper(e.target.value, 'goods','model_type')}>*/}
            {/*    <Radio.Button value="ord">商品</Radio.Button>*/}
            {/*    {config.store_type === 'camel' && <Radio.Button value="sub">订阅商品</Radio.Button>}*/}
            {/*  </Radio.Group>*/}
            {/*</FormItem>*/}
            <FormItem label="商品名">
              <SelectSearch
                datalist={goodslist}
                value={swiperdata.goods_name || '' }
                disabled={swiperdata.goods.model_type !== 'ord'}
                dispatchType="goods/fetchGoods"
                modelType="ord"
                onChange={(e) => this.handleswiper(e, 'goods_name')}/>
            </FormItem>
            {/*{config.store_type === 'camel' &&*/}
            {/*<FormItem label="订阅商品名">*/}
            {/*  <SelectSearch*/}
            {/*    datalist={subgoodslist}*/}
            {/*    value={swiperdata.subgood_name || ''}*/}
            {/*    disabled={swiperdata.goods.model_type !== 'sub'}*/}
            {/*    dispatchType="goods/fetchGoods"*/}
            {/*    modelType="sub"*/}
            {/*    onChange={(e) => this.handleswiper(e, 'subgood_name')}/>*/}
            {/*</FormItem>*/}
            {/*}*/}
            <FormItem label="轮播图"
              help='支持png, jpg, 建议像素为900 * 500。'>
              <UploadImage
                limit={1}
                openSource={swiperdata.image ? [swiperdata.image].length < 1 : [].length < 1}
                fileList={swiperdata.image ? [swiperdata.image] : []}
                onChange={(e,list) => this.handleUpload(e,'image',list)}
                handleSource={() => this.openModal(swiperdata.image ? [swiperdata.image].length < 1 : [].length < 1)}
                restprops={{ openFileDialogOnClick: false }}
              />
            </FormItem>
            <FormItem label="排序">
              <InputNumber min={0} onChange={(e) => this.handleswiper(e, 'index')}
                value={swiperdata.index}
                style={{ width: 150 }}
                placeholder='请输入排序'
              />
            </FormItem>
            <FormItem label="是否启用">
              <Switch checked={swiperdata.is_active} onChange={(e) => this.handleswiper(e,'is_active')} />
            </FormItem>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Link to={'/trade/swiperlist'}>
                <Button>取消</Button>
                </Link>
                <CButton type='primary' style={{ marginLeft: 8 }} onClick={this.handleSubmit}>保存</CButton>
              </Col>
            </Row>
          </Form>
        </Card>
          <Modal width="60%" title="素材选择"
                 visible={visible}
                 centered
                 onCancel={() => this.setState({ visible:false })}
                 onOk={() => this.handleSelect()}
                 bodyStyle={{maxHeight: `${wh-300}px`, overflowY: 'auto'}}>
            <SourceImageTab
              limit={1}
              visible={visible}
              onSelectItem={(list) => this.setState({ _selectList: list })}
              {...this.props}/>
          </Modal>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}

export default Editswiper
