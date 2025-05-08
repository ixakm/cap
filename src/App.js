// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import BookPage from './components/BookPage';
import CartPage from './components/CartPage';
import OrderDetails from './components/OrderDetails';
import ReservationPage from './components/ReservationPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-details/:orderId" element={<OrderDetails />} />
          <Route path="/reservation" element={<ReservationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;