import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { permissionAuth } from '@/utils/permission';
import { validtypeForm } from '@/utils/_utils';
import { Divider, Icon, Modal, Form, Button, Input, InputNumber, Switch, message } from 'antd';
import TableDrag from '@/components/CostomCom/tableDrag';
import UploadImage from '@/components/CostomCom/uploadImage';
import SourceImageTab from '@/components/CostomCom/sourceImage';
import update from 'immutability-helper';

const formItemLayout_S = {
  labelCol: { md: { span: 5 }, lg: { span: 5 }, xxl: { span: 4 } },
  wrapperCol: { md: { span: 18 }, lg: { span: 18 }, xxl: { span: 20 } },
};
const FormItem_S = props => <Form.Item required {...formItemLayout_S} {...props} />;

@connect(({ global }) => ({
  bonus_switch: global.bonus_switch,
  rebate_switch: global.rebate_switch,
  permissions: global.permissions,
}))
class gType extends Component {
  state = {
    modalVisible: false,
    gtypesmax: 0,
    gtypes: [],
    gtypesform: { ladder_list: [] },
    _switch: {},
    _columns: [],
    _ordcolumns: [],
    ladder_list: [],
    len: 0,
    count: 0,
    isMixed: false,
    selectList: [],
    _selectList: [],
    visible: false,
  };

  componentDidMount = () => {
    const { gtypes = [], mode } = this.props;
    if (gtypes) {
      this.setState({ gtypes, gtypesmax: gtypes.length });
    }
    if (mode === 'new') {
      this.switch();
    }
  };

  componentDidUpdate = (preprops, prestate) => {
    const { gtypes, bonus_switch, rebate_switch, ladder_list, isMixed, onChange } = this.props;
    const { _switch } = prestate;
    if (gtypes.length > 0 && gtypes.length !== this.state.gtypesmax) {
      this.setState({ gtypesmax: gtypes.length, count: 0, isMixed });
    }
    if (bonus_switch !== _switch.bonus_switch || rebate_switch !== _switch.rebate_switch) {
      if (!isMixed) {
        this.switch();
      }
    }
    //拼团的阶梯数量变更时，更新adder_list
    if (ladder_list && ladder_list.length !== this.state.len && isMixed) {
      this.setState({ ladder_list, len: ladder_list.length, count: 0, isMixed });
      this.addStair(ladder_list);
    }
    //拼团switch切换
    if (isMixed !== this.state.isMixed) {
      this.setState({ count: 0, isMixed });
      //打开拼团，更新规格的阶梯
      if (isMixed) {
        this.setState({ ladder_list, len: ladder_list.length });
        this.addStair(ladder_list);
      }
      //关闭拼团，清空规格的阶梯和添加分销、返利
      else {
        this.switch('clear');
      }
    }
    const { count } = this.state;
    if (gtypes.length > 0 && count < 30) {
      this.timer = setTimeout(() => {
        this.setState({ count: count + 1 });
      }, 500);
    } else {
      clearTimeout(this.timer);
    }
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  columns = [
    {
      title: '规格名',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: '市场价',
      dataIndex: 'market_price',
      key: 'market_price',
    },
    {
      title: '售卖价',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: '10%',
    },
    {
      title: '订阅期数',
      dataIndex: 'cycle_num',
      key: 'cycle_num',
      width: '10%',
    },
    {
      title: '是否在售',
      dataIndex: 'is_sell',
      key: 'is_sell',
      render: t => (
        <Fragment>
          {t ? (
            <Icon type="check-circle" theme="filled" style={{ color: 'green' }} />
          ) : (
            <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
          )}
        </Fragment>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      // fixed: 'right',
      width: 100,
      render: (text, record) => (
        <Fragment>
          <span onClick={() => this.delModal(record.content, record.index)}>
            <a>删除</a>
          </span>
          <Divider type="vertical" />
          <span onClick={() => this.handleModal(true, record)}>
            <a>编辑</a>
          </span>
        </Fragment>
      ),
    },
  ];

  ordcolumns = [
    {
      title: '规格名',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: '市场价',
      dataIndex: 'market_price',
      key: 'market_price',
    },
    {
      title: '售卖价',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 70,
    },
    {
      title: '是否在售',
      dataIndex: 'is_sell',
      key: 'is_sell',
      render: t => (
        <Fragment>
          {t ? (
            <Icon type="check-circle" theme="filled" style={{ color: 'green' }} />
          ) : (
            <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
          )}
        </Fragment>
      ),
    },
    {
      title: '限购',
      dataIndex: 'buy_limit',
      key: 'buy_limit',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      // fixed: 'right',
      width: 100,
      render: (text, record) => (
        <Fragment>
          <span onClick={() => this.delModal(record.content, record.index)}>
            <a>删除</a>
          </span>
          <Divider type="vertical" />
          <span onClick={() => this.handleModal(true, record)}>
            <a>编辑</a>
          </span>
        </Fragment>
      ),
    },
  ];

  replcolumns = [
    {
      title: '规格名',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: '积分数量',
      dataIndex: 'credit',
      key: 'credit',
    },
    {
      title: '售卖价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 70,
    },
    {
      title: '是否在售',
      dataIndex: 'is_sell',
      key: 'is_sell',
      render: t => (
        <Fragment>
          {t ? (
            <Icon type="check-circle" theme="filled" style={{ color: 'green' }} />
          ) : (
            <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
          )}
        </Fragment>
      ),
    },
    {
      title: '限购',
      dataIndex: 'buy_limit',
      key: 'buy_limit',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      // fixed: 'right',
      width: 130,
      render: (text, record) => (
        <Fragment>
          <span onClick={() => this.delModal(record.content, record.index)}>
            <a>删除</a>
          </span>
          <Divider type="vertical" />
          <span onClick={() => this.handleModal(true, record)}>
            <a>编辑</a>
          </span>
        </Fragment>
      ),
    },
  ];

  switch = stair => {
    const { bonus_switch, rebate_switch, type, gtypes, onChange } = this.props;
    const { _switch } = this.state;
    _switch['bonus_switch'] = bonus_switch;
    _switch['rebate_switch'] = rebate_switch;
    this.setState({ _switch });
    const rebate = {
      title: '返利/积分',
      dataIndex: 'rebate',
      key: 'rebate',
    };
    const bonus = {
      title: '分销/￥',
      dataIndex: 'bonus',
      key: 'bonus',
    };
    const columnGroup = {
      ord_goods: [...this.ordcolumns],
      sub_goods: [...this.columns],
      repl_goods: [...this.replcolumns],
    };
    if (type === 'ord_goods') {
      if (bonus_switch) {
        columnGroup[type].splice(6, 0, bonus);
      }
      if (rebate_switch) {
        columnGroup[type].splice(6, 0, rebate);
      }
      this.setState({ _ordcolumns: columnGroup[type] });
    } else {
      this.setState({ _columns: columnGroup[type] });
    }
    // if(stair) {
    //   gtypes.map(item => {
    //     item.ladder_list = []
    //   })
    //   onChange(gtypes);
    // }
  };

  addStair = stairs => {
    const { type, onChange, gtypes } = this.props;
    const columnGroup = {
      ord_goods: [...this.ordcolumns],
      sub_goods: [...this.columns],
      repl_goods: [...this.replcolumns],
    };
    let columns = columnGroup[type];
    stairs.map(item => {
      const stairsItem = {
        title: `阶梯${item.index}价格`,
        dataIndex: `stair${item.index}`,
        key: `stair${item.index}`,
        width: 100,
        render: (t, r) =>
          (r.ladder_list[item.index - 1] &&
            r.ladder_list[item.index - 1].price &&
            Number(r.ladder_list[item.index - 1].price).toFixed(2)) ||
          '',
      };
      columns.splice(Number(3 + item.index), 0, stairsItem);
    });
    if (type === 'ord_goods') {
      this.setState({ _ordcolumns: columns });
    } else {
      this.setState({ _columns: columns });
    }
    if (stairs.length === 0) {
      gtypes.map(item => {
        item.ladder_list = [];
      });
      onChange(gtypes);
    }
  };

  //获取权限
  getAuth = e => {
    const { permissions } = this.props;
    return permissions.includes(permissionAuth[e]);
  };

  //商品规格编辑和新增弹窗
  handleModal = (modalVisible, gtypesform) => {
    let _gtypesform = { ladder_list: [] };
    const { ladder_list, isMixed } = this.props;
    //gtypesform为null即新增
    if (!gtypesform) {
      isMixed &&
        ladder_list.map(item => {
          _gtypesform.ladder_list.push({ index: item.index, price: '' });
        });
      this.setState({ gtypesform: _gtypesform, gtypesform_key: '' });
    } else {
      this.setState({
        gtypesform: { ...gtypesform },
        gtypesform_key: gtypesform.index ? gtypesform.index - 1 : '',
      });
    }
    this.setState({ modalVisible });
  };
  //规格弹窗表格数据监测
  chnageModaldata = (e, key, index) => {
    const { gtypesform } = this.state;
    if (key === 'ladder_list' && gtypesform.ladder_list) {
      !gtypesform.ladder_list[index]
        ? gtypesform.ladder_list.push({ index: index + 1, price: e })
        : (gtypesform.ladder_list[index].price = e);
    } else if (key === 'rebate' || key === 'bonus') {
      gtypesform[key] = e;
    } else {
      e === undefined ? (gtypesform[key] = null) : (gtypesform[key] = e);
    }
    this.setState({ gtypesform });
  };
  //添加规格
  addModal = modalVisible => {
    const { gtypesform, gtypesform_key, gtypesmax } = this.state;
    const { onChange, ladder_list, gtypes, model_type } = this.props;
    if (gtypesform.stock === 0) gtypesform.is_sell = false;
    if (validtypeForm(gtypesform, ladder_list, model_type)) {
      this.setState({ modalVisible });
      if (gtypesform_key === '') {
        gtypesform.key = gtypesmax + 1;
        gtypes.unshift(gtypesform);
        this.setState({ gtypesmax: gtypesmax + 1 });
      } else {
        gtypes[gtypesform_key] = gtypesform;
      }
    }
    onChange(gtypes);
  };
  //删除规格
  delModal = (content, index) => {
    const { gtypes, onChange, disabled } = this.props;
    const createTem = this.getAuth('createTemplate');
    Modal.confirm({
      title: '确认操作',
      content: `确认删除规格 ${content}`,
      okText: '删除',
      okType: 'danger',
      centered: true,
      onOk() {
        if (createTem && !disabled) {
          gtypes.splice(index - 1, 1);
          onChange(gtypes);
        } else if (!createTem) {
          message.error('你没有进行该操作的权限');
        } else if (disabled) {
          message.error('该商品仍然有人在拼团，不可删除');
        }
      },
    });
  };

  //商品规格拖动排序
  handleDrag = e => {
    const { dragIndex, hoverIndex, dragRow } = e;
    let { onChange, gtypes } = this.props;
    const _gtypes = update(gtypes, { $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]] });
    onChange(_gtypes);
  };
  conversionObject() {
    const { gtypes } = this.props;
    gtypes &&
      gtypes.map((item, index) => {
        item.key = index + 1;
        item.index = index + 1;
      });
    return {
      gtypes,
    };
  }

  render() {
    const {
      gtypesform,
      visible,
      _selectList,
      _switch,
      modalVisible,
      _columns,
      _ordcolumns,
      ladder_list,
    } = this.state;
    const { gtypes } = this.conversionObject();
    const { type, isMixed, disabled } = this.props;
    const createTem = this.getAuth('createTemplate');
    const is_disabled = gtypesform.id ? Boolean(!createTem || disabled) : Boolean(!createTem);
    //弹窗里，添加相应的阶梯编辑框
    const stairItem = (label, maxNum) => (
      <FormItem_S label={`阶梯${label + 1}价格`}>
        <InputNumber
          max={maxNum}
          min={0}
          style={{ width: 200 }}
          placeholder="请输入"
          disabled={is_disabled}
          value={(gtypesform.ladder_list[label] && gtypesform.ladder_list[label].price) || ''}
          onChange={e => this.chnageModaldata(e, 'ladder_list', label)}
        />
      </FormItem_S>
    );
    const wh = window.screen.height;
    const columnGroup = {
      ord_goods: _ordcolumns,
      sub_goods: _columns,
      repl_goods: _columns,
    };

    return (
      <Fragment>
        <TableDrag
          columns={columnGroup[type] || []}
          dataSource={gtypes || []}
          onChange={e => this.handleDrag(e)}
          restProps={{
            scroll: { x: `${(columnGroup[type].length + ladder_list.length) * 90}` },
            pagination: true,
          }}
        />
        {createTem ? (
          <Button type="dashed" block onClick={() => this.handleModal(true, null)}>
            {' '}
            + 添加
          </Button>
        ) : null}
        <Modal
          title="管理商品规格"
          centered
          visible={modalVisible}
          onOk={() => this.addModal(false)}
          onCancel={() => this.handleModal(false, null)}
          bodyStyle={{ maxHeight: `${wh - 380}px`, overflowY: 'auto' }}
        >
          <Form>
            <FormItem_S label="规格名称">
              <Input
                style={{ width: 200 }}
                disabled={!createTem}
                value={gtypesform.content}
                onChange={e => {
                  this.chnageModaldata(e.target.value, 'content');
                }}
              />
            </FormItem_S>
            {type === 'repl_goods' ? (
              <Fragment>
                <FormItem_S label="积分数量">
                  <InputNumber
                    min={1}
                    precision={0}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    step={1}
                    value={gtypesform.credit}
                    style={{ width: 200 }}
                    disabled={!createTem}
                    onChange={e => {
                      this.chnageModaldata(e, 'credit');
                    }}
                  />
                </FormItem_S>
                <FormItem_S label="售卖价格">
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={gtypesform.price}
                    style={{ width: 200 }}
                    disabled={!createTem}
                    onChange={e => {
                      this.chnageModaldata(e, 'price');
                    }}
                  />
                </FormItem_S>
              </Fragment>
            ) : (
              <Fragment>
                <FormItem_S label="市场价格">
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={gtypesform.market_price}
                    style={{ width: 200 }}
                    disabled={!createTem}
                    onChange={e => {
                      this.chnageModaldata(e, 'market_price');
                    }}
                  />
                </FormItem_S>
                <FormItem_S label="售卖价格">
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={gtypesform.price}
                    style={{ width: 200 }}
                    disabled={!createTem}
                    onChange={e => {
                      this.chnageModaldata(e, 'price');
                    }}
                  />
                </FormItem_S>
              </Fragment>
            )}
            {isMixed ? (
              <Fragment>
                {ladder_list.map((item, index) =>
                  stairItem(
                    index,
                    index - 1 >= 0 &&
                    gtypesform.ladder_list[index - 1] &&
                    gtypesform.ladder_list[index - 1].price > 0
                      ? gtypesform.ladder_list[index - 1].price
                      : gtypesform.price || Infinity
                  )
                )}
              </Fragment>
            ) : null}
            <FormItem_S label="库存">
              <InputNumber
                min={gtypesform.is_sell ? 1 : 0}
                value={gtypesform.stock}
                style={{ width: 200 }}
                onChange={e => {
                  this.chnageModaldata(e, 'stock');
                }}
              />
              {gtypesform.is_sell ? null : (
                <Fragment>
                  <br />
                  <span style={{ color: '#ccc' }}>在售状态库存不能为0</span>
                </Fragment>
              )}
            </FormItem_S>
            {type !== 'sub_goods' && (
              <FormItem_S label="限购" required={false}>
                <InputNumber
                  min={0}
                  style={{ width: 200 }}
                  placeholder="请输入限购数量"
                  disabled={!createTem}
                  value={gtypesform.buy_limit}
                  onChange={e => this.chnageModaldata(e, 'buy_limit')}
                />
              </FormItem_S>
            )}
            {type === 'ord_goods' &&
              !isMixed && (
                <Fragment>
                  {(_switch.rebate_switch && (
                    <FormItem_S label="返利" required={false}>
                      <InputNumber
                        min={0}
                        precision={0}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        step={1}
                        style={{ width: 200 }}
                        placeholder="请输入返利积分"
                        disabled={!createTem}
                        value={gtypesform.rebate}
                        onChange={e => this.chnageModaldata(e, 'rebate')}
                      />
                    </FormItem_S>
                  )) ||
                    null}
                  {(_switch.bonus_switch && (
                    <FormItem_S label="分销" required={false}>
                      <InputNumber
                        min={0}
                        style={{ width: 200 }}
                        placeholder="请输入分销"
                        disabled={!createTem}
                        value={gtypesform.bonus}
                        onChange={e => this.chnageModaldata(e, 'bonus')}
                      />
                    </FormItem_S>
                  )) ||
                    null}
                </Fragment>
              )}
            {type === 'sub_goods' && (
              <FormItem_S label="订阅期数">
                <InputNumber
                  min={0}
                  style={{ width: 200 }}
                  placeholder="请输入配送的次数"
                  disabled={!createTem}
                  value={gtypesform.cycle_num}
                  onChange={e => this.chnageModaldata(e, 'cycle_num')}
                />
              </FormItem_S>
            )}
            <FormItem_S label="是否在售">
              <Switch
                checked={gtypesform.is_sell}
                onChange={e => {
                  this.chnageModaldata(e, 'is_sell');
                }}
              />
            </FormItem_S>
            <FormItem_S label="图片" required={false}>
              <UploadImage
                openSource={!gtypesform.icon}
                limit={1}
                fileList={gtypesform.icon ? [{ ...gtypesform.icon }] : []}
                handleSource={() => {
                  if (!gtypesform.icon)
                    this.setState({
                      visible: true,
                      selectList: [],
                      _selectList: [],
                    });
                }}
                onChange={(e, list) => {
                  const del = !!list;
                  let arrlist = del ? null : { ...e };
                  this.chnageModaldata(arrlist, 'icon');
                }}
                restprops={{ openFileDialogOnClick: false }}
              />
            </FormItem_S>
          </Form>
        </Modal>
        <Modal
          width="60%"
          title="素材选择"
          visible={visible}
          centered
          onCancel={() => this.setState({ visible: false })}
          onOk={() => {
            // const { _selectList } = this.state
            _selectList[0] &&
              this.chnageModaldata({ ..._selectList[0], index: undefined, key: undefined }, 'icon');
            this.setState({ visible: false, _selectList: [] });
          }}
          bodyStyle={{ maxHeight: `${wh - 300}px`, overflowY: 'auto' }}
        >
          <SourceImageTab
            limit={1}
            visible={visible}
            onSelectItem={list => this.setState({ _selectList: list })}
            {...this.props}
            type={'picture'}
          />
        </Modal>
      </Fragment>
    );
  }
}

export default gType;
