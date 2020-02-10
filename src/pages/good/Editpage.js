import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import { copy} from '@/utils/_utils';
import { permissionAuth } from '@/utils/permission';
import {
  Input,
  InputNumber,
  Form,
  Button,
  Card,
  message,
  Spin,
  Switch,
  Row,
  Col, Modal,
} from 'antd';
import styles from './editpage.less';
import UploadImage from '@/components/CostomCom/uploadImage';
import SourceImageTab from '@/components/CostomCom/sourceImage';

const formItemLayout = {
  labelCol: { md: { span: 4 }, lg:{ span: 3 } },
  wrapperCol: { md: { span: 18 }, lg:{ span: 20 } },
};
const FormItem = props => (<Form.Item required {...formItemLayout} {...props}/>);

@connect(({ goods, upload, global, loading }) => ({
  permissions:global.permissions,
  shopid: global.shopid,
  shopurl: global.shopurl,
  categorylist: goods.list,
  upload: loading.models.upload,
  CategoryLoading: loading.effects['goods/fetchCategorydata'],
}))
class Editpage extends Component {

  state = {
    categorydata:{is_active: true, index: 1},
    onUpload: false,
    selectList: [],
    _selectList: [],
    uploadform: {},
    page: 1,
    visible: false
  };

  componentDidMount() {
    this.init()
  }
  init = (e) => {
    const { location, dispatch } = this.props
    let id = location.query.id
    if(id || e){
      dispatch({
        type: 'goods/fetchCategorydata',
        payload: {
          id:e ? e : id
        }
      }).then((res) => {
        this.setState({
          categorydata:res,
          onUpload: false
        })
      })
    }
  }

  componentDidUpdate(prepros){}

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
    _selectList[0] && this.handlecategory({ ..._selectList[0], index:undefined, key:undefined },'image')
    this.setState({ visible: false, _selectList:[] })
  }

  handleUpload = (res,key,list) => {
    const del = !!list
    let arrlist = del ? null : {...res}
    this.handlecategory(arrlist,key)
  }

  handlecategory = (e,key) => {
    const { categorydata } = this.state
    const that = this
    if(key === 'is_active' && !e){
       Modal.confirm({
         title:'确认操作',
         content: '隐藏分类后，下架此分类所有商品',
         centered: true,
         onOk(){
           categorydata[key] = e
           that.setState({ categorydata })
         }
       })
    }
    else{
      categorydata[key] = e
    }
    this.setState({ categorydata })
  }

  validatingForm = (args) => {
    let tips = {
      'name': '类别名不能为空 ',
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
    const { categorydata } = this.state
    let id = location.query.id
    let shopid = getLocalStorage('shopid')
    const flag = this.validatingForm(categorydata)
    if(flag){
      if(shopid !== 'all'){
        categorydata.shop = shopid.split("#")[1]
      }
      if(id){
        dispatch({
          type:'goods/updateCategorydata',
          payload:{
            id,
            data:{ ...categorydata}
          }
        })
      }else {
        dispatch({
          type:'goods/createCategoryData',
          payload:{
            ...categorydata
          }
        })
      }
    }
  }

  //获取权限
  getAuth = (e) => {
    const { permissions } = this.props
    return permissions.includes(permissionAuth[e])
  }

  render(){
    const {  categorydata, CategoryLoading, onUpload, visible } = this.state;
    const { location, upload } = this.props
    let id = location.query.id

    const createTem = this.getAuth('createTemplate');
    const wh = window.screen.height;

    return(
      <PageHeaderWrapper loading={CategoryLoading}>
        <Card className={styles.main} title={id ? '编辑商品类别' : '新增商品类别'}>
          <Spin spinning={Boolean(onUpload || upload)} tip='正在操作中'>
          <Form className={styles.editform}>
            <FormItem label="类别名" required {...formItemLayout}>
              <Input style={{ width: 150 }} placeholder='请输入分类名称'
                value={categorydata.name}
                onChange={(e) => this.handlecategory(e.target.value,'name')}
              />
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              <InputNumber style={{ width: 150 }} placeholder='请输入排序'
                           onChange={(e) => this.handlecategory(e,'index')}
                           value={categorydata.index}
                           min={0}
              />
            </FormItem>
            {/*<FormItem label="类别图" required {...formItemLayout}*/}
              {/*className={styles.imageItem}*/}
              {/*help="支持PNG, JPG, 图片大小不超过200K，建议像素为900 * 500。"*/}
            {/*>*/}
              {/*<UploadImage*/}
                {/*limit={1}*/}
                {/*openSource={categorydata.image ? [categorydata.image].length < 1 : [].length < 1}*/}
                {/*fileList={categorydata.image ? [categorydata.image] : []}*/}
                {/*onChange={(e,list) => this.handleUpload(e,'image',list)}*/}
                {/*handleSource={() => this.openModal(categorydata.image ? [categorydata.image].length < 1 : [].length < 1)}*/}
                {/*restprops={{ openFileDialogOnClick: false }}*/}
              {/*/>*/}
            {/*</FormItem>*/}
            <FormItem label="是否启用" {...formItemLayout}>
              <Switch checked={categorydata.is_active} onChange={(e) => this.handlecategory(e,'is_active')} />
            </FormItem>
            {
              id && (
                <FormItem label="小程序页面路径" help={`/pages/util/index?cid=${id}`} required={false}>
                  <Button size='small' onClick={() => copy(`/pages/util/index?cid=${id}`)}>
                    复制
                  </Button>
                </FormItem>
              )
            }
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Link to='/good/categorylist'>
                  <Button>取消</Button>
                </Link>
                <Button type='primary' style={{ marginLeft: 10 }} onClick={this.handleSubmit}>保存</Button>
              </Col>
            </Row>
          </Form>
          </Spin>
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
        </Card>
      </PageHeaderWrapper>
    )
  }
}

export default Editpage
