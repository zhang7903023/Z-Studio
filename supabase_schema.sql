create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum (
      'pending_payment',
      'pending_review',
      'processing',
      'delivered',
      'after_sales',
      'cancelled'
    );
  end if;
end $$;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id) on delete set null,
  sort_order int not null default 0,
  description text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  title text not null,
  slug text unique not null,
  main_category text not null,
  subcategory text not null default '',
  category_slug text not null default '',
  price_cny numeric,
  price_text text,
  delivery_time text not null default '1-24 小时内确认',
  stock_status text not null default '需确认',
  description text not null default '',
  after_sales text not null default '',
  risk_note text not null default '',
  source_sheet text not null default '',
  source_row int,
  row_type text not null default 'product',
  is_active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_method text not null,
  contact_value text not null,
  telegram text,
  whatsapp text,
  created_at timestamptz not null default now(),
  unique (contact_method, contact_value)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  contact_method text not null,
  contact_value text not null,
  product_id uuid references products(id) on delete set null,
  product_title text not null,
  quantity int not null default 1,
  total_price_cny numeric,
  requirements text not null default '',
  payment_method text not null default '',
  payment_screenshot_url text not null default '',
  status order_status not null default 'pending_review',
  admin_note text not null default '',
  delivery_content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  order_no text not null,
  method text not null default '',
  amount numeric,
  screenshot_url text not null default '',
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_parent on categories(parent_id);
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_products_category on products(main_category, subcategory);
create index if not exists idx_products_category_slug on products(category_slug);
create index if not exists idx_products_featured on products(featured, is_active);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_order_no on orders(order_no);
create index if not exists idx_customers_contact on customers(contact_method, contact_value);
create index if not exists idx_payments_order_no on payments(order_no);

alter table if exists categories enable row level security;
alter table if exists products enable row level security;
alter table if exists customers enable row level security;
alter table if exists orders enable row level security;
alter table if exists payments enable row level security;
