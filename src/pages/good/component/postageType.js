import React, { Component, Fragment } from "react";
import { permissionAuth } from "@/utils/permission";
import { Button, InputNumber, List, message } from "antd";
import styles from "../editpage.less";

class postageType extends Component {
  state = {
    set_postage: [],
    postage_typemax: 0
  };

  componentDidMount = () => {};

  componentDidUpdate = (preprops, prestate) => {
    const { set_postage } = this.props;
    let { postage_typemax } = this.state;
    if (set_postage.length > 0 && postage_typemax !== set_postage.length) {
      postage_typemax = set_postage.length;
      this.setState({ postage_typemax });
    }
  };

  //配送距离的邮费设置
  disthandle = (item, keyname, key) => {
    const { set_postage, onChange, disabled } = this.props;
    if (keyname === "") {
      //删除
      let itemindex = 0;
      set_postage.map((list, index) => {
        if (list.key === key) {
          itemindex = index;
        }
      });
      set_postage.splice(itemindex, 1);
    } else {
      //修改
      set_postage.map(list => {
        if (list.key === key) {
          list[keyname] = item;
        }
      });
    }
    if (!disabled) {
      onChange(set_postage);
    }
  };

  adddist = () => {
    let { set_postage, onChange, disabled } = this.props;
    let { postage_typemax } = this.state;
    let flag = true;
    const nulllist = { start: "", end: "", cost: "" };
    set_postage && set_postage.length > 0
      ? set_postage.map(list => {
          Object.keys(list).map(tt => {
            flag = Boolean(list[tt] !== "" && flag);
          });
        })
      : null;
    if (!flag) {
      message.warning("请先填写完整上面数据！");
    } else {
      nulllist.key = set_postage.length + 1;
      set_postage.push(nulllist);
      this.setState({ postage_typemax: postage_typemax + 1 });
    }
    onChange(set_postage);
  };

  //处理传值
  conversionObject() {
    const { set_postage, disabled } = this.props;
    if (!set_postage) {
      return {
        set_postage: []
      };
    }
    return {
      set_postage,
      disabled,
      postage_typemax: set_postage.length
    };
  }

  render() {
    const { set_postage, disabled } = this.conversionObject();

    return (
      <Fragment>
        <List
          className={styles.postage}
          dataSource={set_postage}
          itemLayout="horizontal"
          renderItem={item => (
            <List.Item
              actions={[
                <a
                  onClick={() => this.disthandle(item, "", item.key)}
                  style={{ color: "red" }}
                >
                  删除
                </a>
              ]}
            >
              配送距离（km）
              <InputNumber
                style={{ width: 60 }}
                size="small"
                value={item.start}
                min={0}
                disabled={disabled}
                onChange={e => this.disthandle(e, "start", item.key)}
              />
              <span style={{ marginLeft: 10, marginRight: 10 }}>-</span>
              <InputNumber
                style={{ width: 60 }}
                size="small"
                value={item.end}
                min={0}
                disabled={disabled}
                onChange={e => this.disthandle(e, "end", item.key)}
              />
              <span style={{ marginLeft: 30, marginRight: 10 }}>运费金额</span>
              <InputNumber
                style={{ width: 60 }}
                size="small"
                value={item.cost}
                min={0}
                disabled={disabled}
                onChange={e => this.disthandle(e, "cost", item.key)}
              />
            </List.Item>
          )}
          footer={
            <Button
              size="small"
              disabled={disabled}
              type="dashed"
              style={{ width: "100%" }}
              onClick={this.adddist}
            >
              添加
            </Button>
          }
        />
      </Fragment>
    );
  }
}

export default postageType;
