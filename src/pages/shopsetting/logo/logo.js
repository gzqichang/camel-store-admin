import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import {
  Form,
  Button,
  Card,
  Spin,
  message,
  Modal,
} from 'antd';
import UploadImage from '@/components/CostomCom/uploadImage';
import SourceImageTab from '@/components/CostomCom/sourceImage';

const FormItem = Form.Item;

@connect(({ global, loading }) => ({
  storeicon:global.storeicon,
  loading: loading.effects['global/queryStorelogo'],
}))
class Logo extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    square_logo: null,
    rectangle_logo: null,
    _visible: false,
    key: ''
  };

  componentDidMount(){
    this.init()
  }

  init = () => {
    const { dispatch } = this.props
    dispatch({ type:'global/queryStorelogo' }).then((res) => {
      this.setState({
        square_logo: res.square_logo.url ? res.square_logo : '',
        rectangle_logo: res.rectangle_logo.url ? res.rectangle_logo : '',
      })
    })
  }

  validForm = () => {
    const { square_logo, rectangle_logo } = this.state
    if(!square_logo || !square_logo.file)
      return message.error("店铺小图标不能为空")
    if(!rectangle_logo || !rectangle_logo.file)
      return message.error("店铺长图标不能为空")
    this.handleSubmit()
  }

  handleSubmit = () => {
    const { dispatch } = this.props
    const { square_logo, rectangle_logo } = this.state
    dispatch({
      type: 'global/setStorelogo',
      payload: {
        square_logo:square_logo.url ? square_logo : undefined,
        rectangle_logo:rectangle_logo.url ? rectangle_logo : undefined,
      }
    }).then((res) => {
      if(res){
        this.init()
        message.success('修改成功')
      }
    }).catch(() => {
      message.error('修改失败')
    })
  }

  //打开图片墙弹窗
  _openModal = (key,openSource) => {
    if(openSource){
      this.setState({
        _visible:true,
        _selectList: [],
        key
      })
    }
  }
  //选好图片，点击确定导入到详情中
  handleSelect = () => {
    const { _selectList, key } = this.state
    if(key === 'square_logo'){
      const square_logo = {..._selectList[0], key: undefined, index: undefined }
      this.setState({ square_logo })
    }
    else if(key === 'rectangle_logo'){
      const rectangle_logo = {..._selectList[0], key: undefined, index: undefined }
      this.setState({ rectangle_logo })
    }
    this.setState({ _visible: false, _selectList:[] })
  }
  //图标上传
  handleUpload = (res,key,list) => {
    if(!!list){
      this.setState({ [key]: null })
    }
    else{
      this.setState({ [key]: {...res} })
    }
  };

  render(){
    const { square_logo, rectangle_logo, _visible } = this.state
    const { loading } = this.props
    const formItemLayout = {
      labelCol: { sm:{ span: 5 }, lg: { span: 3 } },
      wrapperCol: { sm:{ span: 16 },lg: { span: 20 } },
    };
    const wh = window.screen.height;

    return(
      <PageHeaderWrapper >
        <Spin spinning={loading}>
          <Card title="店铺图标详情">
            <Form>
              <FormItem label="小图标" required {...formItemLayout}
                        help="管理后台LOGO图，建议尺寸40*40">
                <UploadImage
                  limit={1}
                  fileList={square_logo ? [square_logo] : []}
                  openSource={square_logo ? [square_logo].length < 1 : []}
                  onChange={(e, list) => this.handleUpload(e, 'square_logo', list)}
                  handleSource={() => this._openModal('square_logo',square_logo ? [square_logo].length < 1 : [])}
                  restprops={{ openFileDialogOnClick: false }}
                />
              </FormItem>
              <FormItem label="长图标" required {...formItemLayout}
                        help="线下支付页面LOGO图，建议尺寸670*300">
                <UploadImage
                  limit={1}
                  fileList={rectangle_logo ? [rectangle_logo] : []}
                  openSource={rectangle_logo ? [rectangle_logo].length < 1 : []}
                  onChange={(e, list) => this.handleUpload(e, 'rectangle_logo', list)}
                  handleSource={() => this._openModal('rectangle_logo',rectangle_logo ? [rectangle_logo].length < 1 : [])}
                  restprops={{ openFileDialogOnClick: false }}
                />
              </FormItem>
            </Form>
            <div style={{textAlign:'right'}}>
              <Button type='primary' style={{ marginLeft: 8 }} onClick={this.validForm}>保存</Button>
            </div>
          </Card>
          <Modal width="60%" title="素材选择"
                 visible={_visible}
                 centered
                 onCancel={() => this.setState({ _visible:false })}
                 onOk={() => this.handleSelect()}
                 bodyStyle={{maxHeight: `${wh-300}px`, overflowY: 'auto'}}>
            <SourceImageTab
              limit={1}
              visible={_visible}
              onSelectItem={(list) => this.setState({ _selectList: list })}
              {...this.props}/>
          </Modal>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}

export default Logo
