import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import { connect } from "dva";
import { setLocalStorage, getLocalStorage } from "@/utils/authority";
import { InputNumber, Form, Button, Card, Spin, message, Modal } from "antd";
import styles from "../trade.less";
import UploadImage from "@/components/CostomCom/uploadImage";
import SourceImageTab from "@/components/CostomCom/sourceImage";

const FormItem = Form.Item;

@connect(({ trade, global, loading }) => ({
  bonus_switch: global.bonus_switch,
  rebate_switch: global.rebate_switch,
  bonus: trade.bonus,
  rebate: trade.rebate,
  loading: loading.models.trade
}))
class Expand extends Component {
  state = {
    bonus: null,
    rebate: null,
    _visible: false,
    store_poster: null
  };

  componentDidMount() {
    this.init();
  }
  init = () => {
    const { dispatch } = this.props;
    this.setState({ expandLoading: true });
    dispatch({
      type: "trade/getExpandData"
    }).then(res => {
      this.setState({
        bonus: res.bonus,
        rebate: res.rebate
      });
    });
    dispatch({
      type: "trade/getStorePoster",
      payload: {
        type: "storeposter"
      }
    }).then(res => {
      if (res) {
        this.setState({ store_poster: res.store_poster });
      }
    });
  };

  handleSubmit = () => {
    const { dispatch } = this.props;
    const { bonus, rebate } = this.state;
    dispatch({
      type: "trade/setExpandData",
      payload: {
        bonus,
        rebate
      }
    })
      .then(() => {
        message.success("修改成功");
      })
      .catch(() => {
        message.error("修改失败");
      });
  };

  //打开图片墙弹窗
  _openModal = openSource => {
    if (openSource) {
      this.setState({
        _visible: true,
        _selectList: []
      });
    }
  };
  //选好图片，点击确定导入到详情中
  handleSelect = () => {
    const { _selectList } = this.state;
    const store_poster = {
      ..._selectList[0],
      key: undefined,
      index: undefined
    };
    this.setState({ _visible: false, store_poster, _selectList: [] });
  };
  //图标上传
  handleUpload = (res, key, list) => {
    if (!!list) {
      this.setState({ store_poster: null });
    } else {
      this.setState({ store_poster: { ...res } });
    }
  };
  handleSubmitposter = () => {
    const { dispatch } = this.props;
    const { store_poster } = this.state;
    this.setState({ expandLoading: true });
    dispatch({
      type: "trade/setStorePoster",
      payload: {
        type: "storeposter",
        _params: {
          store_poster
        }
      }
    })
      .then(res => {
        if (res) {
          message.success("海报修改成功");
        } else {
          message.error("海报修改失败");
        }
      })
      .catch(() => {
        message.error("海报修改失败");
      });
  };

  render() {
    const { bonus, store_poster, _visible } = this.state;
    const { bonus_switch, loading } = this.props;
    const formItemLayout = {
      labelCol: { sm: { span: 8 }, lg: { span: 5 } },
      wrapperCol: { sm: { span: 16 }, lg: { span: 19 } }
    };
    const wh = window.screen.height;

    return (
      <PageHeaderWrapper>
        <Spin spinning={loading}>
          <Card
            title="门槛"
            style={{ marginBottom: 20 }}
            extra={
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={this.handleSubmit}
              >
                保存
              </Button>
            }
          >
            {bonus_switch ? (
              <Form className={styles.editform}>
                <FormItem
                  label="分销返佣门槛（元）"
                  required
                  {...formItemLayout}
                  help="例：输入88，则用户在商城消费满88元可获得分销返佣特权"
                >
                  <InputNumber
                    min={0}
                    step={1}
                    value={bonus}
                    style={{ width: "100%" }}
                    onChange={e => this.setState({ bonus: e })}
                  />
                </FormItem>
              </Form>
            ) : (
              <span>您没有开启分销功能</span>
            )}
          </Card>
          <Card
            title="海报"
            extra={
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={() => this.handleSubmitposter()}
              >
                保存
              </Button>
            }
          >
            {bonus_switch ? (
              <Form className={styles.editform}>
                <FormItem label="分销封面海报" required {...formItemLayout}>
                  <UploadImage
                    limit={1}
                    fileList={store_poster ? [store_poster] : []}
                    openSource={!store_poster}
                    onChange={(e, list) => this.handleUpload(e, "icon", list)}
                    handleSource={() => this._openModal(!store_poster)}
                    restprops={{ openFileDialogOnClick: false }}
                  />
                </FormItem>
              </Form>
            ) : null}
          </Card>
          <Modal
            width="60%"
            title="素材选择"
            visible={_visible}
            centered
            onCancel={() => this.setState({ _visible: false })}
            onOk={() => this.handleSelect()}
            bodyStyle={{ maxHeight: `${wh - 300}px`, overflowY: "auto" }}
          >
            <SourceImageTab
              limit={1}
              visible={_visible}
              onSelectItem={list => this.setState({ _selectList: list })}
              {...this.props}
            />
          </Modal>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default Expand;
