package com.scrollshop.service;

import com.scrollshop.entity.Category;
import com.scrollshop.entity.Product;
import com.scrollshop.service.search.ProductSearchEngine;
import com.scrollshop.service.search.SearchSynonymService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProductSearchEngineTest {

    private ProductSearchEngine searchEngine;
    private List<Product> catalog;

    private Product headphones;
    private Product earphones;
    private Product earbuds;
    private Product mobile1;
    private Product mobile2;
    private Product laptop;
    private Product shoes;
    private Product watch;
    private Product tshirt;
    private Product backpack;

    @BeforeEach
    void setUp() {
        SearchSynonymService synonymService = new SearchSynonymService();
        searchEngine = new ProductSearchEngine(synonymService);

        Category electronics = Category.builder().id(1L).name("Electronics").slug("electronics").build();
        Category fashion = Category.builder().id(2L).name("Fashion").slug("fashion").build();

        headphones = Product.builder()
                .id(1L)
                .title("Aura ANC Wireless Studio Headphones")
                .slug("aura-anc-wireless-headphones")
                .description("Active hybrid noise cancellation and ultra-long battery life with plush ear cushions.")
                .price(new BigDecimal("14999.00"))
                .brand("SonicAura")
                .category(electronics)
                .tags("audio,bluetooth,noise-cancelling")
                .searchKeywords("headphones, earphones, over-ear, studio headphones, wireless headphones, bluetooth headsets, anc")
                .ratingAverage(4.8)
                .build();

        earphones = Product.builder()
                .id(2L)
                .title("SonicPro Studio In-Ear Wired Earphones")
                .slug("sonicpro-studio-in-ear-earphones")
                .description("Dual balanced armature drivers with silver-plated cable for reference monitoring.")
                .price(new BigDecimal("4999.00"))
                .brand("SonicAura")
                .category(electronics)
                .tags("earphones,audio,in-ear,iem")
                .searchKeywords("earphones, in-ear monitors, iem, wired earphones, earbuds, in-ear headphones")
                .ratingAverage(4.8)
                .build();

        earbuds = Product.builder()
                .id(3L)
                .title("Apex True Wireless Hi-Fi Earbuds with ANC")
                .slug("apex-true-wireless-earbuds-anc")
                .description("Dual driver acoustic architecture, LDAC high-res codec, wireless charging case.")
                .price(new BigDecimal("8999.00"))
                .brand("SonicAura")
                .category(electronics)
                .tags("earbuds,wireless,music,anc")
                .searchKeywords("wireless earbuds, earphones, earbuds, in-ear monitors, tws, bluetooth earbuds, in-ear headphones")
                .ratingAverage(4.9)
                .build();

        mobile1 = Product.builder()
                .id(4L)
                .title("AeroPhone Pro 5G Flagship Smartphone")
                .slug("aerophone-pro-5g-smartphone")
                .description("Dynamic AMOLED 120Hz display, 200MP camera system, and 5000mAh battery.")
                .price(new BigDecimal("59999.00"))
                .brand("AeroPhone")
                .category(electronics)
                .tags("mobile,phone,smartphone,5g")
                .searchKeywords("mobile, smartphone, android phone, mobile phone, 5g phone, cellphone, handset, cellular phone")
                .ratingAverage(4.9)
                .build();

        mobile2 = Product.builder()
                .id(5L)
                .title("Zenith Titanium Max Smart Mobile Phone")
                .slug("zenith-titanium-max-mobile-phone")
                .description("Titanium unibody, Bionic neural engine, cinematic 4K ProRes camera.")
                .price(new BigDecimal("79999.00"))
                .brand("Zenith")
                .category(electronics)
                .tags("mobile,iphone,smartphone,flagship")
                .searchKeywords("mobile, smartphone, iphone, flagship phone, mobile phone, cellular, smart device, phone")
                .ratingAverage(4.8)
                .build();

        laptop = Product.builder()
                .id(6L)
                .title("ZenBlade Pro 16\" Creator Laptop & Ultrabook")
                .slug("zenblade-pro-16-creator-laptop")
                .description("16-inch 3.2K OLED screen, Intel Core Ultra 9, RTX 4070, 32GB RAM.")
                .price(new BigDecimal("119999.00"))
                .brand("ZenBlade")
                .category(electronics)
                .tags("laptop,notebook,ultrabook,workstation")
                .searchKeywords("laptop, notebook, ultrabook, gaming laptop, portable computer, pc, computer, macbook alternative")
                .ratingAverage(4.9)
                .build();

        shoes = Product.builder()
                .id(7L)
                .title("AeroStride Carbon Pro Running Shoes & Sneakers")
                .slug("aerostride-carbon-pro-running-shoes")
                .description("Carbon fiber propulsion plate, nitrogen-infused foam, breathable mesh.")
                .price(new BigDecimal("8999.00"))
                .brand("AeroStride")
                .category(fashion)
                .tags("shoes,sneakers,running,footwear")
                .searchKeywords("shoes, sneakers, running shoes, sports shoes, footwear, casual shoes, athletic sneakers, trainers, kicks")
                .ratingAverage(4.9)
                .build();

        watch = Product.builder()
                .id(8L)
                .title("Chronos Ceramic Sapphire Chronograph Watch")
                .slug("chronos-sapphire-chronograph-watch")
                .description("Scratch-resistant sapphire crystal glass, Japanese quartz chronograph.")
                .price(new BigDecimal("11999.00"))
                .brand("Chronos")
                .category(fashion)
                .tags("watch,fashion,luxury")
                .searchKeywords("watch, wrist watch, watches, wrist watches, chronograph, luxury watch, timepiece")
                .ratingAverage(4.8)
                .build();

        tshirt = Product.builder()
                .id(9L)
                .title("Minimalist Heavyweight Graphic T-Shirt")
                .slug("minimalist-heavyweight-graphic-tshirt")
                .description("280 GSM 100% organic cotton, boxy drop-shoulder fit.")
                .price(new BigDecimal("1499.00"))
                .brand("SartorialCraft")
                .category(fashion)
                .tags("t-shirt,apparel,graphic-tee")
                .searchKeywords("t-shirt, tshirt, tee, tees, graphic tee, casual t-shirts, apparel, shirt, top")
                .ratingAverage(4.8)
                .build();

        backpack = Product.builder()
                .id(10L)
                .title("Voyager Weatherproof Cordura Daily Backpack")
                .slug("voyager-weatherproof-cordura-backpack")
                .description("1000D Cordura fabric, padded 16-inch laptop compartment.")
                .price(new BigDecimal("5499.00"))
                .brand("VoyagerCo")
                .category(fashion)
                .tags("backpack,travel,bags")
                .searchKeywords("backpack, backpack bag, laptop bag, travel bag, bag, bags, daypack, rucksack")
                .ratingAverage(4.8)
                .build();

        catalog = new ArrayList<>(List.of(headphones, earphones, earbuds, mobile1, mobile2, laptop, shoes, watch, tshirt, backpack));
    }

    // 1. Test "Earphones" -> returns earphones, earbuds, headphones (synonym match)
    @Test
    void testSearch_Earphones_ReturnsRelevantProductsWithDirectFirst() {
        Page<Product> result = searchEngine.searchAndRank(catalog, "Earphones", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));

        assertFalse(result.isEmpty());
        assertTrue(result.getContent().size() >= 3);
        // Direct title match for Earphones ranks at the top
        assertEquals("SonicPro Studio In-Ear Wired Earphones", result.getContent().get(0).getTitle());
        // Earbuds and headphones are also included via synonyms and keywords
        List<String> titles = result.getContent().stream().map(Product::getTitle).toList();
        assertTrue(titles.contains("Apex True Wireless Hi-Fi Earbuds with ANC"));
        assertTrue(titles.contains("Aura ANC Wireless Studio Headphones"));
    }

    // 2. Test "Headphones" -> returns headphones, earphones, earbuds
    @Test
    void testSearch_Headphones_ReturnsHeadphonesFirstFollowedByRelated() {
        Page<Product> result = searchEngine.searchAndRank(catalog, "Headphones", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));

        assertFalse(result.isEmpty());
        // Direct title match for Headphones ranks first
        assertEquals("Aura ANC Wireless Studio Headphones", result.getContent().get(0).getTitle());
        List<String> titles = result.getContent().stream().map(Product::getTitle).toList();
        assertTrue(titles.contains("Apex True Wireless Hi-Fi Earbuds with ANC"));
        assertTrue(titles.contains("SonicPro Studio In-Ear Wired Earphones"));
    }

    // 3. Test "Wireless earbuds"
    @Test
    void testSearch_WirelessEarbuds_ReturnsApexEarbudsFirst() {
        Page<Product> result = searchEngine.searchAndRank(catalog, "Wireless earbuds", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));

        assertFalse(result.isEmpty());
        assertEquals("Apex True Wireless Hi-Fi Earbuds with ANC", result.getContent().get(0).getTitle());
    }

    // 4. Test "Mobile" -> returns Smartphones and Mobile phones
    @Test
    void testSearch_Mobile_ReturnsSmartphonesAndMobiles() {
        Page<Product> result = searchEngine.searchAndRank(catalog, "Mobile", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));

        assertFalse(result.isEmpty());
        assertEquals(2, result.getContent().size());
        List<String> titles = result.getContent().stream().map(Product::getTitle).toList();
        assertTrue(titles.contains("AeroPhone Pro 5G Flagship Smartphone"));
        assertTrue(titles.contains("Zenith Titanium Max Smart Mobile Phone"));
    }

    // 5. Test "Laptop" -> returns Notebooks / Ultrabooks
    @Test
    void testSearch_Laptop_ReturnsLaptopsAndUltrabooks() {
        Page<Product> result = searchEngine.searchAndRank(catalog, "Laptop", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));

        assertFalse(result.isEmpty());
        assertEquals("ZenBlade Pro 16\" Creator Laptop & Ultrabook", result.getContent().get(0).getTitle());

        // Also test synonym "Notebook"
        Page<Product> notebookResult = searchEngine.searchAndRank(catalog, "Notebook", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));
        assertFalse(notebookResult.isEmpty());
        assertEquals("ZenBlade Pro 16\" Creator Laptop & Ultrabook", notebookResult.getContent().get(0).getTitle());
    }

    // 6. Test "Shoes" -> returns Sneakers / Running Shoes
    @Test
    void testSearch_Shoes_ReturnsSneakersAndRunningShoes() {
        Page<Product> result = searchEngine.searchAndRank(catalog, "Shoes", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));

        assertFalse(result.isEmpty());
        assertEquals("AeroStride Carbon Pro Running Shoes & Sneakers", result.getContent().get(0).getTitle());

        // Also test synonym "Sneakers"
        Page<Product> sneakerResult = searchEngine.searchAndRank(catalog, "Sneakers", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));
        assertFalse(sneakerResult.isEmpty());
        assertEquals("AeroStride Carbon Pro Running Shoes & Sneakers", sneakerResult.getContent().get(0).getTitle());
    }

    // 7. Test a product's exact name
    @Test
    void testSearch_ExactProductName_RanksFirstWithHighestScore() {
        String exactName = "Aura ANC Wireless Studio Headphones";
        Page<Product> result = searchEngine.searchAndRank(catalog, exactName, null, null, null, "relevance", "DESC", PageRequest.of(0, 10));

        assertFalse(result.isEmpty());
        assertEquals("Aura ANC Wireless Studio Headphones", result.getContent().get(0).getTitle());
    }

    // 8. Test a query with no matching products
    @Test
    void testSearch_NoMatchingProducts_ReturnsEmptyPage() {
        Page<Product> result = searchEngine.searchAndRank(catalog, "Quantum Intergalactic Hovercraft 9999", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));

        assertTrue(result.isEmpty());
        assertEquals(0, result.getTotalElements());
    }

    // 9. Test multi-word queries e.g. "wireless bluetooth earphones"
    @Test
    void testSearch_MultiWordQuery_MatchesRelevantAudioProducts() {
        Page<Product> result = searchEngine.searchAndRank(catalog, "wireless bluetooth earphones", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));

        assertFalse(result.isEmpty());
        List<String> titles = result.getContent().stream().map(Product::getTitle).toList();
        assertTrue(titles.contains("Apex True Wireless Hi-Fi Earbuds with ANC") || titles.contains("Aura ANC Wireless Studio Headphones"));
    }

    // 10. Test typo tolerance e.g. "headphons"
    @Test
    void testSearch_TypoTolerance_FindsHeadphones() {
        Page<Product> result = searchEngine.searchAndRank(catalog, "headphons", null, null, null, "relevance", "DESC", PageRequest.of(0, 10));

        assertFalse(result.isEmpty());
        assertEquals("Aura ANC Wireless Studio Headphones", result.getContent().get(0).getTitle());
    }
}
