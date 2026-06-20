-- Z-Studio digital resource marketplace schema for Supabase/Postgres
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id),
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  title text not null,
  slug text unique not null,
  main_category text not null,
  subcategory text,
  price_cny numeric,
  price_text text,
  delivery_time text,
  stock_status text default '需确认',
  description text,
  after_sales text,
  risk_note text,
  source_sheet text,
  source_row int,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,
  customer_name text,
  contact_method text not null,
  contact_value text not null,
  product_id uuid references products(id),
  product_title text not null,
  quantity int not null default 1,
  total_price_cny numeric,
  requirements text,
  payment_method text,
  payment_screenshot_url text,
  status text not null default 'pending_review',
  admin_note text,
  delivery_content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_category on products(main_category, subcategory);
create index if not exists idx_products_search on products using gin(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')));
create index if not exists idx_orders_status on orders(status);