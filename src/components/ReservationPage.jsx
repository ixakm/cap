import React, { useState, useEffect } from 'react';
import './ReservationPage.css';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const ReservationPage = () => {
  const [phoneTail, setPhoneTail] = useState('');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const goToMainPage = () => navigate('/');
  const goToBookPage = () => navigate('/book');
  const goToCartPage = () => navigate('/cart');
  const goToReservationPage = () => navigate('/reservation');

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservation?tail=${phoneTail}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setShowModal(false);
      } else {
        setError(data.message || '조회 실패');
      }
    } catch (err) {
      setError('서버 요청 실패');
    }
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phoneTail.trim().length !== 4) {
      setError('전화번호 뒷자리 4자리를 입력해주세요.');
      return;
    }
    fetchOrders();
  };

  return (
    <div className="bookstore-container">
      {/* 헤더 */}
      <header className="header">
        <div className="header-title" onClick={goToMainPage} style={{ cursor: 'pointer' }}>EasyFind</div>
        <div className="search-box">
          <input type="text" placeholder="도서 검색..." className="search-input" disabled />
          <button className="search-button" disabled>검색</button>
        </div>
      </header>

      {/* 네비게이션 */}
      <nav className="nav-menu">
        <ul>
          <li onClick={goToMainPage}>메인</li>
          <li onClick={goToBookPage}>도서 목록</li>
          <li onClick={goToCartPage}>장바구니</li>
          <li className="active" onClick={goToReservationPage}>예약내역</li>
          <li>문의하기</li>
        </ul>
      </nav>

      {/* 전화번호 입력 모달 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', padding: '20px' }}>
            <h3 style={{ marginBottom: '10px' }}>전화번호 뒷자리 4자리를 입력해주세요</h3>
            <form onSubmit={handlePhoneSubmit}>
              <input
                type="text"
                maxLength="4"
                value={phoneTail}
                onChange={(e) => setPhoneTail(e.target.value)}
                placeholder="예: 1234"
                className="reservation-input"
              />
              <div className="modal-buttons" style={{ marginTop: '10px' }}>
                <button type="submit" className="reservation-button">확인</button>
              </div>
            </form>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      )}

      {/* 주문 목록 카드 */}
      {!showModal && (
        <div className="book-list">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="book-card"
              onClick={() => setSelectedOrder(order)}
              style={{ cursor: 'pointer' }}
            >
              <div className="book-title">주문번호: {order.order_id}</div>
              <p className="book-author">대표 상품: {order.representative_product}</p>
              <p className="book-publisher">주문일자: {new Date(order.order_date).toLocaleString('ko-KR')}</p>
              <p className="book-price">총 수량: {order.total_quantity}개 </p>
              <p className="book-price">총 금액: {Math.round(order.total_amount).toLocaleString()}원</p>
              <button className="add-to-cart-btn">상세보기</button>
            </div>
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📦 주문 상세 정보</h3>
            <p>주문번호: {selectedOrder.order_id}</p>
            <p>대표 상품: {selectedOrder.representative_product}</p>
            <p>주문일자: {new Date(selectedOrder.order_date).toLocaleString('ko-KR')}</p>
            <ul className="item-list">
              {selectedOrder.items?.map((item, idx) => (
                <li key={idx}>
                  {item.name} - {item.author} ({(item.price * item.quantity).toLocaleString()}원)
                </li>
              ))}
            </ul>
            <p>총 수량: {selectedOrder.total_quantity}개</p>
            <p className="order-amount">총 금액: <span>{Math.round(selectedOrder.total_amount).toLocaleString()}원</span></p>
            <div className="qr-box">
              <QRCodeCanvas value={`order:${selectedOrder.order_id}`} size={120} />
            </div>
            <button onClick={() => setSelectedOrder(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
