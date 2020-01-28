import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
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
  Input,
  Divider,
  InputNumber,
} from 'antd';
import styles from './trade.less';
import UploadImage from '@/components/CostomCom/uploadImage';
import SourceImageTab from '@/components/CostomCom/sourceImage';

const itemsPerPage = 10;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
const FormItem = props => <Form.Item required {...formItemLayout} {...props} />;

@connect(({ trade, upload, loading }) => ({
  levelList: trade.levelList,
  levelCount: trade.levelCount,
  levelloading: loading.effects['trade/fetchlevelList'],
  Loading: loading.effects['upload/createImage'],
}))
class Userlevel extends Component {
  state = {
    page: 1,
    visible: false,
    levelform: {},
    loading: false,
    previewImage: '',
    previewVisible: false,
    fileList: [],
    iconurl: null,
    selectList: [],
    _selectList: [],
    _visible: false
  };

  columns = [
    {
      title: '会员等级名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '充值金额门槛（元）',
      dataIndex: 'threshold',
      key: 'threshold',
      render: t => <span>￥{t}</span>,
    },
    {
      title: '会员折扣',
      dataIndex: 'discount',
      key: 'discount',
      render: t => <span>{t}%</span>,
    },
    {
      title: '等级图标',
      dataIndex: 'icon_info',
      key: 'icon_info',
      render: t => <img src={t} width={30} />,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 160,
      render: (t, r) => (
        <Fragment>
          <span onClick={() => this.delModal(r.id, r.title)}>
            <a>删除</a>
          </span>
          <Divider type="vertical" />
          <span onClick={() => this.openModal(r)}>
            <a>编辑</a>
          </span>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    this.initData();
  }
  initData = () => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: 'trade/fetchlevelList',
      payload: {
        page: 1,
        page_size: itemsPerPage,
      },
    }).then(() => {
      this.setState({ loading: false });
    });
  };

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
    const fileList = [{..._selectList[0], key: undefined, index: undefined }]
    _selectList[0] && this.handlelevel('icon', _selectList[0].url )
    this.setState({ _visible: false, fileList, _selectList:[] })
  }

  //图标上传
  handleUpload = (res,key,list) => {
    let fileList = []
    if(!!list){
      fileList = []
      this.handlelevel(key,null)
    }
    else{
      fileList = [{...res}]
      this.handlelevel(key,res.url)
    }
    this.setState({ fileList });
  };

  //数据的增删改
  openModal = res => {
    let obj = { label: '图标', file: res.icon_info, key: res.url };
    let fileList = res.icon_info ? [obj] : [];
    this.setState({
      levelform: { ...res },
      visible: true,
      fileList,
    });
  };
  handlelevel = (key, e) => {
    const { levelform } = this.state;
    levelform[key] = e;
    this.setState({ levelform });
  };
  delModal = (id, name) => {
    const { page } = this.state;
    const { dispatch } = this.props;
    const that = this;
    Modal.confirm({
      title: '确认删除 ',
      content: `确认删除 ${name} 会员等级`,
      centered: true,
      okText: '确认删除 ',
      okType: 'danger',
      cancelText: '取消 ',
      onOk() {
        that.setState({ loading: true });
        dispatch({
          type: 'trade/dellevelData',
          payload: { id: id },
        })
          .then(() => {
            dispatch({
              type: 'trade/fetchlevelList',
              payload: {
                page,
                page_size: itemsPerPage,
              },
            }).then(() => {
              that.setState({ loading: false });
              message.success('删除成功');
            });
          })
          .catch(() => {
            that.setState({ loading: false });
            message.error('删除失败');
          });
      },
    });
  };
  validatingForm = args => {
    let tips = {
      title: '名称不能为空',
      discount: '折扣不能为空 ',
      threshold: '等级门槛不能为空',
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
  handleOk = () => {
    const { dispatch } = this.props;
    const { levelform } = this.state;
    this.setState({ loading: true });
    const id = levelform.id;
    const _type = id ? 'trade/updatelevelData' : 'trade/createlevelData';
    let flag = this.validatingForm(levelform);
    if (flag) {
      const _data = id ? { id, data: { ...levelform } } : { ...levelform };
      dispatch({
        type: _type,
        payload: { ..._data },
      }).then(() => {
        this.initData();
      });
      this.setState({ visible: false });
    } else {
      this.setState({ loading: false });
    }
  };

  render() {
    const { levelList, levelCount, Loading } = this.props;
    const { fileList, visible, loading, levelform, _visible } = this.state;
    const pagination = {
      pageSize: itemsPerPage,
      total: levelCount,
      onChange: page => {
        this.setState({ page });
        const { dispatch } = this.props;
        dispatch({
          type: 'trade/fetchlevelList',
          payload: {
            page: page,
            page_size: itemsPerPage,
          },
        });
      },
    };

    const wh = window.screen.height;

    return (
      <PageHeaderWrapper>
        <Spin spinning={loading}>
          <Card className={styles.main}>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: 20 }}>
                  <Button
                    type="primary"
                    style={{ marginLeft: 30 }}
                    onClick={() => this.openModal({})}
                  >
                    + 新增
                  </Button>
                </div>
              </Col>
            </Row>
            <Table dataSource={levelList} columns={this.columns} pagination={pagination} />
            <Modal
              title="会员等级"
              centered
              visible={visible}
              onOk={this.handleOk}
              onCancel={() => this.setState({ visible: false })}
            >
              <Spin spinning={Boolean(Loading)}>
              <Form className={styles.editform}>
                <FormItem label="会员等级名称">
                  <Input
                    placeholder="请输入名称"
                    value={levelform.title}
                    style={{ width: 200 }}
                    onChange={e => this.handlelevel('title', e.target.value)}
                  />
                </FormItem>
                <FormItem label="充值金额门槛（元）">
                  <InputNumber
                    placeholder="请输入金额"
                    style={{ width: 200 }}
                    value={levelform.threshold}
                    min={0}
                    step={0.01}
                    onChange={e => this.handlelevel('threshold', e)}
                  />
                </FormItem>
                <FormItem label="会员折扣（%）">
                  <InputNumber
                    placeholder="请输入折扣"
                    style={{ width: 200 }}
                    value={levelform.discount}
                    max={100}
                    min={0}
                    onChange={e => this.handlelevel('discount', e)}
                  />
                </FormItem>
                <FormItem label="等级图标" required={false}>
                  <UploadImage
                    limit={1}
                    fileList={fileList}
                    openSource={fileList.length < 1}
                    onChange={(e,list) => this.handleUpload(e,'icon',list)}
                    handleSource={() => this._openModal(fileList.length < 1)}
                    restprops={{ openFileDialogOnClick: false }}
                  />
                </FormItem>
              </Form>
              </Spin>
            </Modal>
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
    );
  }
}

export default Userlevel;
