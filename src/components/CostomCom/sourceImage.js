import React, { Component, Fragment } from 'react';
import {
  message,
  Modal,
  Button,
  Checkbox,
  Col,
  Row,
  Layout,
  Tag,
  Popover,
  Input,
  Pagination,
  Form,
  Spin,
  Empty,
  Icon
} from 'antd';
import { connect } from 'dva';
import { imageTransform, imageRequest, imageTransformReverse } from '@/utils/_utils'
import styles from './sourceImage.less';
import UploadImage from '@/components/CostomCom/uploadImage';
import moment from 'moment';

const { Content, Sider } = Layout;
const { CheckableTag } = Tag;
const formItemLayout = {
  labelCol: { sm: { span: 5 }, xxl:{ span: 3 } },
  wrapperCol: { sm: { span: 18 }, xxl:{ span: 20 } },
};
const FormItem = props => <Form.Item {...formItemLayout} {...props}/>

//素材库的单个图片的重写样式
class BodyRow extends Component {
  render() {
    const {
      item,
      handlePreview,
      handleDelete,
      handleEdit,
      handleItem,
      ...restProps
    } = this.props;
    let className = restProps.className;
    let isSelect = restProps.isSelect;

    return (
      <span className={isSelect ? `${styles[className]} ${styles.unmultiOpera}` : styles.unmultiOpera}>
      <div className={`ant-upload-list ant-upload-list-picture-card` }>
        <div className={`ant-upload-list-item ant-upload-list-item-done`} style={{padding:'3px', position: 'relative'}}>
          <span className={styles.Itemcheckbox}><Checkbox checked={isSelect} onChange={() => handleItem(item)}/></span>
          <div className="ant-upload-list-item-info">
            <span>
              <a className="ant-upload-list-item-thumbnail" style={{ width: '102px', height: '102px' }}>
                {item.file_type === 'picture'
                  ? <img src={`${item.file}?imageView2/0/w/102/h/102`} style={{ width: '102px', height: '102px' }} alt={item.label}/>
                  : <video src={item.file} poster={`${item.file}?vframe/jpg/offset/1`} preload="meta" style={{ width: '102px', height: '102px' }}/>
                }
              </a>
            </span>
            <span className="ant-upload-list-item-actions">
              <a onClick={() => handlePreview(item)} title="预览文件">
                <i aria-label="图标: eye-o" className="anticon anticon-eye-o">
                  <svg viewBox="64 64 896 896" className="" data-icon="eye" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                    <path d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 0 0 0 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z"/>
                  </svg>
                </i>
              </a>
              { handleEdit &&
                <Icon onClick={() => handleEdit(item)} type="edit" title="编辑文件" className="anticon anticon-delete" />
              }
              {handleDelete &&
                <i onClick={() => handleDelete(item)} aria-label="图标: delete" title="删除文件" tabIndex="-1" className="anticon anticon-delete">
                  <svg viewBox="64 64 896 896" className="" data-icon="delete" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                    <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"/>
                  </svg>
                </i>
              }
            </span>
          </div>
          <span onClick={() => handleItem(item)}>
            <div className={styles.title_text}>{item.label}</div>
            <div className={styles.title_time}>
              {moment(item.create_at).format('YYYY-MM-DD')}
              <Row>
                <Col span={12} style={{textAlign:'left'}}>{moment(item.create_at).format('kk:mm')}</Col>
                <Col span={12} style={{textAlign:'right'}}>上传</Col>
              </Row>
            </div>
          </span>
        </div>
      </div>
      </span>
    );
  }

}

//展示图片墙
class SourceImage extends Component {
  state = {
    previewImage: '',
    previewVisible: false
  }

  componentDidMount = () => {}

  //预览
  handlePreview = (file) => {
    this.setState({
      previewImage: file.file,
      previewVisible: true,
    });
  }
  //关闭预览
  handleCancel = () => this.setState({ previewVisible: false })

  //检测改变(删除)
  handleDelete = (e) => {
    let { onChange, disabled, fileList } = this.props  //传入的值
    let file_List = fileList.filter(item => item.image ? item.image.url !== e.key : item.url !== e.key )
      .map((item) => { return item.image ? item.image.url : item.url })

    if(!disabled && onChange){
      onChange(e,file_List)
    }
    else{
      message.error("您没有进行该操作的权限！")
    }
  }

  //处理传值
  conversionObject() {
    const { fileList, limit, disabled, type = 'picture' } = this.props;
    if (!fileList) {
      return {
        fileList:[],
        limit,
        disabled: false
      };
    }

    return {
      fileList,
      limit,
      disabled,
      type
    };
  }

  render(){
    const { fileList, type } = this.conversionObject();
    const { previewImage, previewVisible } = this.state
    const { restprops, onhandleEdit, onChange } = this.props
    const wh = window.screen.height

    return(
      <Fragment>
        <span>
        { type !== 'video'
          ? fileList.map((item,index) =>
            <BodyRow
              key={index}
              item={item}
              handlePreview={this.handlePreview}
              handleDelete={onChange ? (item) => this.handleDelete(item) : undefined}
              handleEdit={onhandleEdit ? (item) => onhandleEdit(item) : undefined}
              handleItem={(item) => restprops && restprops.onSelectItem(item)}
              className={restprops && restprops.className || undefined}
              isSelect={restprops && restprops.selectList && restprops.selectList.includes(item.url)}
            /> )
          : null
        }
        </span>
        { type !== 'video' && fileList.length === 0 && <Empty /> }
        <Modal
          centered
          destroyOnClose
          zIndex={1010}
          footer={null}
          visible={previewVisible}
          onCancel={this.handleCancel}
          bodyStyle={{maxHeight: `${wh-200}px`, textAlign: 'center', overflowY: 'auto', paddingTop: 56}}>
          { previewImage && ['mp4','mp3'].includes(previewImage.split('.').reverse()[0])
            ? <video src={previewImage}  style={{ maxHeight: `${wh-360}px` }} controls="controls"/>
            : <img alt="example" style={{ width: '100%' }} src={previewImage} />
          }
        </Modal>
      </Fragment>
    )
  }
}

@connect(({ upload, costom, loading }) => ({
  taglist: upload.taglist,
  tagCount: upload.tagCount,
  filelist:upload.filelist,
  fileCount:upload.fileCount,
  videolist:upload.videolist,
  videoCount:upload.videoCount,
  uploading: loading.models.upload
}))

class sourceImageTab extends Component {
  state = {
    page: 1,
    pageSize: 20,
    visible: false,
    visibleconfirm: false,
    uploadform: {},
    selectModal: false,
    content: null,
    _tag_list: [], //弹窗标签
    taglist: [],  //左栏标签
    uploadList: [],
    zipuploadList: [],
    check_all: false,  //全选
    itemTag: {}, //需要更改标签的对象
    Itemtaglist: [], //记录更改标签对象的标签
    tagSelectvisible: false, //更改图片标签面板
    selectList: [],//选中的对象数组的url
    _selectList: [],//选中的对象数组
    request: true,
  }

  componentDidMount() {
    this.initTagData();
    this.initData('init');
  }
  componentDidUpdate(preprops,prestate){
    const { page, _selectList } = this.state
    const { visible } = this.props
    if(page !== prestate.page && this.state.check_all){
      this.setState({ check_all: false })
    }
    if(visible !== undefined && visible !== preprops.visible && _selectList.length > 0){
      this.setState({ _selectList: [], selectList:[] })
    }
  }
  //标签获取
  initTagData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'upload/fetchImageTaglist',
      payload: {
        page: 1,
        page_size: 50,
      }
    }).then((res) => {
      if(res){
        const taglist = res.map(item => { return {...item, check: false} })
        const _tag_list = res.map(item => { return {...item, ischeck: false} })
        this.setState({ taglist, _tag_list })
      }
    })
  }
  //初始化图片，视频获取
  initData = (pagetype) => {
    const { dispatch, type = 'picture' } = this.props;
    const { uploadform, page, pageSize } = this.state;
    dispatch({
      type: 'upload/fetchImagelist',
      payload: {
        page: pagetype ? 1 : page,
        page_size: pageSize,
        file_type: type,
        ...uploadform
      }
    })
  }

  //图片上传，非自动上传时，list为当前结果
  handleUpload = (res, list, key, manualUpload) => {
    const { uploadList, zipuploadList, page } = this.state
    const { dispatch } = this.props
    const del = !!list
    const that = this
    if(manualUpload){
      if(del){
        this.setState({ [key]: list })
      }
      else{
        key === 'uploadList' ? uploadList.push(res) : zipuploadList.push(res)
        this.setState({ uploadList, zipuploadList })
        // page === 1 && this.initData('init');
      }
    }
    else{  //单个删除
      if(del){
        Modal.confirm({
          title:'确定删除操作',
          content: `确定删除素材 ${res.label} `,
          centered: true,
          onOk() {
            dispatch({
              type: 'costom/_deleteUrlNodata',
              payload: {
                url: res.url
              }
            }).then(() => {
              that.initData()
              message.success("删除成功")
            })
          }
        })
      }
    }
  }

  //标签处理,ischeck
  checkhandleTag = (e, type) => {
    const { _tag_list, Itemtaglist } = this.state
    if(!type){
      _tag_list.map(item => {
        if(item.url === e){
          item.ischeck = !item.ischeck
        }
      })
    }
    if(type){
      const index = Itemtaglist.indexOf(e)
      if(index === -1){
        Itemtaglist.push(e)
      }
      else{
        Itemtaglist.splice(index,1)
      }
    }
    this.setState({ _tag_list, Itemtaglist, })
  }
  //标签增删改
  handleTag = (e, type) => {
    const { dispatch } = this.props;
    const that = this;
    if(type === 'add' && e){
      if(e.length > 6){
        message.warning("标签名称不能超过6个字！")
        this.setState({ request: true });
      }
      else{
        dispatch({
          type: 'upload/createImageTag',
          payload: {
            content: e
          }
        }).then((res) => {
          this.setState({ request: true });
          if(res){
            message.success("创建成功");
            this.initTagData();
            this.setState({ visible: false, content: '' })
          }
        })
      }
    }
    else if(type === 'delete'){
      Modal.confirm({
        title: `确定操作`,
        content: `确定删除标签 ${e.content}`,
        zIndex: 1010,
        centered: true,
        onOk() {
          dispatch({
            type: 'costom/_deleteUrlNodata',
            payload: {
              url: e.url
            }
          }).then(() => {
            message.success("删除成功");
            that.initTagData();
            that.setState({ visible: false })
          })
        }
      })
    }
    else if(type === 'close'){
      this.setState({ content: e, visible: false })
    }
  }
  //点击左栏tag
  selectTag = (e, all) => {
    const { taglist, uploadform } = this.state
    if(!all && e){
      taglist.map(item => {
        if(item.id === e){
          item.check = !item.check
        }
        else{
          item.check = false
        }
      })
    }
    else{   //选择全部
      taglist.map(item => {
        item.check = false
      })
    }
    const list = taglist.filter(item => item.check ).map(item => item.id)
    uploadform.tag = list.length === 1 ? list[0] : list
    this.setState({ taglist, uploadform })
    this.initData('init')
  }

  //上传图片或者压缩包，带tag
  handleImageTag = () => {
    const { dispatch, type = 'picture' } = this.props
    const { _tag_list, uploadList, zipuploadList, page } = this.state
    let flag = false
    const limitSize = type === 'picture' ? 2 : 10;
    const ischecktag = _tag_list.filter(item => item.ischeck ).map(item => item.url)
    uploadList.length > 0 && uploadList.map(item => {
      const size = item.size / (1024*1024)  //mb
      if(size < limitSize) {
        dispatch({
          type: 'upload/createImage',
          payload: {
            file: item.originFileObj,
            tag: ischecktag.length > 0 ? ischecktag : undefined
          }
        }).then((res) => {
          if(!res){
            flag = false;
          }else{
            this.setState({ uploadList: [] })
            res &&  page === 1 && this.initData('init')
          }
        })
      }
      else{
        flag = false;
        message.error(`${item.name}文件太大，请重新上传`)
      }
    })
    zipuploadList.length > 0 && zipuploadList.map(item => {
      const size = item.size / (1024*1024)  //mb
      if(size < 10) {
        dispatch({
          type: 'upload/createMoreImage',
          payload: {
            zip_file: item.originFileObj,
            tag: ischecktag.length > 0 ? ischecktag : undefined
          }
        }).then((res) => {
          if(res){
            this.setState({ uploadList: [] })
            page === 1 && this.initData('init')
            message.success("压缩包上传成功！")
          }
          else{
            message.error("压缩包中有不符合格式的文件，建议单张上传！")
            flag = false
          }
        })
      }
      else {
        message.error(`文件大小超过${limitSize}M,请重新上传`);
        flag = false;
      }
    })
    if(flag){
      message.success("文件上传成功！")
      this.setState({ uploadList: [], zipuploadList: [], selectModal: false })
    }
  }

  //全选
  checkAll = (e) => {
    this.setState({ check_all: e.target.checked })
    if(e.target.checked){
      this.MorehandleDelete('all')
    }
    else{
      this.MorehandleDelete('none')
    }
  }
  //点击图片墙的图片
  onSelectItem = (e) => {
    const { selectList, _selectList } = this.state
    const { limit, onSelectItem } = this.props
    if (!selectList.includes(e.url)) {
      if(limit && selectList.length > limit-1){
        message.warning(`选择图片的数量不能超过${limit}张`);
        return;
      }
      _selectList.push(e);
      selectList.push(e.url);
      this.setState({ selectList, _selectList })
      onSelectItem && onSelectItem(_selectList)
    }
    else {
      const select_List = selectList.filter(item => item !== e.url);
      const _select_List = _selectList.filter(item => item.url !== e.url);
      this.setState({ selectList: select_List, _selectList: _select_List })
      onSelectItem && onSelectItem(_select_List)
    }
  }
  //批量删除,选中
  MorehandleDelete = (action) => {
    const { selectList } = this.state;
    const { dispatch, filelist, videolist, type } = this.props
    const that = this
    const ids = selectList.map(item => {
      return item.toString().split('/').reverse()[1]
    })
    if(!action){
      if(selectList.length > 0){
        Modal.confirm({
          title:'确定删除操作',
          content: `确定删除选中的 ${selectList.length} 个素材 `,
          centered: true,
          okType:'danger',
          onOk() {
            dispatch({
              type: 'upload/delMoreImage',
              payload: {
                ids
              }
            }).then(() => {
              that.initData()
              that.setState({ selectList: [] })
              message.success("删除成功")
            })
          }
        })
      }
      else{
        message.warning("请选择要删除的素材")
      }
    }
    else{
      let actionlist = type === 'picture' ? [...filelist] : [...videolist]
      action === 'all'
      && actionlist.map(item => {
        if(!selectList.includes(item.url)){
          selectList.push(item.url)
        }
      })
      action === 'none' && actionlist.map(item => {
        const index = selectList.indexOf(item.url);
        index > -1 && selectList.splice(index,1)
      })
      this.setState({ selectList })
    }
  }

  //更改图片标签
  getTagItem = (e) => {
    this.setState({ tagSelectvisible: true, itemTag: {...e}, Itemtaglist: e.tag ? [...e.tag] : [] })
  }
  changeTag = () => {
    this.setState({ tagSelectvisible: false })
    const { itemTag, Itemtaglist } = this.state
    const { dispatch } = this.props
    dispatch({
      type: 'costom/_patchUrlData',
      payload:{
        url: itemTag.url,
        data: { tag: Itemtaglist }
      }
    }).then((res) => {
      res && this.initData()
    })
  }

  //处理传值
  conversionObject() {
    const { disabled, type = 'picture', editIcon = false } = this.props;

    return {
      disabled,
      type,
      editIcon
    };
  }

  render(){
    const { disabled, type, editIcon } = this.conversionObject();
    const { visible, selectModal, content, _tag_list, taglist, uploadList, zipuploadList, check_all,
      tagSelectvisible, Itemtaglist,
      page, pageSize, uploadform, selectList, request} = this.state
    const { uploading, filelist, fileCount, videolist, videoCount } = this.props
    const typeText = { 'picture': '图片', 'video': '视频'}

    const pagination = {
      pageSize: pageSize,
      current: page,
      total: type === 'picture' ? fileCount : videoCount,
      showSizeChanger:true,
      onShowSizeChange:(current, pageSize) => {
        this.setState({ pageSize, page: 1 });
        const { dispatch } = this.props
        dispatch({
          type: 'upload/fetchImagelist',
          payload: {
            page: 1,
            page_size:pageSize,
            file_type: type,
            ...uploadform,
          }
        })
      },
      onChange: (page) => {
        this.setState({ page });
        const { dispatch } = this.props
        dispatch({
          type: 'upload/fetchImagelist',
          payload: {
            page,
            page_size:pageSize,
            file_type: type,
            ...uploadform,
          }
        })
      },
    };

    const resultlist = type === 'picture' ? [...filelist] : [...videolist]

    return(
      <Fragment>
        <Spin spinning={uploading}>
        <Layout style={{ background: '#fff' }}>
          <Sider width={150}  style={{ background: 'rgba(245, 245, 245, 0.8)' }}>
            <div className={styles.sliderTitle}>标签</div>
            <div className={styles.sliderTag}>
              <span className={taglist.filter(item => item.check).length === 0 ? styles.tagcheck : null}>
                <Tag onClick={() => this.selectTag(null,'all')}>全部</Tag>
              </span>
              { taglist && taglist.map(item =>
                <span className={item.check ? styles.tagcheck : null}>
                  <Tag closable afterClose={() => this.handleTag(item,'delete')}>
                    <span onClick={() => this.selectTag(item.id)}>{item.content}</span></Tag>
                </span>)
              }
              <Popover placement="bottom" trigger="click" visible={visible} content={
                <Fragment>
                  标签：<Input size="small" style={{ width:150,marginBottom: 10 }}
                            placeholder="不超过6个字" value={content}
                            onPressEnter={() => this.handleTag(content,'add')}
                            onChange={(e) => this.setState({ content: e.target.value })}/><br/>
                  <Button size="small" disabled={disabled && !request}
                          style={{ marginRight: 10 }} type="primary"
                          onClick={() =>
                            this.state.request
                            && this.setState({request: false},
                              () => this.handleTag(content,'add'))}>添加</Button>
                  <Button size="small" onClick={() => this.handleTag(null,'close')}>取消</Button>
                </Fragment>}>
                <Button size="small" type="primary" icon="plus" onClick={() => this.setState({ visible: !visible }) }>添加标签</Button>
              </Popover>
            </div>
          </Sider>
          <Content style={{ padding: '0 24px'}}>
            <Row style={{marginBottom: 20}}>
              <Col>
                <span style={{ float:'left' }}>{typeText[type]}库
                  <span style={{ color: '#1890ff',marginLeft: 5, marginRight: 20 }}>(总共：{pagination.total || 0})</span>
                  {editIcon &&
                    <Fragment>
                      <Checkbox checked={check_all} onChange={(e) => this.checkAll(e)}/>
                      <span style={{marginLeft: 1}}>全选</span>
                    </Fragment>
                  }
                </span>
                <div style={{ float: 'right' }}>
                  <Button size="small" disabled={disabled} type="primary" icon="upload" onClick={() => this.setState({ selectModal:true })}>上传{typeText[type]}</Button>
                  { editIcon ?
                    <Button type="danger" disabled={disabled} size="small" style={{ marginLeft: 10 }}
                            onClick={() => this.MorehandleDelete(null)}>删除</Button>
                    : null
                  }
                </div>
              </Col>
            </Row>
            <SourceImage
              fileList={resultlist}
              onChange={editIcon ? (res,list) => this.handleUpload(res,list) : undefined}
              // MoreDelete={() => this.handleDelete()}
              onhandleEdit={editIcon ? (e) => this.getTagItem(e) : undefined}
              restprops={{
                multiple: true,
                className:'multiOpera',
                onSelectItem: (e) => this.onSelectItem(e),
                selectList: selectList
              }}
            />
            <Row style={{marginBottom: 10, marginTop: 10 }}>
              <Col style={{ float:'right' }}>
                {resultlist.length > 0 && <Pagination {...pagination} /> }
              </Col>
            </Row>
          </Content>
        </Layout>
        </Spin>
        <Modal centered
               width="60%"
               title="本地上传"
               zIndex={1003}
               visible={selectModal}
               onCancel={() => this.setState({ selectModal: false })}
               footer={[<Button onClick={() => this.setState({ selectModal: false })}>取消</Button>,
                 <Button type="primary" onClick={() => this.handleImageTag()}>确定</Button>]}>
          <Form className="uploadModal">
            <FormItem label={`选择${typeText[type]}标签`}>
              { _tag_list && _tag_list.map(item =>
                <CheckableTag checked={item.ischeck} onChange={() => this.checkhandleTag(item.url)}>{item.content}</CheckableTag>)
              }
            </FormItem>
            <FormItem label="批量上传" help={`压缩包的格式为zip，包内${typeText[type]}支持
              ${type === 'picture' ? 'jpeg、jpg、png' : 'mp4'}格式，大小不超10MB`}>
              <UploadImage
                type='video'
                limit={1}
                autoUpload={false}
                fileList={zipuploadList || []}
                onChange={(e,list) => this.handleUpload(e,list,'zipuploadList','manualUpload')}
                restprops={{ text: `选择${typeText[type]}压缩包`, listType: 'text', accept:'.zip', showUploadList:true }}
              />
            </FormItem>
            <FormItem label={`本地${typeText[type]}`} help={`支持${type === 'picture' ? 'jpeg、jpg、png' : 'mp4'}格式，大小不超过${type === 'picture' ? '2' : '10'}MB。数量不超过5。`}>
              <UploadImage
                limit={5}
                type={type}
                autoUpload={false}
                fileList={uploadList || []}
                onChange={(e,list) => this.handleUpload(e,list,'uploadList','manualUpload')}
                restprops={{ accept: type === 'picture' ? '.jpg,.jpeg,.png' : '.mp4', text: '选择视频' }}
              />
            </FormItem>
          </Form>
        </Modal>
        <Modal
          title='标签管理'
          zIndex={1006}
          centered={true}
          visible={tagSelectvisible}
          onCancel={() => this.setState({ tagSelectvisible:false, itemTag: {}, Itemtaglist: [] })}
          onOk={() => this.changeTag()}
        >
          管理{typeText[type]}标签：
          { taglist && taglist.map(item =>
            <CheckableTag
              checked={Itemtaglist.includes(item.url)}
              onChange={() => this.checkhandleTag(item.url,'item')}>{item.content}</CheckableTag>
          )}
        </Modal>
      </Fragment>
    )
  }

}

export default sourceImageTab;
