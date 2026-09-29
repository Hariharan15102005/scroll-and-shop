import React, { useState } from 'react';
import { Sparkles, Gift, Truck, Tag, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnnouncementStrip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #b86200 0%, #f08804 50%, #e07700 100%)',
        color: '#ffffff',
        padding: '6px 16px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        position: 'relative',
        zIndex: 110,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
          <Tag size={13} /> Code: <strong>SCROLLSPRING</strong> (Flat 10% OFF)
        </span>
        <span>•</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Truck size={14} /> FREE 1-Day Express Delivery on Orders Over ₹1,000
        </span>
        <span>•</span>
        <Link
          to="/gifts"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#fff',
            textDecoration: 'underline',
            fontWeight: 700,
          }}
        >
          <Gift size={13} /> Surprise a Friend with Gift Hub &rarr;
        </Link>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          right: '12px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
        title="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
};
