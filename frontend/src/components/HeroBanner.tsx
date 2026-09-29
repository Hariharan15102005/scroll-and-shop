import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Gift, Sparkles, Flame } from 'lucide-react';

const slides = [
  {
    id: 1,
    tag: 'Big Social Commerce Festival',
    title: 'Discover, Chat & Shop with Friends',
    subtitle: 'Share shoppable cards directly into chat, watch creator unboxings, and gift friends in 1-click.',
    cta: 'Explore Deals',
    link: '/search?deals=true',
    bgImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 2,
    tag: 'Gift Your Friend Hub',
    title: 'Surprise Your Best Friends Today',
    subtitle: 'Browse their wishlist, view personalized recommendations, and send with custom gift wrap.',
    cta: 'Gift a Friend',
    link: '/gifts',
    bgImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 3,
    tag: 'Trending Electronics & Tech',
    title: 'Upgrade Your Setup with Premium Tech',
    subtitle: 'Explore high-performance audio, mechanical keyboards, smart accessories, and gaming gear.',
    cta: 'Explore Catalog',
    link: '/search',
    bgImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1600&q=80',
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="hero-slider-container">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.bgImage})` }}
        >
          <div className="hero-gradient-overlay" />
          <div className="hero-content">
            <span className="hero-tag">
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {slide.tag}
            </span>
            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-subtitle">{slide.subtitle}</p>
            <Link to={slide.link} className="btn-secondary" style={{ padding: '12px 26px', fontSize: '15px' }}>
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}

      {/* Slider Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
        }}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
        }}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
