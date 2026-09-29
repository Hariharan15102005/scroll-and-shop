import React, { useState, useEffect } from 'react';
import { X, Upload, Video, Tag, Check } from 'lucide-react';
import { productApi, videoApi, mediaApi } from '../services/api';
import { Product, ShoppingVideo } from '../types';

interface UploadVideoModalProps {
  onClose: () => void;
  onVideoUploaded: (video: ShoppingVideo) => void;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({ onClose, onVideoUploaded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productApi.getProducts({ size: 50 }).then((res) => {
      setAllProducts(res.content || []);
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      const url = await mediaApi.uploadVideo(file);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Video upload failed');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const toggleProductTag = (productId: number) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) {
      setError('Please provide a video URL or upload a video file');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const newVideo = await videoApi.uploadVideo({
        title,
        description,
        videoUrl,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        taggedProductIds: selectedProductIds,
      });
      onVideoUploaded(newVideo);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={18} color="#ff9900" /> Create Shoppable Short Video
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div style={{ padding: '10px', background: '#fdeded', color: '#c40000', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Video Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Unboxing & Testing the ANC Headphones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Give a quick overview of why you love this product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Video File (MP4, WebM)</label>
            <input type="file" accept="video/*" onChange={handleFileUpload} style={{ marginBottom: '8px' }} />
            {isUploadingMedia && <div style={{ fontSize: '12px', color: '#f08804' }}>Uploading media securely...</div>}
            
            <div style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>Or enter direct video URL:</div>
            <input
              type="url"
              className="form-input"
              placeholder="https://commondatastorage.googleapis.com/.../sample.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          {/* Tag Products */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={15} color="#ff9900" /> Tag Shoppable Products ({selectedProductIds.length} selected)
            </label>
            <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', padding: '8px' }}>
              {allProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProductTag(p.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      background: isSelected ? '#fff8e7' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={p.mainImageUrl} alt={p.title} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ fontSize: '13px' }}>{p.title}</span>
                    </div>
                    {isSelected && <Check size={16} color="#067d62" />}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isSubmitting || isUploadingMedia}
          >
            {isSubmitting ? 'Publishing Video...' : 'Publish Shoppable Video'}
          </button>
        </form>
      </div>
    </div>
  );
};
