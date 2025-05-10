import React, { useState, useEffect } from 'react';
import './BookPage.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BookPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState('최신순');
  const [activeCategory, setActiveCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeProductType, setActiveProductType] = useState('책');
  

  const navigate = useNavigate();
  const location = useLocation();

  const goToMainPage = () => navigate('/');
  const goToCartPage = () => navigate('/cart');
  const goToReservationPage = () => navigate('/reservation');

  useEffect(() => {
    if (!isSearching) {
      fetchBooks();
    }
    fetchCategories();
  }, [currentPage, sortOrder, activeCategory, activeProductType, isSearching]);

  useEffect(() => {
    if (keyword.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [keyword]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/data?page=${currentPage}&sort=${sortOrder}&category=${activeCategory}&product_type=${activeProductType}`
      );
      const result = await response.json();
      setBooks(result.data);
      const totalCount = result.pagination?.total || 0;
      setTotalPages(Math.max(1, Math.ceil(totalCount / 9)));
    } catch (err) {
      console.error('도서 데이터 로딩 실패:', err);
      setError('서버와의 연결에 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      setCategories([{ id: 'all', name: '전체' }, ...data]);
    } catch (err) {
      console.error('카테고리 로딩 실패:', err);
    }
  };

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const response = await axios.get('http://localhost:5000/api/search', {
        params: {
          query: trimmedKeyword,
          product_type: activeProductType,
        },
      });
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    }
  };

  const handleAddToCart = async (product_id) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ product_id, quantity: 1 }),
      });
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      console.error('장바구니 추가 실패:', err);
    }
  };

  const handleSortChange = (e) => setSortOrder(e.target.value);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bookstore-container">
      {/* 헤더 */}
      <header className="header">
        <div className="header-title" onClick={goToMainPage} style={{ cursor: 'pointer' }}>
          EasyFind
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="도서 검색..."
            className="search-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
          <button className="search-button" onClick={handleSearch}>
            검색
          </button>
        </div>
      </header>

      {/* 네비게이션 */}
      <nav className="nav-menu">
        <ul>
          <li className={location.pathname === '/' ? 'active' : ''} onClick={goToMainPage}>메인</li>
          <li className={location.pathname === '/book' ? 'active' : ''} onClick={() => navigate('/book')}>도서 목록</li>
          <li className={location.pathname === '/cart' ? 'active' : ''} onClick={goToCartPage}>장바구니</li>
          <li className={location.pathname === '/reservation' ? 'active' : ''} onClick={goToReservationPage}>예약내역</li>
          <li>문의하기</li>
        </ul>
      </nav>

      <div className="content-container">
        {/* 사이드바 */}
        <div className="sidebar">
          <div className="category-section">
            <h3>도서</h3>
            <ul className="category-list">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className={`category-item ${activeProductType === '책' && activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveProductType('책');
                    setActiveCategory(category.id);
                    setCurrentPage(1);
                    setIsSearching(false);
                  }}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="category-section" style={{ marginTop: '30px' }}>
            <h3>문구류</h3>
            <ul className="category-list">
              <li
                className={`category-item ${activeProductType === '문구류' ? 'active' : ''}`}
                onClick={() => {
                  setActiveProductType('문구류');
                  setActiveCategory('all');
                  setCurrentPage(1);
                  setIsSearching(false);
                }}
              >
                문구류
              </li>
            </ul>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="main-content">
          <div className="sort-options">
            <span>정렬: </span>
            <select value={sortOrder} onChange={handleSortChange}>
              <option value="낮은가격순">낮은가격순</option>
              <option value="높은가격순">높은가격순</option>
            </select>
          </div>

          {/* 도서 목록 or 검색 결과 */}
          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (isSearching ? searchResults : books).length === 0 ? (
            <div className="no-results">상품이 없습니다.</div>
          ) : (
            <div className="sub-book-grid">
              {(isSearching ? searchResults : books).map((book) => (
                <div key={book.product_id} className="sub-book-item">
                  <div className="book-image">
                    {book.image_url ? (
                      <img src={book.image_url} alt={book.product_name} />
                    ) : (
                      <div className="placeholder">이미지 없음</div>
                    )}
                  </div>
                  <div className="book-info">
                    <h3 className="book-title">{book.product_name}</h3>
                    {book.product_type === '책' && (
                      <>
                        <p className="book-author">저자: {book.author}</p>
                        <p className="book-publisher">출판사: {book.publisher}</p>
                      </>
                    )}
                    <div className="book-price">
                      <span className="sale-price">{Number(book.price).toLocaleString()}원</span>
                      <div className="book-button-container">
                        <button className="add-to-cart-button" onClick={() => handleAddToCart(book.product_id)}>
                          장바구니
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

{/* 페이지네이션 */}
{!isSearching && (
  <div className="pagination">
    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
      &lt;
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        className={`page-button ${currentPage === page ? 'active' : ''}`}
        onClick={() => handlePageChange(page)}
      >
        {page}
      </button>
    ))}
    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
      &gt;
    </button>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default BookPage;
