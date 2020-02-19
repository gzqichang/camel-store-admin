import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import { getLocalStorage } from '@/utils/authority';
import {
  Button,
  Card,
  Table,
  Modal,
  Form,
  message,
  Spin,
  Row,
  Col,
  Icon,
  Input,
  Divider,
  Carousel,
  Avatar,
  Select
} from 'antd';
import styles from './trade.less';
import UploadImage from '@/components/CostomCom/uploadImage';
import SourceImageTab from '@/components/CostomCom/sourceImage';
import TableDrag from '@/components/CostomCom/tableDrag';
import SelectSearch from '@/components/CostomCom/selectSearch';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import update from 'immutability-helper';
import indexTop from '@/assets/index1.png';
import search from '@/assets/search.png';
import groupbuy from '@/assets/groupbuy.png';
import delivery from '@/assets/delivery.png';
import recommend from '@/assets/recommend.png';
import integrate from '@/assets/integrate.png';
import bottom from '@/assets/bottom.png';

const itemsPerPage = 10;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const FormItem = props => <Form.Item required {...formItemLayout} {...props} />;

@connect(({ trade, goods, costom, upload, global, loading }) => ({
  homebannerlist: trade.homebannerlist,
  modulelist: trade.modulelist,
  shortcutlist: trade.shortcutlist,
  filelist:upload.filelist,
  config: global.config,
  fileCount:upload.fileCount,
  shopid: global.shopid,
  Loading: loading.effects['upload/createImage'],
  tradeload: loading.models.trade
}))
class indexPage extends Component {
  state = {
    page: 1,
    bannervisible: false,
    entervisible: false,
    modalData: {},
    result: [],    //记录需要发请求更改顺序的对象
    isrequest: 0,  //发送了多少次请求去更改顺序
    isIndex: [],  //记录移动表格的key
    goodlist: [],      //初始化商品列表
    categorylist: [],  //初始化商品分类列表
    _selectList: [],  //素材库选中的对象
    _visible: false,  //素材库modal的显隐

    homepage: {       //三个表格的数据对象
      homebanner: [],
      homebannerId: [],
      _module: [],
      _moduleId: [],
      shortcut: [],
      shortcutId: [],
    },
    request: true,
  };

  componentDidMount() {
    this.initData();
  }
  componentDidUpdate(preprops, prestate) {
    const { shopid } = this.props
    const { isIndex, isrequest, result } = this.state
    if(preprops.shopid !== shopid && shopid !== ''){
      this.initData('reset')
    }
    if(isIndex.length > 0 && isrequest > 0 && result.length === isrequest){
      this.setState({ isrequest: 0, result:[] })
      isIndex.map(item => {
        this.fetchhomeData(item)
      })
    }
  }
  //离开页面的时候
  componentWillUnmount(){
    clearTimeout();
    const { isIndex, homepage } = this.state
    if(isIndex.length > 0){   //更改表格顺序
      isIndex.map(item => {
        this.compareIndex(item,homepage[item],homepage[`${item}Id`])
      })
    }
  }
  //获取初始表格数据
  initData = () => {
    this.fetchhomeData('homebanner')
    this.fetchhomeData('_module')
    this.fetchhomeData('shortcut')
  };
  fetchhomeData = (type) => {
    const { dispatch } = this.props;
    const { homepage } = this.state;
    let shopid = getLocalStorage('shopid');
    const _params = {
      page: 1,
      page_size: itemsPerPage,
      shop: shopid === 'all' ? undefined : shopid.split('#')[0]
    }
    dispatch({
      type: 'trade/fetchhomepageList',
      payload: {
        type,
        _params: { ..._params }
      },
    }).then((res) => {
      homepage[type] = [...res];
      homepage[`${type}Id`]= res.map(item => item.id)
      this.setState({ homepage });
    });
  }

  //select数据检测
  fetchData = () => {
    const { dispatch } = this.props;
    const { goodlist, categorylist } = this.state;
    let data = { page:1, page_size:10 };
    let shopid = getLocalStorage('shopid').split('#')[0];
    shopid !== 'all' ? data.shop = shopid : null;
    if(goodlist.length === 0){
      dispatch({
        type: 'goods/searchGoodsData',
        payload: {
          ...data
        }
      }).then((res) => {
        this.setState({ goodlist: res })
      })
    }
    if(categorylist.length === 0){
      dispatch({
        type: 'goods/fetchCategory',
        payload: {
          ...data
        }
      }).then((res) => {
        this.setState({ categorylist: res })
      })
    }
  }

  //打开图片墙弹窗
  _openModal = (openSource) => {
    if(openSource){
      this.setState({
        _visible:true,
        selectList: [],
        _selectList: []
      })
    }
  }

  //选好图片，点击确定导入到详情中
  handleSelect = () => {
    const { _selectList } = this.state
    this.handlelevel('image',{..._selectList[0], key: undefined, index: undefined } )
    this.setState({ _visible: false,_selectList:[] })
  }

  //图片本地删除，上传
  handleUpload = (res,key,list) => {
    if(!!list){
      this.handlelevel(key,null)
    }
    // else{  //上传
    //   const { _page } = this.state;
    //   _page === 1 && this._initData('init');
    // }
  };

  //打开编辑和新增弹窗
  openModal = (res, key) => {
    if(key === 'banner'){
      this.setState({ bannervisible: true,
        modalData: {...res }
      });
    }
    else if(key === 'enter'){
      this.setState({ entervisible: true, modalData: {...res} });
    }
    this.fetchData()
  };
  handlelevel = (key, e) => {
    const { modalData } = this.state;
    modalData[key] = e;
    if(key === 'jump_type'){
      this.fetchData();
      modalData.link = ''
    }
    this.setState({ modalData });
  };
  //删除数据
  delModal = (type, url, name) => {
    const { dispatch } = this.props;
    const { homepage } = this.state;
    const that = this;
    Modal.confirm({
      title: '确认删除 ',
      content: `确认删除 ${name}`,
      centered: true,
      okText: '确认删除 ',
      okType: 'danger',
      cancelText: '取消 ',
      onOk() {
        dispatch({
          type: 'costom/_deleteUrlNodata',
          payload: { url },
        }).then(() => {
          message.success('删除成功');
          const updateIndex = that.compareIndex(type,homepage[type],homepage[`${type}Id`])
          if(!updateIndex){
            that.fetchhomeData(type)
          }
        })
        .catch(() => {
          message.error('删除失败');
        });
      },
    });
  };
  validatingForm = args => {
    let tips = {
      image: '图片不能为空',
      jump_type: '类型不能为空',
      link: '跳转内容不能为空'
    };
    let flag = true;
    Object.keys(tips).map(item => {
      if (!args[item]) {
        message.error(tips[item]);
        flag = false;
      }
    });
    return flag;
  };
  handleOk = (type) => {
    const { dispatch } = this.props;
    const { modalData, homepage } = this.state;
    const id = modalData.id;
    const _type = id ? 'trade/updatehomepage' : 'trade/createhomepage';
    let flag = this.validatingForm(modalData);
    let shortflag = true
    if(type === 'shortcut' && !modalData.label){
      message.error("名称不能为空")
      shortflag = false
    }
    let shopid = getLocalStorage('shopid');
    if (flag && shortflag) {
      const _data = {
        ...modalData,
        [modalData.jump_type]: modalData.jump_type === 'category' ? { url: modalData.link} : modalData.link,
        link: undefined,
        shop: shopid === 'all' ? undefined : shopid.split('#')[1]
      }
      const payload = id ? { type, id, data:{..._data}} : { type, _params:{ index:homepage[type].length + 1, ..._data } }
      dispatch({
        type: _type,
        payload: {
          ...payload
        },
      }).then(() => {
        this.setState({ bannervisible: false, entervisible:false})
          if(id){
          message.success("修改成功")
        }
        const updateIndex = this.compareIndex(type,homepage[type],homepage[`${type}Id`])
        if(!updateIndex){
          this.fetchhomeData(type);
        }
        setTimeout(() => this.setState({request:true }), 1000)
      });
    } else {
      this.setState({request:true})
    }
  };

  //表格拖拽
  handleDrag = (e,key) => {
    const { dragIndex, hoverIndex, dragRow } = e
    let { homepage, isIndex } = this.state
    let dataSource = homepage[key]
    const _dataSource = update(dataSource, {$splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]]})
    homepage[key] = [..._dataSource]
    !isIndex.includes(key) ? isIndex.push(key) : null
    this.setState({ homepage, isIndex })
  }
  //对比表格顺序
  compareIndex = (type, dataSource, dataSourceId) => {
    const { dispatch } = this.props;
    let { result } = this.state
    let isrequest = 0
    dataSource.map((item,index) => {
      if(item.id !== dataSourceId[index]){
        result.push({ ...item, index });
      }
    })
    this.setState({ result })
    result.map((item) => {
      dispatch({
        type: 'trade/updatehomepage',
        payload: {
          type,
          id: item.id,
          data: { ...item, id: undefined, key: undefined }
        }
      }).then((res) => {
        if (res) {
          isrequest = isrequest + 1
          this.setState({ isrequest })
        }
      })
    })
    return result.length > 0
  }
  //模块启用modal
  parthandle = (record) => {
    const { dispatch } = this.props
    const that = this;
    Modal.confirm({
      title: '确定操作',
      content: (<Fragment>确定 <span style={{color:'red'}}>{record.active ? '关闭' : '启用'}</span> {record.label}模块</Fragment>),
      centered: true,
      onOk() {
        dispatch({
          type:'trade/updatehomepage',
          payload:{
            type:'_module',
            id: record.id,
            data:{ active: !record.active }
          }
        }).then(() => {
          that.fetchhomeData('_module');
        })
      }
    })
  }
  parseLabel = (t, r, selectlist, label) => {
    const { homepage } = this.state
    let goods_type_label = ''
    if(t === 'goods_type'){
      const res = homepage._module.filter(item => item.module === r.goods_type)
      if(res.length > 0){
        goods_type_label = res[0].label;
      }
    }
    if(label){
      return (
        selectlist[t].label
          ? (t === 'goods' ? r[selectlist[t].label].goods_name : r[t].name)
          : goods_type_label
      )
    }
    return (
      <span>{selectlist[t].name}-
        {selectlist[t].label
          ? (t === 'goods' ? r[selectlist[t].label].goods_name : r[t].name)
          : goods_type_label}
        </span>
    )
  }
  //检测模块是否启用
  verifyModule = (key) => {
    const { homepage } = this.state
    return homepage._module.filter(item => item.active && item['module'] === key ).length
  }

  render() {
    const { tradeload, Loading, config } = this.props;
    const { homepage, goodlist, categorylist, bannervisible, entervisible, modalData, _visible,} = this.state;
    const _moudel = []
    let _moudelConfig = homepage._module
    if (config && config.subscription_switch === false)
      _moudelConfig = _moudelConfig.filter(({module}) => (module !==  "periodic"))
    _moudelConfig.map(item => {
      if (item.active) {
        _moudel.push({ ...item, url: item['module'] })
      }
    })
    const selectlist = {
      'goods':{ name:'商品详情', label:'goods_info', listdata: goodlist, api: "goods/searchGoodsData" },
      'goods_type':{ name:'商品类型', listdata: _moudel },
      'category':{ name:'商品分类', label:'name',
        listdata: categorylist.filter(item => item.is_active),
        api: "goods/fetchCategory"}
    }

    const wh = window.screen.height;

    const bannercolumn = [
      {
        title: '轮播图',
        dataIndex: 'image',
        key: 'image',
        render: (t) => <img src={t.file} width={60}/>
      },
    ];
    const entercolumn = [
      {
        title: '入口',
        dataIndex: 'image',
        key: 'image',
        render: (t) => <img src={t.file} width={40}/>
      },
      {
        title: '名称',
        dataIndex: 'label',
        key: 'label',
      },
    ];
    const jumpColumn = [
      {
        title: '跳转设置',
        dataIndex: 'jump_type',
        key: 'jump_type',
        render: (t,r) => this.parseLabel(t,r,selectlist),
      },
    ];
    const actionColumn_b = [
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 110,
        render: (t, r) => (
          <Fragment>
          <span onClick={() =>
            this.delModal('homebanner',r.url, this.parseLabel(r.jump_type,r,selectlist,'delete'))}>
            <a>删除</a>
          </span>
            <Divider type="vertical" />
            <span onClick={() => this.openModal(r,'banner')}>
            <a>编辑</a>
          </span>
          </Fragment>
        ),
      },
    ];
    const actionColumn_e = [
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 110,
        render: (t, r) => (
          <Fragment>
          <span onClick={() =>
            this.delModal('shortcut',r.url,this.parseLabel(r.jump_type,r,selectlist,'delete'))}>
            <a>删除</a>
          </span>
            <Divider type="vertical" />
            <span onClick={() => this.openModal(r,'enter')}>
            <a>编辑</a>
          </span>
          </Fragment>
        ),
      },
    ];
    const indexpartColums = [
      {
        title: '模块',
        dataIndex: 'label',
        key: 'label',
      },
      {
        title: '是否启用',
        dataIndex: 'active',
        key: 'active',
        render: (t,r) => <span onClick={() => this.parthandle(r)} style={{ cursor: 'pointer' }}>
          { t ? <Icon type="check-circle" theme="filled" style={{ color: 'green' }}/>
            : <Icon type="close-circle" theme="filled" style={{ color: 'red' }}/>
          }
          </span>
      },
    ];

    return (
      <PageHeaderWrapper>
        <Spin spinning={tradeload}>
          <Row gutter={16} type="flex">
            <Col sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 14 }} xl={{ span: 16 }}>
              <Card className={styles.main} title="首页轮播图设置"
                    extra={homepage.homebanner.length <= 4 && <Button type="primary" size="small" onClick={() => this.openModal({},'banner')}>新增</Button>}>
                <TableDrag dataSource={homepage.homebanner} columns={[...bannercolumn,...jumpColumn,...actionColumn_b]}
                           onChange={(e) => this.handleDrag(e,'homebanner')}/>
                <Modal
                  title="轮播图设置"
                  centered
                  zIndex={1001}
                  visible={bannervisible}
                  onOk={() => this.state.request && this.setState({request:false}, () => this.handleOk('homebanner'))}
                  onCancel={() => this.setState({ bannervisible: false })}>
                  <Spin spinning={Boolean(Loading)}>
                    <Form className={styles.editform}>
                      <FormItem label="轮播图片" help="支持jpg、jpeg、png格式，大小不超过2MB，建议尺寸为750*480">
                        <UploadImage
                          limit={1}
                          fileList={modalData.image ? [modalData.image] : []}
                          openSource={!modalData.image}
                          onChange={(e,list) => this.handleUpload(e,'image',list)}
                          handleSource={() => this._openModal(!modalData.image)}
                          restprops={{ openFileDialogOnClick: false }}
                        />
                      </FormItem>
                      <FormItem label="跳转类型">
                        <Select value={modalData.jump_type} onChange={(e) => this.handlelevel('jump_type', e)}>
                          <Option key="goods">商品详情</Option>
                          <Option key="goods_type">商品类型</Option>
                          <Option key="category">商品分类</Option>
                        </Select>
                      </FormItem>
                      <FormItem label="跳转内容">
                        <SelectSearch
                          datalist={selectlist[modalData.jump_type] && selectlist[modalData.jump_type].listdata || goodlist}
                          value={modalData.link}
                          searchKey={modalData.jump_type === 'goods' ? 'k' : 'name'}
                          dispatchType={selectlist[modalData.jump_type] && selectlist[modalData.jump_type].api}
                          onChange={(e) => this.handlelevel('link', e)}/>
                      </FormItem>
                    </Form>
                  </Spin>
                </Modal>
              </Card>
              <Card className={styles.main} title="快速入口设置"
                    extra={homepage.shortcut.length <= 7 && <Button type="primary" size="small" onClick={() => this.openModal({},'enter') }>新增</Button>}>
                <TableDrag dataSource={homepage.shortcut} columns={[...entercolumn,...jumpColumn,...actionColumn_e]}
                           onChange={(e) => this.handleDrag(e,'shortcut')}/>
                <Modal
                  title="快速入口设置"
                  centered
                  zIndex={1001}
                  visible={entervisible}
                  onOk={() => this.state.request && this.setState({request:false}, () => this.handleOk('shortcut'))}
                  onCancel={() => this.setState({ entervisible: false })}
                >
                  <Spin spinning={Boolean(Loading)}>
                    <Form className={styles.editform}>
                      <FormItem label="快速入口图片" help="支持jpg、jpeg、png格式，大小不超过2MB，建议尺寸为90*90">
                        <UploadImage
                          limit={1}
                          fileList={modalData.image ? [modalData.image] : []}
                          openSource={!modalData.image}
                          onChange={(e,list) => this.handleUpload(e,'image',list)}
                          handleSource={() => this._openModal(!modalData.image)}
                          restprops={{ openFileDialogOnClick: false }}
                        />
                      </FormItem>
                      <FormItem label="快速入口名称">
                        <Input style={{ width:'300px' }}
                               value={modalData.label}
                               onChange={(e) => this.handlelevel('label', e.target.value)}/>
                      </FormItem>
                      <FormItem label="跳转类型">
                        <Select value={modalData.jump_type} onChange={(e) => this.handlelevel('jump_type', e)}>
                          <Option key="goods_type">商品类型</Option>
                          <Option key="category">商品分类</Option>
                        </Select>
                      </FormItem>
                      <FormItem label="跳转内容">
                        <SelectSearch
                          datalist={selectlist[modalData.jump_type] && selectlist[modalData.jump_type].listdata || categorylist}
                          value={modalData.link}
                          dispatchType={selectlist[modalData.jump_type] && selectlist[modalData.jump_type].api}
                          onChange={(e) => this.handlelevel('link', e)}/>
                      </FormItem>
                    </Form>
                  </Spin>
                </Modal>
              </Card>
              <Card className={styles.main} title="首页模块设置">
                <Table dataSource={_moudelConfig} size="small" columns={indexpartColums} pagination={false} />
              </Card>
            </Col>
            <Col md={{ span: 12 }} lg={{ span: 10 }} xl={{ span: 8 }} style={{maxWidth: '460px'}}>
              <Card title="首页预览">
                <div className={styles.onineshow} style={{height:'auto'}}>
                  <img src={indexTop} width="100%"/>
                  <img src={search} width="100%"/>
                </div>
                <div className={styles.onineshow}>
                  <Carousel autoplay>
                    { homepage.homebanner.map(item =>
                        <div>{item.image && <img src={item.image.file} style={{ width: '100%', height: '150px'}}/>}</div>
                    )}
                  </Carousel>
                  <Row style={{ margin:5 }}>
                    { homepage.shortcut.map(item =>
                      <Col span={6} style={{ textAlign:'center', margin: '5px 0' }}>
                        <Avatar size="large" src={item.image && item.image.file}/>
                        <div style={{marginTop: 3,fontSize: 12}}>{item.label}</div>
                      </Col>
                    )}
                  </Row>
                  { this.verifyModule('grouping') && <img src={groupbuy} width="100%"/> || null }
                  {/*{ this.verifyModule('periodic') && <img src={delivery} width="100%"/> || null}*/}
                  { this.verifyModule('recommendation') && <img src={recommend} width="100%"/> || null}
                  { this.verifyModule('credit') && <img src={integrate} width="100%"/> || null}
                </div>
                <div className={styles.onineshow} style={{height:'auto'}}>
                  <img src={bottom} width="100%"/>
                </div>
              </Card>
            </Col>
          </Row>
          <Modal width="60%" title="素材选择"
                 visible={_visible}
                 mask={false}
                 zIndex={1003}
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
    );
  }
}

export default DragDropContext(HTML5Backend)(indexPage);
