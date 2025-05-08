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

  const navigate = useNavigate();
  const location = useLocation();

  const goToMainPage = () => {
    navigate('/'); // 메인 페이지로 이동
  };

  const goToCartPage = () => {
    navigate('/cart'); // 장바구니 페이지로 이동
  };  

  const goToReservationPage = () => {
    navigate('/reservation'); 
  };


  //책 목록과 카테고리 불러오기
  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [currentPage, sortOrder, activeCategory]);

  //검색 기록에 따른 결과 불러오기
  useEffect(() => {
    if (keyword.trim() === '') {
      setSearchResults([]);
      setIsSearching(false); // 검색중이 아니게 설정
    }
  }, [keyword]);

  //책 내용 생성
  const fetchBooks = async () => {
    try {
      setLoading(true);
      // 카테고리, 정렬, 페이지 파라미터 포함
      const response = await fetch(`http://localhost:5000/api/data?page=${currentPage}&sort=${sortOrder}&category=${activeCategory}`);
      if (!response.ok) {
        throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      
      // 전체 아이템 수와 페이지 수 계산
      const totalCount = result.pagination?.total || 0;
      const calculatedPages = Math.ceil(totalCount / 9);
      setTotalPages(Math.max(1, calculatedPages));
      
      setBooks(result.data);
      setTotalPages(calculatedPages);
      setError(null);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다: ' + err.message);
      console.error('API 오류:', err);
    } finally {
      setLoading(false);
    }
  };
  
  //카테고리 생성
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (!response.ok) {
        throw new Error('카테고리 데이터를 불러오지 못했습니다.');
      }
      const data = await response.json();
      setCategories([{ id: 'all', name: '전체' }, ...data]); // '전체' 카테고리 추가
    } catch (err) {
      console.error('카테고리 로딩 오류:', err);
    }
  };

  //페이지 전환
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  //재고 정렬순
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  //카테고리 선택
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentPage(1); // 카테고리 변경 시 첫 페이지로 이동
  };

  //장바구니 추가
  const handleAddToCart = async (product_id) => {
    try {
      // 장바구니에 추가할 상품의 수량
      const quantity = 1;

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ product_id, quantity }),
      });
  
      if (!response.ok) {
        throw new Error('장바구니에 아이템을 추가하는데 실패했습니다.');
      }
  
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
    }
  };

  //헤더 상단 검색 기능
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
        params: { query: trimmedKeyword }
      });
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('검색 실패:', error);
    }
  };
  
  return (
    <div className="bookstore-container">
      {/* 헤더 영역 */}
      <header className="header">
        <div className="header-title" onClick={goToMainPage} style={{ cursor: 'pointer'}}> EasyFind </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="도서 검색..."
            className="search-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button className="search-button" onClick={handleSearch}>
            검색
          </button>
        </div>
      </header>

      {/* 네비게이션 메뉴 */}
      <nav className="nav-menu">
        <ul>
          <li
           className={location.pathname === '/' ? 'active' : ''}
           onClick={goToMainPage}>메인</li>
          <li
            className={location.pathname === '/book' ? 'active' : ''}
            onClick={() => navigate('/book')}>도서 목록</li>
          <li 
          className={location.pathname === '/Cart' ? 'active' : ''}
          onClick={goToCartPage}>장바구니</li>
    <li onClick={goToReservationPage} className={location.pathname === '/reservation' ? 'active' : ''}>
      예약내역
    </li>
          <li>문의하기</li>
        </ul>
      </nav>

      <div className="content-container">
        {/* 왼쪽 카테고리 사이드바 */}
        <div className="sidebar">
          <div className="category-section">
            <h3>카테고리</h3>
            <ul className="category-list">
              {categories.map((category) => (
                <li 
                  key={category.id} 
                  className={`category-item ${category.id === activeCategory ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="main-content">
          {/* 정렬 옵션 */}
          <div className="sort-options">
            <span>정렬: </span>
            <select value={sortOrder} onChange={handleSortChange}>
              <option value="낮은가격순">낮은가격순</option>
              <option value="높은가격순">높은가격순</option>
            </select>
          </div>

        {/* 책 목록 */}
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="sub-book-grid">
            {isSearching && searchResults.length === 0 ? (
              <div className="no-results">없는 상품입니다.</div>
            ) : (
              (isSearching ? searchResults : books).map((book) => (
                <div key={book.product_id} className="sub-book-item">
                  <div className="book-image">
                    {book.image_url ? (
                      <img src={book.image_url} alt={book.product_name} />
                    ) : (
                      <div className="placeholder">책표지</div>
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
                      {book.original_price && book.original_price > book.price && (
                        <span className="original-price">{Number(book.original_price).toLocaleString()}원</span>
                      )}
                      <div className="book-button-container">
                        <button className="add-to-cart-button" onClick={() => handleAddToCart(book.product_id)}>
                          장바구니
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

          {/* 페이지네이션 */}
          <div className="pagination">
            <button className="page-button prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
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
            <button className="page-button next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;
