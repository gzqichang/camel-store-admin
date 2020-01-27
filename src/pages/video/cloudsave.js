import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import Link from "umi/link";
import { connect } from "dva";
import moment from "moment";
import {
  Input,
  Button,
  Select,
  Table,
  message,
  Card,
  Icon,
  InputNumber,
  Col,
  DatePicker,
  Spin,
  Modal
} from "antd";
import { setLocalStorage } from "@/utils/authority";
import { permissionAuth } from "@/utils/permission";
import styles from "./editpage.less";

const { RangePicker } = DatePicker;
const Option = Select.Option;
const { Meta } = Card;
const itemsPerPage = 10;

@connect(({ user, trade, global, loading }) => ({
  bonus_switch: global.bonus_switch,
  rebate_switch: global.rebate_switch,
  permissions: global.permissions,
  searchform: global.searchform,
  userlist: user.userlist,
  userlistCount: user.userlistCount,
  UserlistLoading: loading.effects["user/fetch"],
  levelList: trade.levelList
}))
class CloudSave extends Component {
  state = {
    searchform: {},
    page: 1,
    _columns: [],
    _switch: {},
    fixed: 0
  };

  componentDidMount() {}

  handleChange = (e, key) => {
    this.setState({ [key]: e });
  };

  handleSubmit = () => {
    message.info("现阶段免费使用");
  };

  render() {
    const gbList = [20, 30, 40, 50, 60, 70, 80, 90, 100];
    const yearList = [1, 2, 3];

    return (
      <PageHeaderWrapper>
        <Card title={"当前云存储容量"}>
          <Meta
            avatar={
              <div className={styles.bigSize}>
                10
                <span>GB</span>
              </div>
            }
            title="约可存储300个视频文件。"
            description={
              <div style={{ marginTop: 65 }}>
                扩容至：
                <Select
                  style={{ width: 100, marginRight: 40 }}
                  onChange={e => this.handleChange(e, "size")}
                >
                  {gbList.map(item => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>
                费用：￥--.--
                <Button
                  style={{ marginLeft: 20 }}
                  type="primary"
                  onClick={this.handleSubmit}
                >
                  马上扩容
                </Button>
              </div>
            }
          />
        </Card>
        <Card style={{ marginTop: 30 }} title={"有限期至"}>
          <Meta
            avatar={
              <div className={styles.timeSize}>
                6月28号
                <span>2018</span>
              </div>
            }
            description={
              <div style={{ marginTop: 84 }}>
                续费：
                <Select
                  style={{ width: 100, marginRight: 40 }}
                  onChange={e => this.handleChange(e, "year")}
                >
                  {yearList.map(item => (
                    <Option key={item} value={item}>
                      {item}年
                    </Option>
                  ))}
                </Select>
                费用：￥--.--
                <Button
                  style={{ marginLeft: 20 }}
                  type="primary"
                  onClick={this.handleSubmit}
                >
                  马上续费
                </Button>
              </div>
            }
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CloudSave;
