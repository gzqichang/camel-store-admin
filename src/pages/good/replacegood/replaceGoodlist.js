import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import {
  Button,
  Card,
  DatePicker,
  Select,
  Input, Spin,
} from 'antd';
import styles from '../editpage.less'
import { permissionAuth } from '@/utils/permission';
import { isUrl } from '@/utils/utils';
import TableList from '../component/tableList';
import moment from 'moment';
import CollapseItem from '@/components/CostomCom/collapseItem';

const itemsPerPage = 10;
const Option = Select.Option
const { RangePicker } = DatePicker

@connect(({ goods, global, loading }) => ({
  categorylist:goods.list,
  replgoodslist: goods.replgoodslist,
  replgoodCount: goods.replgoodCount,
  shopid: global.shopid,
  permissions:global.permissions,
  searchform: global.searchform,
  GoodsLoading: loading.effects['goods/fetchGoods'],
}))
class replaceGoodlist extends Component {
  state = {
    goodform:{}
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type:'global/resetSearchFormKey',
      payload:{ key:'replgood' }
    }).then(() => { this.initData('init') })
  }
  initData = (type) => {
    const { dispatch, searchform:{ replgood } } = this.props;
    const { goodform } = this.state
    let _goodform = {}
    if(type === 'init'){
      _goodform = { ...replgood }
      this.setState({ goodform:{ ...replgood } })
    }
    else if(type === 'reset'){
      this.setState({ goodform:{} })
    }
    else if(type === 'search'){
      _goodform = { ...goodform, page: 1 }
      this.setState({ goodform:{ ..._goodform } })
    }
    else{
      _goodform = { ...goodform }
    }
    let data = {
      page_size:itemsPerPage,
      model_type:'replace',
      ..._goodform
    }
    let shopid = getLocalStorage('shopid').split('#')[0]
    shopid !== 'all' ? data.shop = shopid : null
    dispatch({
      type: 'goods/fetchGoods',
      payload: {
        ...data
      }
    })
  }

  componentDidUpdate(preprops) {
    const { shopid } = this.props
    if(preprops.shopid !== shopid && shopid !== ''){
      this.initData('reset')
    }
  }

  componentWillUnmount() {
    const { goodform } = this.state
    const { dispatch } = this.props
    dispatch({
      type:'global/searchFormKey',
      payload:{ replgood: {...goodform} }
    })
  }

  //头部搜索栏
  handlegoodform = (key,e) => {
    const { goodform } = this.state
    goodform[key] = e.target.value
    this.setState({ goodform })
  }
  ondateChange = (date, dateString) => {
    const { goodform } = this.state
    goodform['date_time_after'] = dateString[0]
    goodform['date_time_before'] = dateString[1]
    this.setState({ goodform })
  }
  handleSearch = () => {
    this.initData('search')
  }

  getAuth = key => {
    const { permissions } = this.props
    return permissions.includes(permissionAuth[key])
  }

  render(){
    const { replgoodslist, replgoodCount, GoodsLoading } = this.props
    const { goodform } = this.state
    let data = {
      page_size:itemsPerPage,
      model_type:'replace',
      ...goodform
    }
    let shopid = getLocalStorage('shopid').split('#')[0]
    shopid !== 'all' ? data.shop = shopid : null
    const pagination = {
      pageSize: itemsPerPage,
      current: goodform.page || 1,
      total: replgoodCount,
      onChange: (page) => {
        this.setState({ goodform:{...goodform, page} });
        const { dispatch } = this.props
        dispatch({
          type: 'goods/fetchGoods',
          payload: {
            ...data,
            page,
          }
        })
      },
    };

    return(
      <PageHeaderWrapper>
      <Card className={styles.main}>
        <Spin spinning={false}>
          <CollapseItem
            renderSimpleForm={() =>
              <Fragment>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>商品名: </span>
                  <Input
                    value={goodform.name}
                    onChange={(e) => this.handlegoodform('name',e)}
                    placeholder="请输入商品名"
                    style={{ width: 200 }}/>
                </div>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>商品状态: </span>
                  <Select value={goodform.status}
                          onChange={(e) => this.handlegoodform('status',{target: {value:e}}) }
                          style={{ width: 200 }}>
                    <Option value="is_sell">在售</Option>
                    <Option value="preview">预览</Option>
                    <Option value="not_enough">库存不足</Option>
                    <Option value="not_sell">下架</Option>
                  </Select>
                </div>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>添加时间: </span>
                  <RangePicker
                    value={goodform.date_time_after ? [moment(goodform.date_time_after, 'YYYY-MM-DD'), moment(goodform.date_time_before, 'YYYY-MM-DD')] : null}
                    onChange={this.ondateChange}
                  />
                </div>
                <div className={styles.searchitem}>
                  <span className={styles.searchitem_span}>是否虚拟商品: </span>
                  <Select value={goodform.fictitious}
                          onChange={(e) => this.handlegoodform('fictitious',{target: {value:e}}) }
                          style={{ width: 200 }}>
                    <Option key="是" value={true}>是</Option>
                    <Option key="否" value={false}>否</Option>
                  </Select>
                </div>
              </Fragment>}/>
        </Spin>
        <div style={{float: "right"}}>
          <Button type='primary' onClick={this.handleSearch}>查询</Button>
          <Button type='danger' style={{ marginLeft: 20 }} onClick={() => this.initData('reset')}>重置</Button>
        </div>
        <Link to={{ pathname: `/good/replacegood/replacegoodlist/editreplacegood`, query: { id: null } }}>
          <Button type='primary' style={{ marginBottom: 20 }}>新增积分商品</Button>
        </Link>
        <TableList loading={GoodsLoading}
                   dataSource={replgoodslist}
                   pagination={pagination}
                   initData={this.initData}
                   isTemplate={false}
                   replacegood={true}
                   path={'/good/replacegood/replacegoodlist/editreplacegood'}
        />
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default replaceGoodlist
