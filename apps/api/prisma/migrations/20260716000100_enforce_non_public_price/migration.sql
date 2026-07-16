-- BR-003: non-public prices must not participate in price sorting.
UPDATE "products"
SET "sale_price" = NULL
WHERE "price_mode" <> 'PUBLIC_PRICE';

ALTER TABLE "products"
ADD CONSTRAINT "products_non_public_sale_price_hidden"
CHECK ("price_mode" = 'PUBLIC_PRICE' OR "sale_price" IS NULL);
