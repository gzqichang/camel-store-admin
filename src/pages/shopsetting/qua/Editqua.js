import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import {
  Input,
  InputNumber,
  Form,
  Button,
  Card,
  message,
  Row,
  Col
} from 'antd'
import styles from '../shopsetting.less'

const FormItem = Form.Item;

@connect(({ shopsetting, global, loading }) => ({
  shopid: global.shopid,
  quaLoading: loading.effects['shopsetting/fetchFaqdata'],
}))
class Editqua extends Component {
  state = {
    title:null,
    content:null,
    index:0
  };

  componentDidMount(){
    const { dispatch, location } = this.props
    let id = location.query.id
    if(id){
      dispatch({
        type:'shopsetting/fetchFaqdata',
        payload:{ id }
      }).then((res) => {
        this.setState({
          title:res.title,
          content:res.content,
          index:res.index
        })
      })
    }
  }

  componentDidUpdate(preprops){
    const { shopid } = this.props
    if(preprops.shopid !== shopid && shopid !== ''){
      message.info("常见问题不分门店")
    }
  }

  validatingForm = (args) => {
    let tips = {
      'title':'问题不能为空',
      'content': '回答不能为空 '
    };
    let flag = false
    Object.keys(tips).map(item => {
      flag = true
      if(!args[item]){
        message.error(tips[item]);
        flag = false
      }
    })
    return flag;
  }

  handleSubmit = () => {
    const { dispatch, location } = this.props
    const { title, content, index } = this.state
    let id = location.query.id
    let flag = this.validatingForm({title,content})
    if(flag){
      if(id){
        dispatch({
          type:'shopsetting/updateFaqData',
          payload:{
            id,
            data:{
              title,
              content,
              index
            }
          }
        })
      }
      else{
        dispatch({
          type:'shopsetting/createFaqData',
          payload:{ title, content, index }
        })
      }
    }
  }

  render(){
    const { location:{ quaid } } = this.props
    const { title, content, index } = this.state
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 20 },
    };
    let id = getLocalStorage('quaid')

    return(
      <PageHeaderWrapper >
        <Card className={styles.main} title={quaid || id ? '编辑问题' : '新增问题'}>
          <Form className={styles.editform}>
            <FormItem label="问题" required {...formItemLayout}>
              <Input
                placeholder='请输入问题'
                value={title}
                onChange={(e) => this.setState({title:e.target.value})}
              />
            </FormItem>
            <FormItem label="回答" required {...formItemLayout}>
              <Input.TextArea
                placeholder='请输入答案'
                value={content}
                rows={5}
                onChange={(e) => this.setState({content:e.target.value})}
              />
            </FormItem>
            <FormItem label="排序" required {...formItemLayout}>
              <InputNumber
                style={{ width: 200 }}
                value={index}
                min={0}
                onChange={(e) => this.setState({index:e})}
              />
            </FormItem>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Link to='/setting/quacontent'>
                  <Button>取消</Button>
                </Link>
                <Button type='primary' style={{ marginLeft: 8 }} onClick={this.handleSubmit}>保存</Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </PageHeaderWrapper>
    )
  }
}

export default Editqua
