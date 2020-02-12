import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import moment from 'moment';
import {
  Input,
  Button,
  Table,
  message,
  Card,
  Icon,
  Row,
  Col,
  DatePicker, Spin,
  Modal, Divider,
  Switch
} from 'antd';
import { setLocalStorage } from '@/utils/authority';
import { permissionAuth } from '@/utils/permission';
import styles from './editpage.less';
import CollapseItem from '@/components/CostomCom/collapseItem';

const { RangePicker } = DatePicker;
const itemsPerPage = 10;
const Confirm = props =>
  Modal.confirm({
    title: '确认操作',
    centered: true,
    okText: '确定',
    cancelText: '取消',
    ...props
  });

@connect(({ video, global, loading }) => ({
  permissions: global.permissions,
  video_switch: video.video_switch,
  searchform: global.searchform,
  videolist: video.videolist,
  videolistCount: video.videolistCount,
  Loading: loading.models.video,
}))
class Videolist extends Component {
  state = {
    searchform: {},
    page: 1,
    fixed: 0,
    videoDetail: {},
    visible: false,
    click: true,
    videoVisible: false,
    videoSrc: '',
  };

  columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: t => <div style={{maxWidth: 300}}>{t}</div>
    },
    {
      title: '短视频',
      dataIndex: 'video',
      key: 'video',
      render: (t,r) => <span onClick={() => this.previewVideo(t)}>
        {/*<img src={t+'?iframe/jpg/offset/1/'} width={50} height={50}/>*/}
        <video src={t} width={50} height={50}/>
      </span>
    },
    {
      title: 'Up主',
      dataIndex: 'user_info',
      key: 'user_info',
      align: 'left',
      render: (t) => (
        <Fragment>
          <Link style={{color:"rgba(0, 0, 0, 0.65)"}} to={{ pathname: `/user/userlist/edituser`, query:{id: t.id }} }>
            <img src={t.avatar_url} width="30" height="30" alt="" />
            <span style={{display:'inline-block',verticalAlign:'middle',maxWidth:'150px',
              overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',marginLeft: 10 }}>
              {t.nickname}
            </span>
          </Link>
        </Fragment>
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: t => (t ? moment(t).format('YYYY-MM-DD HH:mm:ss') : null),
    },
    // {
    //   title: '总观看量',
    //   dataIndex: 'browse',
    //   key: 'browse',
    // },
    {
      title: '状态',
      dataIndex: 'is_open',
      key: 'is_open',
      render: (t, r) => (
        <span
          onClick={() => this.handleStatus(r.id, t)}
          style={{ cursor: 'pointer' }}
        >
          {t ? (
            <Icon type="check-circle" theme="filled" style={{ color: 'green' }} />
          ) : (
            <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
          )}
        </span>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (t, r) => (
        <Fragment>
          <a onClick={() => this.editVideo(r)}>编辑</a>
          <Divider type="vertical" />
          <a onClick={() => this.blockUser(r.user_info.id)}>屏蔽该用户</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    this.initdata('init');
    const {dispatch} = this.props;
    dispatch({
      type: 'video/getSwitchVideoData',
    })
  }

  initdata = type => {
    const {
      dispatch,
      searchform: { video },
    } = this.props;
    const { searchform } = this.state;
    let _searchform = {};
    if (type === 'init') {
      _searchform = { ...video };
      this.setState({ searchform: { ...video } });
    } else if (type === 'reset') {
      this.setState({ searchform: {} });
    } else if (type === 'search') {
      _searchform = { ...searchform, page: 1 };
      this.setState({ searchform: { ..._searchform } });
    } else {
      _searchform = { ...searchform };
    }
    dispatch({
      type: 'video/fetchVideo',
      payload: {
        page_size: itemsPerPage,
        ..._searchform,
      },
    });
  };

  // 编辑视频
  editVideo = (row) => {
    this.setState({videoDetail: row, visible: true});
  };

  // 预览视频
  previewVideo = (src) => {
    this.setState({
      videoVisible: true,
      videoSrc: src,
    })
  };

  // 切换状态
  handleStatus = (id, is_open) => {
    const {dispatch} = this.props;
    const self = this;
    Confirm({
      content: `确定${is_open ? '屏蔽' : '开放'}该视频`,
      onOk() {
        dispatch({
          type: 'video/changeVideoData',
          payload: {
            id,
            is_open: !is_open,
          }
        }).then(res => {
          if (res) {
            self.initdata();
          }
        })
      }
    });
  }

  // 屏蔽用户
  blockUser = (id) => {
    const {dispatch} = this.props;
    const self = this;
    Confirm({
      content: '确定屏蔽该用户的视频',
      onOk() {
        dispatch({
          type: 'video/blockUser',
          payload: {
            user: id,
          }
        }).then(res => {
          if (res) {
            self.initdata();
          }
        })
      }
    });
  }

  handleSearchChange = (e, key) => {
    const { searchform } = this.state;
    searchform[key] = e;
    this.setState({ searchform });
  };

  ondateChange = (date, stringData) => {
    const { searchform } = this.state;
    searchform.create_time_after = stringData[0];
    searchform.create_time_before = stringData[1];
    this.setState({ searchform });
  };

  handleSearch = () => {
    this.initdata('search');
  };

  changeVideoSwitch = (e) => {
    const {dispatch} = this.props;
    Confirm({
      content: e ? '确定启动短视频功能' : `确定关闭短视频功能，关闭后用户将无法体验`,
      onOk() {
        dispatch({
          type: 'video/switchVideoData',
          payload: {
            video_switch: e
          }
        })
      }
    });

  }

  render() {
    const { searchform, videoDetail, visible, click, videoVisible, videoSrc } = this.state;
    const { Loading, videolist, videolistCount, video_switch  } = this.props
    const wh = window.screen.height;
    const pagination = {
      pageSize: itemsPerPage,
      current: searchform.page,
      total: videolistCount,
      onChange: page => {
        this.setState({
          searchform: { ...searchform, page }
          }, () => this.initdata()
        );
      },
    };

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.main}>
            <Spin spinning={false}>
              <CollapseItem
                renderSimpleForm={() => (
                  <Fragment>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>标题: </span>
                      <Input
                        onChange={e => {
                          this.handleSearchChange(e.target.value, 'title');
                        }}
                        value={searchform.title}
                        placeholder="请输入标题"
                        style={{ width: 200 }}
                      />
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>Up主: </span>
                      <Input
                        onChange={e => {
                          this.handleSearchChange(e.target.value, 'nickname');
                        }}
                        value={searchform.nickname}
                        placeholder="请输入Up主"
                        style={{ width: 200 }}
                      />
                    </div>
                    <div className={styles.searchitem}>
                      <span className={styles.searchitem_span}>上传时间: </span>
                      <RangePicker
                        value={
                          searchform.create_time_after
                            ? [
                              moment(searchform.create_time_after, 'YYYY-MM-DD'),
                              moment(searchform.create_time_before, 'YYYY-MM-DD'),
                            ]
                            : null
                        }
                        onChange={this.ondateChange}
                      />
                    </div>
                  </Fragment>
                )}
              />
            </Spin>
            <div style={{ marginBottom: 20 }}>
              <Row>
                <Col span={12}>
                  所有用户均可上传（被屏蔽用户除外）：
                  <Switch checked={video_switch} onChange={(e) => this.changeVideoSwitch(e)}/>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Button type="primary" style={{ marginRight: 30 }} onClick={this.handleSearch}>
                    查询
                  </Button>
                  <Button type="danger" onClick={() => this.initdata('reset')}>
                    重置
                  </Button>
                </Col>
              </Row>
            </div>
            <Table
              loading={Loading}
              dataSource={videolist}
              columns={this.columns}
              pagination={pagination}
              rowKey="id"
            />
          </div>
        </Card>
        <Modal
          title={'编辑标题'}
          centered
          visible={visible}
          onCancel={() => this.setState({visible: false})}
          onOk={() => {
            const self = this;
            const {dispatch} = this.props;
            if (!videoDetail.title) {
              message.error('标题不能为空');
              return;
            }
            if (click) {
              this.setState({click: false, visible: false}, () => {
                dispatch({
                  type: 'video/changeVideoData',
                  payload: {
                    id: videoDetail.id,
                    title: videoDetail.title,
                  },
                }).then(res => {
                  self.setState({visible: false, click: true})
                  if (res) {
                    self.initdata();
                  }
                })
              });
            }
          }}>
          <Input
            value={videoDetail.title}
            onChange={(e) => {
              if(e.target.value.length > 40) {
                message.error('标题字数不超过40字');
                return;
              }
              this.setState({videoDetail: {...videoDetail, title: e.target.value}})
            }}/>
        </Modal>
        <Modal
          centered
          title={'视频预览'}
          visible={videoVisible}
          bodyStyle={{maxHeight: `${wh-300}px`, display: 'flex', justifyContent: 'center'}}
          footer={null}
          destroyOnClose
          onCancel={() => this.setState({ videoVisible: false })}>
          <video src={videoSrc} controls style={{maxWidth: '100%', maxHeight:`${wh-360}px`}}/>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default Videolist;
