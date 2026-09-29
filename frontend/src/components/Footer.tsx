import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer>
      <div className="footer-top" onClick={scrollToTop}>
        Back to top
      </div>

      <div className="footer-main">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Get to Know Us</h4>
            <ul>
              <li><Link to="/">About Scroll &amp; Shop</Link></li>
              <li><Link to="/videos">Creator Program</Link></li>
              <li><Link to="/">Social Commerce Vision</Link></li>
              <li><Link to="/profile">Personalization &amp; Privacy</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Connect &amp; Socialize</h4>
            <ul>
              <li><Link to="/friends">Find Friends</Link></li>
              <li><Link to="/chat">Shopping Chat &amp; Discussions</Link></li>
              <li><Link to="/gifts">Gift a Friend Hub</Link></li>
              <li><Link to="/wishlist">Shared Gift Wishlists</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Payment &amp; Security</h4>
            <ul>
              <li><Link to="/cart">Razorpay Test Gateway</Link></li>
              <li><Link to="/orders">Order Tracking</Link></li>
              <li><Link to="/">100% Purchase Protection</Link></li>
              <li><Link to="/">Returns &amp; Replacements</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Let Us Help You</h4>
            <ul>
              <li><Link to="/profile">Your Account</Link></li>
              <li><Link to="/orders">Your Orders</Link></li>
              <li><Link to="/admin">Admin Portal</Link></li>
              <li><Link to="/">Help Center</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div style={{ marginBottom: '8px', fontWeight: 600, color: '#fff' }}>
          Scroll &amp; Shop — Amazon-Style Commerce with Connected Social Shopping
        </div>
        <div>
          &copy; {new Date().getFullYear()} Scroll &amp; Shop Inc. All rights reserved. Razorpay test mode &amp; Cloudinary integration ready.
        </div>
      </div>
    </footer>
  );
};
