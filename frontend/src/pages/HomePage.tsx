import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, Gift, ArrowRight, TrendingUp } from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { ProductGrid } from '../components/ProductGrid';
import { ShareProductModal } from '../components/ShareProductModal';
import { productApi, recommendationApi } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [sharedProduct, setSharedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [dealsData, featuredData, recsData] = await Promise.all([
          productApi.getDeals(),
          productApi.getFeatured(),
          recommendationApi.getRecommendations(8),
        ]);
        setDeals(dealsData);
        setFeatured(featuredData);
        setRecommendations(recsData);
      } catch (err) {
        console.warn('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [user]);

  return (
    <div className="main-content">
      {/* Sliding Promo Hero */}
      <HeroBanner />

      {/* Today's Deals Section */}
      <section style={{ marginBottom: '36px', background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={22} color="#cc0c39" /> Today's Flash Deals &amp; Discounts
          </h2>
          <Link to="/search?deals=true" style={{ fontSize: '14px', fontWeight: 600, color: '#007185' }}>
            See all deals &rarr;
          </Link>
        </div>
        <ProductGrid products={deals} onShareProduct={(p) => setSharedProduct(p)} />
      </section>

      {/* Featured Products */}
      <section style={{ marginBottom: '36px', background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#ff9900" /> Featured Tech &amp; Lifestyle Gear
          </h2>
          <Link to="/search" style={{ fontSize: '14px', fontWeight: 600, color: '#007185' }}>
            Explore all &rarr;
          </Link>
        </div>
        <ProductGrid products={featured} onShareProduct={(p) => setSharedProduct(p)} />
      </section>

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <section style={{ marginBottom: '36px', background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                {user ? `Recommended for You, ${user.fullName || user.username}` : 'Top Recommended for You'}
              </h2>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                Tailored based on trending shopping activity and community interactions.
              </p>
            </div>
            <Link to="/search" style={{ fontSize: '14px', fontWeight: 600, color: '#007185' }}>
              View more &rarr;
            </Link>
          </div>
          <ProductGrid products={recommendations} onShareProduct={(p) => setSharedProduct(p)} />
        </section>
      )}

      {/* Gift Hub Callout */}
      <section
        style={{
          background: 'linear-gradient(135deg, #232f3e 0%, #131921 100%)',
          color: 'white',
          padding: '36px 30px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div>
          <span className="badge badge-deal" style={{ marginBottom: '10px' }}>
            Social Shopping Feature
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0' }}>
            Surprise Your Friends in 1-Click with Custom Gifts
          </h2>
          <p style={{ color: '#ccc', fontSize: '14px', maxWidth: '600px', marginBottom: '18px' }}>
            Browse your connected friends' wishlists, pick the perfect match, add a personalized message, and we will deliver it wrapped with love.
          </p>
          <Link to="/gifts" className="btn-primary" style={{ padding: '10px 22px' }}>
            <Gift size={16} /> Explore Gift Hub
          </Link>
        </div>
        <Gift size={90} color="#ff9900" style={{ opacity: 0.8 }} />
      </section>

      {sharedProduct && (
        <ShareProductModal product={sharedProduct} onClose={() => setSharedProduct(null)} />
      )}
    </div>
  );
};
