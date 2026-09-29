import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocialProvider } from './context/SocialContext';
import { AnnouncementStrip } from './components/AnnouncementStrip';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { Footer } from './components/Footer';
import { AuthRequiredModal } from './components/AuthRequiredModal';
import { SocialOnboardingModal } from './components/SocialOnboardingModal';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { FriendsPage } from './pages/FriendsPage';
import { ChatPage } from './pages/ChatPage';
import { VideoFeedPage } from './pages/VideoFeedPage';
import { GiftFriendPage } from './pages/GiftFriendPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { CashbackPage } from './pages/CashbackPage';
import { SocialFeedPage } from './pages/SocialFeedPage';

import { ErrorBoundary } from './components/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <SocialProvider>
              <div className="app-container">
                <AnnouncementStrip />
                <Navbar />
                <CategoryBar />

                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/feed" element={<SocialFeedPage />} />
                  <Route path="/cashback" element={<CashbackPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/products/:slugOrId" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                  <Route path="/friends" element={<FriendsPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/videos" element={<VideoFeedPage />} />
                  <Route path="/gifts" element={<GiftFriendPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                <Footer />

                {/* Global Modals */}
                <AuthRequiredModal />
                <SocialOnboardingModal />
              </div>
            </SocialProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
