import React from 'react';
import './MainPage.css';
import { FaBook, FaQuestion, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  // useNavigate 훅을 사용하여 페이지 이동 함수 가져오기
  const navigate = useNavigate();

  // 상품조회 버튼 클릭 시 SubPage로 이동하는 함수
  const goToBookPage = () => {
    navigate('/book'); // '/sub' 경로로 이동
  };
  const goToReservationPage = () => {
    navigate('/reservation'); 
  };


  return (
    <div className="main-container">
      <div className="main-content">
        <header className="main-header">
          <h1 className="title">메인 화면</h1>
        </header>
        
        <div className="button-section">
          <button className="main-button" onClick={goToReservationPage}>
            <FaBook className="button-icon" />
            <span>구매내역</span>
          </button>
          
          {/* 상품조회 버튼에 클릭 이벤트 추가 */}
          <button className="main-button" onClick={goToBookPage}>
            <FaBook className="button-icon" />
            <span>상품조회</span>
          </button>
        </div>
        
        {/* 추가 섹션: 최근 본 책 */}
        <div className="recent-books">
          <h2 className="section-title">최근 본 책</h2>
          <div className="book-list">
            <div className="book-item">
              <div className="book-cover"></div>
              <p className="book-title">오늘의 베스트셀러</p>
            </div>
            <div className="book-item">
              <div className="book-cover"></div>
              <p className="book-title">추천도서</p>
            </div>
            <div className="book-item">
              <div className="book-cover"></div>
              <p className="book-title">신간도서</p>
            </div>
          </div>
        </div>
        
        {/* 추가 섹션: 이벤트 배너 */}
        <div className="event-banner">
          <h3>봄맞이 도서 할인 이벤트</h3>
          <p>4월 한정 특별 할인 중!</p>
        </div>
      </div>
      
      <footer className="main-footer">
        <div className="footer-button">
          <FaInfoCircle className="footer-icon" />
          <span>공지사항</span>
        </div>
        <div className="footer-button">
          <FaQuestion className="footer-icon" />
          <span>이용 방법 안내</span>
        </div>
      </footer>
    </div>
  );
}

export default MainPage;