import React, { Component, Fragment } from 'react';
import { permissionAuth } from '@/utils/permission';
import { Button, InputNumber, List, message, Radio,Modal } from 'antd';

const RadioGroup = Radio.Group
const InputNumberItem = props => <InputNumber precision={0} style={{width:60}} placeholder="请输入" size="small" {...props}/>

class mixedStairs extends Component {
  state = {
    stairs: [{ num: '',  index: 1}],
    postage_typemax: 1,
    edit: true,
  }

  componentDidMount() {
    const { goodtype, onChange } = this.props
    if(goodtype === 'subgood'){
      onChange('people', 'mode' )
    }
  }


  componentDidUpdate = (preprops,prestate) => {
    const { stairs } = this.props
    let { postage_typemax, edit } = this.state
    if((stairs && stairs.length > 0 || !edit) && postage_typemax !== stairs.length){
      postage_typemax = stairs.length
      this.setState({ postage_typemax, stairs:[...stairs], edit: false })
    }
  }

  //配送距离的邮费设置
  disthandle = (item,keyname,key) => {
    let { edit,stairs } = this.state
    const that = this
    if(edit){
      if(keyname === ''){  //删除
        Modal.confirm({
          title:'确认操作',
          content:'确认删除该阶梯',
          okText:'删除',
          centered:true,
          cancelText:'取消',
          onOk(){
            let newfilterstair = stairs.filter(item => item.index !== key )
            let newstair = []
            for (let i = 0; i < newfilterstair.length; i++){
              newstair.push({index:i+1,num:newfilterstair[i].num})
            }
            if(newstair.length === 0){
              that.setState({ stairs:[]  })
            }
            else{
              that.setState({ stairs:[...newstair]  })
            }
          }
        })
      }
      else{  //修改
        stairs[key-1][keyname] = item
        this.setState({ stairs })
      }
    }
  }

  adddist = () => {
    let { postage_typemax, edit, stairs } = this.state
    const { mode } = this.props
    if(edit){
      let flag = true
      const nulllist = { num: '',  index: ''}
      if(stairs && stairs.length > 0) {
        stairs.map((list) => {
          if(!list.num){
            flag = Boolean(flag && false)
          }
        })
      }
      if(!flag){
        message.warning('请先填写完整上面数据！')
      }
      else{
        nulllist.index = stairs.length + 1
        stairs.push(nulllist)
        this.setState({ postage_typemax: postage_typemax+1, stairs:[...stairs] })
      }
    }
    else{
      if(mode){
        this.setState({ edit:true })
      }
      else{
        message.warning("请选择成团的类型！")
      }
    }
  }

  savedist = () => {
    let { onChange } = this.props
    let { stairs } = this.state
    let flag = true
    stairs && stairs.length > 0 ? stairs.map((list) => {
      if (!list.num) {
        flag = Boolean(flag && false)
      }
    }) : null
    if(flag){
      onChange(stairs, 'ladder_list')
      this.setState({ edit:false, stairs, postage_typemax: stairs.length })
    }
    else{
      message.warning('请先填写完整上面数据！')
    }
  }

  //处理传值
  conversionObject() {
    const { mode, disabled, stairs } = this.props;
    return {
      mode,
      disabled,
      stairs1:[...stairs]
    };
  }

  render(){
    const { edit, stairs } = this.state
    const { goodtype, onChange } = this.props
    const { mode, disabled, stairs1 } = this.conversionObject();
    const _stairs = !edit && stairs.length <= 0 ? stairs1 : stairs
    return(
      <Fragment>
        <RadioGroup disabled={Boolean(goodtype || disabled)} onChange={(e) => onChange(e.target.value, 'mode' )} value={mode}>
          <Radio value="people">成团人数</Radio>
          <Radio value="goods">成团商品件数</Radio>
        </RadioGroup>
        <List
          dataSource={_stairs}
          itemLayout="horizontal"
          renderItem={item => (
            <List.Item
              actions={[<a onClick={() => this.disthandle(item,'',item.index)} style={ edit ? {color:'red'} : {display: 'none'}}>删除</a>]}>
              <span style={{marginRight: 10}}>阶梯{item.index}</span>
              <span style={{marginRight: 5}}>
                { mode === 'people' ? '成团人数' : '成团商品件数'}
              </span>
              { edit ?
                <InputNumberItem value={item.num}
                                 min={item.index-1 > 0 ? Number(_stairs[item.index-2].num)+1 : 2}
                                 onChange={(e) => this.disthandle(e, 'num', item.index)}/>
                : item.num
              }
              <span style={{marginLeft:5,marginRight: 30}}>
                { mode === 'people' ? '人' : '件'}
              </span>
            </List.Item>
          )}
          footer={(
            <Fragment>
              <Button size="small" onClick={this.adddist} disabled={disabled}>{edit ? '添加' : '编辑'}</Button>
              { edit ?
                <Button size="small" style={{ marginLeft: 10 }} type="primary" onClick={this.savedist}>保存</Button>
                : null
              }
            </Fragment>
          )}
        />
      </Fragment>
    )
  }
}

export default mixedStairs;
