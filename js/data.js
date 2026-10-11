/* 假数据文件：只改这个文件就能增删套餐 / 轮播 / 用途标签（全部为演示用占位数据） */
window.DATA = {
  site: {
    company: { name: "南宁一龙办公设备有限公司", short: "一龙办公", slogan: "政企办公设备租赁 · 省心 · 合规 · 准时", phone: "400-000-0000", wechat: "demo_kefu_001", icp: "备案号（演示站，暂无）" },
    budgetBufferRate: 0.2, roundTo: 10, replySlaHours: 2
  },
  banners: [
    { id: "b1", title: "一天起租 50元起", sub: "短期活动用印，随租随还", link: "#/list/short", color: "#1E40AF" },
    { id: "b2", title: "理光彩色复印机特价", sub: "长租全包套餐 ¥399/月起", link: "#/plan/long/ricoh-color-allin", color: "#0F766E" },
    { id: "b3", title: "展会打印 一站搞定", sub: "送装到展位 · 撤展回收", link: "#/list/expo", color: "#C2410C" }
  ],
  usageTags: [
    { id: "small_office", name: "小型办公室" },
    { id: "dept_share", name: "部门共享" },
    { id: "color_promo", name: "彩色宣传物料" },
    { id: "bulk", name: "大批量文印" },
    { id: "meeting", name: "会议培训" },
    { id: "expo_front", name: "展会前台" }
  ],
  plans: [
    { id: "l1", slug: "ricoh-mono-basic", mode: "long", name: "理光黑白 A4 普通套餐", tier: "basic", tagline: "小型办公室日常打印", usageTagIds: ["small_office"],
      devices: [{ brand: "理光", model: "示例型号 A-100", type: "打印机", condition: "次新", color: false, paper: "A4", speed: 30, qty: 1 }],
      pricing: { monthlyFee: 168, includedMono: 2000, overageMono: 0.04, termOptionsMonths: [12, 24, 36] },
      points: ["含 2000 张/月", "上门维保"], includes: [{ label: "耗材", value: "不含（可加购）" }, { label: "维保", value: "上门维修，4 小时响应" }, { label: "到期", value: "可续租或归还" }] },
    { id: "l2", slug: "ricoh-color-allin", mode: "long", name: "理光彩色 A3 全包套餐", tier: "allin", tagline: "部门共享，耗材全包", usageTagIds: ["dept_share", "color_promo"], hot: true,
      devices: [{ brand: "理光", model: "示例型号 C-300", type: "复印机", condition: "新机", color: true, paper: "A3", speed: 35, qty: 1 }],
      pricing: { monthlyFee: 399, includedMono: 5000, includedColor: 500, overageMono: 0.03, overageColor: 0.3, termOptionsMonths: [12, 24, 36] },
      points: ["含 5000 张/月", "含耗材"], includes: [{ label: "耗材", value: "墨粉全包" }, { label: "维保", value: "上门维修 + 季度巡检" }, { label: "到期", value: "可续租或归还" }] },
    { id: "l3", slug: "ricoh-color-premium", mode: "long", name: "理光彩色 A3 豪华套餐", tier: "premium", tagline: "大批量文印，备机保障", usageTagIds: ["bulk", "dept_share"],
      devices: [{ brand: "理光", model: "示例型号 C-600", type: "复印机", condition: "新机", color: true, paper: "A3", speed: 60, qty: 1 }],
      pricing: { monthlyFee: 899, includedMono: 15000, includedColor: 2000, overageMono: 0.025, overageColor: 0.25, termOptionsMonths: [12, 24, 36] },
      points: ["含 15000 张/月", "备机保障"], includes: [{ label: "耗材", value: "墨粉全包" }, { label: "维保", value: "驻场级响应 + 故障备机" }, { label: "到期", value: "可续租或归还" }] },
    { id: "s1", slug: "short-mono", mode: "short", name: "黑白 A4 短租套餐", tier: "basic", tagline: "临时项目，1 天起租", usageTagIds: ["small_office", "meeting"],
      devices: [{ brand: "理光", model: "示例型号 A-100", type: "打印机", condition: "次新", color: false, paper: "A4", speed: 30, qty: 1 }],
      pricing: { dailyFee: 50, monthlyFee: 168, minDays: 1 }, points: ["1 天起租", "含 500 张/天"],
      includes: [{ label: "押金/证件", value: "请咨询客服" }, { label: "送取", value: "市内送货上门、到期上门取回" }, { label: "耗材", value: "含" }] },
    { id: "s2", slug: "short-color", mode: "short", name: "彩色 A3 短租套餐", tier: "allin", tagline: "会议培训、宣传物料", usageTagIds: ["meeting", "color_promo"], hot: true,
      devices: [{ brand: "理光", model: "示例型号 C-300", type: "复印机", condition: "次新", color: true, paper: "A3", speed: 35, qty: 1 }],
      pricing: { dailyFee: 120, monthlyFee: 399, minDays: 1 }, points: ["彩色 A3", "含耗材"],
      includes: [{ label: "押金/证件", value: "请咨询客服" }, { label: "送取", value: "市内送货上门、到期上门取回" }, { label: "耗材", value: "含" }] },
    { id: "e1", slug: "expo-mono", mode: "expo", name: "展会黑白 A4 一天套餐", tier: "basic", tagline: "前台签到、资料打印", usageTagIds: ["expo_front"],
      devices: [{ brand: "理光", model: "示例型号 A-100", type: "打印机", condition: "次新", color: false, paper: "A4", speed: 30, qty: 1 }],
      pricing: { dailyFee: 199, fixedFee: 100 }, points: ["送装到展位", "撤展回收"],
      includes: [{ label: "送装", value: "送到展位并调试（送装费 ¥100/次）" }, { label: "撤展", value: "撤展当天回收" }, { label: "耗材", value: "含" }] },
    { id: "e2", slug: "expo-color-a3", mode: "expo", name: "展会彩色 A3 一天套餐", tier: "allin", tagline: "海报、彩页现场打印", usageTagIds: ["expo_front", "color_promo"], hot: true,
      devices: [{ brand: "理光", model: "示例型号 C-300", type: "复印机", condition: "新机", color: true, paper: "A3", speed: 35, qty: 1 }],
      pricing: { dailyFee: 399, fixedFee: 150 }, points: ["彩色 A3", "现场调试"],
      includes: [{ label: "送装", value: "送到展位并调试（送装费 ¥150/次）" }, { label: "撤展", value: "撤展当天回收" }, { label: "耗材", value: "含" }] }
  ]
};
