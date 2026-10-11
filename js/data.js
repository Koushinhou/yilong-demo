/* 假数据文件（无服务器时的兜底数据，也是本地服务器首次启动的种子数据）。必须保持为合法 JSON。全部为演示用占位数据。 */
window.DATA = {
 "site": {
  "company": {
   "name": "南宁一龙办公设备有限公司",
   "short": "一龙办公",
   "slogan": "政企办公设备租赁 · 省心 · 合规 · 准时",
   "phone": "400-000-0000",
   "wechat": "yilong_kefu_demo",
   "icp": "备案号（演示站，暂无）"
  },
  "budgetBufferRate": 0.2,
  "roundTo": 10,
  "replySlaHours": 2
 },
 "banners": [
  {
   "id": "b1",
   "title": "一天起租 50元起",
   "sub": "短期活动用印，随租随还",
   "link": "#/list/short",
   "color": "#1E40AF"
  },
  {
   "id": "b2",
   "title": "理光彩色复印机特价",
   "sub": "长租全包套餐 ¥399/月起",
   "link": "#/plan/long/ricoh-color-allin",
   "color": "#0F766E"
  },
  {
   "id": "b3",
   "title": "展会打印 一站搞定",
   "sub": "送装到展位 · 撤展回收",
   "link": "#/list/expo",
   "color": "#C2410C"
  }
 ],
 "usageTags": [
  {
   "id": "small_office",
   "name": "小型办公室"
  },
  {
   "id": "dept_share",
   "name": "部门共享"
  },
  {
   "id": "color_promo",
   "name": "彩色宣传物料"
  },
  {
   "id": "bulk",
   "name": "大批量文印"
  },
  {
   "id": "meeting",
   "name": "会议培训"
  },
  {
   "id": "expo_front",
   "name": "展会前台"
  }
 ],
 "plans": [
  {
   "id": "l1",
   "slug": "ricoh-mono-basic",
   "mode": "long",
   "name": "理光黑白 A4 普通套餐",
   "tier": "basic",
   "tagline": "小型办公室日常打印",
   "usageTagIds": [
    "small_office"
   ],
   "devices": [
    {
     "brand": "理光",
     "model": "示例型号 A-100",
     "type": "打印机",
     "condition": "次新",
     "color": false,
     "paper": "A4",
     "speed": 30,
     "qty": 1
    }
   ],
   "pricing": {
    "monthlyFee": 168,
    "includedMono": 2000,
    "overageMono": 0.04,
    "termOptionsMonths": [
     12,
     24,
     36
    ],
    "termPrices": [
     {
      "months": 12,
      "monthlyFee": 193
     },
     {
      "months": 24,
      "monthlyFee": 180
     },
     {
      "months": 36,
      "monthlyFee": 168
     }
    ]
   },
   "points": [
    "含 2000 张/月",
    "上门维保"
   ],
   "includes": [
    {
     "label": "耗材",
     "value": "不含（可加购）"
    },
    {
     "label": "维保",
     "value": "上门维修，4 小时响应"
    },
    {
     "label": "到期",
     "value": "到期可续租，具体以合同约定为准"
    }
   ],
   "sort": 1,
   "published": true,
   "images": [],
   "guarantees": [
    "上门维保",
    "正式合同",
    "4 小时响应"
   ],
   "recommendPages": {
    "min": 0,
    "max": 2500,
    "unit": "月"
   },
   "suitablePeople": "10 人以下",
   "perPageCalc": {
    "buyPrice": 9800,
    "consumableCostPerPage": 0.03,
    "maintPerMonth": 80,
    "months": 36
   },
   "inspectionItems": 20,
   "realPhotos": [],
   "serviceItems": [
    {
     "name": "原装耗材",
     "included": false
    },
    {
     "name": "定期巡检",
     "included": true
    },
    {
     "name": "上门维修",
     "included": true
    },
    {
     "name": "零配件更换",
     "included": true
    },
    {
     "name": "安装调试",
     "included": true
    },
    {
     "name": "使用培训",
     "included": true
    },
    {
     "name": "打印纸张",
     "included": false
    }
   ],
   "delivery": {
    "days": 2,
    "note": "确认后 2 个工作日内送达，免费安装调试、连接电脑和网络、现场培训"
   },
   "specs": {
    "速度": "30 页/分钟",
    "幅面": "A4",
    "色彩": "黑白",
    "双面": "自动双面",
    "扫描": "彩色扫描到邮箱/文件夹",
    "网络": "有线网络 / USB",
    "纸盒容量": "250 张 + 手送 50 张",
    "月负荷": "50,000 张"
   },
   "consumables": [
    {
     "name": "黑色墨粉",
     "yield": "约 12,000 张"
    }
   ],
   "scenes": [
    {
     "name": "财务报表",
     "why": "黑白大量打印成本低"
    },
    {
     "name": "学校试卷",
     "why": "双面速度快"
    }
   ],
   "keywords": [
    "财务",
    "合同打印",
    "办公室"
   ],
   "highlightTags": [
    "上门维保",
    "正式合同",
    "4 小时响应"
   ],
   "galleryGroups": {
    "official": [],
    "real": []
   }
  },
  {
   "id": "l2",
   "slug": "ricoh-color-allin",
   "mode": "long",
   "name": "理光彩色 A3 全包套餐",
   "tier": "allin",
   "tagline": "部门共享，耗材全包",
   "usageTagIds": [
    "dept_share",
    "color_promo"
   ],
   "hot": true,
   "devices": [
    {
     "brand": "理光",
     "model": "示例型号 C-300",
     "type": "复印机",
     "condition": "新机",
     "color": true,
     "paper": "A3",
     "speed": 35,
     "qty": 1
    }
   ],
   "pricing": {
    "monthlyFee": 399,
    "includedMono": 5000,
    "includedColor": 500,
    "overageMono": 0.03,
    "overageColor": 0.3,
    "termOptionsMonths": [
     12,
     24,
     36
    ],
    "termPrices": [
     {
      "months": 12,
      "monthlyFee": 459
     },
     {
      "months": 24,
      "monthlyFee": 427
     },
     {
      "months": 36,
      "monthlyFee": 399
     }
    ]
   },
   "points": [
    "含 5000 张/月",
    "含耗材"
   ],
   "includes": [
    {
     "label": "耗材",
     "value": "墨粉全包"
    },
    {
     "label": "维保",
     "value": "上门维修 + 季度巡检"
    },
    {
     "label": "到期",
     "value": "到期可续租，具体以合同约定为准"
    }
   ],
   "sort": 2,
   "published": true,
   "images": [],
   "guarantees": [
    "上门维保",
    "耗材全包",
    "正式合同",
    "4 小时响应"
   ],
   "recommendPages": {
    "min": 2000,
    "max": 8000,
    "unit": "月"
   },
   "suitablePeople": "10～50 人",
   "perPageCalc": {
    "buyPrice": 26000,
    "consumableCostPerPage": 0.025,
    "maintPerMonth": 150,
    "months": 36
   },
   "inspectionItems": 20,
   "realPhotos": [],
   "serviceItems": [
    {
     "name": "原装耗材",
     "included": true
    },
    {
     "name": "定期巡检",
     "included": true
    },
    {
     "name": "上门维修",
     "included": true
    },
    {
     "name": "零配件更换",
     "included": true
    },
    {
     "name": "安装调试",
     "included": true
    },
    {
     "name": "使用培训",
     "included": true
    },
    {
     "name": "打印纸张",
     "included": false
    }
   ],
   "delivery": {
    "days": 2,
    "note": "确认后 2 个工作日内送达，免费安装调试、连接电脑和网络、现场培训"
   },
   "specs": {
    "速度": "35 页/分钟",
    "幅面": "A3/A4",
    "色彩": "彩色/黑白",
    "双面": "自动双面",
    "扫描": "彩色扫描到邮箱/文件夹",
    "网络": "有线网络 / USB",
    "纸盒容量": "2×550 张 + 手送 100 张",
    "月负荷": "50,000 张"
   },
   "consumables": [
    {
     "name": "黑色墨粉",
     "yield": "约 16,500 张"
    },
    {
     "name": "彩色墨粉（每色）",
     "yield": "约 10,500 张"
    }
   ],
   "scenes": [
    {
     "name": "政务大厅窗口",
     "why": "证照、回执随到随印"
    },
    {
     "name": "宣传彩页",
     "why": "彩色 A3 出图效果好"
    },
    {
     "name": "工程图纸",
     "why": "A3 幅面看图更清楚"
    }
   ],
   "keywords": [
    "政务大厅",
    "A3 彩色"
   ],
   "highlightTags": [
    "上门维保",
    "耗材全包",
    "正式合同",
    "4 小时响应"
   ],
   "galleryGroups": {
    "official": [],
    "real": []
   }
  },
  {
   "id": "l3",
   "slug": "ricoh-color-premium",
   "mode": "long",
   "name": "理光彩色 A3 豪华套餐",
   "tier": "premium",
   "tagline": "大批量文印，备机保障",
   "usageTagIds": [
    "bulk",
    "dept_share"
   ],
   "devices": [
    {
     "brand": "理光",
     "model": "示例型号 C-600",
     "type": "复印机",
     "condition": "新机",
     "color": true,
     "paper": "A3",
     "speed": 60,
     "qty": 1
    }
   ],
   "pricing": {
    "monthlyFee": 899,
    "includedMono": 15000,
    "includedColor": 2000,
    "overageMono": 0.025,
    "overageColor": 0.25,
    "termOptionsMonths": [
     12,
     24,
     36
    ],
    "termPrices": [
     {
      "months": 12,
      "monthlyFee": 1034
     },
     {
      "months": 24,
      "monthlyFee": 962
     },
     {
      "months": 36,
      "monthlyFee": 899
     }
    ]
   },
   "points": [
    "含 15000 张/月",
    "备机保障"
   ],
   "includes": [
    {
     "label": "耗材",
     "value": "墨粉全包"
    },
    {
     "label": "维保",
     "value": "驻场级响应 + 故障备机"
    },
    {
     "label": "到期",
     "value": "到期可续租，具体以合同约定为准"
    }
   ],
   "sort": 3,
   "published": true,
   "images": [],
   "guarantees": [
    "上门维保",
    "耗材全包",
    "正式合同",
    "4 小时响应"
   ],
   "recommendPages": {
    "min": 8000,
    "max": 20000,
    "unit": "月"
   },
   "suitablePeople": "50 人以上",
   "perPageCalc": {
    "buyPrice": 58000,
    "consumableCostPerPage": 0.02,
    "maintPerMonth": 260,
    "months": 36
   },
   "inspectionItems": 20,
   "realPhotos": [],
   "serviceItems": [
    {
     "name": "原装耗材",
     "included": true
    },
    {
     "name": "定期巡检",
     "included": true
    },
    {
     "name": "上门维修",
     "included": true
    },
    {
     "name": "零配件更换",
     "included": true
    },
    {
     "name": "安装调试",
     "included": true
    },
    {
     "name": "使用培训",
     "included": true
    },
    {
     "name": "打印纸张",
     "included": false
    }
   ],
   "delivery": {
    "days": 2,
    "note": "确认后 2 个工作日内送达，免费安装调试、连接电脑和网络、现场培训"
   },
   "specs": {
    "速度": "60 页/分钟",
    "幅面": "A3/A4",
    "色彩": "彩色/黑白",
    "双面": "自动双面",
    "扫描": "彩色扫描到邮箱/文件夹",
    "网络": "有线网络 / USB",
    "纸盒容量": "2×550 张 + 手送 100 张",
    "月负荷": "150,000 张"
   },
   "consumables": [
    {
     "name": "黑色墨粉",
     "yield": "约 16,500 张"
    },
    {
     "name": "彩色墨粉（每色）",
     "yield": "约 10,500 张"
    }
   ],
   "scenes": [
    {
     "name": "政务大厅窗口",
     "why": "证照、回执随到随印"
    },
    {
     "name": "宣传彩页",
     "why": "彩色 A3 出图效果好"
    },
    {
     "name": "工程图纸",
     "why": "A3 幅面看图更清楚"
    }
   ],
   "keywords": [
    "设计",
    "图文"
   ],
   "highlightTags": [
    "上门维保",
    "耗材全包",
    "正式合同",
    "4 小时响应"
   ],
   "galleryGroups": {
    "official": [],
    "real": []
   }
  },
  {
   "id": "s1",
   "slug": "short-mono",
   "mode": "short",
   "name": "黑白 A4 短租套餐",
   "tier": "basic",
   "tagline": "临时项目，1 天起租",
   "usageTagIds": [
    "small_office",
    "meeting"
   ],
   "devices": [
    {
     "brand": "理光",
     "model": "示例型号 A-100",
     "type": "打印机",
     "condition": "次新",
     "color": false,
     "paper": "A4",
     "speed": 30,
     "qty": 1
    }
   ],
   "pricing": {
    "dailyFee": 50,
    "monthlyFee": 168,
    "minDays": 1,
    "dayTiers": [
     {
      "minDays": 1,
      "dailyFee": 50
     },
     {
      "minDays": 7,
      "dailyFee": 45
     },
     {
      "minDays": 15,
      "dailyFee": 40
     }
    ]
   },
   "points": [
    "1 天起租",
    "含 500 张/天"
   ],
   "includes": [
    {
     "label": "送取",
     "value": "市内送货上门、到期上门取回"
    },
    {
     "label": "耗材",
     "value": "含"
    }
   ],
   "sort": 4,
   "published": true,
   "images": [],
   "guarantees": [
    "送货上门",
    "到期上门取回",
    "正式合同"
   ],
   "recommendPages": {
    "min": 0,
    "max": 500,
    "unit": "天"
   },
   "suitablePeople": "临时项目组",
   "inspectionItems": 20,
   "realPhotos": [],
   "serviceItems": [
    {
     "name": "原装耗材",
     "included": false
    },
    {
     "name": "定期巡检",
     "included": false
    },
    {
     "name": "上门维修",
     "included": true
    },
    {
     "name": "零配件更换",
     "included": true
    },
    {
     "name": "安装调试",
     "included": true
    },
    {
     "name": "使用培训",
     "included": true
    },
    {
     "name": "打印纸张",
     "included": false
    }
   ],
   "delivery": {
    "days": 2,
    "note": "确认后 2 个工作日内送达，免费安装调试、连接电脑和网络、现场培训"
   },
   "specs": {
    "速度": "30 页/分钟",
    "幅面": "A4",
    "色彩": "黑白",
    "双面": "自动双面",
    "扫描": "彩色扫描到邮箱/文件夹",
    "网络": "有线网络 / USB",
    "纸盒容量": "250 张 + 手送 50 张",
    "月负荷": "50,000 张"
   },
   "consumables": [
    {
     "name": "黑色墨粉",
     "yield": "约 12,000 张"
    }
   ],
   "scenes": [
    {
     "name": "财务报表",
     "why": "黑白大量打印成本低"
    },
    {
     "name": "学校试卷",
     "why": "双面速度快"
    }
   ],
   "keywords": [
    "考试",
    "临时"
   ],
   "highlightTags": [
    "送货上门",
    "到期上门取回",
    "正式合同"
   ],
   "galleryGroups": {
    "official": [],
    "real": []
   }
  },
  {
   "id": "s2",
   "slug": "short-color",
   "mode": "short",
   "name": "彩色 A3 短租套餐",
   "tier": "allin",
   "tagline": "会议培训、宣传物料",
   "usageTagIds": [
    "meeting",
    "color_promo"
   ],
   "hot": true,
   "devices": [
    {
     "brand": "理光",
     "model": "示例型号 C-300",
     "type": "复印机",
     "condition": "次新",
     "color": true,
     "paper": "A3",
     "speed": 35,
     "qty": 1
    }
   ],
   "pricing": {
    "dailyFee": 120,
    "monthlyFee": 399,
    "minDays": 1,
    "dayTiers": [
     {
      "minDays": 1,
      "dailyFee": 120
     },
     {
      "minDays": 7,
      "dailyFee": 108
     },
     {
      "minDays": 15,
      "dailyFee": 96
     }
    ]
   },
   "points": [
    "彩色 A3",
    "含耗材"
   ],
   "includes": [
    {
     "label": "送取",
     "value": "市内送货上门、到期上门取回"
    },
    {
     "label": "耗材",
     "value": "含"
    }
   ],
   "sort": 5,
   "published": true,
   "images": [],
   "guarantees": [
    "送货上门",
    "到期上门取回",
    "正式合同"
   ],
   "recommendPages": {
    "min": 300,
    "max": 1500,
    "unit": "天"
   },
   "suitablePeople": "会议培训 20～200 人",
   "inspectionItems": 20,
   "realPhotos": [],
   "serviceItems": [
    {
     "name": "原装耗材",
     "included": true
    },
    {
     "name": "定期巡检",
     "included": false
    },
    {
     "name": "上门维修",
     "included": true
    },
    {
     "name": "零配件更换",
     "included": true
    },
    {
     "name": "安装调试",
     "included": true
    },
    {
     "name": "使用培训",
     "included": true
    },
    {
     "name": "打印纸张",
     "included": false
    }
   ],
   "delivery": {
    "days": 2,
    "note": "确认后 2 个工作日内送达，免费安装调试、连接电脑和网络、现场培训"
   },
   "specs": {
    "速度": "35 页/分钟",
    "幅面": "A3/A4",
    "色彩": "彩色/黑白",
    "双面": "自动双面",
    "扫描": "彩色扫描到邮箱/文件夹",
    "网络": "有线网络 / USB",
    "纸盒容量": "2×550 张 + 手送 100 张",
    "月负荷": "50,000 张"
   },
   "consumables": [
    {
     "name": "黑色墨粉",
     "yield": "约 16,500 张"
    },
    {
     "name": "彩色墨粉（每色）",
     "yield": "约 10,500 张"
    }
   ],
   "scenes": [
    {
     "name": "政务大厅窗口",
     "why": "证照、回执随到随印"
    },
    {
     "name": "宣传彩页",
     "why": "彩色 A3 出图效果好"
    },
    {
     "name": "工程图纸",
     "why": "A3 幅面看图更清楚"
    }
   ],
   "keywords": [
    "培训",
    "会务"
   ],
   "highlightTags": [
    "送货上门",
    "耗材全包",
    "到期上门取回",
    "正式合同"
   ],
   "galleryGroups": {
    "official": [],
    "real": []
   }
  },
  {
   "id": "e1",
   "slug": "expo-mono",
   "mode": "expo",
   "name": "展会黑白 A4 一天套餐",
   "tier": "basic",
   "tagline": "前台签到、资料打印",
   "usageTagIds": [
    "expo_front"
   ],
   "devices": [
    {
     "brand": "理光",
     "model": "示例型号 A-100",
     "type": "打印机",
     "condition": "次新",
     "color": false,
     "paper": "A4",
     "speed": 30,
     "qty": 1
    }
   ],
   "pricing": {
    "dailyFee": 199,
    "fixedFee": 100
   },
   "points": [
    "送装到展位",
    "撤展回收"
   ],
   "includes": [
    {
     "label": "送装",
     "value": "送到展位并调试（送装费 ¥100/次）"
    },
    {
     "label": "撤展",
     "value": "撤展当天回收"
    },
    {
     "label": "耗材",
     "value": "含"
    }
   ],
   "sort": 6,
   "published": true,
   "images": [],
   "guarantees": [
    "送装到展位",
    "现场调试",
    "撤展回收"
   ],
   "recommendPages": {
    "min": 0,
    "max": 500,
    "unit": "天"
   },
   "suitablePeople": "展位前台",
   "inspectionItems": 20,
   "realPhotos": [],
   "serviceItems": [
    {
     "name": "原装耗材",
     "included": false
    },
    {
     "name": "定期巡检",
     "included": false
    },
    {
     "name": "上门维修",
     "included": true
    },
    {
     "name": "零配件更换",
     "included": true
    },
    {
     "name": "安装调试",
     "included": true
    },
    {
     "name": "使用培训",
     "included": true
    },
    {
     "name": "打印纸张",
     "included": false
    }
   ],
   "delivery": {
    "days": 0,
    "note": "布展日送到展位、现场调试；撤展当天上门回收"
   },
   "specs": {
    "速度": "30 页/分钟",
    "幅面": "A4",
    "色彩": "黑白",
    "双面": "自动双面",
    "扫描": "彩色扫描到邮箱/文件夹",
    "网络": "有线网络 / USB",
    "纸盒容量": "250 张 + 手送 50 张",
    "月负荷": "50,000 张"
   },
   "consumables": [
    {
     "name": "黑色墨粉",
     "yield": "约 12,000 张"
    }
   ],
   "scenes": [
    {
     "name": "展会前台",
     "why": "签到表、资料随时打印"
    },
    {
     "name": "宣传彩页",
     "why": "现场补印海报和彩页"
    }
   ],
   "keywords": [
    "签到"
   ],
   "highlightTags": [
    "送装到展位",
    "现场调试",
    "撤展回收"
   ],
   "galleryGroups": {
    "official": [],
    "real": []
   }
  },
  {
   "id": "e2",
   "slug": "expo-color-a3",
   "mode": "expo",
   "name": "展会彩色 A3 一天套餐",
   "tier": "allin",
   "tagline": "海报、彩页现场打印",
   "usageTagIds": [
    "expo_front",
    "color_promo"
   ],
   "hot": true,
   "devices": [
    {
     "brand": "理光",
     "model": "示例型号 C-300",
     "type": "复印机",
     "condition": "新机",
     "color": true,
     "paper": "A3",
     "speed": 35,
     "qty": 1
    }
   ],
   "pricing": {
    "dailyFee": 399,
    "fixedFee": 150
   },
   "points": [
    "彩色 A3",
    "现场调试"
   ],
   "includes": [
    {
     "label": "送装",
     "value": "送到展位并调试（送装费 ¥150/次）"
    },
    {
     "label": "撤展",
     "value": "撤展当天回收"
    },
    {
     "label": "耗材",
     "value": "含"
    }
   ],
   "sort": 7,
   "published": true,
   "images": [],
   "guarantees": [
    "送装到展位",
    "现场调试",
    "撤展回收"
   ],
   "recommendPages": {
    "min": 300,
    "max": 1500,
    "unit": "天"
   },
   "suitablePeople": "展位宣传",
   "inspectionItems": 20,
   "realPhotos": [],
   "serviceItems": [
    {
     "name": "原装耗材",
     "included": true
    },
    {
     "name": "定期巡检",
     "included": false
    },
    {
     "name": "上门维修",
     "included": true
    },
    {
     "name": "零配件更换",
     "included": true
    },
    {
     "name": "安装调试",
     "included": true
    },
    {
     "name": "使用培训",
     "included": true
    },
    {
     "name": "打印纸张",
     "included": false
    }
   ],
   "delivery": {
    "days": 0,
    "note": "布展日送到展位、现场调试；撤展当天上门回收"
   },
   "specs": {
    "速度": "35 页/分钟",
    "幅面": "A3/A4",
    "色彩": "彩色/黑白",
    "双面": "自动双面",
    "扫描": "彩色扫描到邮箱/文件夹",
    "网络": "有线网络 / USB",
    "纸盒容量": "2×550 张 + 手送 100 张",
    "月负荷": "50,000 张"
   },
   "consumables": [
    {
     "name": "黑色墨粉",
     "yield": "约 16,500 张"
    },
    {
     "name": "彩色墨粉（每色）",
     "yield": "约 10,500 张"
    }
   ],
   "scenes": [
    {
     "name": "展会前台",
     "why": "签到表、资料随时打印"
    },
    {
     "name": "宣传彩页",
     "why": "现场补印海报和彩页"
    }
   ],
   "keywords": [
    "展会物料"
   ],
   "highlightTags": [
    "送装到展位",
    "耗材全包",
    "现场调试",
    "撤展回收"
   ],
   "galleryGroups": {
    "official": [],
    "real": []
   }
  },
  {
   "id": "l4",
   "slug": "kyocera-mono-basic",
   "mode": "long",
   "name": "京瓷黑白 A4 基础套餐",
   "tier": "basic",
   "tagline": "小型办公室日常打印",
   "usageTagIds": [
    "small_office"
   ],
   "devices": [
    {
     "brand": "京瓷",
     "model": "示例型号 A-100",
     "type": "打印机",
     "condition": "次新",
     "color": false,
     "paper": "A4",
     "speed": 30,
     "qty": 1
    }
   ],
   "pricing": {
    "monthlyFee": 188,
    "includedMono": 2000,
    "overageMono": 0.04,
    "termOptionsMonths": [
     12,
     24,
     36
    ],
    "termPrices": [
     {
      "months": 12,
      "monthlyFee": 225
     },
     {
      "months": 24,
      "monthlyFee": 206
     },
     {
      "months": 36,
      "monthlyFee": 188
     }
    ]
   },
   "points": [
    "含 2000 张/月",
    "上门维保"
   ],
   "includes": [
    {
     "label": "耗材",
     "value": "不含（可加购）"
    },
    {
     "label": "维保",
     "value": "上门维修，4 小时响应"
    },
    {
     "label": "到期",
     "value": "到期可续租，具体以合同约定为准"
    }
   ],
   "sort": 11,
   "published": true,
   "images": [],
   "guarantees": [
    "上门维保",
    "正式合同",
    "4 小时响应"
   ],
   "recommendPages": {
    "min": 0,
    "max": 2500,
    "unit": "月"
   },
   "suitablePeople": "10 人以下",
   "perPageCalc": {
    "buyPrice": 9800,
    "consumableCostPerPage": 0.03,
    "maintPerMonth": 80,
    "months": 36
   },
   "inspectionItems": 20,
   "realPhotos": [],
   "serviceItems": [
    {
     "name": "原装耗材",
     "included": false
    },
    {
     "name": "定期巡检",
     "included": true
    },
    {
     "name": "上门维修",
     "included": true
    },
    {
     "name": "零配件更换",
     "included": true
    },
    {
     "name": "安装调试",
     "included": true
    },
    {
     "name": "使用培训",
     "included": true
    },
    {
     "name": "打印纸张",
     "included": false
    }
   ],
   "delivery": {
    "days": 2,
    "note": "确认后 2 个工作日内送达，免费安装调试、连接电脑和网络、现场培训"
   },
   "specs": {
    "速度": "30 页/分钟",
    "幅面": "A4",
    "色彩": "黑白",
    "双面": "自动双面",
    "扫描": "彩色扫描到邮箱/文件夹",
    "网络": "有线网络 / USB",
    "纸盒容量": "250 张 + 手送 50 张",
    "月负荷": "50,000 张"
   },
   "consumables": [
    {
     "name": "黑色墨粉",
     "yield": "约 12,000 张"
    }
   ],
   "scenes": [
    {
     "name": "财务报表",
     "why": "黑白大量打印成本低"
    },
    {
     "name": "学校试卷",
     "why": "双面速度快"
    }
   ],
   "keywords": [
    "京瓷",
    "小办公室"
   ],
   "highlightTags": [
    "上门维保",
    "正式合同",
    "4 小时响应"
   ],
   "galleryGroups": {
    "official": [],
    "real": []
   },
   "hot": false
  },
  {
   "id": "l5",
   "slug": "canon-color-a4-allin",
   "mode": "long",
   "name": "佳能彩色 A4 全包套餐",
   "tier": "allin",
   "tagline": "部门共享，耗材全包",
   "usageTagIds": [
    "dept_share",
    "color_promo"
   ],
   "hot": false,
   "devices": [
    {
     "brand": "佳能",
     "model": "示例型号 C-300",
     "type": "复印机",
     "condition": "新机",
     "color": true,
     "paper": "A4",
     "speed": 35,
     "qty": 1
    }
   ],
   "pricing": {
    "monthlyFee": 459,
    "includedMono": 5000,
    "includedColor": 500,
    "overageMono": 0.03,
    "overageColor": 0.3,
    "termOptionsMonths": [
     12,
     24,
     36
    ],
    "termPrices": [
     {
      "months": 12,
      "monthlyFee": 550
     },
     {
      "months": 24,
      "monthlyFee": 504
     },
     {
      "months": 36,
      "monthlyFee": 459
     }
    ]
   },
   "points": [
    "含 5000 张/月",
    "含耗材"
   ],
   "includes": [
    {
     "label": "耗材",
     "value": "墨粉全包"
    },
    {
     "label": "维保",
     "value": "上门维修 + 季度巡检"
    },
    {
     "label": "到期",
     "value": "到期可续租，具体以合同约定为准"
    }
   ],
   "sort": 12,
   "published": true,
   "images": [],
   "guarantees": [
    "上门维保",
    "耗材全包",
    "正式合同",
    "4 小时响应"
   ],
   "recommendPages": {
    "min": 2000,
    "max": 8000,
    "unit": "月"
   },
   "suitablePeople": "10～50 人",
   "perPageCalc": {
    "buyPrice": 26000,
    "consumableCostPerPage": 0.025,
    "maintPerMonth": 150,
    "months": 36
   },
   "inspectionItems": 20,
   "realPhotos": [],
   "serviceItems": [
    {
     "name": "原装耗材",
     "included": true
    },
    {
     "name": "定期巡检",
     "included": true
    },
    {
     "name": "上门维修",
     "included": true
    },
    {
     "name": "零配件更换",
     "included": true
    },
    {
     "name": "安装调试",
     "included": true
    },
    {
     "name": "使用培训",
     "included": true
    },
    {
     "name": "打印纸张",
     "included": false
    }
   ],
   "delivery": {
    "days": 2,
    "note": "确认后 2 个工作日内送达，免费安装调试、连接电脑和网络、现场培训"
   },
   "specs": {
    "速度": "35 页/分钟",
    "幅面": "A3/A4",
    "色彩": "彩色/黑白",
    "双面": "自动双面",
    "扫描": "彩色扫描到邮箱/文件夹",
    "网络": "有线网络 / USB",
    "纸盒容量": "2×550 张 + 手送 100 张",
    "月负荷": "50,000 张"
   },
   "consumables": [
    {
     "name": "黑色墨粉",
     "yield": "约 16,500 张"
    },
    {
     "name": "彩色墨粉（每色）",
     "yield": "约 10,500 张"
    }
   ],
   "scenes": [
    {
     "name": "政务大厅窗口",
     "why": "证照、回执随到随印"
    },
    {
     "name": "宣传彩页",
     "why": "彩色 A3 出图效果好"
    },
    {
     "name": "工程图纸",
     "why": "A3 幅面看图更清楚"
    }
   ],
   "keywords": [
    "佳能",
    "设计工作室"
   ],
   "highlightTags": [
    "上门维保",
    "耗材全包",
    "正式合同",
    "4 小时响应"
   ],
   "galleryGroups": {
    "official": [],
    "real": []
   }
  },
  {
   "id": "l6",
   "slug": "kyocera-color-a3-premium",
   "mode": "long",
   "name": "京瓷彩色 A3 豪华套餐",
   "tier": "premium",
   "tagline": "大批量文印，备机保障",
   "usageTagIds": [
    "bulk",
    "dept_share"
   ],
   "devices": [
    {
     "brand": "京瓷",
     "model": "示例型号 C-600",
     "type": "复印机",
     "condition": "新机",
     "color": true,
     "paper": "A3",
     "speed": 60,
     "qty": 1
    }
   ],
   "pricing": {
    "monthlyFee": 999,
    "includedMono": 15000,
    "includedColor": 2000,
    "overageMono": 0.025,
    "overageColor": 0.25,
    "termOptionsMonths": [
     12,
     24,
     36
    ],
    "termPrices": [
     {
      "months": 12,
      "monthlyFee": 1198
     },
     {
      "months": 24,
      "monthlyFee": 1098
     },
     {
      "months": 36,
      "monthlyFee": 999
     }
    ]
   },
   "points": [
    "含 15000 张/月",
    "备机保障"
   ],
   "includes": [
    {
     "label": "耗材",
     "value": "墨粉全包"
    },
    {
     "label": "维保",
     "value": "驻场级响应 + 故障备机"
    },
    {
     "label": "到期",
     "value": "到期可续租，具体以合同约定为准"
    }
   ],
   "sort": 13,
   "published": true,
   "images": [],
   "guarantees": [
    "上门维保",
    "耗材全包",
    "正式合同",
    "4 小时响应"
   ],
   "recommendPages": {
    "min": 8000,
    "max": 20000,
    "unit": "月"
   },
   "suitablePeople": "50 人以上",
   "perPageCalc": {
    "buyPrice": 58000,
    "consumableCostPerPage": 0.02,
    "maintPerMonth": 260,
    "months": 36
   },
   "inspectionItems": 20,
   "realPhotos": [],
   "serviceItems": [
    {
     "name": "原装耗材",
     "included": true
    },
    {
     "name": "定期巡检",
     "included": true
    },
    {
     "name": "上门维修",
     "included": true
    },
    {
     "name": "零配件更换",
     "included": true
    },
    {
     "name": "安装调试",
     "included": true
    },
    {
     "name": "使用培训",
     "included": true
    },
    {
     "name": "打印纸张",
     "included": false
    }
   ],
   "delivery": {
    "days": 2,
    "note": "确认后 2 个工作日内送达，免费安装调试、连接电脑和网络、现场培训"
   },
   "specs": {
    "速度": "60 页/分钟",
    "幅面": "A3/A4",
    "色彩": "彩色/黑白",
    "双面": "自动双面",
    "扫描": "彩色扫描到邮箱/文件夹",
    "网络": "有线网络 / USB",
    "纸盒容量": "2×550 张 + 手送 100 张",
    "月负荷": "150,000 张"
   },
   "consumables": [
    {
     "name": "黑色墨粉",
     "yield": "约 16,500 张"
    },
    {
     "name": "彩色墨粉（每色）",
     "yield": "约 10,500 张"
    }
   ],
   "scenes": [
    {
     "name": "政务大厅窗口",
     "why": "证照、回执随到随印"
    },
    {
     "name": "宣传彩页",
     "why": "彩色 A3 出图效果好"
    },
    {
     "name": "工程图纸",
     "why": "A3 幅面看图更清楚"
    }
   ],
   "keywords": [
    "京瓷",
    "大型办公"
   ],
   "highlightTags": [
    "上门维保",
    "耗材全包",
    "正式合同",
    "4 小时响应"
   ],
   "galleryGroups": {
    "official": [],
    "real": []
   },
   "hot": false
  }
 ],
 "faqs": [
  {
   "q": "设备坏了怎么办？",
   "a": "联系专属商务，安排上门维修；具体响应时间以合同约定为准。"
  },
  {
   "q": "能提前结束吗？到期后怎么办？",
   "a": "租期、续租等具体条款以合同约定为准，欢迎咨询专属商务。"
  },
  {
   "q": "能开对公发票吗？",
   "a": "可以，签约时与商务确认。"
  },
  {
   "q": "多久能送到？",
   "a": "市内一般 1～2 个工作日内送装，以商务确认为准。"
  }
 ],
 "cases": [
  {
   "name": "示例：某区政务服务中心",
   "text": "长租彩色 A3 全包套餐 ×4，部门共享打印（示例，非真实客户）"
  },
  {
   "name": "示例：某行业博览会",
   "text": "展会一天套餐 ×6，前台签到和资料打印（示例，非真实客户）"
  }
 ],
 "recommend": {
  "questions": [
   {
    "key": "people",
    "q": "办公室大概多少人用？",
    "options": [
     [
      "s",
      "10 人以下"
     ],
     [
      "m",
      "10～50 人"
     ],
     [
      "l",
      "50 人以上"
     ]
    ]
   },
   {
    "key": "color",
    "q": "需要彩色打印吗？",
    "options": [
     [
      "n",
      "只要黑白"
     ],
     [
      "y",
      "需要彩色"
     ]
    ]
   },
   {
    "key": "volume",
    "q": "每月大概打印多少张？",
    "options": [
     [
      "low",
      "2000 张以内"
     ],
     [
      "mid",
      "2000～8000 张"
     ],
     [
      "high",
      "8000 张以上"
     ]
    ]
   }
  ],
  "rules": [
   {
    "when": {
     "volume": "high"
    },
    "main": "ricoh-color-premium",
    "alt": "ricoh-color-allin"
   },
   {
    "when": {
     "color": "y"
    },
    "main": "ricoh-color-allin",
    "alt": "ricoh-color-premium"
   },
   {
    "when": {
     "people": "l"
    },
    "main": "ricoh-color-allin",
    "alt": "ricoh-color-premium"
   },
   {
    "when": {},
    "main": "ricoh-mono-basic",
    "alt": "ricoh-color-allin"
   }
  ]
 },
 "purchase": {
  "files": [
   {
    "name": "营业执照（示例）",
    "file": "files/营业执照_示例.txt"
   },
   {
    "name": "厂家授权书（示例）",
    "file": "files/厂家授权_示例.txt"
   },
   {
    "name": "报价单模板（示例）",
    "file": "files/报价单模板_示例.csv"
   }
  ],
  "areas": [
   "南宁市青秀区",
   "西乡塘区",
   "兴宁区",
   "江南区",
   "良庆区",
   "邕宁区",
   "（其他区域请咨询）"
  ],
  "response": "市区工作日 4 小时内响应（待客户确认后上线）",
  "logos": [
   "合作单位 A",
   "合作单位 B",
   "合作单位 C",
   "合作单位 D",
   "合作单位 E",
   "合作单位 F"
  ]
 },
 "salesContacts": [
  {
   "id": "s1",
   "name": "李经理",
   "title": "客户经理",
   "wechat": "yilong_li_demo",
   "phone": "400-000-0001",
   "response": "工作日 2 小时内回复",
   "enabled": true,
   "isDefault": false
  },
  {
   "id": "s0",
   "name": "一龙客服",
   "title": "默认客服",
   "wechat": "yilong_kefu_demo",
   "phone": "400-000-0000",
   "response": "工作时间内尽快回复",
   "enabled": true,
   "isDefault": true
  }
 ],
 "salesDefault": {
  "name": "一龙客服",
  "title": "默认客服",
  "wechat": "yilong_kefu_demo",
  "phone": "400-000-0000",
  "response": "工作时间内尽快回复"
 },
 "demoAccount": {
  "phone": "13800000000",
  "ownerId": "s1",
  "contact": {
   "org": "南宁市某某区政务服务中心",
   "name": "张先生",
   "phone": "13800000000",
   "wechat": "zhang_demo"
  },
  "owner": {
   "name": "李经理",
   "title": "客户经理",
   "wechat": "yilong_li_demo",
   "phone": "400-000-0001",
   "response": "工作日 2 小时内回复"
  },
  "orders": [
   {
    "createdAt": "2026-10-11T14:05:00",
    "assigneeId": "s1",
    "status": "quoted",
    "stepDates": {
     "new": "2026-10-11",
     "wechat": "2026-10-11",
     "quoted": "2026-10-12"
    },
    "items": [
     {
      "planId": "l2",
      "qty": 2,
      "months": 36
     },
     {
      "planId": "s1",
      "qty": 1,
      "days": 5,
      "startDate": "2026-10-20"
     }
    ],
    "follows": [
     {
      "at": "2026-10-11T15:02:00",
      "text": "已添加客户微信，确认需要 2 台彩色",
      "visible": true,
      "customerText": "已添加您的微信"
     },
     {
      "at": "2026-10-11T16:30:00",
      "text": "内部：客户预算偏紧，报价可让 5%",
      "visible": false
     },
     {
      "at": "2026-10-12T14:20:00",
      "text": "已通过微信发送报价单",
      "visible": true
     }
    ],
    "quote": {
     "items": [
      {
       "name": "理光彩色 A3 全包套餐",
       "price": 380,
       "qty": 2,
       "unit": "/月/台",
       "subtotal": 760
      },
      {
       "name": "黑白 A4 短租套餐",
       "price": 45,
       "qty": 5,
       "unit": "/天",
       "subtotal": 225
      }
     ],
     "total": 985,
     "validUntil": "2026-12-31",
     "note": "长租 36 个月，含送装、上门维保；短租 5 天含送装。",
     "sentAt": "2026-10-12T10:00:00",
     "customerAction": "",
     "actionAt": ""
    }
   },
   {
    "createdAt": "2026-10-05T09:30:00",
    "assigneeId": "s1",
    "status": "renting",
    "stepDates": {
     "new": "2026-10-05",
     "wechat": "2026-10-05",
     "quoted": "2026-10-06",
     "won": "2026-10-07",
     "delivered": "2026-10-09",
     "renting": "2026-10-09"
    },
    "wonAmount": 750,
    "items": [
     {
      "planId": "s1",
      "qty": 3,
      "days": 5,
      "startDate": "2026-10-09"
     }
    ],
    "follows": [
     {
      "at": "2026-10-07T10:00:00",
      "text": "已签约，安排 10-09 送装",
      "visible": true
     },
     {
      "at": "2026-10-09T11:00:00",
      "text": "设备已送达并调试完成",
      "visible": true
     }
    ]
   },
   {
    "createdAt": "2026-09-20T16:12:00",
    "status": "new",
    "stepDates": {
     "new": "2026-09-20"
    },
    "items": [
     {
      "planId": "e2",
      "qty": 1,
      "days": 3,
      "startDate": "2026-11-01",
      "expo": {
       "name": "示例博览会",
       "venue": "会展中心 B 馆"
      }
     }
    ],
    "follows": []
   },
   {
    "createdAt": "2026-08-01T10:00:00",
    "assigneeId": "s1",
    "status": "finished",
    "stepDates": {
     "new": "2026-08-01",
     "wechat": "2026-08-01",
     "quoted": "2026-08-02",
     "won": "2026-08-03",
     "delivered": "2026-08-05",
     "renting": "2026-08-05",
     "finished": "2026-09-05"
    },
    "wonAmount": 1200,
    "items": [
     {
      "planId": "l1",
      "qty": 1,
      "months": 12
     }
    ],
    "follows": [
     {
      "at": "2026-09-05T09:00:00",
      "text": "租期结束，设备已回收，感谢合作",
      "visible": true
     }
    ]
   },
   {
    "createdAt": "2026-07-15T11:20:00",
    "status": "invalid",
    "invalidReason": "重复",
    "stepDates": {
     "new": "2026-07-15"
    },
    "items": [
     {
      "planId": "s2",
      "qty": 1,
      "days": 2
     }
    ],
    "follows": []
   }
  ]
 },
 "detailCommon": {
  "sla": {
   "respondH": 2,
   "arriveH": 4,
   "spare": "修不好提供备用机",
   "areas": [
    {
     "area": "南宁市区",
     "respond": "2 小时响应",
     "arrive": "4 小时到场"
    },
    {
     "area": "南宁县区",
     "respond": "4 小时响应",
     "arrive": "24 小时到场"
    }
   ]
  },
  "serviceAreas": [
   {
    "area": "青秀区",
    "time": "4 小时到场"
   },
   {
    "area": "兴宁区",
    "time": "4 小时到场"
   },
   {
    "area": "西乡塘区",
    "time": "4 小时到场"
   },
   {
    "area": "江南区",
    "time": "4 小时到场"
   },
   {
    "area": "良庆区",
    "time": "4 小时到场"
   },
   {
    "area": "邕宁区",
    "time": "次日到场"
   },
   {
    "area": "武鸣区 / 横州市 / 宾阳县等",
    "time": "24 小时内到场"
   }
  ]
 },
 "hotKeywords": [
  "理光",
  "A3 彩色",
  "展会",
  "财务"
 ],
 "posterSlogan": "政企办公设备租赁 · 1 台起租 · 对公结算",
 "showcase": [
  {
   "id": "sc1",
   "type": "case",
   "title": "某区政务中心彩色复印",
   "summary": "3 台全包套餐，4 小时响应，合作已满 2 年",
   "industry": "政务",
   "qty": 3,
   "publishDate": "",
   "content": "某区政务服务中心窗口日均打印 2000 张以上。我们按窗口分布配置 3 台理光彩色 A3 全包机，含耗材和季度巡检。\n上线后报修平均 3 小时内到场，2 年来未影响窗口办件。（示例）",
   "relatedPlanIds": [
    "l2"
   ],
   "authorized": false,
   "cover": "",
   "images": [],
   "status": "online",
   "sort": 1,
   "showOnHome": true
  },
  {
   "id": "sc2",
   "type": "case",
   "title": "某中学考试季短租",
   "summary": "20 台短租，送装到校，考试结束上门回收",
   "industry": "教育",
   "qty": 20,
   "publishDate": "",
   "content": "期末考试周需要集中印制试卷。20 台黑白 A4 短租 7 天，前一天送装调试，考后统一回收。（示例）",
   "relatedPlanIds": [
    "s1"
   ],
   "authorized": false,
   "cover": "",
   "images": [],
   "status": "online",
   "sort": 2,
   "showOnHome": true
  },
  {
   "id": "sc3",
   "type": "case",
   "title": "某会展中心展会打印",
   "summary": "展期 3 天，送装到展位，现场调试",
   "industry": "会展",
   "qty": 6,
   "publishDate": "",
   "content": "为展商提供 6 台展会打印机，布展日 9:00 前送装到位，撤展当天回收。（示例）",
   "relatedPlanIds": [
    "e2"
   ],
   "authorized": false,
   "cover": "",
   "images": [],
   "status": "online",
   "sort": 3,
   "showOnHome": true
  },
  {
   "id": "sc4",
   "type": "news",
   "title": "新增武鸣区上门服务网点",
   "summary": "武鸣区客户报修可当日到场",
   "industry": "",
   "qty": null,
   "publishDate": "2026-09-20",
   "content": "为缩短响应时间，我们在武鸣区新增服务网点。（示例）",
   "relatedPlanIds": [],
   "authorized": true,
   "cover": "",
   "images": [],
   "status": "online",
   "sort": 4,
   "showOnHome": true
  },
  {
   "id": "sc5",
   "type": "news",
   "title": "彩色 A3 机型升级",
   "summary": "全包套餐统一升级为新款彩色机",
   "industry": "",
   "qty": null,
   "publishDate": "2026-08-15",
   "content": "全包套餐设备统一升级，打印速度提升，耗材仍全包。（示例）",
   "relatedPlanIds": [
    "l2",
    "l3"
   ],
   "authorized": true,
   "cover": "",
   "images": [],
   "status": "online",
   "sort": 5,
   "showOnHome": true
  },
  {
   "id": "sc6",
   "type": "news",
   "title": "国庆假期服务安排",
   "summary": "假期正常受理报修，工程师轮值",
   "industry": "",
   "qty": null,
   "publishDate": "2026-09-28",
   "content": "10 月 1 日–7 日正常受理报修，市区当日响应。（示例）",
   "relatedPlanIds": [],
   "authorized": true,
   "cover": "",
   "images": [],
   "status": "online",
   "sort": 6,
   "showOnHome": true
  }
 ],
 "filters": {
  "long": [
   {
    "key": "usage",
    "sort": 1,
    "enabled": true,
    "quick": "",
    "label": "用途",
    "type": "multi",
    "options": "auto"
   },
   {
    "key": "color",
    "sort": 2,
    "enabled": true,
    "quick": "color",
    "label": "黑白 / 彩色",
    "type": "single",
    "options": [
     {
      "v": "mono",
      "label": "黑白"
     },
     {
      "v": "color",
      "label": "彩色"
     }
    ]
   },
   {
    "key": "paper",
    "sort": 3,
    "enabled": true,
    "quick": "A3",
    "label": "幅面",
    "type": "single",
    "options": [
     {
      "v": "A4",
      "label": "A4"
     },
     {
      "v": "A3",
      "label": "A3"
     }
    ]
   },
   {
    "key": "pages",
    "sort": 4,
    "enabled": true,
    "quick": "",
    "label": "月印量",
    "type": "single",
    "options": [
     {
      "v": "lt1500",
      "label": "<1500 张"
     },
     {
      "v": "1500-4000",
      "label": "1500–4000 张"
     },
     {
      "v": "4000+",
      "label": "4000+ 张"
     }
    ]
   },
   {
    "key": "people",
    "sort": 5,
    "enabled": true,
    "quick": "10-30",
    "label": "适用人数",
    "type": "single",
    "options": [
     {
      "v": "le10",
      "label": "≤10 人"
     },
     {
      "v": "10-30",
      "label": "10–30 人"
     },
     {
      "v": "30+",
      "label": "30+ 人"
     }
    ]
   },
   {
    "key": "price",
    "sort": 6,
    "enabled": true,
    "quick": "",
    "label": "价格",
    "type": "range",
    "options": "auto"
   },
   {
    "key": "brand",
    "sort": 7,
    "enabled": true,
    "quick": "",
    "label": "品牌",
    "type": "multi",
    "options": "auto"
   },
   {
    "key": "term",
    "sort": 8,
    "enabled": true,
    "quick": "",
    "label": "租期",
    "type": "single",
    "options": [
     {
      "v": "12",
      "label": "12 个月"
     },
     {
      "v": "24",
      "label": "24 个月"
     },
     {
      "v": "36",
      "label": "36 个月"
     }
    ]
   },
   {
    "key": "allin",
    "sort": 9,
    "enabled": true,
    "quick": "1",
    "label": "含耗材（全包）",
    "type": "switch",
    "options": [
     {
      "v": "1",
      "label": "全包"
     }
    ]
   }
  ],
  "short": [
   {
    "key": "usage",
    "sort": 1,
    "enabled": true,
    "quick": "",
    "label": "用途",
    "type": "multi",
    "options": "auto"
   },
   {
    "key": "color",
    "sort": 2,
    "enabled": true,
    "quick": "",
    "label": "黑白 / 彩色",
    "type": "single",
    "options": [
     {
      "v": "mono",
      "label": "黑白"
     },
     {
      "v": "color",
      "label": "彩色"
     }
    ]
   },
   {
    "key": "paper",
    "sort": 3,
    "enabled": true,
    "quick": "",
    "label": "幅面",
    "type": "single",
    "options": [
     {
      "v": "A4",
      "label": "A4"
     },
     {
      "v": "A3",
      "label": "A3"
     }
    ]
   },
   {
    "key": "people",
    "sort": 4,
    "enabled": true,
    "quick": "",
    "label": "适用人数",
    "type": "single",
    "options": [
     {
      "v": "le10",
      "label": "≤10 人"
     },
     {
      "v": "10-30",
      "label": "10–30 人"
     },
     {
      "v": "30+",
      "label": "30+ 人"
     }
    ]
   },
   {
    "key": "price",
    "sort": 5,
    "enabled": true,
    "quick": "",
    "label": "价格",
    "type": "range",
    "options": "auto"
   },
   {
    "key": "brand",
    "sort": 6,
    "enabled": true,
    "quick": "",
    "label": "品牌",
    "type": "multi",
    "options": "auto"
   },
   {
    "key": "days",
    "sort": 7,
    "enabled": true,
    "quick": "1",
    "label": "天数",
    "type": "single",
    "options": [
     {
      "v": "1",
      "label": "1 天起租"
     },
     {
      "v": "3",
      "label": "3 天以上"
     },
     {
      "v": "7",
      "label": "7 天以上"
     }
    ]
   },
   {
    "key": "allin",
    "sort": 8,
    "enabled": true,
    "quick": "",
    "label": "含耗材（全包）",
    "type": "switch",
    "options": [
     {
      "v": "1",
      "label": "全包"
     }
    ]
   },
   {
    "key": "delivery",
    "sort": 9,
    "enabled": true,
    "quick": "1",
    "label": "含送装",
    "type": "switch",
    "options": [
     {
      "v": "1",
      "label": "含送装"
     }
    ]
   }
  ],
  "expo": [
   {
    "key": "color",
    "sort": 1,
    "enabled": true,
    "quick": "",
    "label": "黑白 / 彩色",
    "type": "single",
    "options": [
     {
      "v": "mono",
      "label": "黑白"
     },
     {
      "v": "color",
      "label": "彩色"
     }
    ]
   },
   {
    "key": "paper",
    "sort": 2,
    "enabled": true,
    "quick": "A3",
    "label": "幅面",
    "type": "single",
    "options": [
     {
      "v": "A4",
      "label": "A4"
     },
     {
      "v": "A3",
      "label": "A3"
     }
    ]
   },
   {
    "key": "price",
    "sort": 3,
    "enabled": true,
    "quick": "",
    "label": "价格",
    "type": "range",
    "options": "auto"
   },
   {
    "key": "brand",
    "sort": 4,
    "enabled": true,
    "quick": "",
    "label": "品牌",
    "type": "multi",
    "options": "auto"
   },
   {
    "key": "allin",
    "sort": 5,
    "enabled": true,
    "quick": "",
    "label": "含耗材（全包）",
    "type": "switch",
    "options": [
     {
      "v": "1",
      "label": "全包"
     }
    ]
   },
   {
    "key": "delivery",
    "sort": 6,
    "enabled": true,
    "quick": "1",
    "label": "含送装",
    "type": "switch",
    "options": [
     {
      "v": "1",
      "label": "含送装"
     }
    ]
   }
  ]
 },
 "filterPriceBands": {}
};
