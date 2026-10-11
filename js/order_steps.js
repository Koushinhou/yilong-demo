/* 订单进展统一字典 ORDER_STEPS：前台（我的/订单详情）和管理后台共用这一份；本地服务器也读这个文件。
   注意：大括号内必须保持合法 JSON（服务器用 JSON 解析）。admin＝后台叫法，customer＝客户看到的叫法。 */
window.ORDER_STEPS_CONFIG = {
 "steps": [
  {"key": "new", "admin": "待联系", "customer": "已提交", "desc": "已收到您的需求，专属商务会尽快联系您", "color": "#B45309"},
  {"key": "wechat", "admin": "已加微信", "customer": "客服已联系", "desc": "商务已与您联系，请留意微信消息", "color": "#15803D"},
  {"key": "quoted", "admin": "已报价", "customer": "已报价", "desc": "商务已发送报价，请留意微信", "color": "#1D4ED8"},
  {"key": "won", "admin": "已成交", "customer": "已成交", "desc": "已确认合作，商务将安排签约和送装", "color": "#047857"},
  {"key": "delivered", "admin": "已送装", "customer": "已送装", "desc": "设备已送达并安装调试", "color": "#0E7490"},
  {"key": "renting", "admin": "租赁中", "customer": "租赁中", "desc": "设备使用中，有问题请联系专属商务", "color": "#6D28D9"},
  {"key": "finished", "admin": "已完结", "customer": "已完结", "desc": "本次租赁已完结，感谢您的信任", "color": "#475569"}
 ],
 "closed": {"key": "invalid", "admin": "无效", "customer": "订单已关闭", "desc": "订单已关闭，如有需要可再次询价", "color": "#6B7280"},
 "customerTabs": [
  {"key": "all", "label": "全部", "statuses": []},
  {"key": "pending", "label": "待联系", "statuses": ["new", "wechat"]},
  {"key": "quoted", "label": "已报价", "statuses": ["quoted"]},
  {"key": "won", "label": "已成交", "statuses": ["won", "delivered", "renting"]},
  {"key": "finished", "label": "已完结", "statuses": ["finished"]},
  {"key": "closed", "label": "已关闭", "statuses": ["invalid"]}
 ]
};
(function (C) {
  var all = C.steps.concat([C.closed]);
  window.ORDER_STEPS = C.steps;
  window.ORDER_STATUS = {};
  all.forEach(function (s, i) { s.index = i; window.ORDER_STATUS[s.key] = s; });
})(window.ORDER_STEPS_CONFIG);
