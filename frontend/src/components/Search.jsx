import React, { useState, useEffect } from 'react';
import { IoSearchOutline, IoCloseCircle } from 'react-icons/io5';
import './Search.css';

const Search = ({ isOpen, onClose, onUserClick, dbUsers }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem("recent_searches");
    return saved ? JSON.parse(saved) : [];
  });

  // Filtering Logic
  useEffect(() => {
    if (query.trim() === "") {
      setResults(recentSearches); 
    } else {
      const filtered = dbUsers.filter(u => 
        u.username.toLowerCase().includes(query.toLowerCase()) || 
        (u.fullName && u.fullName.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
    }
  }, [query, dbUsers, recentSearches]);

  const handleSelectUser = (user) => {
    // Logic: Add to recent searches if not already there
    const updatedRecent = [user, ...recentSearches.filter(u => u.id !== user.id)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem("recent_searches", JSON.stringify(updatedRecent));
    
    // System Logic: Send to App.jsx to change view
    onUserClick(user);
    setQuery(""); // Clear for next time
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  return (
    <>
      {isOpen && <div className="search-backdrop" onClick={onClose} />}

      <div className={`search-panel ${isOpen ? 'open' : ''}`}>
        <div className="search-header">
          <h2 className="search-title">Search</h2>
          <div className="search-input-container">
            <IoSearchOutline className="inner-search-icon" />
            <input 
              type="text" 
              placeholder="Search" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus={isOpen}
            />
            {query && (
              <IoCloseCircle 
                className="clear-query-icon" 
                onClick={() => setQuery("")} 
              />
            )}
          </div>
        </div>

        <div className="search-results-area">
          <div className="results-header">
            <span>{query === "" ? "Recent" : "Results"}</span>
            {query === "" && recentSearches.length > 0 && (
              <button className="clear-all-link" onClick={clearRecent}>Clear all</button>
            )}
          </div>

          <div className="results-list">
            {results.length > 0 ? (
              results.map(user => (
                <div key={user.id || user._id} className="search-result-item" onClick={() => handleSelectUser(user)}>
                  <img src={user.avatar || 'https://via.placeholder.com/150'} alt={user.username} />
                  <div className="user-meta">
                    <span className="u-name">{user.username}</span>
                    <span className="f-name">{user.fullName || user.username}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">
                {query === "" ? "No recent searches." : "No results found."}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;