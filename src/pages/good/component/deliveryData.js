import React, { Component, Fragment } from 'react';
import { permissionAuth } from '@/utils/permission';
import { Button, Col, DatePicker, message, Row } from 'antd';
import TagSelect from './tagSelect';
import moment from 'moment';

class deliveryData extends Component {
  state = {
    openVisible: false,
    openDate: null
  }

  componentDidMount = () => {}

  componentDidUpdate = (preprops,prestate) => {}

  //添加具体日期
  addDate = () => {
    const { openDate } = this.state
    let { specific, onChange, disabled } = this.props
    let arr = specific || [], flag = true
    arr.map(item => {
      if(item === openDate){
        flag = false && flag
      }
    })
    if(flag){
      openDate ? arr.push(openDate) : message.warning("日期不能为空,请选择")
    }
    else{
      message.warning("日期已存在,请重新选择")
    }
    specific = [ ...arr ]
    if(!disabled){
      onChange(specific)
    }
  }
  //删除日期
  onClose = (e) => {
    let { specific, onChange, disabled } = this.props
    let arr = []
    specific.map(item => {
      if(item !== e){
        arr.push(item)
      }
    })
    specific = [ ...arr ]
    if(!disabled){
      onChange(specific)
    }
  }

  disabledDate = (current) => {
    let { limit } = this.props
    let day = moment().endOf('day')
    if(limit){
      if(day < moment(limit[0]) ){ //以后开始
        return current && ( current > moment(limit[1]) || current < moment(limit[0]) )
      }
      else{  //已经开始
        return current && ( current < moment().endOf('day') || current > moment(limit[1]) )
      }
    }
    return current && current < moment().endOf('day');
  }

  //处理传值
  conversionObject() {
    const { specific, disabled }  = this.props;
    if (!specific) {
      return {
        specific:[]
      };
    }
    return {
      specific,
      disabled
    };
  }

  render() {
    const { specific, disabled } = this.conversionObject();
    const { openVisible, openDate } = this.state

    return(
      <Fragment>
        <Row>
          <Col>
            <TagSelect children={specific || []}
                       disabled={disabled}
                       onClose={(e) => this.onClose(e)} />
          </Col>
          <Col style={!specific || specific.length === 0 ? {marginTop: '40px'} : {}}>
            <DatePicker
              disabled={disabled}
              open={openVisible}
              value={openDate ? moment(openDate,'YYYY-MM-DD') : null }
              onOpenChange={() => this.setState({ openVisible:true })}
              onChange={(e,dateString) => {this.setState({ openDate: dateString }); }}
              disabledDate={(e) => this.disabledDate(e)}
              dateRender={(current) => {
                const style = {};
                specific ? specific.map(item => {
                  if (current.format('YYYY-MM-DD') === item) {
                    style.border = '1px solid #1890ff';
                    style.borderRadius = '50%';
                    style.width = '24px';
                  }
                }) : []
                return (
                  <div className="ant-calendar-date" style={style}>
                    {current.date()}
                  </div>
                );
              }}
              renderExtraFooter={() => {
                return (
                  <Row><Col style={{ textAlign: 'right'}}>
                    <Button size='small' onClick={() => this.setState({ openVisible:false })}>关闭</Button>
                    <Button type='primary' size='small' style={{marginLeft:10}} onClick={() => this.addDate()}>添加</Button>
                  </Col></Row>
                );
              }}
            />
          </Col>
        </Row>
      </Fragment>
    )
  }
}

export default deliveryData;
