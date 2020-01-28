import moment from 'moment';
import { message } from 'antd';
import PromiseRender from '../components/Authorized/PromiseRender';

//图片数组->组件图片组
export function imageTransform(res = [], max) {
  let arr = [];
  res.map((item, index) => {
    const object = {};
    object.key = item.image ? item.image.url : item.url;
    object.uid = max ? max : index * -1;
    object.url = item.image ? item.image.file : item.file;
    object.name = item.image ? item.image.label : item.label;
    arr.push(object);
  });
  return arr;
}
//组件图片组->图片数组
export function imageTransformReverse(res = [], list) {
  let arr = [];
  res.map(item => {
    if (item.image && list.includes(item.image.url)) {
      arr.push(item);
    } else if (list.includes(item.url)) {
      arr.push(item);
    }
  });
  return arr;
}

//组件图片转换上传{image:'',index:''}
export function imageRequest(res = []) {
  res.map((item, index) => {
    item.index = index + 1;
  });
  return res;
}

//校验时间跨度
export function timeRange(res = []) {
  let flag = true,
    tip = '';
  res.map(item => {
    if (moment(item[0]).isSame(item[1], 'date')) {
      tip = '下单开始时间不得等于结束时间';
      flag = false;
    }
  });
  let len = res.length;
  if (res[len - 1][1] !== '23:59') {
    tip = '下单时间没有覆盖24小时';
    flag = false;
  }
  if (flag) {
    return flag;
  } else {
    return tip;
  }
}

//商品模块初始化
export function InitGoodData(res = {}, e) {
  const gooddata = {
    ...res,
    postage:
      (res.postage &&
        res.postage.map((item, index) => {
          return { ...item, key: index + 1 };
        })) ||
      [],
  };
  res.ord_goods && res.model_type === 'ord'
    ? (gooddata.ord_goods = {
        ...res.ord_goods,
        gtypes: res.ord_goods.gtypes.map((item, index) => {
          return { ...item, key: index };
        }),
      })
    : null;
  res.sub_goods && res.model_type === 'sub'
    ? (gooddata.sub_goods = {
        ...res.sub_goods,
        gtypes: res.sub_goods.gtypes.map((item, index) => {
          return { ...item, key: index };
        }),
      })
    : null;
  res.repl_goods && res.model_type === 'replace'
    ? (gooddata.repl_goods = {
        ...res.repl_goods,
        gtypes: res.repl_goods.gtypes.map((item, index) => {
          return { ...item, key: index };
        }),
      })
    : null;

  if (e) {
    gooddata.category = null;
  }
  return gooddata;
}

//从模板新建，去掉id,url
export function delSign(res = {}) {
  let obj = { ...res };
  Object.keys(obj).map(item => {
    if (item === 'id' || item === 'url') {
      delete res[item];
    }
    if (
      item === 'ord_goods' ||
      item === 'sub_goods' ||
      item === 'repl_goods' ||
      item === 'groupbuy_info'
    ) {
      return delSign(obj[item]);
    }
    if (item === 'gtypes' && obj[item].length > 0) {
      obj[item].map(item_in => {
        return delSign(item_in);
      });
    }
    if (item === 'attach' && obj[item].length > 0) {
      obj[item].map(item_in => {
        return delSign(item_in);
      });
    }
  });
  return res;
}
//商品模块校验规格
export function validtypeForm(args = {}, ladder_list, model_type) {
  let flag = true,
    flag_list = true;
  let tip = {
    content: '规格名不能为空',
    price: '售卖价不能为空',
    stock: '库存不能为空',
  };
  if (model_type !== 'replace') {
    tip.market_price = '市场价不能为空';
  }
  if (model_type !== 'repl_goods') {
    tip.credit = '积分数量不能为空';
  }
  if (model_type === 'sub') {
    tip.cycle_num = '订阅期数不能为空';
  }
  Object.keys(tip).map(item => {
    if (!args[item] && item !== 'stock') {
      message.error(tip[item]);
      flag = false;
    }
    if (item === 'stock' && !args[item]) {
      message.error(tip[item]);
      flag = false;
    }
  });
  if (ladder_list && args.ladder_list) {
    args.ladder_list.map(item_in => {
      if (!item_in.price) {
        flag_list = false;
      }
    });
    if (!flag_list) {
      message.error('阶梯价格不完整');
    }
  }
  return flag && flag_list;
}
//商品模块提交前的校验
export function validatingForm(args = {}) {
  let tips = {
    name: '商品名不能为空 ',
    goods_brief: '商品描述不能为空',
    // image: '封面图片不能为空',
    poster: '海报图片不能为空',
    detail: '详情图不能为空',
    banner: '轮播图不能为空',
    postage_setup: '请选择运费方式',
  };
  let groupbuytips = {
    period: '拼团倒计时不能为空或者0',
    ladder_list: '拼团阶梯不能为空',
  };
  let flag = true;
  // 虚拟商品
  if (args.fictitious) {
    delete tips.postage_setup;
  }
  Object.keys(tips).map(item => {
    if (!args[item] || args[item].length === 0) {
      message.error(tips[item]);
      flag = false;
    } else if (item === 'poster' || item === 'image') {
      if (!(args[item] && args[item].file)) {
        message.error(tips[item]);
        flag = false;
      }
    } else if (item === 'category') {
      if (args.model_type !== 'replace' && !args[item]) {
        message.error('类别名不能为空');
        flag = false;
      }
    }
  });

  //拼团
  if (args.groupbuy) {
    Object.keys(groupbuytips).map(item_in => {
      if (!args.groupbuy_info[item_in] || args.groupbuy_info[item_in].length === 0) {
        message.error(groupbuytips[item_in]);
        flag = false;
      }
    });
  }
  //规格
  let gtypes = [];
  if (args.ord_goods && args.ord_goods.gtypes && args.model_type === 'ord') {
    gtypes = args.ord_goods.gtypes;
  }
  if (args.sub_goods && args.sub_goods.gtypes && args.model_type === 'sub') {
    gtypes = args.sub_goods.gtypes;
  }
  if (args.repl_goods && args.repl_goods.gtypes && args.model_type === 'replace') {
    gtypes = args.repl_goods.gtypes;
  }
  if (!gtypes.length) {
    message.error('规格不能为空');
    flag = false;
  }
  for (let item_in of gtypes) {
    if (
      !validtypeForm(
        item_in,
        args.groupbuy && args.groupbuy_info && args.groupbuy_info.ladder_list,
        args.model_type
      )
    ) {
      flag = false;
      return false;
    }
  }
  //配送时间
  if (args.ord_goods && args.ord_goods.estimate_time && args.ord_goods.estimate_time.length > 0) {
    let arr = [];
    args.ord_goods.estimate_time.map(item => {
      arr.push(item.add);
    });
    let result = timeRange(arr);
    if (result !== true) {
      flag = false;
      message.error(result);
    }
  }
  //配送日的配送时间
  if (args.sub_goods) {
    if (!args.sub_goods.send_start || !args.sub_goods.send_end) {
      flag = false;
      message.error('配送日的配送时间不能为空');
    }
    if (!args.sub_goods.duration) {
      flag = false;
      message.error('订阅持续时间不能为空');
    }
  }

  if (
    !args.delivery_method ||
    (!args.fictitious && args.delivery_method && args.delivery_method.length === 0)
  ) {
    flag = false;
    message.error('配送方式不能为空');
  }
  return flag;
}

export function copy(value) {
  const oInput = document.createElement('input');
  oInput.value = value;
  document.body.appendChild(oInput);
  oInput.select(); // 选择对象
  document.execCommand('Copy'); // 执行浏览器复制命令
  oInput.className = 'oInput';
  oInput.style.display = 'none';
  message.info('复制成功');
}
