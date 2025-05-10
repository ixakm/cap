// server.js

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const initDB = require('./db');  // mysql2/promise 연결

const app = express();

// CORS 설정
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 설정
app.use(session({
  secret: 'easyfind-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false,
    httpOnly: true,
    sameSite: 'strict'
  }
}));

// 세션 확인
app.get('/api/session', (req, res) => {
  res.send({ session: req.session ? 'active' : 'inactive' });
});

// 카테고리 조회
app.get('/api/categories', async (req, res) => {
  try {
    const db = await initDB();
    const [results] = await db.query(`SELECT DISTINCT category FROM book`);
    const categories = results.map(row => ({ id: row.category, name: row.category }));
    res.json(categories);
    await db.end();
  } catch (err) {
    console.error('카테고리 조회 오류:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
});
// 상품 데이터 조회
app.get('/api/data', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const offset = (page - 1) * limit;

  const category = req.query.category || 'all';
  const sort = req.query.sort || '최신순';
  const productType = req.query.product_type || '책'; // ✅ 핵심 필드

  let whereClause = 'p.is_active = TRUE';
  const params = [];

  // ✅ product_type 필터
  if (productType !== 'all') {
    whereClause += ` AND p.product_type = ?`;
    params.push(productType);
  }

  // ✅ category는 책일 때만 적용 (문구류에는 category 없음)
  if (productType === '책' && category !== 'all') {
    whereClause += ` AND b.category = ?`;
    params.push(category);
  }

  // ✅ 정렬 기준
  let orderClause = 'p.created_at DESC';
  if (sort === '낮은가격순') orderClause = 'p.price ASC';
  else if (sort === '높은가격순') orderClause = 'p.price DESC';

  try {
    const db = await initDB();

    const query = `
      SELECT p.*, b.author, b.publisher, b.category
      FROM product p
      LEFT JOIN book b ON p.product_id = b.product_id
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const [results] = await db.query(query, [...params, limit, offset]);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM product p
      LEFT JOIN book b ON p.product_id = b.product_id
      WHERE ${whereClause}
    `;

    const [countResults] = await db.query(countQuery, params);
    const totalItems = countResults[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: results,
      pagination: {
        total: totalItems,
        per_page: limit,
        current_page: page,
        last_page: totalPages,
      },
    });

    await db.end();
  } catch (err) {
    console.error('데이터 조회 오류:', err);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 장바구니에 상품 추가
app.post('/api/cart', async (req, res) => {
  const { product_id, quantity } = req.body;
  const sessionId = req.sessionID;

  if (!req.session.initialized) {
    req.session.initialized = true;
    console.log('새 세션 생성됨:', sessionId);
  }

  try {
    const db = await initDB();

    // 준비 상태 주문 확인
    const [orderResults] = await db.query(
      `SELECT order_id FROM orders WHERE session_id = ? AND status = '준비' LIMIT 1`,
      [sessionId]
    );

    let order_id;
    if (orderResults.length === 0) {
      const [insertOrder] = await db.query(
        `INSERT INTO orders (status, session_id) VALUES ('준비', ?)`,
        [sessionId]
      );
      order_id = insertOrder.insertId;
    } else {
      order_id = orderResults[0].order_id;
    }

    // 상품 가격 조회
    const [productResults] = await db.query(
      `SELECT price FROM product WHERE product_id = ?`,
      [product_id]
    );
    const price_per_item = productResults[0]?.price;

    // 기존 아이템 확인
    const [itemResults] = await db.query(
      `SELECT order_item_id, quantity FROM order_items
       WHERE order_id = ? AND product_id = ?`,
      [order_id, product_id]
    );

    if (itemResults.length > 0) {
      const newQuantity = itemResults[0].quantity + quantity;
      await db.query(
        `UPDATE order_items SET quantity = ? WHERE order_item_id = ?`,
        [newQuantity, itemResults[0].order_item_id]
      );
      res.status(200).json({ message: '장바구니 수량 업데이트 완료' });
    } else {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_per_item)
         VALUES (?, ?, ?, ?)`,
        [order_id, product_id, quantity, price_per_item]
      );
      res.status(200).json({ message: '장바구니에 상품 추가됨' });
    }

    await db.end();
  } catch (err) {
    console.error('장바구니 추가 오류:', err);
    res.status(500).json({ error: '장바구니 추가 실패' });
  }
});

// 장바구니 조회
app.get('/api/cart', async (req, res) => {
  const sessionId = req.sessionID;

  if (!sessionId) {
    return res.status(400).json({ error: '세션이 유효하지 않습니다.' });
  }

  try {
    const db = await initDB();

    const [orderResults] = await db.query(
      `SELECT order_id FROM orders WHERE session_id = ? AND status = '준비' LIMIT 1`,
      [sessionId]
    );

    if (orderResults.length === 0) {
      await db.end();
      return res.json({ items: [], session_id: sessionId });
    }

    const orderId = orderResults[0].order_id;

    const [items] = await db.query(
      `SELECT oi.order_item_id, oi.product_id, oi.quantity, oi.price_per_item,
              p.product_name, p.image_url, p.product_type,
              b.author, b.publisher
       FROM order_items oi
       JOIN product p ON oi.product_id = p.product_id
       LEFT JOIN book b ON p.product_id = b.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({ items, session_id: sessionId });
    await db.end();
  } catch (err) {
    console.error('장바구니 조회 오류:', err);
    res.status(500).json({ error: '장바구니 정보를 불러오는 데 실패했습니다.' });
  }
});
// 주문 상태 완료 처리
app.post('/api/complete-order', async (req, res) => {
  const { sessionId } = req.body;

  try {
    const db = await initDB();

    await db.query(
      `UPDATE orders
       SET status = '완료',
           order_date = CURRENT_TIMESTAMP
       WHERE session_id = ? AND status = '준비'`,
      [sessionId]
    );

    const [rows] = await db.query(
      `SELECT order_id
       FROM orders
       WHERE session_id = ? AND status = '완료'
       ORDER BY order_date DESC
       LIMIT 1`,
      [sessionId]
    );

    if (!rows || rows.length === 0) {
      await db.end();
      return res.status(500).json({ success: false, error: '주문 ID 조회 실패' });
    }

    res.json({ success: true, orderId: rows[0].order_id });
    await db.end();
  } catch (err) {
    console.error('주문 상태 업데이트 오류:', err);
    res.status(500).json({ success: false, error: 'DB update 실패' });
  }
});

// 수량 변경
app.put('/api/cart/item/:id', async (req, res) => {
  const orderItemId = req.params.id;
  const { quantity } = req.body;
  const sessionId = req.sessionID;

  if (!sessionId) {
    return res.status(400).json({ error: '세션이 유효하지 않습니다.' });
  }

  try {
    const db = await initDB();

    const [verify] = await db.query(
      `SELECT oi.order_item_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       WHERE oi.order_item_id = ? AND o.session_id = ? AND o.status = '준비'`,
      [orderItemId, sessionId]
    );

    if (verify.length === 0) {
      await db.end();
      return res.status(403).json({ error: '해당 상품을 수정할 권한이 없습니다.' });
    }

    await db.query(
      `UPDATE order_items SET quantity = ? WHERE order_item_id = ?`,
      [quantity, orderItemId]
    );

    res.json({ message: '수량이 업데이트되었습니다.' });
    await db.end();
  } catch (err) {
    console.error('수량 업데이트 오류:', err);
    res.status(500).json({ error: '수량을 업데이트하는데 실패했습니다.' });
  }
});

// 아이템 삭제
app.delete('/api/cart/item/:id', async (req, res) => {
  const orderItemId = req.params.id;
  const sessionId = req.sessionID;

  if (!sessionId) {
    return res.status(400).json({ error: '세션이 유효하지 않습니다.' });
  }

  try {
    const db = await initDB();

    const [verify] = await db.query(
      `SELECT oi.order_item_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       WHERE oi.order_item_id = ? AND o.session_id = ? AND o.status = '준비'`,
      [orderItemId, sessionId]
    );

    if (verify.length === 0) {
      await db.end();
      return res.status(403).json({ error: '해당 상품을 삭제할 권한이 없습니다.' });
    }

    await db.query(
      `DELETE FROM order_items WHERE order_item_id = ?`,
      [orderItemId]
    );

    res.json({ message: '상품이 장바구니에서 삭제되었습니다.' });
    await db.end();
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '아이템을 삭제하는데 실패했습니다.' });
  }
});
// 검색 API
app.get('/api/search', async (req, res) => {
  const searchQuery = req.query.query || '';
  const productType = req.query.product_type || '책';

  try {
    const db = await initDB();

    const whereClause = `p.product_name LIKE ? AND p.product_type = ?`;
    const params = [`%${searchQuery}%`, productType];

    const query = `
      SELECT 
        p.product_id, p.product_name, p.price, p.image_url, p.product_type,
        b.author, b.publisher, b.category
      FROM product p
      LEFT JOIN book b ON p.product_id = b.product_id
      WHERE ${whereClause}
    `;

    const [results] = await db.query(query, params);
    res.json({ data: results });

    await db.end();
  } catch (err) {
    console.error('🔴 검색 오류:', err);
    res.status(500).json({ error: '검색 실패', message: err.message });
  }
});


// 주문 상세 조회
app.get('/api/order-details/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const db = await initDB();

    const [results] = await db.query(
      `SELECT 
         o.order_id,
         o.order_date,
         oi.quantity,
         oi.price_per_item,
         p.product_name,
         b.author
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN product p ON oi.product_id = p.product_id
       LEFT JOIN book b ON p.product_id = b.product_id
       WHERE o.order_id = ?`,
      [orderId]
    );

    if (results.length === 0) {
      await db.end();
      return res.status(404).json({ error: '주문 내역 없음' });
    }

    const items = results.map(item => ({
      name: item.product_name,
      author: item.author,
      price: item.price_per_item,
      quantity: item.quantity
    }));

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    res.json({
      orderId: results[0].order_id,
      orderDate: results[0].order_date,
      totalAmount: total,
      items
    });

    await db.end();
  } catch (err) {
    console.error('주문 상세 오류:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
});

// 전화번호 저장
app.post('/api/save-phone', async (req, res) => {
  const { sessionId, phone_tail } = req.body;

  if (!sessionId || !phone_tail) {
    return res.status(400).json({ success: false, error: '필수 정보 누락' });
  }

  try {
    const db = await initDB();

    const [orderRows] = await db.query(
      `SELECT order_id FROM orders
       WHERE session_id = ? AND status = '완료'
       ORDER BY order_id DESC LIMIT 1`,
      [sessionId]
    );

    if (!orderRows || orderRows.length === 0) {
      await db.end();
      return res.status(404).json({ success: false, error: '주문 없음' });
    }

    const orderId = orderRows[0].order_id;

    await db.query(
      `UPDATE orders SET phone = ? WHERE order_id = ?`,
      [phone_tail, orderId]
    );

    res.json({ success: true, orderId });
    await db.end();
  } catch (err) {
    console.error('전화번호 저장 오류:', err);
    res.status(500).json({ success: false, error: '전화번호 저장 실패' });
  }
});


// 예약내역 조회 - 전화번호 뒷자리로 조회
app.get('/api/reservation', async (req, res) => {
  const phoneTail = req.query.tail;

  try {
    const connection = await initDB();

    // 1. 주문 목록 조회 (완료 상태만)
    const [orders] = await connection.query(
      `SELECT o.order_id, o.order_date 
       FROM orders o
       WHERE o.phone = ? AND o.status = '완료'
       ORDER BY o.order_date DESC`,
      [phoneTail]
    );

    if (orders.length === 0) {
      return res.json({ success: false, message: '조회된 주문이 없습니다.' });
    }

    // 2. 각 주문에 대한 대표 상품, 총 가격, 총 수량 정보 추가
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        // 대표 상품 1개 조회
        const [items] = await connection.query(
          `SELECT p.product_name
           FROM order_items oi
           JOIN product p ON oi.product_id = p.product_id
           WHERE oi.order_id = ?
           LIMIT 1`,
          [order.order_id]
        );

        // 총 가격과 총 수량 계산
// 백엔드 내 /api/reservation 핸들러에서 각 주문에 대해 추가
const [summary] = await connection.query(
  `SELECT SUM(oi.quantity * oi.price_per_item) as total_amount, SUM(oi.quantity) as total_quantity
   FROM order_items oi
   WHERE oi.order_id = ?`,
  [order.order_id]
);

return {
  ...order,
  representative_product: items[0]?.product_name || '상품 없음',
  total_amount: summary[0]?.total_amount || 0,
  total_quantity: summary[0]?.total_quantity || 0
};

      })
    );

    // 3. 응답
    res.json({ success: true, orders: enrichedOrders });
  } catch (err) {
    console.error('예약 내역 조회 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// ✅ 주문 상세 조회 API (server.js)
app.get('/api/order-details/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  const connection = await initDB();

  try {
    const [items] = await connection.query(`
      SELECT p.product_name, b.author, oi.price_per_item
      FROM order_items oi
      JOIN product p ON oi.product_id = p.product_id
      LEFT JOIN book b ON p.product_id = b.product_id
      WHERE oi.order_id = ?
    `, [orderId]);

    const [orderMeta] = await connection.query(`
      SELECT order_id, order_date
      FROM orders
      WHERE order_id = ?
    `, [orderId]);

    if (orderMeta.length === 0) {
      return res.status(404).json({ success: false });
    }

    // QR코드 생성 (base64 또는 URL)
    const qr = require('qrcode');
    const qrDataUrl = await qr.toDataURL(`http://localhost:3000/order-details/${orderId}`);

    const totalAmount = items.reduce((sum, i) => sum + i.price_per_item, 0);

    res.json({
      success: true,
      order_id: orderMeta[0].order_id,
      order_date: orderMeta[0].order_date,
      total_amount: totalAmount,
      items,
      qrUrl: qrDataUrl
    });
  } catch (err) {
    console.error('상세 조회 실패:', err);
    res.status(500).json({ success: false });
  }
});

app.get('/api/data', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const offset = (page - 1) * limit;
  const category = req.query.category;
  const sort = req.query.sort || '최신순';
  const productType = req.query.product_type || '책'; // ✅ 추가

  let whereClause = 'p.is_active = TRUE';
  let orderClause = 'p.price ASC';
  const params = [];

  // ✅ product_type 필터 추가
  if (productType && productType !== 'all') {
    whereClause += ` AND p.product_type = ?`;
    params.push(productType);
  }

  if (category && category !== 'all') {
    whereClause += ` AND b.category = ?`;
    params.push(category);
  }

  switch (sort) {
    case '낮은가격순':
      orderClause = 'p.price ASC';
      break;
    case '높은가격순':
      orderClause = 'p.price DESC';
      break;
    default:
      orderClause = 'p.created_at DESC';
  }

  try {
    const db = await initDB();

    const query = `
      SELECT p.*, b.author, b.publisher, b.isbn, b.category, b.published_year
      FROM product p
      LEFT JOIN book b ON p.product_id = b.product_id
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, limit, offset];

    const [results] = await db.query(query, queryParams);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM product p
      LEFT JOIN book b ON p.product_id = b.product_id
      WHERE ${whereClause}
    `;
    const [countResults] = await db.query(countQuery, params);
    const totalItems = countResults[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: results,
      pagination: {
        total: totalItems,
        per_page: limit,
        current_page: page,
        last_page: totalPages
      }
    });

    await db.end();
  } catch (error) {
    console.error('데이터 조회 오류:', error);
    res.status(500).json({ error: '데이터베이스 오류', details: error.message });
  }
});


// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
