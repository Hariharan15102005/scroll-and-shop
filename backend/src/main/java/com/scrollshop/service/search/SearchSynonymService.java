package com.scrollshop.service.search;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SearchSynonymService {

    // Bidirectional synonym clusters
    private final List<Set<String>> synonymClusters = new ArrayList<>();
    // Directed query expansion mappings (e.g. general term -> specific product terms)
    private final Map<String, Set<String>> directedExpansions = new HashMap<>();

    public SearchSynonymService() {
        initSynonymClusters();
    }

    private void initSynonymClusters() {
        // Audio / Earphones / Headphones
        addCluster("earphone", "earphones", "headphone", "headphones", "earbud", "earbuds", 
                "wireless earbuds", "bluetooth headset", "bluetooth headsets", "headset", "headsets", 
                "in-ear monitor", "in-ear monitors", "iem", "airpods", "tws", "earpiece");

        // Mobile / Phones
        addCluster("mobile", "mobiles", "smartphone", "smartphones", "phone", "phones", 
                "android phone", "android phones", "iphone", "iphones", "mobile phone", "mobile phones", 
                "cellphone", "cellphones", "handset", "handsets");

        // Laptops / Computers
        addCluster("laptop", "laptops", "notebook", "notebooks", "ultrabook", "ultrabooks", 
                "gaming laptop", "gaming laptops", "macbook", "pc", "computer", "computers");

        // Shoes / Footwear
        addCluster("shoe", "shoes", "sneaker", "sneakers", "running shoe", "running shoes", 
                "sports shoe", "sports shoes", "casual shoe", "casual shoes", "footwear", 
                "trainer", "trainers", "kicks", "athletic shoes");

        // Watches / Smartwatches
        addCluster("watch", "watches", "wrist watch", "wrist watches", "smartwatch", "smartwatches", 
                "fitness watch", "fitness watches", "fitness band", "smart band", "chronograph", "timepiece");

        // T-Shirts / Tops
        addCluster("t-shirt", "t-shirts", "tshirt", "tshirts", "tee", "tees", 
                "graphic tee", "graphic tees", "casual t-shirt", "casual t-shirts", 
                "graphic t-shirt", "graphic t-shirts", "shirt", "shirts", "top", "apparel");

        // Bags / Backpacks
        addCluster("bag", "bags", "backpack", "backpacks", "laptop bag", "laptop bags", 
                "handbag", "handbags", "travel bag", "travel bags", "daypack", "rucksack", 
                "duffel", "duffel bag", "tote", "tote bag", "satchel");

        // Speakers
        addCluster("speaker", "speakers", "bluetooth speaker", "bluetooth speakers", 
                "soundbar", "boombox", "portable speaker", "audio system");

        // Chargers / Power
        addCluster("charger", "chargers", "fast charger", "fast charging", "power bank", 
                "powerbank", "magsafe", "charging adapter", "gan charger", "battery pack");

        // Displays / Monitors
        addCluster("monitor", "monitors", "gaming monitor", "curved monitor", 
                "display", "screen", "ultrawide", "4k monitor");

        // Keyboards
        addCluster("keyboard", "keyboards", "mechanical keyboard", "gaming keyboard", 
                "hot-swap keyboard", "keypad");

        // Mice
        addCluster("mouse", "mice", "gaming mouse", "wireless mouse", "ultralight mouse");

        // Skincare
        addCluster("serum", "serums", "skincare", "skin care", "face serum", 
                "vitamin c", "hyaluronic", "beauty", "anti-aging", "glow serum");

        // Coffee
        addCluster("coffee", "espresso", "pour-over", "pour over", "coffee beans", 
                "arabica", "kettle", "brewer", "barista");

        // Tea / Matcha
        addCluster("tea", "matcha", "green tea", "uji matcha", "ceremonial matcha");

        // Fitness / Yoga
        addCluster("yoga mat", "yoga", "exercise mat", "fitness mat", "rubber mat", "mat");

        // Diffusers
        addCluster("diffuser", "aroma diffuser", "humidifier", "aromatherapy", "essential oil");

        // Massagers
        addCluster("massage gun", "massager", "percussion massager", "deep tissue", "massage");

        // Sunglasses
        addCluster("sunglasses", "sunglass", "shades", "aviators", "aviator sunglasses", "polarized sunglasses", "eyewear");

        // Wallets
        addCluster("wallet", "wallets", "bifold", "bifold wallet", "leather wallet", "cardholder", "purse");

        // Desks
        addCluster("desk", "desks", "standing desk", "standing desks", "sit stand desk", "workstation", "table");

        // Air Purifiers
        addCluster("air purifier", "air purifiers", "hepa purifier", "air cleaner", "hepa filter");

        // Candles
        addCluster("candle", "candles", "scented candle", "soy candle", "aromatherapy candle", "wax");
    }

    private void addCluster(String... terms) {
        Set<String> cluster = new HashSet<>();
        for (String term : terms) {
            String norm = normalize(term);
            if (!norm.isEmpty()) {
                cluster.add(norm);
            }
        }
        synonymClusters.add(cluster);
    }

    /**
     * Normalize a term or search query:
     * lowercase, replace punctuation/special characters with whitespace, trim multiple spaces.
     */
    public String normalize(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\- ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Retrieve all synonyms for a given term/phrase.
     */
    public Set<String> getSynonyms(String term) {
        String normalized = normalize(term);
        if (normalized.isEmpty()) return Collections.emptySet();

        Set<String> result = new LinkedHashSet<>();
        
        // Check clusters
        for (Set<String> cluster : synonymClusters) {
            if (cluster.contains(normalized)) {
                for (String syn : cluster) {
                    if (!syn.equals(normalized)) {
                        result.add(syn);
                    }
                }
            }
        }

        // Also check if any word within cluster matches
        if (result.isEmpty() && normalized.contains(" ")) {
            String[] words = normalized.split("\\s+");
            for (String w : words) {
                for (Set<String> cluster : synonymClusters) {
                    if (cluster.contains(w)) {
                        for (String syn : cluster) {
                            if (!syn.equals(w)) {
                                result.add(syn);
                            }
                        }
                    }
                }
            }
        }

        return result;
    }

    /**
     * Compute Levenshtein distance between two strings for typo tolerance.
     */
    public int getLevenshteinDistance(String s1, String s2) {
        if (s1 == null || s2 == null) return Integer.MAX_VALUE;
        int len1 = s1.length();
        int len2 = s2.length();
        int[][] dp = new int[len1 + 1][len2 + 1];

        for (int i = 0; i <= len1; i++) dp[i][0] = i;
        for (int j = 0; j <= len2; j++) dp[0][j] = j;

        for (int i = 1; i <= len1; i++) {
            for (int j = 1; j <= len2; j++) {
                int cost = (s1.charAt(i - 1) == s2.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
            }
        }
        return dp[len1][len2];
    }

    /**
     * Check if word is close enough to target (1 edit for short words, 2 edits for words >= 6 chars).
     */
    public boolean isFuzzyMatch(String word1, String word2) {
        if (word1 == null || word2 == null) return false;
        int maxDist = (word1.length() >= 6 && word2.length() >= 6) ? 2 : 1;
        if (Math.abs(word1.length() - word2.length()) > maxDist) return false;
        return getLevenshteinDistance(word1, word2) <= maxDist;
    }
}
