import React, { useState, useEffect } from 'react';
import './BookPage.css';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneLastDigits, setPhoneLastDigits] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const goToMainPage = () => navigate('/');
  const goToBookPage = () => navigate('/book');
  const goToReservationPage = () => navigate('/reservation');

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cart', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('장바구니 정보를 가져오는데 실패했습니다.');

      const result = await response.json();
      setCartItems(result.items || []);
      setSessionId(result.session_id || '');
      calculateTotal(result.items || []);
      setError(null);
    } catch (err) {
      setError('장바구니를 불러오는 중 오류가 발생했습니다: ' + err.message);
      console.error('장바구니 API 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price_per_item * item.quantity), 0);
    setTotalAmount(total);
  };

  const handleQuantityChange = async (orderItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cart/item/${orderItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error('수량 변경 실패');

      fetchCartItems();
    } catch (error) {
      alert('수량 변경 실패: ' + error.message);
    }
  };

  const handleRemoveItem = async (orderItemId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/item/${orderItemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('삭제 실패');

      fetchCartItems();
      alert('상품이 삭제되었습니다.');
    } catch (error) {
      alert('삭제 실패: ' + error.message);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openPhoneModal = () => setShowPhoneModal(true);
  const closePhoneModal = () => setShowPhoneModal(false);

  const confirmPayment = async () => {
    if (!sessionId) {
      alert('세션 정보가 없습니다.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/complete-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId }),
      });
      const result = await response.json();

      if (result.success && result.orderId) {
        setIsModalOpen(false);
        openPhoneModal(); // 전화번호 입력 모달로 이동
      } else {
        alert('결제는 되었지만 주문번호를 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      alert('결제 처리 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const submitPhoneNumber = async () => {
    if (!/^\d{4}$/.test(phoneLastDigits)) {
      alert('전화번호 뒷자리 4자리를 정확히 입력하세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/save-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          phone_tail: phoneLastDigits
        })
      });

      const result = await response.json();
      if (result.success && result.orderId) {
        setShowPhoneModal(false);
        navigate(`/order-details/${result.orderId}`);
      } else {
        alert('전화번호 저장에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 오류: ' + error.message);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('장바구니에 상품이 없습니다.');
      return;
    }
    openModal();
  };
  return (
    <div className="bookstore-container">
      <header className="header">
        <div className="header-title" onClick={goToMainPage} style={{ cursor: 'pointer' }}>EasyFind</div>
        <div className="search-box">
          <input type="text" placeholder="도서 검색..." className="search-input" />
          <button className="search-button">검색</button>
        </div>
      </header>

      <nav className="nav-menu">
        <ul>
          <li onClick={goToMainPage}>메인</li>
          <li onClick={goToBookPage}>도서 목록</li>
          <li className="active">장바구니</li>
          <li onClick={goToReservationPage}>예약내역</li>
          <li>문의하기</li>
        </ul>
      </nav>

      <div className="cart-container">
        <h2 className="cart-title">장바구니</h2>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>장바구니가 비어 있습니다.</p>
            <button className="continue-shopping-btn" onClick={goToBookPage}>쇼핑 계속하기</button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              <div className="cart-header">
                <div className="cart-header-item product-info">상품정보</div>
                <div className="cart-header-item">수량</div>
                <div className="cart-header-item">가격</div>
                <div className="cart-header-item">합계</div>
                <div className="cart-header-item">삭제</div>
              </div>              {cartItems.map((item) => (
                <div key={item.order_item_id} className="cart-item">
                  <div className="product-info">
                    <div className="product-image">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.product_name} />
                      ) : (
                        <div className="placeholder">상품 이미지</div>
                      )}
                    </div>
                    <div className="product-details">
                      <h3>{item.product_name}</h3>
                      {item.author && <p>저자: {item.author}</p>}
                      {item.publisher && <p>출판사: {item.publisher}</p>}
                    </div>
                  </div>

                  <div className="quantity-controls">
                    <button onClick={() => handleQuantityChange(item.order_item_id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.order_item_id, item.quantity + 1)}>+</button>
                  </div>

                  <div className="price">{Number(item.price_per_item).toLocaleString()}원</div>
                  <div className="item-total">{Number(item.price_per_item * item.quantity).toLocaleString()}원</div>
                  <div className="remove-item">
                    <button onClick={() => handleRemoveItem(item.order_item_id)}>삭제</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-line">
                <span>총 상품금액</span>
                <span>{Number(totalAmount).toLocaleString()}원</span>
              </div>
              <div className="summary-total">
                <span>결제 예정금액</span>
                <span>{Number(totalAmount).toLocaleString()}원</span>
              </div>
              <button className="checkout-button" onClick={handleCheckout} disabled={cartItems.length === 0}>
                결제하기
              </button>
              <button className="continue-shopping" onClick={goToBookPage}>쇼핑 계속하기</button>
            </div>
          </div>
        )}
      </div>

      {/* 결제 확인 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>결제 확인</h3>
            <p>총 결제 금액: {Number(totalAmount).toLocaleString()}원</p>
            <div className="modal-buttons">
              <button onClick={confirmPayment}>확인</button>
              <button onClick={closeModal}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 전화번호 입력 모달 */}
      {showPhoneModal && (
  <div className="modal-overlay">
    <div className="modal-content" style={{ textAlign: 'center', padding: '20px' }}>
      <h3 style={{ marginBottom: '10px' }}>전화번호 뒷자리 4자리를 입력해주세요</h3>
      <input
        type="text"
        maxLength="4"
        value={phoneLastDigits}
        onChange={(e) => setPhoneLastDigits(e.target.value)}
        placeholder="예: 1234"
        style={{ width: '100px', textAlign: 'center', fontSize: '1.2em', marginBottom: '15px' }}
      />
      <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
        <button onClick={submitPhoneNumber}>확인</button>
        <button onClick={closePhoneModal}>취소</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default CartPage;

