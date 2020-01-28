import React, { Component, Fragment } from 'react';
import { permissionAuth } from '@/utils/permission';
import { Button, Table, message, Select, TimePicker, Modal } from 'antd';
import moment from 'moment';

const Option = Select.Option;
const format = 'HH:mm';
const Time_Picker = props => <TimePicker placeholder="请选择" suffixIcon={null} format={format} size="small" style={{width:80}} {...props}/>

class bookTime extends Component {
  state = {
    estimate_time: [],
    postage_typemax: 0
  }

  componentDidMount = () => {}

  componentDidUpdate = (preprops,prestate) => {
    const { estimate_time } = this.props
    let { postage_typemax } = this.state
    if(estimate_time.length > 0 && postage_typemax !== estimate_time.length){
      postage_typemax = estimate_time.length
      this.setState({ postage_typemax })
    }
  }

  disabledHours = (start) => {
    let arr = [];
    for (let i = 0; i < 24; i++){
      i < start ? arr.push(i) : null
    }
    return arr
  }
  disabledMinutes = (hour,start) => {
    let arr = [];
    let hh = start.split(":")[0], mm = start.split(":")[1];
    if(hour === Number(hh)){
      for (let i = 0; i < 59; i++){
        i < mm ? arr.push(i) : null
      }
    }
    return arr
  }

  addlist = () => {
    let { estimate_time, onChange } = this.props
    let { postage_typemax } = this.state
    let flag = true
    estimate_time && estimate_time.length > 0 ? estimate_time.map((list) => {
      Object.keys(list).map(tt => {
        const arr = !(Array.isArray(list[tt]) ? list[tt].length > 1 : list[tt] !== '')
        flag = !arr && flag
      })
    }) : null
    if(!flag){
      message.warning('请先填写完整上面数据！')
    }
    else{
      let len = estimate_time.length
      if(len > 0 && estimate_time[len-1].add[1] === "23:59"){
        message.warning('下单时间已覆盖所有24小时！')
      }
      else{
        estimate_time.length === 0
          ? estimate_time.push({ add: ["00:00","23:59"],  send: [], sendtype: '',key:postage_typemax + 1})
          : estimate_time.push({ add: [estimate_time[len-1].add[1],"23:59"],  send: [], sendtype: '',key:postage_typemax + 1})
        this.setState({ postage_typemax:postage_typemax+1 })
      }
    }
    onChange(estimate_time)
  }

  ontimeChange = (str,keyname,_index,key) => {
    const { estimate_time, onChange, disabled } = this.props;
    let itemindex = 0, edit = false
    if(keyname === null){  //删除
      Modal.confirm({
        title: '确认操作',
        content: `确认删除该时间段`,
        okText: '删除',
        okType: 'danger',
        centered: true,
        onOk() {
          let copy_postage = [...estimate_time]
          copy_postage.map((list,index) => {
            if(list.key === key){
              itemindex = index
            }
          })
          estimate_time.splice(itemindex,1)
          if(!disabled){
            onChange(estimate_time)
          }
        }
      })
    }
    else{
      estimate_time.map((list,index) => {
        if(list.key === key){
          if(_index === null){
            list[keyname] = str
          }
          else{
            if(keyname === 'add' && _index === 1){
              itemindex = index
              edit = true
            }
            list[keyname][_index] = str
          }
        }
      })
      edit && estimate_time.length > itemindex + 1 ? estimate_time[itemindex+1].add[0] = str : null
    }
    if(!disabled){
      onChange(estimate_time)
    }
  }

  //处理传值
  conversionObject() {
    const { estimate_time, disabled } = this.props;
    if (!estimate_time) {
      return {
        estimate_time:[]
      };
    }
    estimate_time.map((item,index) => item.key = index)
    return {
      estimate_time,
      disabled,
      postage_typemax: estimate_time.length
    };
  }

  render(){
    const { estimate_time, disabled } = this.conversionObject();

    const column = [
      {
        title: '下单时间',
        dataIndex: 'add_time',
        key: 'add_time',
        render: (t,r) => (
          <Fragment>
            <Time_Picker value={r.add[0] ? moment(r.add[0],format) : null}
                         disabled={true}
                         onChange={(time,timeString) => this.ontimeChange(timeString,'add',0,r.key)}
            />
            <span style={{marginLeft: 5,marginRight: 5}}>-</span>
            <Time_Picker value={r.add[1] ? moment(r.add[1],format) : null}
                         disabled={disabled}
                         disabledHours={() => this.disabledHours(moment(r.add[0]).format('HH') )}
                         disabledMinutes={(e) => this.disabledMinutes(e,r.add[0])}
                         onChange={(time,timeString) => this.ontimeChange(timeString,'add',1,r.key)}
            />
          </Fragment>
        )
      },
      {
        title: '预计送达时间',
        dataIndex: 'send_time',
        key: 'send_time',
        render: (t,r) => (
          <Fragment>
            <Select size="small" value={r.sendtype} style={{ width:100, marginRight:5 }}
                    disabled={disabled}
                    onChange={(e) => this.ontimeChange(e,'sendtype',null,r.key)}>
              <Option value="today">下单当日</Option>
              <Option value="tomorrow">下单次日</Option>
            </Select>
            <Time_Picker value={r.send[0] ? moment(r.send[0],format) : null}
                         disabled={disabled}
                         onChange={(time, timeString) => this.ontimeChange(timeString,'send',0,r.key)}
            />
            <span style={{marginLeft: 5,marginRight: 5}}>-</span>
            <Time_Picker value={r.send[1] ? moment(r.send[1],format) : null}
                         disabled={disabled}
                         disabledHours={() => this.disabledHours(r.send[0] ? r.send[0].split(":")[0] : 0 )}
                         disabledMinutes={(e) => this.disabledMinutes(e,r.send[0] || '00:00')}
                         onChange={(time, timeString) => this.ontimeChange(timeString,'send',1,r.key)}
            />
          </Fragment>
        )
      },
      {
        title: '操作',
        dataIndex: 'action',
        fixed: 'right',
        width:80,
        key: 'action',
        render: (t,r) => (
          <Fragment>
            <a onClick={() => this.ontimeChange('',null,null,r.key)} style={{color:'red'}}>删除</a>
          </Fragment>
        )
      },
    ]

    return(
      <Fragment>
        <Table
          dataSource={estimate_time}
          columns={column}
          scroll={{ x: 700 }}
        />
        <Button size="small" disabled={disabled} type="dashed" style={{width:'100%'}} onClick={this.addlist}>添加</Button>
      </Fragment>
    )
  }
}

export default bookTime;
