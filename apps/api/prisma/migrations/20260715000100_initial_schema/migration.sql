-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PriceMode" AS ENUM ('PUBLIC_PRICE', 'LINE_OFFER', 'CONTACT_PRICE');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('ON_SALE', 'SOLD_OUT', 'PAUSED', 'DRAFT', 'UNLISTED');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH', 'LOGIN', 'LOGIN_FAILED', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(3),
    "last_login_at" TIMESTAMPTZ(3),
    "password_changed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "admin_id" UUID,
    "action" "AuditAction" NOT NULL,
    "entity_type" VARCHAR(80) NOT NULL,
    "entity_id" VARCHAR(80),
    "metadata" JSONB,
    "ip_address" INET,
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "sku" VARCHAR(64) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "short_description" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "specifications" JSONB,
    "notices" TEXT,
    "original_price" DECIMAL(12,2),
    "sale_price" DECIMAL(12,2),
    "price_mode" "PriceMode" NOT NULL,
    "sale_status" "SaleStatus" NOT NULL DEFAULT 'DRAFT',
    "shopee_url" VARCHAR(2048),
    "accepts_shopee" BOOLEAN NOT NULL DEFAULT false,
    "accepts_line" BOOLEAN NOT NULL DEFAULT true,
    "line_inquiry_template" TEXT,
    "show_on_home" BOOLEAN NOT NULL DEFAULT false,
    "home_sort_order" INTEGER,
    "is_new" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_best_seller" BOOLEAN NOT NULL DEFAULT false,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "show_sold_out_in_related" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ(3),
    "unpublish_at" TIMESTAMPTZ(3),
    "seo_title" VARCHAR(70),
    "seo_description" VARCHAR(170),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "description" VARCHAR(500),
    "image_key" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "seo_title" VARCHAR(70),
    "seo_description" VARCHAR(170),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "product_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("product_id","category_id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "object_key" VARCHAR(500) NOT NULL,
    "alt_text" VARCHAR(250) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "product_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("product_id","tag_id")
);

-- CreateTable
CREATE TABLE "product_recommendations" (
    "source_product_id" UUID NOT NULL,
    "target_product_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_recommendations_pkey" PRIMARY KEY ("source_product_id","target_product_id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL,
    "key" VARCHAR(80) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "seo_title" VARCHAR(70),
    "seo_description" VARCHAR(170),
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "type" VARCHAR(80) NOT NULL,
    "content" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "desktop_options" JSONB,
    "mobile_options" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "faq_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "question" VARCHAR(300) NOT NULL,
    "answer" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carousel_slides" (
    "id" UUID NOT NULL,
    "desktop_key" VARCHAR(500) NOT NULL,
    "mobile_key" VARCHAR(500) NOT NULL,
    "title" VARCHAR(200),
    "subtitle" VARCHAR(300),
    "button_label" VARCHAR(80),
    "target_url" VARCHAR(2048),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMPTZ(3),
    "ends_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "carousel_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "key" VARCHAR(120) NOT NULL,
    "value" JSONB NOT NULL,
    "description" VARCHAR(300),
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "audit_logs_admin_id_created_at_idx" ON "audit_logs"("admin_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_sale_status_published_at_idx" ON "products"("sale_status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "products_price_mode_sale_price_idx" ON "products"("price_mode", "sale_price");

-- CreateIndex
CREATE INDEX "products_show_on_home_home_sort_order_idx" ON "products"("show_on_home", "home_sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_sort_order_idx" ON "categories"("parent_id", "sort_order");

-- CreateIndex
CREATE INDEX "product_categories_category_id_sort_order_idx" ON "product_categories"("category_id", "sort_order");

-- CreateIndex
CREATE INDEX "product_images_product_id_is_primary_idx" ON "product_images"("product_id", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "product_images_product_id_sort_order_key" ON "product_images"("product_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "product_tags_tag_id_idx" ON "product_tags"("tag_id");

-- CreateIndex
CREATE INDEX "product_recommendations_source_product_id_sort_order_idx" ON "product_recommendations"("source_product_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "pages_key_key" ON "pages"("key");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_status_published_at_idx" ON "pages"("status", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "content_blocks_page_id_sort_order_key" ON "content_blocks"("page_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "faq_categories_slug_key" ON "faq_categories"("slug");

-- CreateIndex
CREATE INDEX "faqs_category_id_status_sort_order_idx" ON "faqs"("category_id", "status", "sort_order");

-- CreateIndex
CREATE INDEX "carousel_slides_active_sort_order_idx" ON "carousel_slides"("active", "sort_order");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_recommendations" ADD CONSTRAINT "product_recommendations_source_product_id_fkey" FOREIGN KEY ("source_product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_recommendations" ADD CONSTRAINT "product_recommendations_target_product_id_fkey" FOREIGN KEY ("target_product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "faq_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Domain invariants from BR-001, BR-004 and BR-005.
ALTER TABLE "products"
  ADD CONSTRAINT "products_public_price_required"
  CHECK ("price_mode" <> 'PUBLIC_PRICE' OR ("sale_price" IS NOT NULL AND "sale_price" >= 0)),
  ADD CONSTRAINT "products_prices_non_negative"
  CHECK (("original_price" IS NULL OR "original_price" >= 0) AND ("sale_price" IS NULL OR "sale_price" >= 0)),
  ADD CONSTRAINT "products_shopee_url_required"
  CHECK (NOT "accepts_shopee" OR "shopee_url" IS NOT NULL);

ALTER TABLE "product_recommendations"
  ADD CONSTRAINT "product_recommendations_not_self"
  CHECK ("source_product_id" <> "target_product_id");

ALTER TABLE "carousel_slides"
  ADD CONSTRAINT "carousel_slides_valid_window"
  CHECK ("ends_at" IS NULL OR "starts_at" IS NULL OR "ends_at" > "starts_at");

CREATE UNIQUE INDEX "product_images_one_primary_per_product"
  ON "product_images" ("product_id")
  WHERE "is_primary" = true;
