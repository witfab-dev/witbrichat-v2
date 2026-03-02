import React from 'react';
import { IoPlay, IoDuplicate } from 'react-icons/io5';

const Explore = () => {
  const items = [
    { id: 1, type: 'video', url: 'https://picsum.photos/600/1200?random=1', class: 'tall' },
    { id: 2, type: 'image', url: 'https://picsum.photos/600/600?random=2', class: 'square' },
    { id: 3, type: 'image', url: 'https://picsum.photos/600/600?random=3', class: 'square' },
    { id: 4, type: 'image', url: 'https://picsum.photos/600/600?random=4', class: 'square' },
  ];

  return (
    <div className="explore-container">
      <div className="explore-mini-grid">
        {items.map((item) => (
          <div key={item.id} className={`explore-item ${item.class}`}>
            <img src={item.url} alt="Explore content" />
            <div className="explore-overlay">
              {item.type === 'video' ? <IoPlay /> : <IoDuplicate />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;