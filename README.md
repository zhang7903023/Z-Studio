# Z-Studio 数字资源商城

## 技术栈
- Next.js 15
- TypeScript
- TailwindCSS
- Supabase
- Vercel
- Stripe 跳转支付

## 已实现内容
- 首页科技极简深色风格
- 商品分类页、详情页、下单页、订单查询页
- 后台管理页与对应 API
- Sitemap、OpenGraph、Robots、Manifest
- 从 `data/product_catalog.csv` 自动生成商品和分类数据

## 本地运行
1. 进入项目目录：
   ```bash
   cd /Users/zyxstudio/Documents/Codex/2026-06-20/gen/zstudio-marketplace
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 生成商品数据：
   ```bash
   npm run generate:data
   ```
4. 启动本地开发：
   ```bash
   npm run dev
   ```

## Supabase 初始化
1. 在 Supabase 新建项目。
2. 执行 `supabase_schema.sql`。
3. 把 `.env.example` 复制为 `.env.local`，填写：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
4. 访问 `POST /api/seed` 同步初始商品与分类，或直接运行本地 seed：
   ```bash
   npm run seed:local
   ```

### Supabase keys 在哪里找
- `SUPABASE_URL`：Supabase 项目首页的 `Project URL`
- `SUPABASE_ANON_KEY`：项目设置里的 `API` 页面中的 `anon public`
- `SUPABASE_SERVICE_ROLE_KEY`：同一个 `API` 页面中的 `service_role`
- 找到后直接复制到 `.env.local`
- `STRIPE_SECRET_KEY`：Stripe 后台 `Developers / API keys` 里的 Secret key
- `STRIPE_WEBHOOK_SECRET`：Stripe 后台创建 webhook endpoint 后给你的签名密钥

## Vercel 部署
1. 将这个 GitHub 仓库直接导入 Vercel。
2. 设置环境变量：
   - `NEXT_PUBLIC_SITE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `ADMIN_ACCESS_KEY`
3. Build Command 保持默认：`npm run build`
4. 部署完成后，直接使用 Vercel 给你的正式链接或 Preview 链接分享给别人。
5. Stripe 如果要自动更新订单状态，再到 Stripe 后台添加 webhook，地址填：`https://你的域名/api/webhooks/stripe`

## 分享给别人看
- 最稳妥的方式：部署到 Vercel 后，把生成的 `https://xxx.vercel.app` 链接直接发给对方。
- 如果你想先给别人看预览版，可以直接把 Vercel 的 Preview Deployment 链接发出去。
- 如果你设置了 `ADMIN_ACCESS_KEY`，后台页只给自己用，不要公开分享。
- 后续绑定自己的域名后，也可以直接用品牌域名分享。

## 备注
- 当前版本默认采用人工审核收款和人工交付流程。
- 后台管理页已经预留了商品、分类、订单、客户管理的 API。
- 如果暂时没有 Supabase 配置，系统会先用本地 `data/runtime-db.json` 跑起来，方便你先看效果。
