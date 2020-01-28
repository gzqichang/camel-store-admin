import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import {
  Input,
  InputNumber,
  Form,
  Button,
  Card,
  Upload,
  Icon,
  message,
  Row,
  Col,
  Select
} from 'antd'
import styles from './editrole.less'

const FormItem = Form.Item;
const Option = Select.Option;

function beforeUpload(file) {
  const isJPG = file.type === 'image/jpeg';
  if (!isJPG) {
    message.error('You can only upload JPG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJPG && isLt2M;
}

function onChange(e) {
  // console.log('changed', value);
}

class Edituser extends Component {
  state = {
    loading: false,
    value: 1,
    isfee: false
  };

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, imageUrl => this.setState({
        imageUrl,
        loading: false,
      }));
    }
  }
  onFeeChange = () => {
    const { isfee }  = this.state
    this.setState({ isfee: !isfee });
  }
  render(){

    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
      </div>
    );
    const imageUrl = ''
    const uploadImage = (
      <Fragment>
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action="//jsonplaceholder.typicode.com/posts/"
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
      >
        {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
      </Upload>
      支持PNG, JPG, 图片大小不超过200K，建议像素为900 * 500。
      </Fragment>
    )

    const formItemLayout = {
      labelCol: { span: 2 }
    };

    return(
      <PageHeaderWrapper >
        <Card className={styles.main}>
          <Form className={styles.editform}>
            <FormItem label="订单号" {...formItemLayout}>
              <Input
                style={{ width: 250 }}
                disabled={true}
                defaultValue='20180930122225656'
              />
            </FormItem>
            <FormItem label="商品名" {...formItemLayout}>
              <Input
                style={{ width: 250 }}
                placeholder='请输入商品名称'
              />
            </FormItem>
            <FormItem label="规格" {...formItemLayout}>
              <Input
                style={{ width: 250 }}
                placeholder='请输入规格'
              />
            </FormItem>
            <FormItem label="订单状态" {...formItemLayout}>
              <Select defaultValue="待付款" style={{ width: 150 }}>
                <Option value="待付款">待付款</Option>
                <Option value="待发货">待发货</Option>
                <Option value="待收货">待收货</Option>
                <Option value="已收货">已收货</Option>
                <Option value="已失效">已失效</Option>
              </Select>
            </FormItem>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button>取消</Button>
                <Button type='primary' style={{ marginLeft: 8 }}>保存</Button>
              </Col>
            </Row>
            <FormItem>

            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    )
  }
}

export default Edituser
