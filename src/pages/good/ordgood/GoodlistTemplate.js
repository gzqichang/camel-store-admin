import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import Link from "umi/link";
import { connect } from "dva";
import { permissionAuth } from "@/utils/permission";
import { setLocalStorage, getLocalStorage } from "@/utils/authority";
import { Button, Card, DatePicker, Select, Input, Col, Row, Spin } from "antd";
import styles from "../editpage.less";
import CategorySelect from "@/components/CostomCom/categorySelect";
import TableList from "../component/tableList";
import moment from "moment";
import CollapseItem from "@/components/CostomCom/collapseItem";

const itemsPerPage = 10;
const Option = Select.Option;
const { RangePicker } = DatePicker;

@connect(({ goods, global, loading }) => ({
  categorylist: goods.list,
  goodsTempaltelist: goods.goodsTempaltelist,
  goodTempalteCount: goods.goodTempalteCount,
  shopid: global.shopid,
  permissions: global.permissions,
  searchform: global.searchform,
  GoodsLoading: loading.models.goods
}))
class GoodlistTemplate extends Component {
  state = {
    goodform: {}
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "global/resetSearchFormKey",
      payload: { key: "goodtem" }
    }).then(() => {
      this.initData("init");
    });
  }
  initData = type => {
    const {
      dispatch,
      searchform: { goodtem }
    } = this.props;
    const { goodform } = this.state;
    let _goodform = {};
    if (type === "init") {
      _goodform = { ...goodtem };
      this.setState({ goodform: { ...goodtem } });
    } else if (type === "reset") {
      this.setState({ goodform: {} });
    } else if (type === "search") {
      _goodform = { ...goodform, page: 1 };
      this.setState({ goodform: { ..._goodform } });
    } else {
      _goodform = { ...goodform };
    }
    let data = {
      page_size: itemsPerPage,
      model_type: "ord",
      is_template: true,
      ..._goodform
    };
    dispatch({
      type: "goods/fetchGoods",
      payload: {
        ...data
      }
    });
  };

  componentWillUnmount() {
    const { goodform } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: "global/searchFormKey",
      payload: { goodtem: { ...goodform } }
    });
  }

  //头部搜索栏
  handlegoodform = (key, e) => {
    const { goodform } = this.state;
    goodform[key] = e.target.value;
    this.setState({ goodform });
  };
  ondateChange = (date, dateString) => {
    const { goodform } = this.state;
    goodform["date_time_after"] = dateString[0];
    goodform["date_time_before"] = dateString[1];
    this.setState({ goodform });
  };
  handleSearch = () => {
    this.initData("search");
  };

  //获取权限
  getAuth = e => {
    const { permissions } = this.props;
    return permissions.includes(permissionAuth[e]);
  };

  render() {
    const { goodsTempaltelist, goodTempalteCount, GoodsLoading } = this.props;
    const { goodform } = this.state;
    const pagination = {
      pageSize: itemsPerPage,
      current: goodform.page || 1,
      total: goodTempalteCount,
      onChange: page => {
        this.setState({ goodform: { ...goodform, page } });
        const { dispatch } = this.props;
        dispatch({
          type: "goods/fetchGoods",
          payload: {
            ...goodform,
            page,
            page_size: itemsPerPage,
            model_type: "ord",
            is_template: true
          }
        });
      }
    };
    const createTem = this.getAuth("createTemplate");
    return (
      <PageHeaderWrapper>
        <Card className={styles.main}>
          <Spin spinning={false}>
            <CollapseItem
              renderSimpleForm={() => (
                <Fragment>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>商品名: </span>
                    <Input
                      value={goodform.name}
                      onChange={e => this.handlegoodform("name", e)}
                      placeholder="请输入商品名"
                      style={{ width: 200 }}
                    />
                  </div>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>商品类别: </span>
                    <CategorySelect
                      type="search"
                      newprops={{ style: { width: 200 } }}
                      value={goodform.category}
                      onChange={e =>
                        this.handlegoodform("category", {
                          target: { value: e }
                        })
                      }
                    />
                  </div>
                  {/*<div className={styles.searchitem}>*/}
                  {/*<span className={styles.searchitem_span}>商品状态: </span>*/}
                  {/*<Select value={goodform.status}*/}
                  {/*onChange={(e) => this.handlegoodform('status',{target: {value:e}}) }*/}
                  {/*style={{ width: 200 }}>*/}
                  {/*<Option value="is_sell">在售</Option>*/}
                  {/*<Option value="preview">预览</Option>*/}
                  {/*<Option value="not_enough">库存不足</Option>*/}
                  {/*<Option value="not_sell">下架</Option>*/}
                  {/*</Select>*/}
                  {/*</div>*/}
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>添加时间: </span>
                    <RangePicker
                      value={
                        goodform.date_time_after
                          ? [
                              moment(goodform.date_time_after, "YYYY-MM-DD"),
                              moment(goodform.date_time_before, "YYYY-MM-DD")
                            ]
                          : null
                      }
                      onChange={this.ondateChange}
                    />
                  </div>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>
                      是否热门商品:{" "}
                    </span>
                    <Select
                      value={goodform.recommendation}
                      onChange={e =>
                        this.handlegoodform("recommendation", {
                          target: { value: e }
                        })
                      }
                      style={{ width: 200 }}
                    >
                      <Option key="是" value={true}>
                        是
                      </Option>
                      <Option key="否" value={false}>
                        否
                      </Option>
                    </Select>
                  </div>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>
                      是否虚拟商品:{" "}
                    </span>
                    <Select
                      value={goodform.fictitious}
                      onChange={e =>
                        this.handlegoodform("fictitious", {
                          target: { value: e }
                        })
                      }
                      style={{ width: 200 }}
                    >
                      <Option key="是" value={true}>
                        是
                      </Option>
                      <Option key="否" value={false}>
                        否
                      </Option>
                    </Select>
                  </div>
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>
                      是否拼团商品:{" "}
                    </span>
                    <Select
                      value={goodform.groupbuy}
                      onChange={e =>
                        this.handlegoodform("groupbuy", {
                          target: { value: e }
                        })
                      }
                      style={{ width: 200 }}
                    >
                      <Option key="是" value={true}>
                        是
                      </Option>
                      <Option key="否" value={false}>
                        否
                      </Option>
                    </Select>
                  </div>
                </Fragment>
              )}
            />
          </Spin>
          <Row>
            {createTem ? (
              <Col span={12}>
                <Link
                  to={{
                    pathname: `/good/template/goodlistTemplate/editgoodTemplate`,
                    query: { id: null }
                  }}
                >
                  <Button type="primary" style={{ marginBottom: 20 }}>
                    新增商品模板
                  </Button>
                </Link>
              </Col>
            ) : null}
            <Col
              span={12}
              offset={createTem ? 0 : 12}
              style={{ textAlign: "right", marginBottom: 20 }}
            >
              <Button type="primary" onClick={this.handleSearch}>
                查询
              </Button>
              <Button
                type="danger"
                style={{ marginLeft: 20 }}
                onClick={() => this.initData("reset")}
              >
                重置
              </Button>
            </Col>
          </Row>
          <TableList
            loading={GoodsLoading}
            dataSource={goodsTempaltelist}
            pagination={pagination}
            initData={this.initData}
            isTemplate={true}
            path={"/good/template/goodlistTemplate/editgoodTemplate"}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default GoodlistTemplate;
