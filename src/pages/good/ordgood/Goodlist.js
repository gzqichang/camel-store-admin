import React, { Component, Fragment } from "react";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import Link from "umi/link";
import { connect } from "dva";
import { setLocalStorage, getLocalStorage } from "@/utils/authority";
import { Button, Card, DatePicker, Select, Input, Spin } from "antd";
import styles from "../editpage.less";
import CategorySelect from "@/components/CostomCom/categorySelect";
import TableList from "../component/tableList";
import CollapseItem from "@/components/CostomCom/collapseItem";
import moment from "moment";

const itemsPerPage = 10;
const Option = Select.Option;
const { RangePicker } = DatePicker;

@connect(({ goods, global, loading }) => ({
  categorylist: goods.list,
  goodslist: goods.goodslist,
  goodlistCount: goods.goodlistCount,
  shopid: global.shopid,
  searchform: global.searchform,
  GoodsLoading: loading.effects["goods/fetchGoods"]
}))
class Goodlist extends Component {
  state = {
    goodform: {}
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "global/resetSearchFormKey",
      payload: { key: "good" }
    }).then(() => {
      this.initData("init");
    });
  }
  initData = type => {
    const {
      dispatch,
      searchform: { good }
    } = this.props;
    const { goodform } = this.state;
    let _goodform = {};
    if (type === "init") {
      _goodform = { ...good };
      this.setState({ goodform: { ...good } });
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
      ..._goodform
    };
    let shopid = getLocalStorage("shopid").split("#")[0];
    shopid !== "all" ? (data.shop = shopid) : null;
    dispatch({
      type: "goods/fetchGoods",
      payload: {
        ...data
      }
    });
  };

  componentDidUpdate(preprops) {
    const { shopid } = this.props;
    if (preprops.shopid !== shopid && shopid !== "") {
      this.initData("reset");
    }
  }

  componentWillUnmount() {
    const { goodform } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: "global/searchFormKey",
      payload: { good: { ...goodform } }
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

  render() {
    const { goodslist, goodlistCount, GoodsLoading } = this.props;
    const { goodform } = this.state;
    let shopid = getLocalStorage("shopid").split("#")[0];
    let data = {
      page_size: itemsPerPage,
      model_type: "ord",
      ...goodform
    };
    shopid !== "all" ? (data.shop = shopid) : null;
    const pagination = {
      pageSize: itemsPerPage,
      current: goodform.page || 1,
      total: goodlistCount,
      onChange: page => {
        this.setState({ goodform: { ...goodform, page } });
        const { dispatch } = this.props;
        dispatch({
          type: "goods/fetchGoods",
          payload: {
            ...data,
            page
          }
        });
      }
    };
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
                  <div className={styles.searchitem}>
                    <span className={styles.searchitem_span}>商品状态: </span>
                    <Select
                      value={goodform.status}
                      onChange={e =>
                        this.handlegoodform("status", { target: { value: e } })
                      }
                      style={{ width: 200 }}
                    >
                      <Option value="is_sell">在售</Option>
                      <Option value="preview">预览</Option>
                      <Option value="not_enough">库存不足</Option>
                      <Option value="not_sell">下架</Option>
                    </Select>
                  </div>
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
          <div style={{ float: "right" }}>
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
          </div>
          <Link
            to={{
              pathname: `/good/ordgood/goodlist/editgood`,
              query: { id: null }
            }}
          >
            <Button type="primary" style={{ marginBottom: 20 }}>
              新增商品
            </Button>
          </Link>
          <TableList
            loading={GoodsLoading}
            dataSource={goodslist}
            pagination={pagination}
            initData={this.initData}
            isTemplate={false}
            path={"/good/ordgood/goodlist/editgood"}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Goodlist;
