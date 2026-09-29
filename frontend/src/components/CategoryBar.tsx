import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Flame, Gift, ShoppingBag } from 'lucide-react';

export const CategoryBar: React.FC = () => {
  const location = useLocation();

  const links = [
    { name: 'All Products', path: '/search', icon: <ShoppingBag size={14} /> },
    { name: "Today's Deals", path: '/search?deals=true', icon: <Flame size={14} color="#ff9900" />, highlight: true },
    { name: 'Gift a Friend', path: '/gifts', icon: <Gift size={14} color="#ff9900" />, highlight: true },
  ];

  return (
    <nav className="category-subnav">
      <Link to="/search" className="subnav-link" style={{ fontWeight: 700 }}>
        <Menu size={16} /> All
      </Link>
      {links.map((link) => {
        const isActive = location.pathname + location.search === link.path;
        return (
          <Link
            key={link.name}
            to={link.path}
            className={`subnav-link ${isActive ? 'active' : ''} ${link.highlight ? 'subnav-highlight' : ''}`}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
