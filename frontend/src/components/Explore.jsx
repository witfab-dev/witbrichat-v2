import React, { useState } from 'react';
import { IoPlay, IoDuplicate, IoClose } from 'react-icons/io5';
import './Explore.css'; // Don't forget this!

const Explore = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // A standard Instagram block is 6 items
  const items = [
    { id: 1, type: 'video', url: 'https://picsum.photos/800/1200?random=1', class: 'tall' },
    { id: 2, type: 'image', url: 'https://picsum.photos/800/800?random=2', class: 'square' },
    { id: 3, type: 'image', url: 'https://picsum.photos/800/800?random=3', class: 'square' },
    { id: 4, type: 'image', url: 'https://picsum.photos/800/800?random=4', class: 'square' },
    { id: 5, type: 'image', url: 'https://picsum.photos/800/800?random=5', class: 'square' },
    { id: 6, type: 'video', url: 'https://picsum.photos/800/1200?random=6', class: 'square' },
  ];

  return (
    <div className="explore-container">
      <div className="explore-mini-grid">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`explore-item ${item.class}`}
            onClick={() => setSelectedImage(item.url)}
          >
            <img src={item.url} alt="Explore content" loading="lazy" />
            <div className="explore-overlay">
              {item.type === 'video' ? <IoPlay /> : <IoDuplicate />}
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <button className="modal-close" onClick={() => setSelectedImage(null)}>
            <IoClose />
          </button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Expanded view" className="expanded-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;