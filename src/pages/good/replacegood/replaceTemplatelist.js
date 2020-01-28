import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Link from 'umi/link';
import { connect } from 'dva';
import { setLocalStorage, getLocalStorage } from '@/utils/authority';
import {
  Button,
  Card,
  DatePicker,
  Row,
  Col,
  Select,
  Input, Spin,
} from 'antd';
import styles from '../editpage.less'
import { permissionAuth } from '@/utils/permission';
import TableList from '../component/tableList';
import moment from 'moment';
import CollapseItem from '@/components/CostomCom/collapseItem';

const itemsPerPage = 10;
const Option = Select.Option
const { RangePicker } = DatePicker

@connect(({ goods, global, loading }) => ({
  categorylist:goods.list,
  replTemplatelist: goods.replTemplatelist,
  replTemplateCount: goods.replTemplateCount,
  shopid: global.shopid,
  permissions:global.permissions,
  searchform: global.searchform,
  GoodsLoading: loading.effects['goods/fetchGoods'],
}))
class subscribeTemplatelist extends Component {
  state = {
    goodform:{}
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type:'global/resetSearchFormKey',
      payload:{ key:'replgoodtem' }
    }).then(() => { this.initData('init') })
  }
  initData = (type) => {
    const { dispatch, searchform:{ replgoodtem }} = this.props;
    const { page, goodform } = this.state
    let _goodform = {}
    if(type === 'init'){
      _goodform = { ...replgoodtem }
      this.setState({ goodform:{ ...replgoodtem } })
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
      is_template: true,
      ..._goodform
    }
    dispatch({
      type: 'goods/fetchGoods',
      payload: {
        ...data
      }
    })
  }

  componentWillUnmount() {
    const { goodform } = this.state
    const { dispatch } = this.props
    dispatch({
      type:'global/searchFormKey',
      payload:{ replgoodtem: {...goodform} }
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
    const { replTemplatelist, replTemplateCount, GoodsLoading } = this.props
    const { goodform } = this.state
    let data = {
      page_size:itemsPerPage,
      is_template: true,
      model_type:'replace',
      ...goodform
    }
    const pagination = {
      pageSize: itemsPerPage,
      current: goodform.page || 1,
      total: replTemplateCount,
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
    const addsubgoodTemplate = this.getAuth('createTemplate')
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
        <Row>
          {addsubgoodTemplate ?
            <Col span={12}>
              <Link to={{ pathname: `/good/template/replacetemplete/replaceEditTemplete`, query: { id: null} }}>
                <Button type='primary' style={{ marginBottom: 20 }}>新增积分商品模板</Button>
              </Link>
            </Col>
            : null
          }
          <Col span={12} offset={addsubgoodTemplate ? 0 : 12} style={{ textAlign:'right',marginBottom: 20 }}>
            <Button type='primary' onClick={this.handleSearch}>查询</Button>
            <Button type='danger' style={{ marginLeft: 20 }} onClick={() => this.initData('reset')}>重置</Button>
          </Col>
        </Row>
        <TableList loading={GoodsLoading}
                   dataSource={replTemplatelist}
                   pagination={pagination}
                   initData={this.initData}
                   isTemplate={true}
                   replacegood={true}
                   path={'/good/template/replacetemplete/replaceEditTemplete'}
        />
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default subscribeTemplatelist
