import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
  Video,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Check,
  AlertCircle,
} from 'lucide-react';
import { adminApi, productApi } from '../services/api';
import { AdminStats, Order, Product, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users'>('orders');
  const [isLoading, setIsLoading] = useState(true);

  // New Product State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('20');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('1');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    const loadAdminData = async () => {
      try {
        setIsLoading(true);
        const [statsData, ordersData, prodsData, usersData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getOrders(undefined, 0, 50),
          productApi.getProducts({ size: 50 }),
          adminApi.getAllUsers(),
        ]);
        setStats(statsData);
        setOrders(ordersData.content || []);
        setProducts(prodsData.content || []);
        setUsersList(usersData);
      } catch (err) {
        console.warn('Admin load failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [isAuthenticated, user]);

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const updated = await adminApi.updateOrderStatus(orderId, status);
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
      alert(`Order #${updated.orderNumber} status updated to ${status}`);
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleUpdateStock = async (productId: number, newStock: number) => {
    try {
      const updated = await adminApi.updateProductStock(productId, newStock);
      setProducts(products.map((p) => (p.id === productId ? updated : p)));
    } catch (err) {
      alert('Failed to update product stock');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      const updated = await adminApi.updateUserRole(userId, newRole);
      setUsersList(usersList.map((u) => (u.id === userId ? updated : u)));
      alert(`User @${updated.username} role changed to ${newRole}`);
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await productApi.createProduct({
        title: newTitle,
        price: Number(newPrice),
        stockQuantity: Number(newStock),
        brand: newBrand,
        categoryId: Number(newCategory),
        mainImageUrl: newImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        description: newDescription,
        isFeatured: true,
      });
      setProducts([created, ...products]);
      setShowAddProduct(false);
      alert('Product created successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create product');
    }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} color="#cc0c39" /> Admin Control Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Manage orders, inventory, catalog items, creator short videos, and customer accounts.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddProduct(true)}>
          <Plus size={16} /> Add New Catalog Product
        </button>
      </div>

      {/* Metric Cards Grid */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Revenue</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <Package size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Orders</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{stats.totalOrders}</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Active Users</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{stats.totalUsers}</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>
              <Video size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Shoppable Videos</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>{stats.totalVideos}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: '15px',
            fontWeight: activeTab === 'orders' ? 700 : 500,
            color: activeTab === 'orders' ? '#ff9900' : '#555',
            borderBottom: activeTab === 'orders' ? '3px solid #ff9900' : '3px solid transparent',
            cursor: 'pointer',
          }}
        >
          Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: '15px',
            fontWeight: activeTab === 'products' ? 700 : 500,
            color: activeTab === 'products' ? '#ff9900' : '#555',
            borderBottom: activeTab === 'products' ? '3px solid #ff9900' : '3px solid transparent',
            cursor: 'pointer',
          }}
        >
          Catalog Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: '15px',
            fontWeight: activeTab === 'users' ? 700 : 500,
            color: activeTab === 'users' ? '#ff9900' : '#555',
            borderBottom: activeTab === 'users' ? '3px solid #ff9900' : '3px solid transparent',
            cursor: 'pointer',
          }}
        >
          User Accounts &amp; Roles ({usersList.length})
        </button>
      </div>

      {/* Tab 1: Orders Table */}
      {activeTab === 'orders' && (
        <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td style={{ fontWeight: 600 }}>{ord.orderNumber}</td>
                  <td>{ord.shippingName} (@{ord.username})</td>
                  <td style={{ fontWeight: 700 }}>₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                  <td>
                    <span className="badge badge-success">{ord.paymentStatus}</span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={ord.status}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn-outline"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => navigate(`/orders`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Products Inventory Table */}
      {activeTab === 'products' && (
        <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock Quantity</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={p.mainImageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{p.title}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{p.price.toLocaleString('en-IN')}</td>
                  <td>
                    <input
                      type="number"
                      defaultValue={p.stockQuantity}
                      onBlur={(e) => handleUpdateStock(p.id, Number(e.target.value))}
                      style={{ width: '70px', padding: '4px 6px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </td>
                  <td>{p.categoryName || 'General'}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      style={{ background: 'none', border: 'none', color: '#c40000', cursor: 'pointer' }}
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Users & Roles Table */}
      {activeTab === 'users' && (
        <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Personalization</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={u.avatarUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.fullName || u.username}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.email || 'N/A'}</td>
                  <td>
                    {u.isPersonalizationEnabled ? (
                      <span className="badge badge-success">Enabled</span>
                    ) : (
                      <span className="badge badge-warning">Disabled (Privacy)</span>
                    )}
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={u.role}
                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '12px', width: '120px' }}
                    >
                      <option value="USER">USER</option>
                      <option value="CREATOR">CREATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Add New Product to Catalog</h2>
            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Price (INR)</label>
                  <input type="number" className="form-input" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-input" value={newStock} onChange={(e) => setNewStock(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" className="form-input" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="1">Electronics &amp; Gadgets</option>
                    <option value="2">Home &amp; Living</option>
                    <option value="3">Fashion &amp; Apparel</option>
                    <option value="4">Gaming &amp; Workspace</option>
                    <option value="5">Wellness &amp; Lifestyle</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Main Image URL</label>
                <input type="url" className="form-input" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://..." />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Create Product
                </button>
                <button type="button" className="btn-outline" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
