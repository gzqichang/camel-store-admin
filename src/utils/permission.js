export default {
  "/trade": [
    "config.view_level",
    "account.view_rechargerecord",
    "config.view_marketing",
    "account.view_wxuseraccountlog",
    "config.view_notice",
    "goods.view_banner",
    "goods.view_hotword"
  ],
  "/trade/userlevel": ["config.view_level"],
  "/trade/prerecharge": ["config.view_rechargetype"],
  // '/trade/expand':['config.view_marketing'],
  "/trade/share/expand": ["config.view_marketing"],
  "/trade/share/profie": ["account.view_wxuseraccountlog"],
  "/trade/distribution/expand": ["config.view_marketing"],
  "/trade/distribution/profie": ["account.view_wxuseraccountlog"],
  "/trade/shopmessage": ["config.view_notice"],
  "/trade/swiperlist": ["goods.view_banner"],
  "/trade/hotword": ["goods.view_hotword"],

  "/finance": ["account.view_rechargerecord", "account.view_withdraw"],
  "/finance/recharge": ["account.view_rechargerecord"],
  "/finance/money": ["account.view_withdraw"],

  "/setting": [
    "config.view_faqcontent",
    "shop.view_all_shop",
    "user.view_all_user"
  ],

  "/setting/quacontent": ["config.view_faqcontent"],
  "/setting/storelist": ["shop.view_all_shop"],
  "/setting/adminlist": ["user.view_all_user"]
};

export const permissionAuth = {
  changeRebateBouns: "goods.change_rebate_bonus", //分销、返利数据更改
  createTemplate: "goods.create_template", //创建模板
  changeWxuser: "account.change_wxuserinfo", //用户信息（分销、返利、测试人员）切换
  addsubgood: "goods.add_subgoods", //创建订阅商品
  changesubgood: "goods.change_subgoods", //修改订阅商品
  deletesubgood: "goods.delete_subgoods", //删除订阅商品
  addsubgoodTemplate: "goods.add_subgoodstemplate", //创建订阅商品模板
  deletesubgoodTemplate: "goods.delete_subgoodstemplate" //删除订阅商品模板
};
