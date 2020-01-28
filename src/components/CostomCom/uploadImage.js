import React, { Component, Fragment } from 'react';
import { Icon, message, Modal, Upload, Button } from 'antd';
import { connect } from 'dva';
import { imageTransform, imageRequest, imageTransformReverse } from '@/utils/_utils'
import DragImage from './dragImage';
import styles from './tableDrag.less';

@connect(({ upload }) => ({
}))

class uploadImage extends Component {
  state = {
    previewImage: '',
    previewVisible: false
  }

  componentDidMount = () => {}

  componentDidUpdate = (preprops,prestate) => {}

  //预览
  handlePreview = (file) => {
    this.setState({
      previewImage: file.file || file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  //关闭预览
  handleCancel = () => this.setState({ previewVisible: false })

  uploadPromise = (file) =>
    new Promise((resolve, reject) => {
      const { dispatch } = this.props
      const size = file.size / (1024*1024)  //mb
      if( size < 10 ){
        dispatch({
          type:'upload/createImage',
          payload:{
            file:file,
            label:''
          }
        }).then(resolve)
          .catch(reject);
      }
      else{
        reject('上传的文件过大，请上传不超过10M素材')
      }
    })

  //上传完处理
  handleUpload = ({file, onProgress, onSuccess, onError}) => {
    const { onChange, autoUpload = true } = this.props
    if(autoUpload){
      onProgress();
      this.uploadPromise(file)
        .then((res) => {
          onSuccess();
          message.success('文件上传成功');
          onChange(res)
        })
        .catch((err) => {
          onError(err);
          message.error(err);
        })
    }
  }
  //检测改变(删除)
  handleChange = (value) => {
    let { onChange,disabled, autoUpload = true } = this.props  //传入的值
    let file_List = value.fileList //组件内部的值
    file_List = file_List.map((item) => {
      return item.key
    })

    if(value.file.status === 'uploading' && !autoUpload){
      onChange({...value.file, status:'done'})
    }

    if(value.file.status === 'removed'){
      if(!disabled && onChange){
        onChange({},autoUpload ? file_List : value.fileList)
      }
      else{
        message.error("您没有进行该操作的权限！")
      }
    }
  }

  handleDelete = (e,index) => {
    let { onChange,disabled, fileList } = this.props  //传入的值
    fileList.splice(index,1);
    let file_List = fileList.map((item) => { return item.image ? item.image.url : item.url })
    if(!disabled){
      onChange(e,file_List)
    }
    else{
      message.error("您没有进行该操作的权限！")
    }
  }

  //拖动图片
  moveRow = (dragIndex, hoverIndex) => {
    const { fileList, onChange } = this.props;
    const dragRow = fileList[dragIndex];
    onChange({dragIndex,hoverIndex,dragRow},[],'drag')
  }

  //打开素材库
  openSource = () => {
    const { openSource = true, handleSource } = this.props
    if(openSource && handleSource){
      handleSource()
    }
  }

  //处理传值
  conversionObject() {
    const { fileList, limit, disabled, areakey, type = 'picture', isdrag = false, autoUpload = true, openSource = true } = this.props;
    if (!fileList) {
      return {
        fileList:[],
        limit,
        disabled: false
      };
    }

    return {
      fileList:autoUpload ? imageTransform(fileList) : fileList,
      limit,
      disabled,
      isdrag,
      areakey,
      type,
      openSource
    };
  }

  render(){
    const { fileList, limit, disabled, type, areakey, isdrag } = this.conversionObject();
    const { previewImage, previewVisible } = this.state
    const { restprops } = this.props
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus' } />
      </div>
    );
    const uploadIcon = (
      <Button>
        <Icon type="upload" /> { restprops && restprops.text }
      </Button>
    )
    const wh = window.screen.height
    const _limit = (limit && limit !== 1) || !limit //有限制数量且为1，或者没有限制

    return(
      <Fragment>
        <span style={ isdrag ? {} : {display:'table'}}>
        { isdrag && _limit
          ? fileList.map((item,index) =>
            <DragImage
              areakey={areakey} index={index} item={item}
              moveRow={this.moveRow}
              handlePreview={this.handlePreview}
              handleDelete={(item) => this.handleDelete(item,index)}
            />
          )
          : null
        }
        </span>
        <span className={styles.dragImageUpload}
              style={ isdrag ? {} : {marginLeft: 0}}
              onClick={() => this.openSource()}>
        <Upload action=''
                accept='.jpg,.jpeg,.png,.mp3,.mp4'
                listType={type === 'video' ? 'text' : 'picture-card'}
                showUploadList={ !isdrag || !_limit }
                onPreview={this.handlePreview}
                fileList={fileList}
                customRequest={(e) => this.handleUpload(e)}
                onChange={(e) => this.handleChange(e)}
                {...restprops}
        >
          {!disabled ?
            (limit && fileList.length >= limit
                ? null
                : (type === 'video' ? uploadIcon : uploadButton)
            ) : null
          }
        </Upload>
        </span>
        <Modal
          centered
          destroyOnClose
          footer={null}
          zIndex={1010}
          visible={previewVisible}
          onCancel={this.handleCancel}
          bodyStyle={{paddingTop: 56, maxHeight: `${wh-200}px`, textAlign:'center', overflowY: 'auto'}}>
          { previewImage && type === 'video'
            ? <video src={previewImage}  style={{ maxHeight: `${wh-360}px` }} controls="controls"/>
            : <img alt="example" style={{ width: '100%' }} src={previewImage} />
          }
        </Modal>
      </Fragment>
    )
  }
}

export default uploadImage;
