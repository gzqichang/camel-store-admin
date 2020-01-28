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
  Row,
  Col,
  Spin,
  Divider, InputNumber, Icon, Switch,
} from 'antd';
import styles from './trade.less'

const itemsPerPage = 10;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 15 },
};
const FormItem = props => <Form.Item required {...formItemLayout} {...props}/>

@connect(({ trade }) => ({
  rechargetypelist:trade.rechargetypelist,
  rechargetypeCount:trade.rechargetypeCount
}))
class Prerecharge extends Component {
  state = {
    page:1,
    visible:false,
    amount:null,
    real_pay:null,
    proposal:null,
    id:null,
    loading:false
  }

  columns = [
    {
      title: '充值金额（元）',
      dataIndex: 'amount',
      key: 'amount',
    }, {
      title: '实付金额（元）',
      dataIndex: 'real_pay',
      key: 'real_pay',
    }, {
      title: '推荐',
      dataIndex: 'proposal',
      key: 'proposal',
      render: (t) => (
        <Fragment>
          {t ?
            <Icon type="check-circle" theme="filled" style={{color:'green'}}/> :
            <Icon type="close-circle" theme="filled" style={{color:'red'}} />}
        </Fragment>
      ),
    }, {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (t, r) =>(
        <Fragment>
          <span onClick={() => this.delModal(r.id,r.amount,r.real_pay)}>
           <a href='javascript:;'>删除</a></span>
          <Divider type="vertical" />
          <span onClick={() => this.openModal(r)}>
              <a href='javascript:;'>编辑</a>
          </span>
        </Fragment>
      )
    }];

  componentDidMount() {
    this.initData()
  }
  initData = () => {
    const { dispatch } = this.props;
    this.setState({ loading:true })
    dispatch({
      type: 'trade/fetchrecharge',
      payload: {
        page: 1,
        page_size:itemsPerPage
      }
    }).then(() => {
      this.setState({ loading:false })
    })
  }

  //数据的增删改
  openModal = (res) => {
    this.setState({
      amount:res.amount,
      real_pay:res.real_pay,
      proposal:res.proposal,
      id:res.id,
      visible: true
    })
  }
  delModal = (id,amount,real_pay) => {
    const { page } = this.state
    const { dispatch } = this.props
    const that = this
    Modal.confirm({
      title: '确认删除 ',
      content: `确认删除充值 ￥${real_pay}，获得￥${amount} 的优惠充值`,
      centered: true,
      okText: '确认删除 ',
      okType: 'danger',
      cancelText: '取消 ',
      onOk() {
        that.setState({ loading:true })
        dispatch({
          type: 'trade/delrecharge',
          payload: { id: id },
        }).then(() => {
          dispatch({
            type:'trade/fetchrecharge',
            payload:{
              page,
              page_size:itemsPerPage
            }
          }).then(() => {
            that.setState({ loading:false })
            message.success('删除成功')
          })
        }).catch(() => {
          that.setState({ loading:false })
          message.error('删除失败')
        })
      },
    });
  }
  validatingForm = (args) => {
    let tips = {
      'amount':'充值金额不能为空',
      'real_pay': '实付金额不能为空 ',
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
  handleOk = () => {
    const { dispatch } = this.props
    const { amount, real_pay, proposal, id } = this.state
    const defaultdata = { amount, real_pay, proposal }
    const _type = id ? 'trade/updaterecharge' : 'trade/createrecharge'
    const _data = id ? { id, data:{...defaultdata} } : {...defaultdata}
    let flag = this.validatingForm(defaultdata)
    this.setState({ loading:true })
    if(flag){
      dispatch({
        type:_type,
        payload:{..._data}
      }).then(() => {
        this.initData()
      })
      this.setState({ visible: false })
    }else{
      this.setState({ loading:false })
    }
  }

  render(){
    const { rechargetypelist } = this.props
    const { amount, real_pay, proposal, visible, loading } = this.state

    return(
      <PageHeaderWrapper>
        <Spin spinning={loading}>
        <Card className={styles.main}>
          <Row>
          <Col  span={24} style={{ textAlign: 'right' }}>
            <div style={{marginBottom: 20}}>
              <Button type="primary" style={{marginLeft: 30}} onClick={() => this.openModal({})}> + 新增</Button>
            </div>
          </Col>
          </Row>
          <Table
            dataSource={rechargetypelist}
            columns={this.columns}
            pagination={false}
          />
          <Modal
            title="优惠充值"
            centered
            visible={visible}
            onOk={this.handleOk}
            onCancel={() => this.setState({ visible: false})}>
            <Form className={styles.editform}>
              <FormItem label="充值金额（元）">
                <InputNumber
                  placeholder='请输入充值金额'
                  value={amount}
                  style={{ width: 250 }}
                  min={0}
                  onChange={(e) => this.setState({amount:e})}
                />
              </FormItem>
              <FormItem label="实付金额（元）">
                <InputNumber
                  placeholder='请输入金额'
                  style={{ width: 250 }}
                  value={real_pay}
                  min={0}
                  onChange={(e) => this.setState({real_pay:e})}
                />
              </FormItem>
              <FormItem label="推荐">
                <Switch
                  checked={proposal}
                  onChange={(e) => this.setState({proposal:e})}/>
              </FormItem>
            </Form>
          </Modal>
        </Card>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}

export default Prerecharge
