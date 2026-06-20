你是我的全栈开发助手。请基于我上传的资料包，创建 Z-Studio 数字资源商城。

资料文件：
- product_catalog.csv：从原始价目表整理出来的商品库，保留 source_sheet/source_row 方便追溯。
- category_mapping.json：栏目分类映射。
- raw_excel_grouped.json：原始 Excel 数据，作为兜底参考。
- supabase_schema.sql：建议数据库结构。

技术栈：
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Vercel 部署
- 不接 Stripe/PayPal，第一版只做人工审核收款：USDT、支付宝、微信、银行卡、付款截图上传。

请完成：
1. 创建首页，品牌为 Z-Studio，风格：自由、科技、未来、极简、高级。
2. 创建商品分类页：TikTok、Facebook、Instagram、YouTube、Google、X/Twitter、电商、通讯、IP资源、认证服务、增长服务。
3. 创建商品列表，支持搜索、分类筛选、价格排序。
4. 创建商品详情页，展示价格、交付时间、库存状态、售后、风险说明、联系客服。
5. 创建下单页，字段包括：商品、数量、联系方式、需求备注、支付方式、付款截图上传。
6. 创建后台管理页：商品管理、订单管理、订单状态修改、交付内容填写、备注。
7. 导入 product_catalog.csv 作为初始商品数据。价格字段如果无法解析为数字，保留 price_text。
8. 加 Telegram Bot 通知：新订单提交后，把订单号、商品、联系方式、备注发送到管理员 Telegram。
9. 所有页面必须适配手机端。
10. 不要做刷量承诺文案，商品说明用中性资源展示方式；风险说明必须显示。

订单状态：
pending_payment, pending_review, processing, delivered, after_sales, cancelled

重要要求：
- 不要把商品全部平铺在首页。
- 首页只展示核心分类和热门服务入口。
- 商品数据以 CSV 为准，原始 JSON 只作为补充。
- 代码要能直接运行，给出 .env.example。
- 给出 README 部署步骤。