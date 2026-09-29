package com.scrollshop.config;

import com.scrollshop.entity.*;
import com.scrollshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ShoppingVideoRepository videoRepository;
    private final VideoProductTagRepository tagRepository;
    private final FriendshipRepository friendshipRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final ReviewRepository reviewRepository;
    private final ProductCommentRepository commentRepository;
    private final NotificationRepository notificationRepository;
    private final GiftWishlistRepository wishlistRepository;
    private final ProductLikeRepository productLikeRepository;
    private final CashbackCampaignRepository campaignRepository;
    private final SocialPostRepository socialPostRepository;
    private final ConnectedSocialAccountRepository connectedSocialAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAllData();
    }

    @Transactional
    public void seedAllData() {
        log.info("Populating Scroll & Shop with expansive catalog, creator videos, social graph, and interactive conversations...");

        String defaultPass = passwordEncoder.encode("Password@123");

        // 1. Categories
        Category catElectronics = getOrCreateCategory("Electronics & Gadgets", "electronics",
                "High-performance audio, premium computing, and smart gadgets.",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80");
        Category catHome = getOrCreateCategory("Home & Living", "home-living",
                "Modern aesthetic furniture, artisanal coffee gear, and ambient lighting.",
                "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80");
        Category catFashion = getOrCreateCategory("Fashion & Apparel", "fashion",
                "Contemporary streetwear, timeless watches, and ergonomic accessories.",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80");
        Category catGaming = getOrCreateCategory("Gaming & Workspace", "gaming-workspace",
                "Mechanical keyboards, ultra-wide monitors, and ergonomic battlestations.",
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80");
        Category catWellness = getOrCreateCategory("Wellness & Lifestyle", "wellness",
                "Self-care essentials, aroma diffusers, and relaxation accessories.",
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80");
        Category catBeauty = getOrCreateCategory("Beauty & Skincare", "beauty-skincare",
                "Botanical serums, derma rollers, and luxury hydration kits.",
                "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80");
        Category catGourmet = getOrCreateCategory("Gourmet & Pantry", "gourmet-pantry",
                "Specialty roast beans, organic matcha, and artisanal condiments.",
                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80");
        Category catFitness = getOrCreateCategory("Fitness & Outdoor", "fitness-outdoor",
                "Smart fitness bands, insulated hydration flasks, and tactical trail gear.",
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80");

        // 2. Users (32 Diverse Users)
        User admin = getOrCreateUser("admin", "admin@scrollshop.com", defaultPass, "Platform Admin",
                "Scroll & Shop Global Administrator & Community Lead",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80", Role.ADMIN);
        User alex = getOrCreateUser("alex_tech", "alex@scrollshop.com", defaultPass, "Alex Rivera",
                "Tech enthusiast & audio reviewer. Sharing high-end gear finds!",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80", Role.CREATOR);
        User sarah = getOrCreateUser("sarah_style", "sarah@scrollshop.com", defaultPass, "Sarah Jenkins",
                "Minimalist aesthetics, home decor, and sustainable lifestyle finds.",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80", Role.CREATOR);
        User rohit = getOrCreateUser("rohit_gamer", "rohit@scrollshop.com", defaultPass, "Rohit Sharma",
                "Hardcore gamer & custom mechanical keyboard enthusiast.",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80", Role.USER);
        User priya = getOrCreateUser("priya_art", "priya@scrollshop.com", defaultPass, "Priya Nair",
                "Art lover, morning coffee brewer, and book collector.",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80", Role.USER);
        User marcus = getOrCreateUser("marcus_fit", "marcus@scrollshop.com", defaultPass, "Marcus Vance",
                "Endurance coach & trail runner. Testing high-performance athletic gear.",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80", Role.CREATOR);
        User elena = getOrCreateUser("elena_vogue", "elena@scrollshop.com", defaultPass, "Elena Rostova",
                "Fashion stylist & luxury accessory curator from Milan/NYC.",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80", Role.CREATOR);
        User david = getOrCreateUser("david_chef", "david@scrollshop.com", defaultPass, "David Chang",
                "Culinary explorer & espresso perfectionist.",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80", Role.CREATOR);
        User maya = getOrCreateUser("maya_decor", "maya@scrollshop.com", defaultPass, "Maya Lin",
                "Interior architect sharing cozy nook designs and ambient lighting.",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80", Role.USER);
        User liam = getOrCreateUser("liam_sound", "liam@scrollshop.com", defaultPass, "Liam O'Connor",
                "Hi-Fi audio engineer & vinyl collector.",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80", Role.USER);
        User chloe = getOrCreateUser("chloe_skincare", "chloe@scrollshop.com", defaultPass, "Chloe Dubois",
                "Certified aesthetician reviewing clean botanical skincare formulations.",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80", Role.CREATOR);
        User arjun = getOrCreateUser("arjun_coder", "arjun@scrollshop.com", defaultPass, "Arjun Mehta",
                "Full-stack engineer building automated desk workflows.",
                "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80", Role.USER);
        User sophia = getOrCreateUser("sophia_travel", "sophia@scrollshop.com", defaultPass, "Sophia Rossi",
                "Digital nomad documenting lightweight travel setups.",
                "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80", Role.USER);
        User vikram = getOrCreateUser("vikram_speed", "vikram@scrollshop.com", defaultPass, "Vikram Sen",
                "Sim racer & custom PC modder.",
                "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=250&q=80", Role.USER);
        User zara = getOrCreateUser("zara_minimal", "zara@scrollshop.com", defaultPass, "Zara Khan",
                "Monochrome fashion lover and leather goods collector.",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80", Role.USER);
        User daniel = getOrCreateUser("daniel_outdoor", "daniel@scrollshop.com", defaultPass, "Daniel Boone",
                "Backcountry hiker, bushcraft photographer, and campfire barista.",
                "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=250&q=80", Role.USER);
        User ananya = getOrCreateUser("ananya_books", "ananya@scrollshop.com", defaultPass, "Ananya Roy",
                "Book reviewer, cozy desk stylist, and stationery addict.",
                "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=250&q=80", Role.USER);
        User lucas = getOrCreateUser("lucas_photo", "lucas@scrollshop.com", defaultPass, "Lucas Silva",
                "Street photographer testing mirrorless cameras and prime lenses.",
                "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=250&q=80", Role.CREATOR);
        User emily = getOrCreateUser("emily_craft", "emily@scrollshop.com", defaultPass, "Emily Watson",
                "Ceramics artisan and handmade home goods creator.",
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80", Role.USER);
        User kai = getOrCreateUser("kai_streamer", "kai@scrollshop.com", defaultPass, "Kai Tanaka",
                "Twitch partner streaming retro fighting games & tech unboxings.",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80", Role.CREATOR);

        // 3. Expanded Product Catalog (Diverse Products across all key search categories)
        List<Product> products = new ArrayList<>();

        // Electronics & Audio
        Product p1 = createProduct("Aura ANC Wireless Studio Headphones", "aura-anc-wireless-headphones",
                "Custom 40mm beryllium drivers, active hybrid noise cancellation, and 45-hour ultra-long battery life with plush memory foam ear cushions.",
                14999.00, 19999.00, 45, catElectronics, "SonicAura",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                4.8, 142, true, true, "audio,bluetooth,noise-cancelling,music,gift",
                "headphones, earphones, over-ear, studio headphones, wireless headphones, bluetooth headsets, anc, sound, music, headsets");
        Product p2 = createProduct("Pulse Portable Waterproof Bluetooth Speaker", "pulse-waterproof-bluetooth-speaker",
                "360-degree dynamic audio projection, IPX7 submersible waterproof rating, and 24-hour party playback with bass radiator.",
                3999.00, 5499.00, 75, catElectronics, "SonicAura",
                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
                4.7, 98, true, false, "audio,speaker,outdoor,bluetooth,portable,gift",
                "speaker, bluetooth speaker, soundbar, boombox, portable speaker, audio system, wireless speaker");
        Product p3 = createProduct("Apex True Wireless Hi-Fi Earbuds with ANC", "apex-true-wireless-earbuds-anc",
                "Dual driver acoustic architecture, LDAC high-res audio codec, wireless charging case, and IPX5 sweat resistance.",
                8999.00, 12999.00, 60, catElectronics, "SonicAura",
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
                4.9, 210, true, true, "earbuds,wireless,music,anc,gift",
                "wireless earbuds, earphones, earbuds, in-ear monitors, tws, bluetooth earbuds, in-ear headphones, audio, airpods alternative");
        Product p4 = createProduct("VoltGaN 100W 4-Port Fast Desktop Charger", "voltgan-100w-fast-charger",
                "Next-gen Gallium Nitride (GaN) fast charging with dual USB-C Power Delivery 3.0 and dual USB-A QC 4.0 outputs.",
                3499.00, 4499.00, 110, catElectronics, "VoltForge",
                "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
                4.8, 88, false, false, "charger,usb-c,fast-charge,desk,travel",
                "charger, fast charger, gan charger, adapter, charging brick, power supply, usb-c charger");
        Product p5 = createProduct("Nova 4K Ultra HD Smart Streaming Projector", "nova-4k-smart-projector",
                "Native 4K HDR10 laser engine, 2200 ANSI Lumens brightness, auto-keystone alignment, and built-in Harman Kardon acoustics.",
                48999.00, 59999.00, 15, catElectronics, "NovaVision",
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
                4.9, 44, true, false, "projector,home-theater,4k,cinema,gift",
                "projector, smart projector, 4k projector, home theater, cinema, laser projector");
        Product p6 = createProduct("Vanguard MagSafe Magnetic Power Bank 10000mAh", "vanguard-magsafe-power-bank",
                "Snap-on magnetic wireless charging for iPhone and Qi devices, ultra-slim titanium shell, and digital LED percentage display.",
                2799.00, 3799.00, 90, catElectronics, "VoltForge",
                "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80",
                4.6, 112, false, true, "powerbank,magsafe,apple,travel,gift",
                "power bank, powerbank, portable charger, battery pack, magsafe, wireless charger, fast charge");

        // Mobile Phones / Smartphones
        Product p29 = createProduct("AeroPhone Pro 5G Flagship Smartphone", "aerophone-pro-5g-smartphone",
                "6.7-inch 120Hz Dynamic AMOLED display, Snapdragon 8 Gen 3, 200MP OIS triple camera system, and 5000mAh battery with 100W HyperCharge.",
                59999.00, 69999.00, 30, catElectronics, "AeroPhone",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
                4.9, 175, true, true, "mobile,phone,smartphone,5g,android",
                "mobile, smartphone, android phone, mobile phone, 5g phone, cellphone, handset, cellular phone, smartphones");
        Product p30 = createProduct("Zenith Titanium Max Smart Mobile Phone", "zenith-titanium-max-mobile-phone",
                "Aerospace titanium unibody, Bionic neural engine, satellite SOS connectivity, and cinematic 4K HDR ProRes camera.",
                79999.00, 89999.00, 20, catElectronics, "Zenith",
                "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
                4.8, 92, true, false, "mobile,iphone,smartphone,flagship,cellular",
                "mobile, smartphone, iphone, flagship phone, mobile phone, cellular, smart device, phone, handsets");

        // Laptops & Computers
        Product p31 = createProduct("ZenBlade Pro 16\" Creator Laptop & Ultrabook", "zenblade-pro-16-creator-laptop",
                "16-inch 3.2K 120Hz OLED screen, Intel Core Ultra 9, RTX 4070 8GB, 32GB LPDDR5X RAM, and 1TB NVMe Gen4 SSD in an ultra-slim chassis.",
                119999.00, 134999.00, 15, catElectronics, "ZenBlade",
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
                4.9, 86, true, true, "laptop,notebook,ultrabook,gaming-laptop,workstation",
                "laptop, notebook, ultrabook, gaming laptop, portable computer, pc, computer, workstation, macbook alternative, laptops, notebooks");

        // In-Ear Earphones
        Product p32 = createProduct("SonicPro Studio In-Ear Wired Earphones", "sonicpro-studio-in-ear-earphones",
                "Dual balanced armature drivers with detachable MMCX silver-plated cable and tuned acoustic damper for reference monitoring.",
                4999.00, 6499.00, 50, catElectronics, "SonicAura",
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
                4.8, 110, false, true, "earphones,audio,in-ear,iem,studio",
                "earphones, in-ear monitors, iem, wired earphones, earbuds, headphones, in-ear headphones, audio");

        // Home & Living
        Product p7 = createProduct("Artisan Precision Pour-Over Kettle & Brewer", "artisan-pour-over-kettle-brewer",
                "Gooseneck temperature-controlled precision kettle with integrated stopwatch, matte black finish, and borosilicate double-wall dripper set.",
                6299.00, 7999.00, 25, catHome, "KaffeWerk",
                "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
                4.9, 114, true, true, "coffee,kitchen,artisanal,morning,gift",
                "coffee, espresso, pour-over, pour over, kettle, brewer, barista, coffee maker, morning brew");
        Product p8 = createProduct("Luminary Ambient Smart Desk Lamp", "luminary-ambient-smart-lamp",
                "Adjustable color temperature (2200K - 6500K), magnetic wireless charging base, gesture dimmer, and seamless smart ecosystem integration.",
                4299.00, 5999.00, 60, catHome, "GlowCraft",
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
                4.7, 56, true, false, "lighting,smart-home,desk,minimalist,gift",
                "lamp, desk lamp, smart lighting, ambient light, table lamp, led light");
        Product p9 = createProduct("Nordic Solid Oak Minimalist Plant Stand", "nordic-solid-oak-plant-stand",
                "Sustainably harvested European white oak with waterproof matte sealant, modular interlocking joinery, and felt floor protectors.",
                2199.00, 2999.00, 40, catHome, "NordicNest",
                "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
                4.8, 62, false, false, "plants,home-decor,woodwork,nordic,gift",
                "plant stand, home decor, furniture, wooden stand, planter, nordic");
        Product p10 = createProduct("AeroPure HEPA 13 Smart Air Purifier", "aeropure-hepa-air-purifier",
                "Captures 99.97% of airborne dust, smoke, and pet allergens with ultra-quiet 22dB sleep mode and real-time PM2.5 air quality laser ring.",
                8499.00, 11499.00, 35, catHome, "AeroPure",
                "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
                4.9, 87, true, true, "air-purifier,wellness,home,smart-home,gift",
                "air purifier, hepa purifier, air cleaner, hepa filter, air quality, air purifiers");
        Product p11 = createProduct("Hand-Poured Soy Wax Botanical Candle Set", "botanical-soy-wax-candle-set",
                "Set of 3 aromatherapy candles in amber apothecary jars: Cedar & Bergamot, Smoked Amber, and White Tea Lavender.",
                1499.00, 1999.00, 120, catHome, "Botanica",
                "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
                4.8, 175, false, false, "candles,aromatherapy,gift,home-decor,relaxation",
                "candle, candles, scented candle, soy candle, aromatherapy candle, wax, fragrance");

        // Fashion, Footwear & Apparel
        Product p12 = createProduct("Chronos Ceramic Sapphire Chronograph Watch", "chronos-sapphire-chronograph-watch",
                "Crafted with scratch-resistant sapphire crystal glass, Japanese quartz chronograph movement, 50m water resistance, and interchangeable leather straps.",
                11999.00, 16999.00, 18, catFashion, "Chronos",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                4.8, 73, true, false, "watch,fashion,luxury,accessories,gift",
                "watch, wrist watch, watches, wrist watches, chronograph, luxury watch, timepiece, analog watch");
        Product p33 = createProduct("VeloPulse Pro GPS Smartwatch & Fitness Watch", "velopulse-pro-gps-smartwatch",
                "AMOLED sapphire touch display, dual-frequency multi-GNSS tracking, VO2 max metrics, heart rate ECG sensor, and 14-day battery life.",
                18999.00, 24999.00, 25, catFashion, "VeloPulse",
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
                4.9, 130, true, true, "smartwatch,fitness,gps,watch,wearable",
                "smartwatch, fitness watch, wrist watch, smart band, digital watch, watch, fitness tracker, watches, smartwatches");
        Product p34 = createProduct("AeroStride Carbon Pro Running Shoes & Sneakers", "aerostride-carbon-pro-running-shoes",
                "Full-length carbon fiber propulsion plate, supercritical PEBA nitrogen-infused foam, breathable engineered mesh, and grippy Continental rubber outsole.",
                8999.00, 11999.00, 40, catFashion, "AeroStride",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
                4.9, 164, true, true, "shoes,sneakers,running,footwear,sports",
                "shoes, sneakers, running shoes, sports shoes, footwear, casual shoes, athletic sneakers, trainers, kicks, shoe");
        Product p35 = createProduct("Minimalist Heavyweight Graphic T-Shirt", "minimalist-heavyweight-graphic-tshirt",
                "280 GSM 100% organic ring-spun combed cotton, pre-shrunk boxy modern drop-shoulder fit with screen-printed Japanese typography.",
                1499.00, 1999.00, 80, catFashion, "SartorialCraft",
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                4.8, 95, true, false, "t-shirt,apparel,graphic-tee,streetwear,cotton",
                "t-shirt, tshirt, tee, tees, graphic tee, graphic tees, casual t-shirts, casual t-shirt, apparel, shirt, shirts, top, streetwear");
        Product p13 = createProduct("Voyager Weatherproof Cordura Daily Backpack", "voyager-weatherproof-cordura-backpack",
                "Water-repellent 1000D Cordura fabric, dedicated padded 16-inch laptop compartment, hidden security pocket, and ergonomic chest clasp.",
                5499.00, 6999.00, 50, catFashion, "VoyagerCo",
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
                4.8, 120, false, false, "backpack,travel,everyday-carry,bags,gift",
                "backpack, backpack bag, laptop bag, travel bag, bag, bags, daypack, rucksack, luggage, backpacks");
        Product p36 = createProduct("Voyager All-Weather Convertible Travel Bag & Duffel", "voyager-all-weather-travel-duffel-bag",
                "Convertible shoulder duffel and backpack styling with shoe compartment, water-resistant tarp bottom, and YKK storm zippers.",
                4299.00, 5799.00, 35, catFashion, "VoyagerCo",
                "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80",
                4.7, 78, false, true, "bag,duffel,travel,luggage,handbag",
                "bag, bags, travel bag, travel bags, handbag, handbags, duffel, duffel bag, tote, luggage, laptop bags");
        Product p14 = createProduct("Sartorial Full-Grain Italian Leather Bifold Wallet", "sartorial-leather-bifold-wallet",
                "Hand-stitched vegetable-tanned Italian leather with RFID-blocking lining, 8 card slots, and dual currency sleeves.",
                2499.00, 3499.00, 65, catFashion, "SartorialCraft",
                "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
                4.9, 140, false, true, "wallet,leather,accessories,edc,gift",
                "wallet, wallets, bifold, leather wallet, cardholder, purse, money clip");
        Product p15 = createProduct("Solstice Polarized Titanium Aviator Sunglasses", "solstice-titanium-aviator-sunglasses",
                "Ultra-lightweight aerospace-grade titanium frame with Japanese polarized UV400 anti-reflective lenses.",
                4799.00, 6299.00, 30, catFashion, "Solstice",
                "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
                4.7, 68, true, false, "sunglasses,fashion,summer,gift,accessories",
                "sunglasses, sunglass, shades, aviators, aviator sunglasses, polarized sunglasses, eyewear");

        // Gaming & Workspace
        Product p16 = createProduct("Nomad Minimalist Mechanical Keyboard (Hot-Swap)", "nomad-mechanical-keyboard",
                "75% layout, CNC anodized aluminum case, pre-lubed linear switches, custom RGB underglow, and seamless Bluetooth 5.2 / 2.4G wireless triple connectivity.",
                8499.00, 10999.00, 30, catGaming, "KeyNova",
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
                4.9, 89, true, false, "keyboard,gaming,desk-setup,mechanical,gift",
                "keyboard, keyboards, mechanical keyboard, gaming keyboard, keycaps, hot-swap keyboard");
        Product p17 = createProduct("Horizon Ultra-Wide Curved Gaming Monitor 34\"", "horizon-curved-gaming-monitor-34",
                "1440p WQHD 165Hz IPS curved panel with 1ms response time, HDR400, USB-C 90W power delivery, and ultra-thin bezel design.",
                34999.00, 42999.00, 12, catGaming, "Horizon",
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
                4.9, 39, true, true, "monitor,gaming,workspace,pc",
                "monitor, monitors, gaming monitor, curved monitor, display, screen, ultrawide, 4k monitor");
        Product p18 = createProduct("ErgoGlide Dual-Motor Solid Walnut Standing Desk", "ergoglide-solid-walnut-standing-desk",
                "Solid North American walnut desktop with anti-collision gyroscope sensors, 4 memory height presets, and integrated cable conduit.",
                28999.00, 35999.00, 8, catGaming, "ErgoGlide",
                "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80",
                4.9, 28, true, false, "desk,standing-desk,workspace,ergonomics",
                "desk, standing desk, sit stand desk, workstation, table, ergonomic desk");
        Product p19 = createProduct("Phantom Wireless Ultralight Esports Gaming Mouse (49g)", "phantom-ultralight-gaming-mouse",
                "PAW3395 26000 DPI sensor, sub-1ms wireless polling, optical Kailh switches, and ergonomic claw grip geometry.",
                5499.00, 6999.00, 42, catGaming, "KeyNova",
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
                4.8, 95, false, true, "mouse,gaming,esports,wireless,gift",
                "mouse, gaming mouse, wireless mouse, ultralight mouse, mice, esports mouse");

        // Wellness & Lifestyle
        Product p20 = createProduct("Botanica Ultrasonic Aroma Diffuser & Humidifier", "botanica-ultrasonic-aroma-diffuser",
                "Handcrafted ceramic cover, silent ultrasonic misting technology, 7 ambient LED warm modes, and auto-shutoff safety timer.",
                2899.00, 3999.00, 80, catWellness, "Botanica",
                "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
                4.6, 95, false, false, "diffuser,wellness,relaxation,home,gift",
                "diffuser, aroma diffuser, humidifier, aromatherapy, essential oil mist, fragrance");
        Product p21 = createProduct("TheraPulse Deep Tissue Percussion Massage Gun", "therapulse-percussion-massage-gun",
                "Brushless high-torque motor delivering 3200 PPM, 6 interchangeable silicone massage heads, and 6-hour battery pack.",
                6999.00, 9999.00, 35, catWellness, "TheraPulse",
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
                4.8, 118, true, true, "massage,recovery,fitness,wellness,gift",
                "massage gun, massager, percussion massager, deep tissue, muscle recovery, massage");
        Product p22 = createProduct("ZenFlow High-Density Natural Tree Rubber Yoga Mat", "zenflow-natural-rubber-yoga-mat",
                "Non-slip alignment laser grid, 5mm cushion density for joint protection, and antimicrobial sweat-absorbent surface.",
                3299.00, 4299.00, 50, catWellness, "ZenFlow",
                "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
                4.9, 76, false, false, "yoga,fitness,wellness,mindfulness,gift",
                "yoga mat, yoga, mat, exercise mat, fitness mat, rubber mat, pilates");

        // Beauty & Skincare
        Product p23 = createProduct("Botanical Glow Vitamin C & Hyaluronic Peptide Serum", "botanical-glow-vitamin-c-serum",
                "Potent 15% Ethyl Ascorbic Acid infused with multi-molecular hyaluronic acid, ferulic acid, and organic rosewater.",
                1899.00, 2499.00, 90, catBeauty, "Lumiere Botanics",
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
                4.8, 160, true, true, "skincare,serum,beauty,glow,gift",
                "serum, serums, skincare, skin care, face serum, vitamin c, beauty, anti-aging, moisturizer");
        Product p24 = createProduct("SculptGlow Rose Quartz Microcurrent Facial Sculptor", "sculptglow-rose-quartz-facial-sculptor",
                "Combines gentle microcurrent contouring with sonic vibrations and warm rose quartz thermal stimulation.",
                4499.00, 5999.00, 40, catBeauty, "Lumiere Botanics",
                "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
                4.7, 83, false, false, "beauty,skincare,anti-aging,tools,gift",
                "facial sculptor, microcurrent, beauty tool, face massager, rose quartz, anti-aging");

        // Gourmet & Pantry
        Product p25 = createProduct("Mount Kenya Single-Origin Specialty Arabica Beans (1kg)", "mount-kenya-single-origin-coffee",
                "Washed process heirloom Arabica grown at 1900m altitude. Tasting notes of blackcurrant, bergamot, and cane sugar.",
                1699.00, 2199.00, 60, catGourmet, "KaffeWerk",
                "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80",
                4.9, 134, true, false, "coffee,beans,specialty-coffee,gourmet,gift",
                "coffee, coffee beans, espresso, specialty coffee, arabica, roast, barista");
        Product p26 = createProduct("Ceremonial Grade Uji Matcha Green Tea Powder (100g)", "ceremonial-uji-matcha-powder",
                "First-harvest stone-ground tencha leaves from Kyoto, Japan. Vibrant emerald green with velvety umami sweetness.",
                2299.00, 2899.00, 45, catGourmet, "MatchaCraft",
                "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80",
                4.9, 92, false, true, "matcha,tea,japan,wellness,gift",
                "matcha, tea, green tea, uji matcha, ceremonial matcha, japanese tea");

        // Fitness & Outdoor
        Product p27 = createProduct("HydroShield Pro 1.2L Insulated Magnetic Flask", "hydroshield-pro-insulated-flask",
                "Double-wall copper vacuum insulation keeping drinks icy cold for 24 hours or steaming hot for 12 hours with magnetic cap lid.",
                2199.00, 2799.00, 85, catFitness, "HydroShield",
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
                4.8, 145, true, false, "flask,water-bottle,fitness,outdoor,gift",
                "flask, water bottle, bottle, insulated flask, thermos, tumbler, hydration");
        Product p28 = createProduct("TrailMatrix Ultralight Ripstop Camping Hammock Set", "trailmatrix-ultralight-camping-hammock",
                "210T parachute nylon with tree-friendly daisy-chain straps and heavy-duty 12KN aluminum carabiners.",
                2999.00, 3999.00, 50, catFitness, "TrailMatrix",
                "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
                4.7, 64, false, true, "hammock,camping,hiking,outdoor,gift",
                "hammock, camping hammock, outdoor gear, hiking, parachute nylon");

        Collections.addAll(products, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24, p25, p26, p27, p28, p29, p30, p31, p32, p33, p34, p35, p36);

        // 4. Shoppable Creator Videos (10 High Quality Shoppable Clips)
        createVideo(alex, "Aura Studio Headphones - Deep Dive ANC & Spatial Audio Test",
                "Testing out acoustic staging, low-frequency clarity, and commuter noise cancellation.",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
                540, 3890, List.of(p1, p3));

        createVideo(sarah, "Minimalist Coffee Corner & Morning Espresso Routine",
                "My absolute daily morning routine with the precision gooseneck kettle and single-origin Kenyan beans.",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
                412, 2980, List.of(p7, p25));

        createVideo(kai, "Nomad 75% Mechanical Keyboard Sound Profile & Keycap Mod",
                "ASMR switch sound test! Lubricated linear switches on gasket mount.",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
                890, 6200, List.of(p16, p19));

        createVideo(marcus, "Hydration & Muscle Recovery Gear I Never Leave Without",
                "Unboxing the TheraPulse percussion gun and HydroShield flask after a 20k trail marathon.",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
                320, 2150, List.of(p21, p27));

        createVideo(elena, "Timeless Watches & Leather Goods For Clean Capsule Wardrobes",
                "Styling the Chronos sapphire watch with this handcrafted Italian leather bifold.",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
                670, 4800, List.of(p12, p14));

        createVideo(chloe, "5-Minute Morning Glow: Vitamin C + Rose Quartz Sculpting",
                "How I layer high-concentration Vitamin C serum with lymphatic facial drainage.",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
                "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
                520, 3900, List.of(p23, p24));

        createVideo(david, "Whisking Authentic Uji Ceremonial Matcha at Home",
                "Step-by-step 80°C temperature water technique for a rich, silky foam layer without bitterness.",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
                "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80",
                445, 3100, List.of(p26, p7));

        createVideo(lucas, "The Ultimate Minimalist EDC Backpack Setup for Creators",
                "Packing my 16-inch workstation, headphones, and chargers into the Voyager Cordura pack.",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
                730, 5600, List.of(p13, p4, p1));

        // 5. Mutual Friendships
        createMutualFriendship(admin, alex);
        createMutualFriendship(admin, sarah);
        createMutualFriendship(admin, rohit);
        createMutualFriendship(alex, rohit);
        createMutualFriendship(alex, priya);
        createMutualFriendship(alex, kai);
        createMutualFriendship(sarah, maya);
        createMutualFriendship(sarah, elena);
        createMutualFriendship(sarah, chloe);
        createMutualFriendship(rohit, vikram);
        createMutualFriendship(rohit, arjun);
        createMutualFriendship(priya, ananya);
        createMutualFriendship(priya, david);
        createMutualFriendship(marcus, daniel);

        // 6. Pending Friend Requests (Incoming for test accounts)
        createFriendRequest(marcus, alex, FriendRequestStatus.PENDING);
        createFriendRequest(elena, alex, FriendRequestStatus.PENDING);
        createFriendRequest(lucas, alex, FriendRequestStatus.PENDING);
        createFriendRequest(sophia, rohit, FriendRequestStatus.PENDING);
        createFriendRequest(zara, priya, FriendRequestStatus.PENDING);
        createFriendRequest(daniel, admin, FriendRequestStatus.PENDING);
        createFriendRequest(emily, admin, FriendRequestStatus.PENDING);

        // Outgoing Requests (sent from alex to someone else)
        createFriendRequest(alex, david, FriendRequestStatus.PENDING);
        createFriendRequest(alex, sophia, FriendRequestStatus.PENDING);

        // 7. Seeded Chat Conversations & Messages with Shared Products
        createConversationWithMessages(alex, rohit, "Hey Rohit! Have you checked out that new 75% mechanical keyboard?", p16,
                "Yeah! The sound test in Kai's video was insane. Thinking about grabbing the linear switch version.",
                "Definitely recommend it! I just added it to my cart yesterday.");

        createConversationWithMessages(sarah, alex, "Alex, what do you think of this pour-over kettle for a gift?", p7,
                "It's phenomenal Sarah, temperature stability is super precise. Priya would love it!",
                "Awesome, ordering it now with gift wrap!");

        createConversationWithMessages(admin, alex, "Welcome to Scroll & Shop Creator Hub! Your audio review is trending on the feed.", p1,
                "Thank you Admin! Love the interactive product tagging features.",
                "Keep up the great demos!");

        createConversationWithMessages(priya, sarah, "Sarah, which aroma diffuser do you have in your study room?", p20,
                "It's the Botanica Ceramic one! 10/10 recommend with the lavender oil.",
                "Adding it to my wishlist right now!");

        // 8. Reviews and Comments
        createReview(p1, alex, 5, "Unbelievable Acoustic Clarity and ANC Isolation",
                "I have tested dozens of studio headphones and the Aura ANC easily rivals models twice its price point. The beryllium drivers deliver punchy, controlled sub-bass without muddying mid frequencies. Battery life easily exceeded 40 hours on my recent trans-continental flight.");
        createReview(p1, rohit, 5, "Perfect for both gaming audio and daily commute",
                "Low latency mode is crisp for competitive matches, and the plush ear cushions don't squeeze your glasses.");
        createReview(p16, kai, 5, "Best Pre-Built 75% Keyboard on the Market",
                "Factory lubed switches sound creamy right out of the box with zero metallic ping. The aluminum frame feels super premium.");
        createReview(p7, david, 5, "Barista-Level Flow Control",
                "The gooseneck spout gives you pinpoint control over pour speed. Built-in stopwatch makes dialing in extraction a breeze.");
        createReview(p23, chloe, 5, "Holy Grail Vitamin C Formula",
                "Non-sticky, rapidly absorbing, and noticeably brightens hyperpigmentation within 2 weeks of daily application.");

        createComment(p1, priya, "Does the active noise cancellation work well on flights?");
        createComment(p16, arjun, "Is the hot-swap PCB compatible with 5-pin Cherry MX switches?");
        createComment(p7, maya, "Can you set the temperature in both Celsius and Fahrenheit?");

        // 9. Notifications
        createNotification(alex, marcus, NotificationType.FRIEND_REQUEST, "New Friend Request",
                "Marcus Vance sent you a friend request.", "/friends");
        createNotification(alex, elena, NotificationType.FRIEND_REQUEST, "New Friend Request",
                "Elena Rostova sent you a friend request.", "/friends");
        createNotification(alex, rohit, NotificationType.CHAT_MESSAGE, "New Message from Rohit",
                "Rohit sent you a message: 'Yeah! The sound test in Kai's video was insane...'", "/chat");
        createNotification(alex, admin, NotificationType.PRODUCT_LIKE, "Product Liked",
                "Platform Admin liked your review on Aura ANC Studio Headphones.", "/products/aura-anc-wireless-headphones");
        createNotification(rohit, sophia, NotificationType.FRIEND_REQUEST, "New Friend Request",
                "Sophia Rossi sent you a friend request.", "/friends");
        createNotification(admin, daniel, NotificationType.FRIEND_REQUEST, "New Friend Request",
                "Daniel Boone sent you a friend request.", "/friends");

        // 10. Gift Wishlist Items
        createWishlistItem(alex, p1, 1, "Top choice for audio editing!");
        createWishlistItem(alex, p16, 2, "Would love this for my streaming desk.");
        createWishlistItem(priya, p7, 1, "For morning pour-overs.");
        createWishlistItem(priya, p20, 1, "Love relaxing lavender scents.");
        createWishlistItem(rohit, p17, 1, "Dream monitor setup.");

        // 11. Cashback Campaigns
        if (campaignRepository.count() == 0) {
            campaignRepository.save(CashbackCampaign.builder()
                    .title("5% Storewide Shopping Rewards")
                    .description("Earn 5% cashback on all qualifying orders. Approved 7 days after delivery.")
                    .rewardType("PERCENTAGE")
                    .rewardValue(BigDecimal.valueOf(5.00))
                    .activityType("PURCHASE")
                    .minPurchaseAmount(BigDecimal.valueOf(25.00))
                    .maxCashbackPerUser(BigDecimal.valueOf(500.00))
                    .isActive(true)
                    .badgeText("5% BACK")
                    .terms("Applies automatically at checkout on all eligible items. Excludes gift card purchases.")
                    .build());

            campaignRepository.save(CashbackCampaign.builder()
                    .title("Connect Instagram & Earn $5.00")
                    .description("Link your verified Instagram creator or shopper profile to receive instant welcome reward credits.")
                    .rewardType("FIXED")
                    .rewardValue(BigDecimal.valueOf(5.00))
                    .activityType("SOCIAL_CONNECT")
                    .maxCashbackPerUser(BigDecimal.valueOf(5.00))
                    .isActive(true)
                    .badgeText("$5 BONUS")
                    .terms("One-time bonus per verified social media handle. Requires public profile connection.")
                    .build());

            campaignRepository.save(CashbackCampaign.builder()
                    .title("Creator Reviewer Spotlight ($10.00)")
                    .description("Publish a verified photo review or video unboxing of any tech or audio product.")
                    .rewardType("FIXED")
                    .rewardValue(BigDecimal.valueOf(10.00))
                    .activityType("PRODUCT_REVIEW")
                    .maxCashbackPerUser(BigDecimal.valueOf(30.00))
                    .isActive(true)
                    .badgeText("$10 BOUNTY")
                    .terms("Must include at least one photo or video demonstration with verified purchase status.")
                    .build());

            campaignRepository.save(CashbackCampaign.builder()
                    .title("Friend Referral Cashback ($15.00)")
                    .description("Invite your friends to Scroll & Shop. Earn $15 cashback when their first order ships.")
                    .rewardType("FIXED")
                    .rewardValue(BigDecimal.valueOf(15.00))
                    .activityType("REFERRAL")
                    .maxCashbackPerUser(BigDecimal.valueOf(150.00))
                    .isActive(true)
                    .badgeText("$15 REFERRAL")
                    .terms("Referral reward credits when referred friend completes a qualifying purchase over $50.")
                    .build());
        }

        // 12. Social Posts (30% Social Content in Feed)
        if (socialPostRepository.count() == 0) {
            socialPostRepository.save(SocialPost.builder()
                    .user(alex)
                    .content("Just unboxed the Aura ANC Wireless Headphones. The sound isolation in a busy cafe is unmatched! Full frequency response feels super flat and accurate for monitoring. 🎧✨")
                    .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80")
                    .taggedProduct(p1)
                    .category("Tech")
                    .likeCount(48)
                    .commentCount(12)
                    .isPublic(true)
                    .build());

            socialPostRepository.save(SocialPost.builder()
                    .user(sarah)
                    .content("Morning coffee routine upgraded with the Artisanal Pour-Over Kettle. The matte black finish looks gorgeous on the counter! ☕🤍")
                    .imageUrl("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80")
                    .taggedProduct(p7)
                    .category("Lifestyle")
                    .likeCount(84)
                    .commentCount(19)
                    .isPublic(true)
                    .build());

            socialPostRepository.save(SocialPost.builder()
                    .user(kai)
                    .content("Finally completed my desk overhaul with the Lumina Custom 75% Mechanical Keyboard. Custom gateron oil kings sound so creamy. Who wants a sound test?")
                    .imageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80")
                    .taggedProduct(p16)
                    .category("Tech")
                    .likeCount(126)
                    .commentCount(34)
                    .isPublic(true)
                    .build());

            socialPostRepository.save(SocialPost.builder()
                    .user(priya)
                    .content("Skincare restock day! The Radiant Vitamin C Complex has become my morning staple. Noticeable glow after just 10 days. 🌿✨")
                    .imageUrl("https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80")
                    .taggedProduct(p23)
                    .category("Beauty")
                    .likeCount(62)
                    .commentCount(8)
                    .isPublic(true)
                    .build());

            socialPostRepository.save(SocialPost.builder()
                    .user(marcus)
                    .content("Hydration check! The HydroFlow Insulated Bottle keeps my electrolyte water freezing cold throughout 2-hour gym sessions. 🧊💪")
                    .imageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80")
                    .taggedProduct(p11)
                    .category("Fitness")
                    .likeCount(95)
                    .commentCount(15)
                    .isPublic(true)
                    .build());
        }

        // 13. Connected Social Accounts
        if (connectedSocialAccountRepository.count() == 0) {
            connectedSocialAccountRepository.save(ConnectedSocialAccount.builder()
                    .user(alex)
                    .provider("INSTAGRAM")
                    .providerUserId("soc_alex_tech_ig")
                    .providerUsername("@alex_tech_official")
                    .providerDisplayName("Alex Mercer | Tech Reviews")
                    .profilePictureUrl(alex.getAvatarUrl())
                    .status("CONNECTED")
                    .permissionsGranted("instagram_basic, pages_show_list")
                    .isVerified(true)
                    .rewardClaimed(true)
                    .build());

            connectedSocialAccountRepository.save(ConnectedSocialAccount.builder()
                    .user(sarah)
                    .provider("TIKTOK")
                    .providerUserId("soc_sarah_tiktok")
                    .providerUsername("@sarah_style_daily")
                    .providerDisplayName("Sarah Jenkins Daily")
                    .profilePictureUrl(sarah.getAvatarUrl())
                    .status("CONNECTED")
                    .permissionsGranted("user.info.basic, video.list")
                    .isVerified(true)
                    .rewardClaimed(true)
                    .build());
        }

        log.info("Successfully populated Scroll & Shop with {} products, {} users, {} videos, campaigns, and social interactions!",
                productRepository.count(), userRepository.count(), videoRepository.count());
    }

    private Category getOrCreateCategory(String name, String slug, String desc, String img) {
        return categoryRepository.findBySlug(slug).orElseGet(() ->
                categoryRepository.save(Category.builder().name(name).slug(slug).description(desc).imageUrl(img).build()));
    }

    private User getOrCreateUser(String username, String email, String pass, String fullName, String bio, String avatar, Role role) {
        return userRepository.findByUsername(username).orElseGet(() ->
                userRepository.save(User.builder()
                        .username(username)
                        .email(email)
                        .passwordHash(pass)
                        .fullName(fullName)
                        .bio(bio)
                        .avatarUrl(avatar)
                        .role(role)
                        .isPersonalizationEnabled(true)
                        .build()));
    }

    private Product createProduct(String title, String slug, String desc, double price, double origPrice, int stock,
                                  Category cat, String brand, String img, double rating, int ratingCount,
                                  boolean featured, boolean deal, String tags, String searchKeywords) {
        Product existing = productRepository.findBySlug(slug).orElse(null);
        if (existing != null) {
            existing.setSearchKeywords(searchKeywords);
            existing.setTags(tags);
            existing.setCategory(cat);
            existing.setBrand(brand);
            return productRepository.save(existing);
        }
        return productRepository.save(Product.builder()
                .title(title)
                .slug(slug)
                .description(desc)
                .price(BigDecimal.valueOf(price))
                .originalPrice(BigDecimal.valueOf(origPrice))
                .stockQuantity(stock)
                .category(cat)
                .brand(brand)
                .mainImageUrl(img)
                .ratingAverage(rating)
                .ratingCount(ratingCount)
                .isFeatured(featured)
                .isDealOfTheDay(deal)
                .tags(tags)
                .searchKeywords(searchKeywords)
                .build());
    }

    private void createVideo(User creator, String title, String desc, String videoUrl, String thumb, int likes, int views, List<Product> taggedProducts) {
        ShoppingVideo video = videoRepository.save(ShoppingVideo.builder()
                .creator(creator)
                .title(title)
                .description(desc)
                .videoUrl(videoUrl)
                .thumbnailUrl(thumb)
                .likesCount(likes)
                .viewsCount(views)
                .build());

        for (Product p : taggedProducts) {
            tagRepository.save(VideoProductTag.builder().video(video).product(p).build());
        }
    }

    private void createMutualFriendship(User u1, User u2) {
        if (!friendshipRepository.existsByUserIdAndFriendId(u1.getId(), u2.getId())) {
            friendshipRepository.save(Friendship.builder().user(u1).friend(u2).build());
        }
        if (!friendshipRepository.existsByUserIdAndFriendId(u2.getId(), u1.getId())) {
            friendshipRepository.save(Friendship.builder().user(u2).friend(u1).build());
        }
    }

    private void createFriendRequest(User sender, User receiver, FriendRequestStatus status) {
        if (!friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(sender.getId(), receiver.getId(), status) &&
            !friendshipRepository.existsByUserIdAndFriendId(sender.getId(), receiver.getId())) {
            friendRequestRepository.save(FriendRequest.builder().sender(sender).receiver(receiver).status(status).build());
        }
    }

    private void createConversationWithMessages(User u1, User u2, String msg1, Product product, String msg2, String msg3) {
        Conversation conv = conversationRepository.save(Conversation.builder()
                .isGroup(false)
                .title(u1.getFullName() + " & " + u2.getFullName())
                .build());

        participantRepository.save(ConversationParticipant.builder().conversation(conv).user(u1).build());
        participantRepository.save(ConversationParticipant.builder().conversation(conv).user(u2).build());

        messageRepository.save(Message.builder().conversation(conv).sender(u1).content(msg1).sharedProduct(product).build());
        messageRepository.save(Message.builder().conversation(conv).sender(u2).content(msg2).build());
        messageRepository.save(Message.builder().conversation(conv).sender(u1).content(msg3).build());
    }

    private void createReview(Product p, User u, int rating, String title, String comment) {
        reviewRepository.save(Review.builder()
                .product(p)
                .user(u)
                .rating(rating)
                .title(title)
                .comment(comment)
                .isVerifiedPurchase(true)
                .build());
    }

    private void createComment(Product p, User u, String content) {
        commentRepository.save(ProductComment.builder()
                .product(p)
                .user(u)
                .content(content)
                .build());
    }

    private void createNotification(User recipient, User sender, NotificationType type, String title, String msg, String link) {
        notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .type(type)
                .title(title)
                .message(msg)
                .linkUrl(link)
                .isRead(false)
                .build());
    }

    private void createWishlistItem(User u, Product p, int priority, String notes) {
        if (wishlistRepository.findByUserIdAndProductId(u.getId(), p.getId()).isEmpty()) {
            wishlistRepository.save(GiftWishlist.builder()
                    .user(u)
                    .product(p)
                    .isPublic(true)
                    .isReserved(false)
                    .build());
        }
    }
}

