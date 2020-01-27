import React, { Component, Fragment } from "react";
import { permissionAuth } from "@/utils/permission";
import { Form, InputNumber } from "antd";
import MixedStairs from "./mixedStairs";

const formItemLayout = {
  labelCol: { md: { span: 5 }, lg: { span: 5 }, xxl: { span: 3 } },
  wrapperCol: { md: { span: 18 }, lg: { span: 18 }, xxl: { span: 20 } }
};
const FormItem = props => <Form.Item required {...formItemLayout} {...props} />;

class groupBuy extends Component {
  state = {};

  handleChange = (e, key) => {
    const { onChange } = this.props;
    onChange(e, key);
  };

  //处理传值
  conversionObject() {
    const { disabled, groupbuy_info, goodtype } = this.props;

    return {
      disabled,
      groupbuy_info: groupbuy_info || {},
      goodtype
    };
  }

  render() {
    const { disabled, groupbuy_info, goodtype } = this.conversionObject();

    return (
      <Fragment>
        <FormItem label="拼团倒计时">
          <InputNumber
            min={1}
            precision={0}
            style={{ width: 150 }}
            placeholder="请输入小时"
            disabled={disabled}
            value={groupbuy_info.period}
            onChange={e => this.handleChange(e, "period")}
          />
        </FormItem>
        <FormItem label="拼团成功奖励积分">
          <InputNumber
            min={0}
            precision={0}
            parser={value => value.replace(/\$\s?|(,*)/g, "")}
            step={1}
            style={{ width: 150 }}
            placeholder="成功时奖励的积分"
            value={groupbuy_info.integral}
            onChange={e => this.handleChange(e, "integral")}
          />
        </FormItem>
        <FormItem label="拼团阶梯">
          <MixedStairs
            goodtype={goodtype}
            disabled={disabled}
            mode={groupbuy_info.mode}
            stairs={groupbuy_info.ladder_list || []}
            onChange={(e, labelname) => this.handleChange(e, labelname)}
          />
        </FormItem>
      </Fragment>
    );
  }
}

export default groupBuy;
