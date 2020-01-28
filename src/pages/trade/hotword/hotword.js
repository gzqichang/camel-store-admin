import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import {
  Button,
  Card,
  Table,
  Modal,
  Row,
  Col,
  Divider,
  Input,
  InputNumber,
  Form, message,
} from 'antd';
import styles from '../trade.less'

const itemsPerPage = 10;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};
const FormItem = props => <Form.Item required {...formItemLayout} {...props}/>

@connect(({ trade, loading }) => ({
  hotword:trade.hotword,
  hotwordCount:trade.hotwordCount,
  hotwordloading: loading.effects['trade/fetchHotword'],
}))
class Hotword extends Component {
  state = {
    page:1,
    visible:false,
    word:null,
    index:null,
    id:null
  }

  columns = [
    {
      title: '搜索热词',
      dataIndex: 'word',
      key: 'word',
    }, {
      title: '排序',
      dataIndex: 'index',
      key: 'index',
    }, {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (t, r) =>(
        <Fragment>
          <span onClick={() => this.delModal(r.id,r.word)}>
           <a>删除</a></span>
            <Divider type="vertical" />
            <span onClick={() => this.openModal(r)}>
              <a>编辑</a>
          </span>
        </Fragment>
      )
   }];

  componentDidMount() {
    this.initData('init')
  }
  initData = (type) => {
    const { dispatch } = this.props;
    const { page } = this.state
    dispatch({
      type: 'trade/fetchHotword',
      payload: {
        page: type ? 1 : page,
        page_size:itemsPerPage
      }
    })
  }

  //数据的增删改
  openModal = (res) => {
    this.setState({
      word:res.word,
      index:res.index,
      id:res.id,
      visible: true
    })
  }
  delModal = (id,name) => {
    const { dispatch } = this.props
    const that = this
    Modal.confirm({
      title: '确认删除 ',
      content: `确认删除 ${name} 搜索热词`,
      okText: '确认删除 ',
      centered: true,
      okType: 'danger',
      cancelText: '取消 ',
      onOk() {
        dispatch({
          type: 'trade/deleteHotword',
          payload: { id: id },
        }).then(() => {
          message.success('删除成功')
          that.initData()
        });
      },
    });
  }
  handleOk = () => {
    const { dispatch } = this.props
    const { word, index, id } = this.state
    let data = { word, index}
    let _data = id ? { id, data } : {...data}
    dispatch({
      type:id ? 'trade/updateHotword' :'trade/createHotword' ,
      payload:{
        ..._data
      }
    }).then(() => {
      this.initData()
    })
    this.setState({ visible: false })
  }

  render(){
    const { hotwordCount, hotword , hotwordloading } = this.props
    const { visible, word, index } = this.state

    const pagination = {
      pageSize: itemsPerPage,
      total: hotwordCount,
      onChange: (page) => {
        this.setState({ page });
        const { dispatch } = this.props;
        dispatch({
          type:'trade/fetchHotword',
          payload: {
            page,
            page_size:itemsPerPage
          }
        });
      },
    };

    return(
      <PageHeaderWrapper>
      <Card className={styles.main}>
        <Row>
        <Col span={24} style={{ textAlign: 'right' }}>
          <div style={{marginBottom: 20}}>
            <Button type="primary" style={{marginLeft: 30}} onClick={() => this.openModal({})}> + 新增</Button>
          </div>
        </Col>
        </Row>
        <Table
          loading={hotwordloading}
          dataSource={hotword}
          columns={this.columns}
          pagination={pagination}
        />
        <Modal
          title="搜索热词"
          centered
          visible={visible}
          onOk={this.handleOk}
          onCancel={() => this.setState({ visible: false})}>
          <Form className={styles.editform}>
            <FormItem label="搜索热词">
              <Input
                placeholder='请输入搜索热词'
                value={word}
                onChange={(e) => this.setState({word:e.target.value})}
              />
            </FormItem>
            <FormItem label="排序">
              <InputNumber
                placeholder='请输入排序'
                style={{ width: 200 }}
                value={index}
                onChange={(e) => this.setState({index:e})}
              />
            </FormItem>
          </Form>
        </Modal>
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default Hotword
