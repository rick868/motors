CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"date_of_birth" timestamp,
	"license_number" text,
	"license_state" text,
	"notes" text,
	"customer_type" text DEFAULT 'individual',
	"status" text DEFAULT 'active',
	"profile_image" text,
	"created_at" timestamp DEFAULT now(),
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"motorcycle_id" integer NOT NULL,
	"transaction_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"reference_id" integer,
	"reference_type" text,
	"notes" text,
	"batch_number" text,
	"transaction_date" timestamp DEFAULT now() NOT NULL,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE "motorcycle_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"motorcycle_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"alt" text,
	"is_primary" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "motorcycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" text NOT NULL,
	"model" text NOT NULL,
	"make" text NOT NULL,
	"year" integer NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"color" text NOT NULL,
	"price" double precision NOT NULL,
	"cost" double precision NOT NULL,
	"msrp" double precision,
	"vin" text NOT NULL,
	"engine_type" text,
	"engine_capacity" integer,
	"transmission" text,
	"fuel_capacity" double precision,
	"seat_height" integer,
	"weight" integer,
	"power" integer,
	"torque" integer,
	"description" text,
	"features" jsonb,
	"warranty" text,
	"status" text DEFAULT 'in_stock' NOT NULL,
	"condition" text DEFAULT 'new' NOT NULL,
	"location" text,
	"stock" integer DEFAULT 0 NOT NULL,
	"reorder_point" integer DEFAULT 5,
	"lead_time" integer,
	"supplier_id" integer,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer,
	"updated_by" integer,
	CONSTRAINT "motorcycles_sku_unique" UNIQUE("sku"),
	CONSTRAINT "motorcycles_vin_unique" UNIQUE("vin")
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"motorcycle_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" double precision NOT NULL,
	"received_quantity" integer DEFAULT 0,
	"total" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"supplier_id" integer NOT NULL,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"expected_delivery_date" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"subtotal" double precision NOT NULL,
	"tax" double precision DEFAULT 0,
	"shipping" double precision DEFAULT 0,
	"total" double precision NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"created_by" integer,
	CONSTRAINT "purchase_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"motorcycle_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"sale_date" timestamp DEFAULT now() NOT NULL,
	"sale_price" double precision NOT NULL,
	"tax" double precision DEFAULT 0,
	"discount" double precision DEFAULT 0,
	"total" double precision NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text DEFAULT 'paid' NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sales_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"website" text,
	"payment_terms" text,
	"notes" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text NOT NULL,
	"phone" text,
	"profile_image" text,
	"role" text DEFAULT 'sales_manager' NOT NULL,
	"facebook_id" text,
	"instagram_id" text,
	"twitter_id" text,
	"linkedin_id" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_motorcycle_id_motorcycles_id_fk" FOREIGN KEY ("motorcycle_id") REFERENCES "public"."motorcycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motorcycle_images" ADD CONSTRAINT "motorcycle_images_motorcycle_id_motorcycles_id_fk" FOREIGN KEY ("motorcycle_id") REFERENCES "public"."motorcycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motorcycles" ADD CONSTRAINT "motorcycles_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motorcycles" ADD CONSTRAINT "motorcycles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motorcycles" ADD CONSTRAINT "motorcycles_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_motorcycle_id_motorcycles_id_fk" FOREIGN KEY ("motorcycle_id") REFERENCES "public"."motorcycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_motorcycle_id_motorcycles_id_fk" FOREIGN KEY ("motorcycle_id") REFERENCES "public"."motorcycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;