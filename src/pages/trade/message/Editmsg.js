import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva'
import { getLocalStorage } from '@/utils/authority'
import {
  Input,
  Form,
  Button,
  Card,
  Switch,
  Icon,
  message,
  Row,
  Col,
  Spin,
  InputNumber
} from 'antd'
import styles from '../trade.less';

const FormItem = Form.Item;

@connect(({ trade, global, loading }) => ({
  shopid: global.shopid,
  shoploading: loading.effects['trade/fetchShopData'],
}))
class Editmsg extends Component {
  state = {
    title:null,
    content:null,
    is_active:true,
    index:1,
    loading:false
  };

  componentDidMount(){
    const { dispatch, location } = this.props;
    let id = location.query.id
    if(id ){
      this.setState({ loading:true })
      dispatch({
        type:'trade/fetchShopData',
        payload: { id }
      }).then((res) => {
        this.setState({
          title:res.title,
          content:res.content,
          is_active:res.is_active,
          index:res.index,
          loading:false
        })
      })
    }
  }

  componentDidUpdate(preprops){
    const { shopid } = this.props
    if(preprops.shopid !== shopid && shopid !== ''){
      message.info("店铺消息不分门店")
    }
  }

  //验证提交
  validatingForm = (args) => {
    let tips = {
      'title':'标题不能为空',
      'content': '内容不能为空 ',
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
  handlesubmit = () => {
    const { title, content, is_active, index } = this.state
    const { dispatch, location } = this.props;
    let flag = this.validatingForm({title, content})
    let id = location.query.id
    const data = { title, content, is_active, index }
    let _data = id ? {id,data} : data
    if(flag){
      this.setState({ loading: true })
      dispatch({
        type: id ? 'trade/updateShop' : 'trade/createShop',
        payload: {
          ..._data
        }
      }).then(() => {

      }).catch(() => { this.setState({ loading: false }) })
    }
  }

  render(){
    const { title, content, is_active, index, loading } = this.state
    const { location } = this.props;
    let id = location.query.id

    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 18 }
    };

    return(
      <PageHeaderWrapper >
        <Spin spinning={loading}>
        <Card className={styles.main} title={id ? '编辑信息' : '新增信息'}>
          <Form className={styles.editform}>
            <FormItem label="消息标题" required {...formItemLayout}>
              <Input
                placeholder='请输入消息标题'
                value={title}
                onChange={(e) => this.setState({ title: e.target.value })}
              />
            </FormItem>
            <FormItem label="消息内容" required {...formItemLayout}>
              <Input.TextArea
                placeholder='请输入消息内容'
                value={content}
                rows={4}
                onChange={(e) => this.setState({ content: e.target.value })}
              />
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              <InputNumber
                placeholder='请输入排序'
                value={index}
                style={{width:200}}
                onChange={(e) => this.setState({ index: e })}
              />
            </FormItem>
            <FormItem label="是否启用" {...formItemLayout}>
              <Switch
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="close" />}
                checked={is_active}
                onChange={(e) => this.setState({ is_active: e })}
              />
            </FormItem>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Link to={{pathname:`/trade/shopmessage`}}>
                  <Button>取消</Button>
                </Link>
                <Button type='primary' style={{ marginLeft: 8 }} onClick={this.handlesubmit}>保存</Button>
              </Col>
            </Row>
            <FormItem>

            </FormItem>
          </Form>
        </Card>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}

export default Editmsg
