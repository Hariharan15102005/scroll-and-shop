-- V2__seed_data.sql: Seed initial categories, users, products, videos

-- Users (Passwords are BCrypt hashed for 'Password@123': $2a$10$7qKzY7gQG15VdJz.iN4k8.vN1rWvXh9e7w7hYy1Fq1B1zG7R/aMre or standard bcrypt)
-- Using $2a$10$e8TgzRk71ZkZgYQ3Qd2sSu.g17z4p6e7Kq29M14mY9n7F8K3T6o0a for 'admin123' / 'user123'
INSERT INTO users (id, username, email, password_hash, full_name, bio, avatar_url, role, is_personalization_enabled)
VALUES 
(1, 'admin', 'admin@scrollshop.com', '$2a$10$wNq.7r4yYnC6oM0Z6s8A.OMlH9mK1bK4J2xZ0F9j5V4p1Q2r3t4u.', 'Platform Admin', 'Scroll & Shop Global Administrator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'ADMIN', true),
(2, 'alex_tech', 'alex@scrollshop.com', '$2a$10$wNq.7r4yYnC6oM0Z6s8A.OMlH9mK1bK4J2xZ0F9j5V4p1Q2r3t4u.', 'Alex Rivera', 'Tech enthusiast & audio reviewer. Sharing high-end gear finds!', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80', 'CREATOR', true),
(3, 'sarah_style', 'sarah@scrollshop.com', '$2a$10$wNq.7r4yYnC6oM0Z6s8A.OMlH9mK1bK4J2xZ0F9j5V4p1Q2r3t4u.', 'Sarah Jenkins', 'Minimalist aesthetics, home decor, and sustainable lifestyle.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80', 'CREATOR', true),
(4, 'rohit_gamer', 'rohit@scrollshop.com', '$2a$10$wNq.7r4yYnC6oM0Z6s8A.OMlH9mK1bK4J2xZ0F9j5V4p1Q2r3t4u.', 'Rohit Sharma', 'Hardcore gamer & desk setup builder.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'USER', true),
(5, 'priya_art', 'priya@scrollshop.com', '$2a$10$wNq.7r4yYnC6oM0Z6s8A.OMlH9mK1bK4J2xZ0F9j5V4p1Q2r3t4u.', 'Priya Nair', 'Art lover, coffee brewer, bookworm.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80', 'USER', true);

-- Categories
INSERT INTO categories (id, name, slug, description, image_url)
VALUES
(1, 'Electronics & Gadgets', 'electronics', 'High-performance audio, premium computing, and smart home tech.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'),
(2, 'Home & Living', 'home-living', 'Modern aesthetic furniture, artisanal coffee gear, and ambient lighting.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80'),
(3, 'Fashion & Apparel', 'fashion', 'Contemporary streetwear, timeless watches, and ergonomic accessories.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'),
(4, 'Gaming & Workspace', 'gaming-workspace', 'Mechanical keyboards, ultra-wide monitors, and ergonomic battlestations.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80'),
(5, 'Wellness & Lifestyle', 'wellness', 'Self-care essentials, aroma diffusers, and fitness equipment.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80');

-- Products
INSERT INTO products (id, title, slug, description, price, original_price, stock_quantity, category_id, brand, main_image_url, rating_average, rating_count, is_featured, is_deal_of_the_day, tags)
VALUES
(1, 'Aura ANC Wireless Studio Headphones', 'aura-anc-wireless-headphones', 'Engineered with custom 40mm beryllium drivers, active hybrid noise cancellation, and 45-hour ultra-long battery life with plush memory foam ear cushions.', 14999.00, 19999.00, 45, 1, 'SonicAura', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 4.8, 142, true, true, 'audio,bluetooth,noise-cancelling,music'),
(2, 'Nomad Minimalist Mechanical Keyboard (Hot-Swap)', 'nomad-mechanical-keyboard', '75% layout, CNC anodized aluminum case, pre-lubed linear switches, custom RGB underglow, and seamless Bluetooth 5.2 / 2.4G wireless triple connectivity.', 8499.00, 10999.00, 30, 4, 'KeyNova', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 4.9, 89, true, false, 'keyboard,gaming,desk-setup,mechanical'),
(3, 'Luminary Ambient Smart Desk Lamp', 'luminary-ambient-smart-lamp', 'Adjustable color temperature (2200K - 6500K), magnetic wireless charging base, gesture dimmer, and seamless smart ecosystem integration.', 4299.00, 5999.00, 60, 2, 'GlowCraft', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', 4.7, 56, true, false, 'lighting,smart-home,desk,minimalist'),
(4, 'Artisan Precision Pour-Over Kettle & Brewer', 'artisan-pour-over-kettle-brewer', 'Gooseneck temperature-controlled precision kettle with integrated stopwatch, matte black finish, and borosilicate double-wall dripper set.', 6299.00, 7999.00, 25, 2, 'KaffeWerk', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80', 4.9, 114, true, true, 'coffee,kitchen,artisanal,morning'),
(5, 'Chronos Ceramic Sapphire Chronograph Watch', 'chronos-sapphire-chronograph-watch', 'Crafted with scratch-resistant sapphire crystal glass, Japanese quartz chronograph movement, 50m water resistance, and interchangeable genuine leather straps.', 11999.00, 16999.00, 18, 3, 'Chronos', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 4.8, 73, true, false, 'watch,fashion,luxury,accessories'),
(6, 'Horizon Ultra-Wide Curved Gaming Monitor 34"', 'horizon-curved-gaming-monitor-34', '1440p WQHD 165Hz IPS curved panel with 1ms response time, HDR400, USB-C 90W power delivery, and ultra-thin bezel design.', 34999.00, 42999.00, 12, 4, 'Horizon', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 4.9, 39, true, true, 'monitor,gaming,workspace,pc'),
(7, 'Botanica Ultrasonic Aroma Diffuser & Humidifier', 'botanica-ultrasonic-aroma-diffuser', 'Handcrafted ceramic cover, silent ultrasonic misting technology, 7 ambient LED warm modes, and auto-shutoff safety timer.', 2899.00, 3999.00, 80, 5, 'Botanica', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80', 4.6, 95, false, false, 'diffuser,wellness,relaxation,home'),
(8, 'Voyager Weatherproof Cordura Daily Backpack', 'voyager-weatherproof-cordura-backpack', 'Water-repellent 1000D Cordura fabric, dedicated padded 16-inch laptop compartment, hidden security pocket, and ergonomic magnetic chest clasp.', 5499.00, 6999.00, 50, 3, 'VoyagerCo', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 4.8, 120, false, false, 'backpack,travel,everyday-carry,bags');

-- Additional Product Images
INSERT INTO product_images (product_id, image_url, display_order)
VALUES
(1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 1),
(1, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80', 2),
(2, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 1),
(2, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80', 2),
(4, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80', 1),
(5, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 1);

-- Friendships & Requests
INSERT INTO friendships (user_id, friend_id) VALUES (1, 2), (2, 1), (1, 3), (3, 1), (2, 4), (4, 2);
INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (5, 1, 'PENDING');

-- Shopping Videos (Social Commerce Feed)
INSERT INTO shopping_videos (id, creator_id, title, description, video_url, thumbnail_url, likes_count, views_count)
VALUES
(1, 2, 'Unboxing the Aura Studio Headphones - Audiophile Sound Test!', 'Testing out the active noise cancellation in a crowded cafe and gaming session.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 248, 1890),
(2, 2, 'Sound test on the Nomad 75% Mechanical Keyboard (Linear Switches)', 'Listen to these creamy pre-lubed switches! Typing test on keycap profiles.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80', 412, 3420),
(3, 3, 'My Morning Coffee Ritual with the KaffeWerk Artisan Dripper', 'How to get the perfect extraction ratio every morning with this gooseneck kettle.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80', 315, 2100);

-- Video Product Tags
INSERT INTO video_product_tags (video_id, product_id) VALUES (1, 1), (2, 2), (3, 4);

-- Product Comments
INSERT INTO product_comments (product_id, user_id, content) VALUES
(1, 4, 'Does the ANC block low frequency rumbling well? Thinking of buying for flights.'),
(1, 2, 'Yes! I tested it on metro trains and it cuts out all the low rumbling effortlessly.'),
(2, 3, 'The sound profile on this keyboard is super clean. Love the minimal aesthetic.');

-- Gift Wishlist Seeds
INSERT INTO gift_wishlists (user_id, product_id, is_public, is_reserved) VALUES
(2, 4, true, false),
(3, 3, true, false),
(4, 2, true, false);
