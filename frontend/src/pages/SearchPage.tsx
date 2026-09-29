import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { productApi } from '../services/api';
import { Product } from '../types';
import { ProductGrid } from '../components/ProductGrid';
import { ShareProductModal } from '../components/ShareProductModal';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const dealsParam = searchParams.get('deals') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<string>('DESC');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sharedProduct, setSharedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setIsLoading(true);
        if (dealsParam) {
          const dealList = await productApi.getDeals();
          setProducts(dealList);
          setTotalElements(dealList.length);
          setTotalPages(1);
        } else {
          const res = await productApi.getProducts({
            q: query || undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            sortBy,
            sortDir,
            page: currentPage,
            size: 12,
          });
          setProducts(res.content || []);
          setTotalPages(res.totalPages || 1);
          setTotalElements(res.totalElements || 0);
        }
      } catch (err) {
        console.warn('Failed to load search results', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [query, minPrice, maxPrice, sortBy, sortDir, currentPage, dealsParam]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'price_asc') {
      setSortBy('price');
      setSortDir('ASC');
    } else if (val === 'price_desc') {
      setSortBy('price');
      setSortDir('DESC');
    } else if (val === 'rating') {
      setSortBy('ratingAverage');
      setSortDir('DESC');
    } else {
      setSortBy('createdAt');
      setSortDir('DESC');
    }
    setCurrentPage(0);
  };

  return (
    <div className="main-content">
      {/* Header breadcrumb & results count */}
      <div style={{ background: 'white', padding: '12px 20px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e7e7e7' }}>
        <div style={{ fontSize: '14px', color: '#555' }}>
          {dealsParam ? (
            <span style={{ fontWeight: 700, color: '#cc0c39' }}>🔥 Showing Deals of the Day</span>
          ) : (
            <span>
              Showing <strong>{totalElements}</strong> results {query ? `for "${query}"` : ''}
            </span>
          )}
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={15} color="#555" />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Sort by:</span>
          <select className="form-select" style={{ width: 'auto', padding: '6px 12px' }} onChange={handleSortChange}>
            <option value="featured">Featured / Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Avg. Customer Review</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
        {/* Left Filter Sidebar */}
        <aside style={{ background: 'white', padding: '20px', borderRadius: '8px', height: 'fit-content', border: '1px solid #e7e7e7' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={16} /> Filters
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px', color: '#333' }}>
              Price Range (₹)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="number"
                className="form-input"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ padding: '6px 8px', fontSize: '13px' }}
              />
              <input
                type="number"
                className="form-input"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ padding: '6px 8px', fontSize: '13px' }}
              />
            </div>
          </div>

          <button
            className="btn-outline"
            style={{ width: '100%', fontSize: '12px' }}
            onClick={() => {
              setMinPrice('');
              setMaxPrice('');
            }}
          >
            Clear Filters
          </button>
        </aside>

        {/* Product Grid Area */}
        <main>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '8px' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#666' }}>Loading catalog products...</p>
            </div>
          ) : (
            <>
              <ProductGrid
                products={products}
                onShareProduct={(p) => setSharedProduct(p)}
                emptyMessage={query ? `No relevant products found for "${query}". Try searching with different keywords.` : 'No relevant products found.'}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' }}>
                  <button
                    className="btn-outline"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      className={idx === currentPage ? 'btn-primary' : 'btn-outline'}
                      style={{ minWidth: '36px' }}
                      onClick={() => setCurrentPage(idx)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    className="btn-outline"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {sharedProduct && (
        <ShareProductModal product={sharedProduct} onClose={() => setSharedProduct(null)} />
      )}
    </div>
  );
};
