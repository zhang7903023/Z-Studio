# Z-Studio Codex 项目资料包

这个资料包可以直接丢给 Codex，用来生成独立站/数字资源商城。

## 文件说明

- `product_catalog.csv`：已整理的商品库，Codex 应优先读取这个。
- `category_mapping.json`：分类结构。
- `raw_excel_grouped.json`：原始 Excel 按 Sheet 分组后的数据。
- `supabase_schema.sql`：Supabase/Postgres 建表结构。
- `CODEX_PROMPT.md`：直接复制给 Codex 的完整提示词。

## 推荐做法

1. 新建一个 GitHub 仓库或本地项目。
2. 把本资料包所有文件放进项目根目录 `/data` 文件夹。
3. 打开 Codex，把 `CODEX_PROMPT.md` 内容发给它。
4. 让 Codex 先完成数据库导入脚本，再做页面。
5. 第一版只做人工收款和人工交付，不要接 Stripe/PayPal。