import React, { Component, Fragment } from "react";
import { connect } from "dva";
import { getLocalStorage } from "@/utils/authority";
import {
  Input,
  Table,
  Button,
  Modal,
  message,
  Select,
  Divider,
  Spin,
  Tooltip
} from "antd";
import styles from "../orderlist.less";
import moment from "moment";
import tixing from "@/assets/tixing.svg";
import PropTypes from "prop-types";

const Option = Select.Option;
const status_group = {
  paying: "待付款",
  sending: "待发货",
  close: "已失效",
  receiving: "待收货",
  over: "已收货"
};
let timeout;
let currentValue;

@connect(({ order, costom, loading }) => ({
  expresslist: order.expresslist,
  expresslistCount: order.expresslistCount,
  expressAllList: order.expressAllList,
  expressLoading: loading.effects["order/getExpresslist"],
  orderLoading: loading.effects["order/fetchOrderdata"]
}))
class goodInfoTable extends Component {
  state = {
    rowdataid: "",
    isdetail: false,
    delivery_method: "",
    pay_time: "",
    orderdata_item: [],
    orderdata_item_form: {},
    edit_item: false,
    edit_order: false,
    singerform: {},
    onLoading: false,
    visible: false,
    secondvisible: false,
    expressname: "",
    express_Company_data: [],
    logistics_v: false,
    logistics_form: [],
    edit_real_mount: false,
    real_mount: 0,
    order_sn: null,
    changeitem: {},
    count: 0
  };

  componentDidMount() {
    const {
      dispatch,
      value,
      goodtype,
      expresslist,
      expressAllList
    } = this.props;
    const {
      rowdataid,
      orderdata_item,
      isdetail,
      delivery_method,
      pay_time
    } = value;
    //订单详情页：获取所有快递公司列表
    if (isdetail) {
      if (expressAllList.length === 0) {
        dispatch({ type: "order/expressAllList" });
      }
      this.setState({ orderdata_item: orderdata_item || [] });
    } else {
      //列表页：订阅商品每次获取都是请求新的数据
      if (goodtype === "sub") {
        this.getItemsData(rowdataid);
      } else {
        this.setState({ orderdata_item: orderdata_item || [] });
      }
    }
    //获取常用的快递公司列表
    if (expresslist.length === 0) {
      dispatch({
        type: "order/getExpresslist",
        payload: {
          page: 1,
          page_size: 100
        }
      });
    }

    this.setState({
      rowdataid,
      isdetail,
      delivery_method,
      pay_time
    });
  }

  //获取当前订单的最新信息
  getItemsData = (id, type) => {
    const { dispatch, value, location, initData } = this.props;
    const { isdetail } = value;
    this.setState({ onLoading: true });
    let data = location.query && location.query.is_pt ? { is_pt: true } : null;
    dispatch({
      type: "order/fetchOrderdata",
      payload: { id, data }
    }).then(rep => {
      let orderdata_item = [],
        statuslist = false;
      rep.items.map(item => {
        item.edit = false;
        if (item.goods_backup.delivery_method === value.delivery_method) {
          if (item.send_type === "sending") {
            statuslist = true;
          }
          orderdata_item.push(item);
        }
      });
      //商品订单已全部发货，列表页中，会刷新当前列表页
      if (!statuslist && !isdetail && initData) {
        initData();
      }
      this.setState({ orderdata_item, onLoading: false });
    });
  };

  componentDidUpdate(preprops, prestate) {
    const { value } = this.props;
    const {
      rowdataid,
      orderdata_item,
      isdetail,
      delivery_method,
      pay_time
    } = value;
    if (
      this.state.rowdataid !== rowdataid &&
      this.state.rowdataid !== "" &&
      !isdetail
    ) {
      this.setState({
        rowdataid,
        delivery_method,
        isdetail,
        pay_time
      });
      this.getItemsData(rowdataid);
    }
    if (
      isdetail &&
      orderdata_item.length > 0 &&
      orderdata_item.length !== this.state.orderdata_item.length
    ) {
      this.setState({
        orderdata_item: orderdata_item || [],
        rowdataid,
        delivery_method,
        isdetail,
        pay_time
      });
    }
    const { onLoading, count } = this.state;
    if (onLoading !== this.state.onLoading) {
      this.setState({ count: 0, onLoading });
    }
    if (orderdata_item.length > 0 && count < 16) {
      this.timer = setTimeout(() => {
        this.setState({ count: count + 1 });
      }, 400);
    } else {
      clearTimeout(this.timer);
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  //商品信息表格修改和保存
  editTable = (id, record) => {
    const { orderdata_item } = this.state;
    const editgroup = orderdata_item.filter(item => item.edit === true);
    let orderdata_item_form = {};
    if (editgroup.length === 0) {
      orderdata_item.map(item => {
        if (item.id === id) {
          item.edit = true;
          orderdata_item_form = { ...record };
        }
      });
      this.setState({ orderdata_item, orderdata_item_form });
    } else {
      message.warning("请先完成或者取消其他商品状态的编辑！");
    }
  };
  //表格信息的修改
  tableHandle = (key, e) => {
    const { orderdata_item_form, changeitem } = this.state;
    orderdata_item_form[key] = e;
    changeitem[key] = e;
    this.setState({ orderdata_item_form, changeitem });
  };
  //点击“保存”或者“取消”
  savetable = (id, type, url) => {
    const { orderdata_item, orderdata_item_form, changeitem } = this.state;
    let _orderdata_item_form = {
      express_company: orderdata_item_form.express_company,
      express_num: orderdata_item_form.express_num
    };
    this.setState({ onLoading: true });
    //隐藏所有输入框
    orderdata_item.map(item => {
      if (item.id === id) {
        item.edit = false;
      }
    });
    //点击“保存”
    if (type === 0) {
      //先检测快递公司信息，没有填写则直接更改状态sendStatus
      if (!changeitem.express_company && !changeitem.express_num) {
        orderdata_item_form.send
          ? this.sendStatus(orderdata_item_form.send)
          : null;
      }
      //填写了快递公司信息，先更改快递信息submittable
      else {
        if (
          _orderdata_item_form.express_company ||
          _orderdata_item_form.express_num
        ) {
          this.submittable(id, _orderdata_item_form);
        }
        this.setState({ onLoading: false });
      }
    }
    //点击“取消”，数据复原
    else {
      this.setState({
        onLoading: false,
        orderdata_item,
        orderdata_item_form: {}
      });
    }
  };
  //商品订单状态的更改=>sending->receiving
  sendStatus = url => {
    const { dispatch } = this.props;
    const { rowdataid } = this.state;
    dispatch({
      type: "costom/_postUrlNodata",
      payload: { url }
    }).then(() => {
      this.getItemsData(rowdataid);
      this.setState({ onLoading: false });
    });
  };
  //快递公司信息提交，提交完成再处理状态
  submittable = (id, orderdata) => {
    const { dispatch } = this.props;
    const { orderdata_item_form, rowdataid } = this.state;
    dispatch({
      type: "costom/_patchUrlData",
      payload: {
        url: orderdata_item_form.url,
        data: { ...orderdata }
      }
    })
      .then(res => {
        if (res) {
          orderdata_item_form.send
            ? this.sendStatus(orderdata_item_form.send)
            : this.getItemsData(rowdataid);
        }
        this.setState({ onLoading: false });
      })
      .catch(() => {
        this.setState({ onLoading: false, orderdata_item_form: {} });
      });
  };

  //商家自配送/自提：商品订单状态的更改=>sending->receiving
  sendtypeStatus = (id, name, url) => {
    this.setState({ onLoading: true });
    const that = this;
    let tip = "";
    switch (name) {
      case "待发货":
        tip = "已发货";
        break;
      case "已发货":
        tip = "已送达";
        break;
      case "备货中":
        tip = "待取件";
        break;
      case "待取件":
        tip = "已取件";
        break;
    }
    Modal.confirm({
      title: `确认操作`,
      content: (
        <Fragment>
          确认把商品状态从
          <span style={{ color: "red", marginRight: 5, marginLeft: 5 }}>
            {name}
          </span>
          变为
          <span style={{ color: "red", marginRight: 5, marginLeft: 5 }}>
            {tip}
          </span>
        </Fragment>
      ),
      okText: `确认`,
      centered: true,
      cancelText: `取消`,
      onCancel() {
        that.setState({ onLoading: false });
      },
      onOk() {
        that.sendStatus(url);
      }
    });
  };

  //查看物流信息
  checkOrderData = () => {
    window.open("https://www.kuaidi100.com");
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'order/checkorder',
    //   payload: {
    //     url: logistics,
    //   },
    // }).then(res => {
    //   if (res) {
    //     this.setState({
    //       logistics_v: true,
    //       logistics_form: res,
    //     });
    //   }
    // });
  };

  copyText = data => {
    document.execCommand(data);
    message.success("运单号复制成功");
  };

  //快递公司列表
  expresscolumns = [
    {
      title: "快递公司",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      render: (text, r) => (
        <span onClick={() => this.delexpress(r.name, r.id)}>
          <a>删除</a>
        </span>
      )
    }
  ];

  //快递公司增删
  showModal = visible => this.setState({ visible });
  showsecondModal = secondvisible => this.setState({ secondvisible });

  //新增快递公司
  saveCompay = () => {
    const { dispatch, expresslist } = this.props;
    const { expressname } = this.state;
    const sameexpress = expresslist.filter(item => item.name === expressname);
    if (sameexpress.length > 0) {
      message.error("快递公司已存在！ 请重新输入");
    } else {
      dispatch({
        type: "order/createExpress",
        payload: {
          name: expressname
        }
      }).then(() => {
        dispatch({
          type: "order/getExpresslist",
          payload: {
            page: 1,
            page_size: 100
          }
        });
      });
      this.setState({ secondvisible: false, expressname: "" });
    }
  };
  handleOk = () => this.setState({ visible: false });

  //删除快递公司
  delexpress = (name, id) => {
    const { dispatch } = this.props;
    Modal.confirm({
      title: "确认删除 ",
      content: `确认删除 ${name} `,
      okText: "确认删除 ",
      okType: "danger",
      cancelText: "取消 ",
      onOk() {
        dispatch({
          type: "order/delExpress",
          payload: { id: id }
        }).then(() => {
          dispatch({
            type: "order/getExpresslist",
            payload: {
              page: 1,
              page_size: 100
            }
          });
        });
      },
      onCancel() {}
    });
  };

  //查询快递公司列表
  handleSearch = value => {
    this.fetch(value, data => this.setState({ express_Company_data: data }));
  };
  handleFocus = value => {
    this.fetch(value, data => this.setState({ express_Company_data: data }));
  };
  fetch = (value, callback) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;
    const fake = () => {
      const { expressAllList } = this.props;
      if (currentValue === value) {
        const data = [];
        if (currentValue === undefined) {
          expressAllList.forEach(r => {
            if (data.length < 100) {
              data.push({
                value: r.name,
                text: r.name,
                disabled: false
              });
            }
          });
        } else {
          const result = expressAllList.filter(item =>
            item.name.includes(currentValue)
          );
          result.forEach(r => {
            if (data.length < 100) {
              data.push({
                value: r.name,
                text: r.name,
                disabled: false
              });
            }
          });
        }
        data.unshift({
          value: "search",
          text: "精确查找请在上面输入框搜索",
          disabled: true
        });
        callback(data);
      }
    };
    timeout = setTimeout(fake, 300);
  };

  //比较时间，显示配送到达时间
  parseTime = arr => {
    const { pay_time } = this.state;
    let tip = null,
      flag = false;
    arr.map(item => {
      let day = moment(pay_time).format("YYYY-MM-DD");
      let tomorrow = moment(pay_time)
        .add(1, "days")
        .format("YYYY-MM-DD");
      let today = moment(pay_time).format("YYYY-MM-DD HH:mm");
      if (
        moment(today).isBetween(
          `${day} ${item.add[0]}`,
          `${day} ${item.add[1]}`
        )
      ) {
        tip = `预计${tomorrow} ${item.send[0]}-${item.send[1]}送达`;
        flag = true;
      }
    });
    if (flag) {
      return tip;
    } else {
      return flag;
    }
  };

  //序列化attach自定义字段
  parseAttach = str => {
    try {
      return JSON.parse(str) ? JSON.parse(str) : [];
    } catch (e) {
      return str || [];
    }
  };

  conversionObject() {
    const { value, goodtype, fictitious = false } = this.props;
    const { delivery_method } = value;
    return {
      delivery_method,
      goodtype,
      fictitious
    };
  }

  render() {
    const {
      orderdata_item,
      orderdata_item_form,
      expressname,
      logistics_form,
      express_Company_data,
      isdetail,
      onLoading
    } = this.state;
    const { goodtype, delivery_method, fictitious } = this.conversionObject();
    const { expresslist, expressLoading } = this.props;

    //商品基本信息：商品-规格/数量价格
    const goodinfo = [
      {
        title: "商品-规格",
        dataIndex: "goods_backup",
        key: "goods_backup",
        width: 200,
        render: t => (
          <span>
            {t.goods_name}
            ——
            {t.gtype_name}
          </span>
        )
      },
      {
        title: "数量价格",
        dataIndex: "price",
        key: "price",
        width: 160,
        render: (t, r) => (
          <Fragment>
            单价：
            {goodtype === "repl"
              ? `${r.goods_backup.price}积分`
              : `￥ ${r.goods_backup.price}`}
            <br />
            数量：
            {r.goods_backup.num} 件<br />
            总价：
            {goodtype === "repl"
              ? `${r.goods_backup.price * r.goods_backup.num}积分`
              : `￥ ${(r.goods_backup.price * r.goods_backup.num).toFixed(2)}`}
          </Fragment>
        )
      }
    ];

    //订阅商品基本信息：期数/配送时间
    const subgoodinfo = [
      {
        title: "期数",
        dataIndex: "cycle",
        key: "cycle"
      },
      {
        title: "配送时间",
        dataIndex: "send_date",
        key: "send_date",
        width: 130
      }
    ];

    //有快递信息的配送状态
    const statustype = [
      {
        title: "配送状态",
        dataIndex: "send_type",
        key: "send_type",
        render: (t, r) => (
          <Fragment>
            {r.send ? (
              <span
                onClick={() =>
                  this.sendtypeStatus(r.id, r.zh_send_type, r.send)
                }
              >
                <Button>{r.zh_send_type}</Button>
                {moment().add(1, "day") >= moment(r.send_date) ? (
                  <img style={{ width: 20, marginLeft: "5px" }} src={tixing} />
                ) : r.goods_backup.ord_goods_info ? (
                  <Tooltip
                    placement="top"
                    title={
                      r.goods_backup.ord_goods_info.estimate_time &&
                      this.parseTime(
                        r.goods_backup.ord_goods_info.estimate_time
                      )
                    }
                    arrowPointAtCenter
                  >
                    <img
                      style={{ width: 20, marginLeft: "5px" }}
                      src={tixing}
                    />
                  </Tooltip>
                ) : null}
              </span>
            ) : r.arrive ? (
              <Fragment>
                <span
                  onClick={() =>
                    this.sendtypeStatus(r.id, r.zh_send_type, r.arrive)
                  }
                >
                  <Button>{r.zh_send_type}</Button>
                </span>
              </Fragment>
            ) : (
              r.zh_send_type
            )}
          </Fragment>
        )
      }
    ];

    //没有快递信息的配送状态
    let old_columnstatus = [
      {
        title: "状态",
        dataIndex: "send_type",
        key: "send_type",
        width: 100,
        render: (t, r) =>
          r.edit ? (
            orderdata_item_form.send_type === "sending" && r.send ? (
              <Button
                type="primary"
                onClick={() => this.tableHandle("send_type", "receiving")}
              >
                确认发货
              </Button>
            ) : (
              status_group[orderdata_item_form.send_type]
            )
          ) : (
            <Fragment>
              {r.zh_send_type}
              {r.send_type === "sending" ? (
                moment().add(1, "day") >= moment(r.send_date) ? (
                  <img style={{ width: 20, marginLeft: "5px" }} src={tixing} />
                ) : null
              ) : null}
            </Fragment>
          )
      }
    ];

    //自定义字段：其他信息
    const otherMessage = [
      {
        title: "其他信息",
        dataIndex: "attach",
        key: "attach",
        render: (t, r) => (
          <Tooltip
            placement="top"
            title={this.parseAttach(r.goods_backup.attach).map(item => (
              <div>
                {item.label}:{" "}
                {item.attach_type === "checkbox" && item.value
                  ? item.value.join(" / ")
                  : item.value}
              </div>
            ))}
            arrowPointAtCenter
          >
            <div
              style={{
                display: "inline-block",
                maxWidth: "300px",
                overflowX: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis"
              }}
            >
              {this.parseAttach(r.goods_backup.attach).map(item => {
                return (
                  <div style={{ height: "21px", margin: "0 auto" }}>
                    {item.label}:{" "}
                    {item.attach_type === "checkbox" && item.value
                      ? item.value.join(" / ")
                      : item.value}
                    <br />
                  </div>
                );
              })}
            </div>
          </Tooltip>
        )
      }
    ];

    //快递信息
    const expressinfo = !fictitious
      ? [
          {
            title: () => (
              <Fragment>
                快递公司
                {isdetail ? (
                  <Button
                    type="primary"
                    size="small"
                    style={{ marginLeft: 10 }}
                    onClick={() => this.showModal(true)}
                  >
                    编辑
                  </Button>
                ) : null}
              </Fragment>
            ),
            dataIndex: "express_company",
            key: "express_company",
            render: (t, r) =>
              r.edit ? (
                <Select
                  disabled={!(orderdata_item_form.send_type === "receiving")}
                  value={orderdata_item_form.express_company}
                  onChange={e => this.tableHandle("express_company", e)}
                  style={{ width: 120 }}
                >
                  {expresslist.map(item => (
                    <Option value={item.name}>{item.name}</Option>
                  ))}
                </Select>
              ) : (
                r.express_company
              )
          },
          {
            title: "快递单号",
            dataIndex: "express_num",
            key: "express_num",
            render: (t, r) =>
              r.edit ? (
                <Input
                  value={orderdata_item_form.express_num}
                  disabled={!(orderdata_item_form.send_type === "receiving")}
                  placeholder="请输入快递单号"
                  style={{ width: 150 }}
                  onChange={e =>
                    this.tableHandle("express_num", e.target.value)
                  }
                />
              ) : (
                <a onClick={() => this.copyText(t)}>{t}</a>
              )
          }
        ]
      : [];

    //普通商品的快递信息（快递公司和单号合在一列）
    const old_expressinfo = !fictitious
      ? [
          {
            title: () => (
              <Fragment>
                快递公司运单
                {isdetail ? (
                  <Button
                    type="primary"
                    size="small"
                    style={{ marginLeft: 10 }}
                    onClick={() => this.showModal(true)}
                  >
                    编辑
                  </Button>
                ) : null}
              </Fragment>
            ),
            dataIndex: "express_company",
            key: "express_company",
            render: (t, r) =>
              r.edit ? (
                <Fragment>
                  快递公司：
                  <Select
                    disabled={!(orderdata_item_form.send_type === "receiving")}
                    value={orderdata_item_form.express_company}
                    onChange={e => this.tableHandle("express_company", e)}
                    style={{ width: 150 }}
                    placeholder="请选择快递公司"
                  >
                    {expresslist.map(item => (
                      <Option value={item.name}>{item.name}</Option>
                    ))}
                  </Select>
                  <br />
                  运单号：
                  <Input
                    value={orderdata_item_form.express_num}
                    disabled={!(orderdata_item_form.send_type === "receiving")}
                    placeholder="请输入快递单号"
                    style={{ width: 150 }}
                    onChange={e =>
                      this.tableHandle("express_num", e.target.value)
                    }
                  />
                </Fragment>
              ) : (
                <div>
                  快递公司：
                  {r.express_company}
                  <br />
                  运单号：
                  <a onClick={() => this.copyText(r.express_num)}>
                    {r.express_num}
                  </a>
                </div>
              )
          }
        ]
      : [];

    //发货时间
    const sendTime = [
      {
        title: "发货时间",
        dataIndex: "send_time",
        key: "send_time",
        render: t => (t ? moment(t).format("YYYY-MM-DD kk:mm:ss") : null)
      }
    ];
    //发货时间，收货时间
    const sendreceivTime = [
      ...sendTime,
      {
        title: "收货时间",
        dataIndex: "receive_time",
        key: "receive_time",
        render: t => (t ? moment(t).format("YYYY-MM-DD kk:mm:ss") : null)
      }
    ];

    //操作
    const action = [
      {
        title: "操作",
        dataIndex: "action",
        key: "action",
        fixed: "right",
        width: 150,
        render: (t, r) =>
          r.send_type !== "close" &&
          (r.edit ? (
            <Fragment>
              <a onClick={() => this.savetable(r.id, 0, r.send)}>保存</a>
              <Divider type="vertical" />
              <a onClick={() => this.savetable(r.id, 1)}>取消</a>
            </Fragment>
          ) : (
            <Fragment>
              <a onClick={() => this.editTable(r.id, r)}>编辑</a>
              {r.send_type === "receiving" && isdetail && !fictitious ? (
                <Fragment>
                  <Divider type="vertical" />
                  <a onClick={() => this.checkOrderData(r.logistics)}>
                    查看物流
                  </a>
                </Fragment>
              ) : null}
            </Fragment>
          ))
      }
    ];

    //“S”是没有快递信息的时候使用
    const textColumn = {
      ord: [
        ...goodinfo,
        ...old_columnstatus,
        ...otherMessage,
        ...old_expressinfo,
        ...sendTime,
        ...action
      ],
      ordS: [...goodinfo, ...statustype, ...otherMessage, ...sendreceivTime],
      sub: [
        ...subgoodinfo,
        ...old_columnstatus,
        ...expressinfo,
        ...sendTime,
        ...action
      ],
      subS: [...subgoodinfo, ...statustype, ...sendreceivTime],
      repl: [
        ...goodinfo,
        ...old_columnstatus,
        ...otherMessage,
        ...old_expressinfo,
        ...sendTime,
        ...action
      ],
      replS: [...goodinfo, ...statustype, ...otherMessage, ...sendreceivTime]
    };

    let columns = [];
    const buyerColumn = {
      title: "自提",
      align: "center",
      dataIndex: "delivery_info",
      key: "delivery_info",
      render: t => {
        let _ = "";
        if (t && t.buyer_no && t.buyer_code)
          _ = `自提号：${t.buyer_no}，自提码：${t.buyer_code}`;
        return _;
      }
    };
    if (delivery_method === "buyer") {
      columns = textColumn[`${goodtype}S`];
      columns.push(buyerColumn);
    } else {
      columns =
        delivery_method === "express" && !fictitious
          ? textColumn[goodtype]
          : textColumn[`${goodtype}S`];
    }
    //物流信息
    const logistics_data = logistics_form.map(item => (
      <div className={styles.msgplane_span_msg}>
        <span className={styles.msg_time}>{item.time}</span>
        <span className={styles.msg_context}>{item.context}</span>
      </div>
    ));

    //快递公司的Select选项
    const exCom_options = express_Company_data.map(d => (
      <Option key={d.value} disabled={d.disabled}>
        {d.text}
      </Option>
    ));

    const wh = window.screen.height;

    return (
      <Fragment>
        <Spin tip="操作中" spinning={onLoading}>
          <Table
            dataSource={orderdata_item}
            columns={columns}
            rowKey="id"
            scroll={{ x: `${columns.length * 170}px` }}
          />
        </Spin>
        <Modal
          title="快递公司列表"
          centered
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={() => this.showModal(false)}
        >
          <Button type="primary" onClick={() => this.showsecondModal(true)}>
            新增
          </Button>
          <Table
            loading={expressLoading}
            dataSource={expresslist}
            columns={this.expresscolumns}
            rowKey="url"
          />
        </Modal>
        <Modal
          title="新增快递公司"
          centered
          visible={this.state.secondvisible}
          onCancel={() => this.showsecondModal(false)}
          footer={[
            <Button type="primary" onClick={this.saveCompay}>
              保存
            </Button>
          ]}
        >
          <span style={{ marginRight: 20 }}>快递公司名称:</span>
          <Select
            showSearch
            value={expressname}
            placeholder="请输入快递公司名"
            defaultActiveFirstOption={false}
            filterOption={false}
            style={{ width: 300 }}
            onFocus={this.handleFocus}
            onSearch={this.handleSearch}
            onChange={e => this.setState({ expressname: e })}
            loading={true}
          >
            {exCom_options}
          </Select>
        </Modal>
        <Modal
          title="物流信息"
          centered
          bodyStyle={{ maxHeight: `${wh - 380}px`, overflowY: "auto" }}
          visible={this.state.logistics_v}
          onOk={() => this.setState({ logistics_v: false })}
          onCancel={() => this.setState({ logistics_v: false })}
        >
          {logistics_form.length > 0 ? (
            <div className={styles.msgplane}>{logistics_data}</div>
          ) : null}
        </Modal>
      </Fragment>
    );
  }
}
goodInfoTable.propTypes = {
  goodtype: PropTypes.string.isRequired, //订单的类型: ord/sub/repl/qrpay
  initData: PropTypes.func, //当前订单页刷新，用于goodInfoTable组件中订阅商品完成发货时刷新
  fictitious: PropTypes.bool, //是否虚拟商品
  value: PropTypes.object //需要显示的商品发货信息
};
/*
value:{
  rowdataid: string.isRequired,       //订单的id
  orderdata_item: array.isRequired,   //显示的商品列表
  delivery_method: string.isRequired, //配送方式: express/own/buyer
  isdetail： bool.isRequired,         //是否在详情页显示
  pay_time: string                    //delivery_method:own时，需要添加该属性：订单的支付时间
}
*/
export default goodInfoTable;
