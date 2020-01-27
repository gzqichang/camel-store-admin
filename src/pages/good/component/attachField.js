import React, { Component, Fragment } from "react";
import { permissionAuth } from "@/utils/permission";
import {
  Button,
  Select,
  Input,
  Divider,
  Switch,
  message,
  InputNumber,
  Row,
  Col,
  DatePicker,
  Radio,
  Checkbox,
  Modal,
  Form
} from "antd";
import moment from "moment";
import TableDrag from "@/components/CostomCom/tableDrag";
import TagSelect from "./tagSelect";
import update from "immutability-helper";

const formItemLayout = {
  labelCol: { md: { span: 5 }, lg: { span: 5 }, xxl: { span: 3 } },
  wrapperCol: { md: { span: 16 }, lg: { span: 16 }, xxl: { span: 18 } }
};
const FormItem = props => (
  <Form.Item
    required
    {...formItemLayout}
    style={{ marginBottom: 0, textAlign: "left" }}
    {...props}
  />
);
const FormItemS = props => (
  <Form.Item
    labelCol={{ span: 5 }}
    wrapperCol={{ span: 16 }}
    required
    {...props}
  />
);
const Option = Select.Option;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const nullform = {
  attach_type: "",
  lable: "",
  is_required: false,
  help_text: "",
  index: null,
  length: null,
  max_value: null,
  min_value: null,
  option: null
};

class attachField extends Component {
  state = {
    edit: false,
    modalform: {},
    visible: false,
    select_value: null
  };

  //数据填写
  onChangeModal = (e, key) => {
    const { modalform } = this.state;
    modalform[key] = e === undefined ? null : e;
    this.setState({ modalform });
  };
  //选择框的值
  onChangeTag = e => {
    const { select_value, modalform } = this.state;
    let array = modalform.option || [],
      _array = [];
    let _index = null,
      itemvalue = e || select_value;
    array.map((item, index) => {
      if (item === itemvalue) {
        _index = index;
      } else {
        _array.push(item);
      }
    });
    if (!e && select_value) {
      _index === null ? array.push(select_value) : message.error("名称重复");
    }
    if (!select_value) {
      message.error("名称不能为空");
    }
    modalform.option = e ? [..._array] : [...array];
    this.setState({ modalform, select_value: "" });
  };

  editdist = (type, form) => {
    const { attach, onChange } = this.props;
    if (type === "edit") {
      //编辑
      this.setState({ visible: true, modalform: { ...form } });
    } else if (type === "del") {
      //删除
      Modal.confirm({
        title: "确认操作",
        content: "确认删除该字段",
        centered: true,
        onOk() {
          let _attach = attach.filter(item => item.key !== form.key);
          onChange(_attach);
        }
      });
    } else {
      //添加
      this.setState({ visible: true, modalform: { ...nullform } });
    }
  };

  savedist = () => {
    let { onChange, attach } = this.props;
    let { modalform } = this.state;
    if (!modalform.label) {
      message.error("字段名不能为空");
      return;
    }
    if (!modalform.attach_type) {
      message.error("字段类型不能为空");
      return;
    }
    if (modalform.key) {
      //保存
      attach[modalform.key - 1] = { ...modalform };
    } else {
      //添加
      attach = [...attach, modalform];
    }
    this.setState({ visible: false });
    onChange(attach);
  };

  handleDrag = e => {
    const { dragIndex, hoverIndex, dragRow } = e;
    let { onChange, attach } = this.props;
    const _attach = update(attach, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]]
    });
    onChange(_attach);
  };

  //处理传值
  conversionObject() {
    const { attach, disabled } = this.props;
    attach &&
      attach.map((item, index) => {
        item.key = index + 1;
        item.index = index + 1;
      });
    return {
      attach,
      disabled
    };
  }

  columns = [
    {
      title: "字段",
      dataIndex: "name",
      key: "name",
      render: (t, r) => (
        <FormItem label={r.label} required={r.is_required}>
          {r.attach_type === "string" ? (
            <Input
              maxLength={r.length === null ? Infinity : r.length}
              style={{ width: 200 }}
              placeholder={r.help_text}
            />
          ) : null}
          {r.attach_type === "number" ? (
            <InputNumber
              min={r.min_value === null ? -Infinity : r.min_value}
              max={r.max_value === null ? Infinity : r.max_value}
              style={{ width: 200 }}
              placeholder={r.help_text}
            />
          ) : null}
          {r.attach_type === "date" ? (
            <DatePicker placeholder={r.help_text} />
          ) : null}
          {r.attach_type === "radio" ? (
            <RadioGroup>
              {r.option.map(item_in => (
                <Radio key={item_in} value={item_in}>
                  {item_in}
                </Radio>
              ))}
            </RadioGroup>
          ) : null}
          {r.attach_type === "checkbox" ? (
            <CheckboxGroup>
              {r.option.map(item_in => (
                <Checkbox value={item_in}>{item_in}</Checkbox>
              ))}
            </CheckboxGroup>
          ) : null}
        </FormItem>
      )
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      width: 130,
      render: (t, r) => (
        <Fragment>
          <a onClick={() => this.editdist("edit", r)}>编辑</a>
          <Divider type="vertical" />
          <a onClick={() => this.editdist("del", r)}>删除</a>
        </Fragment>
      )
    }
  ];

  render() {
    const { visible, modalform, select_value } = this.state;
    const { attach, disabled } = this.conversionObject();

    return (
      <Fragment>
        <div style={{ color: "#aaa", fontSize: "12px", marginLeft: "16px" }}>
          自定义商品信息是商家在销售商品的时候希望买家在下单的时候补充的信息。商家自定义需要收集信息的名称和希望买家录入的方式。
        </div>
        <Row>
          <Col style={{ float: "right", marginTop: 10, marginBottom: 10 }}>
            <Button type="primary" onClick={() => this.editdist(null)}>
              添加
            </Button>
          </Col>
        </Row>
        <TableDrag
          columns={this.columns}
          dataSource={attach}
          onChange={e => this.handleDrag(e)}
        />
        <Modal
          centered
          title="自定义字段详情"
          visible={visible}
          onOk={() => this.savedist()}
          onCancel={() => this.setState({ visible: false })}
        >
          <Form>
            <FormItemS label="字段名称">
              <Input
                value={modalform.label}
                onChange={e => this.onChangeModal(e.target.value, "label")}
                placeholder="建议名称不超过6个字"
              />
            </FormItemS>
            <FormItemS label="类型">
              <Select
                value={modalform.attach_type}
                onChange={e => this.onChangeModal(e, "attach_type")}
              >
                <Option key="string">文字</Option>
                <Option key="number">数字</Option>
                <Option key="date">日期</Option>
                <Option key="radio">单选</Option>
                <Option key="checkbox">多选</Option>
              </Select>
            </FormItemS>
            <FormItemS label="是否必填">
              <Switch
                checked={modalform.is_required}
                onChange={e => this.onChangeModal(e, "is_required")}
              />
            </FormItemS>
            <FormItemS label="备注文字" required={false}>
              <Input
                value={modalform.help_text}
                onChange={e => this.onChangeModal(e.target.value, "help_text")}
                placeholder="显示在空白输入框上"
              />
            </FormItemS>
            {modalform.attach_type === "string" ? (
              <FormItemS label="长度" required={false}>
                <InputNumber
                  min={0}
                  placeholder="字数限制"
                  value={modalform.length}
                  onChange={e => this.onChangeModal(e, "length")}
                />
              </FormItemS>
            ) : null}
            {modalform.attach_type === "number" ? (
              <Fragment>
                <FormItemS label="最小值" required={false}>
                  <InputNumber
                    value={modalform.min_value}
                    onChange={e => this.onChangeModal(e, "min_value")}
                  />
                </FormItemS>
                <FormItemS label="最大值" required={false}>
                  <InputNumber
                    value={modalform.max_value}
                    onChange={e => this.onChangeModal(e, "max_value")}
                  />
                </FormItemS>
              </Fragment>
            ) : null}
            {modalform.attach_type === "radio" ||
            modalform.attach_type === "checkbox" ? (
              <FormItemS label="值">
                <TagSelect
                  children={modalform.option}
                  onClose={e => this.onChangeTag(e)}
                />
                <Input
                  placeholder="请输入选项名称"
                  value={select_value}
                  onChange={e =>
                    this.setState({ select_value: e.target.value })
                  }
                />
                <Button
                  size="small"
                  type="primary"
                  onClick={() => this.onChangeTag()}
                >
                  添加
                </Button>
              </FormItemS>
            ) : null}
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default attachField;
