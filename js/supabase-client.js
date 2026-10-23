/**
 * OOMS v2.5 Supabase Cloud DB Client Module
 * Single Source of Truth (SSOT) for Orders, Realtime Sync & CRUD Gateway
 */
(function (window) {
  'use strict';

  const SUPABASE_URL = 'https://ypeyajrrplumssgoqubc.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3q4SUBu2soZN27D8yonr9w_af3-UxCQ';

  // Supabase 클라이언트 초기화
  let supabase = null;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    // window.supabase.from 직접 호출 완전 지원
    window.supabase.from = supabase.from.bind(supabase);
    window.supabase.channel = supabase.channel.bind(supabase);
    window.supabase.auth = supabase.auth;
    window.supabaseClient = supabase;
  } else {
    console.warn('[OOMS_DB] window.supabase CDN 라이브러리가 먼저 로드되어야 합니다.');
  }

  // 실시간 구독자 콜백 목록
  const subscribers = new Set();

  /**
   * DB 행(Row) 데이터를 프론트엔드 호환 표준 주문 객체로 양방향 매핑
   */
  function mapDbRowToOrder(row) {
    if (!row) return row;

    const isPaid = (
      String(row.payment_status || '').toLowerCase() === 'paid' ||
      (!row.payment_status && (row.paymentStatus === '입금완료' || row.paymentStatus === 'paid' || row.paid === true))
    );

    let shippingStatus = '준비중';
    const rawShipping = String(row.shipping_status || row.shippingStatus || '').toLowerCase();
    if (rawShipping === 'delivered' || rawShipping === '배송완료') {
      shippingStatus = '배송완료';
    } else if (rawShipping === 'shipped' || rawShipping === '배송중' || rawShipping === '배송출발') {
      shippingStatus = '배송중';
    } else {
      shippingStatus = '준비중';
    }

    const tracking = row.tracking_number || row.tracking || row.invoiceNum || row.invoice || '';
    const carrier = row.carrier || row.courier || (tracking ? 'CJ대한통운' : '');
    const addrStr = row.address || row.roadAddress || '';
    const zonecode = row.zonecode || row.postal_code || row.postcode || row.zip || '';
    const qty = Number(row.quantity) || 1;
    const amount = Number(row.amount) || Number(row.price) || 55000;
    const prodName = row.product_name || row.productName || '시나노 골드사과 10kg';
    const orderId = row.id || row.orderId || row.order_id || '';
    const memo = row.memo || row.deliveryMemo || '';
    const createdAt = row.created_at || row.createdAt || new Date().toISOString();

    return {
      ...row,
      id: orderId,
      orderId: orderId,
      order_id: orderId,
      farmCode: row.farm_code || row.farmCode || 'FARM-2026-224',
      farm_code: row.farm_code || row.farmCode || 'FARM-2026-224',
      orderer_name: row.orderer_name || row.senderName || '',
      senderName: row.orderer_name || row.senderName || '',
      orderer_phone: row.orderer_phone || row.senderPhone || '',
      senderPhone: row.orderer_phone || row.senderPhone || '',
      recipient_name: row.recipient_name || row.receiverName || '',
      receiverName: row.recipient_name || row.receiverName || '',
      recipient_phone: row.recipient_phone || row.receiverPhone || '',
      receiverPhone: row.recipient_phone || row.receiverPhone || '',
      product_name: prodName,
      productName: prodName,
      product: {
        name: prodName,
        qty: qty,
        price: Math.round(amount / qty)
      },
      quantity: qty,
      qty: qty,
      amount: amount,
      price: amount,
      paid: isPaid,
      payment_status: isPaid ? 'paid' : 'unpaid',
      paymentStatus: isPaid ? '입금완료' : '미입금',
      shipping_status: shippingStatus === '배송완료' ? 'delivered' : (shippingStatus === '배송중' ? 'shipped' : 'preparing'),
      shippingStatus: shippingStatus,
      deliveryStatus: shippingStatus,
      carrier: carrier,
      courier: carrier,
      tracking_number: tracking,
      tracking: tracking,
      invoiceNum: tracking,
      invoiceNumber: tracking,
      memo: memo,
      zonecode: zonecode,
      postcode: zonecode,
      zip: zonecode,
      address: {
        road: addrStr,
        detail: '',
        zip: zonecode
      },
      roadAddress: addrStr,
      detailAddress: '',
      createdAt: createdAt,
      created_at: createdAt,
      approvedAt: createdAt,
      status: {
        payment: isPaid ? 'PAID' : 'UNPAID',
        shipping: shippingStatus === '배송완료' ? 'DELIVERED' : (shippingStatus === '배송중' ? 'SHIPPED' : 'READY'),
        staging: tracking ? 'INVOICE_ISSUED' : (isPaid ? 'APPROVED' : 'PENDING')
      }
    };
  }

  /**
   * 프론트엔드 주문 객체를 DB 스키마(orders table) 규격으로 변환
   */
  function mapOrderToDbRow(order) {
    const isPaid = (
      order.paid === true ||
      order.paymentStatus === '입금완료' ||
      order.payment_status === 'paid' ||
      order.status?.payment === 'PAID'
    );

    let shippingStatus = 'preparing';
    const rawShipping = String(order.shippingStatus || order.shipping_status || '').toLowerCase();
    if (rawShipping === '배송완료' || rawShipping === 'delivered') {
      shippingStatus = 'delivered';
    } else if (rawShipping === '배송중' || rawShipping === 'shipped' || rawShipping === '배송출발') {
      shippingStatus = 'shipped';
    } else {
      shippingStatus = 'preparing';
    }

    const addrStr = typeof order.address === 'string'
      ? order.address
      : [order.roadAddress || order.address?.road || '', order.detailAddress || order.address?.detail || ''].filter(Boolean).join(' ').trim();

    const zonecode = order.zonecode || order.postcode || order.postal_code || order.address?.zip || order.zip || '';
    const qty = Number(order.quantity || order.qty || order.product?.qty || 1);
    const amount = Number(order.amount || order.price || order.product?.price || (qty * 55000));
    const prodName = order.productName || order.product_name || order.product?.name || '시나노 골드사과 10kg';
    const tracking = order.tracking_number || order.tracking || order.invoiceNum || order.invoiceNumber || null;
    const carrier = order.carrier || order.courier || (tracking ? 'CJ대한통운' : null);

    // 주문번호 생성 (존재하지 않는 경우)
    let id = order.id || order.orderId || order.order_id;
    if (!id) {
      const now = new Date();
      const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
      const rnd = Math.floor(1000 + Math.random() * 9000);
      id = `ORD-${ymd}-${rnd}`;
    }

    return {
      id: id,
      orderer_name: order.senderName || order.orderer_name || order.orderer?.name || (typeof order.orderer === 'string' ? order.orderer : '') || '고객',
      orderer_phone: order.senderPhone || order.orderer_phone || order.orderer?.tel || order.phone || '010-0000-0000',
      recipient_name: order.receiverName || order.recipient_name || order.receiver?.name || (typeof order.receiver === 'string' ? order.receiver : '') || '수령인',
      recipient_phone: order.receiverPhone || order.recipient_phone || order.receiver?.tel || '010-0000-0000',
      zonecode: zonecode,
      address: addrStr,
      product_name: prodName,
      quantity: qty,
      amount: amount,
      farm_code: order.farmCode || order.farm_code || 'FARM-2026-224',
      payment_status: isPaid ? 'paid' : 'unpaid',
      shipping_status: shippingStatus,
      carrier: carrier,
      tracking_number: tracking,
      memo: order.memo || order.deliveryMemo || '',
      created_at: order.createdAt || order.created_at || new Date().toISOString()
    };
  }

  // 실시간 채널 설정 플래그
  let realtimeChannel = null;

  function initRealtime() {
    if (!supabase || realtimeChannel) return;
    try {
      realtimeChannel = supabase
        .channel('realtime:orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('[OOMS_DB Realtime Event]', payload.eventType, payload.new || payload.old);
            subscribers.forEach(cb => {
              try { cb(payload); } catch (err) { console.error('[OOMS_DB Callback Error]', err); }
            });
          }
        )
        .subscribe((status) => {
          console.log('[OOMS_DB Realtime Status]', status);
        });
    } catch (e) {
      console.warn('[OOMS_DB Realtime Init Error]', e);
    }
  }

  // OOMS_DB 전역 객체 정의
  const OOMS_DB = {
    /**
     * Supabase 인스턴스 반환
     */
    getClient: function () {
      if (!supabase && window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      }
      return supabase;
    },

    /**
     * 1. 전체 또는 조건부 주문 목록 조회
     * @param {Object} [filter] - { farm_code, shipping_status, payment_status }
     * @returns {Promise<Array>} 매핑된 주문 배열
     */
    getOrders: async function (filter = {}) {
      const client = this.getClient();
      if (!client) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
      }

      let query = client.from('orders').select('*').order('created_at', { ascending: false });

      if (filter.farm_code || filter.farmCode) {
        query = query.eq('farm_code', filter.farm_code || filter.farmCode);
      }
      if (filter.shipping_status || filter.shippingStatus) {
        query = query.eq('shipping_status', filter.shipping_status || filter.shippingStatus);
      }
      if (filter.payment_status || filter.paymentStatus) {
        query = query.eq('payment_status', filter.payment_status || filter.paymentStatus);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[OOMS_DB getOrders Error]', error);
        throw error;
      }

      const orders = (data || []).map(mapDbRowToOrder);
      return orders;
    },

    /**
     * 2. 신규 주문(단건 또는 대량 배열) DB Insert
     * @param {Array|Object} orderArray
     * @returns {Promise<Array>} 생성된 주문 배열
     */
    createOrders: async function (orderArray) {
      const client = this.getClient();
      if (!client) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
      }

      const rawItems = Array.isArray(orderArray) ? orderArray : [orderArray];
      if (rawItems.length === 0) return [];

      const dbRows = rawItems.map(mapOrderToDbRow);

      const { data, error } = await client
        .from('orders')
        .insert(dbRows)
        .select();

      if (error) {
        console.error('[OOMS_DB createOrders Error]', error);
        throw error;
      }

      const created = (data || []).map(mapDbRowToOrder);

      // 로컬 구독자들에게 즉시 알림 트리거
      created.forEach(item => {
        subscribers.forEach(cb => {
          try { cb({ eventType: 'INSERT', new: item }); } catch (e) {}
        });
      });

      return created;
    },

    /**
     * 3. 주문 수정 (송장번호 입력, 입금확인, 배송상태 변경 등)
     * @param {string} id - 주문 ID
     * @param {Object} updateFields
     * @returns {Promise<Object>} 업데이트된 주문 객체
     */
    updateOrder: async function (id, updateFields) {
      const client = this.getClient();
      if (!client) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
      }

      const dbUpdate = {};

      if (updateFields.tracking_number !== undefined) {
        dbUpdate.tracking_number = updateFields.tracking_number;
      } else if (updateFields.tracking !== undefined) {
        dbUpdate.tracking_number = updateFields.tracking;
      } else if (updateFields.invoiceNum !== undefined) {
        dbUpdate.tracking_number = updateFields.invoiceNum;
      } else if (updateFields.invoiceNumber !== undefined) {
        dbUpdate.tracking_number = updateFields.invoiceNumber;
      }

      if (updateFields.carrier !== undefined) {
        dbUpdate.carrier = updateFields.carrier;
      } else if (updateFields.courier !== undefined) {
        dbUpdate.carrier = updateFields.courier;
      }

      if (updateFields.shipping_status !== undefined) {
        dbUpdate.shipping_status = updateFields.shipping_status;
      } else if (updateFields.shippingStatus !== undefined) {
        const s = updateFields.shippingStatus;
        dbUpdate.shipping_status = s === '배송완료' ? 'delivered' : (s === '배송중' || s === '배송출발' ? 'shipped' : 'preparing');
      }

      if (updateFields.payment_status !== undefined) {
        dbUpdate.payment_status = updateFields.payment_status;
      } else if (updateFields.paymentStatus !== undefined) {
        const p = updateFields.paymentStatus;
        dbUpdate.payment_status = (p === '입금완료' || p === 'paid') ? 'paid' : 'unpaid';
      } else if (updateFields.paid !== undefined) {
        dbUpdate.payment_status = updateFields.paid ? 'paid' : 'unpaid';
      }

      if (updateFields.memo !== undefined) dbUpdate.memo = updateFields.memo;
      if (updateFields.address !== undefined && typeof updateFields.address === 'string') {
        dbUpdate.address = updateFields.address;
      }
      if (updateFields.quantity !== undefined) dbUpdate.quantity = Number(updateFields.quantity);
      if (updateFields.amount !== undefined) dbUpdate.amount = Number(updateFields.amount);

      const { data, error } = await client
        .from('orders')
        .update(dbUpdate)
        .eq('id', id)
        .select();

      if (error) {
        console.error('[OOMS_DB updateOrder Error]', error);
        throw error;
      }

      const updated = data && data[0] ? mapDbRowToOrder(data[0]) : null;

      if (updated) {
        subscribers.forEach(cb => {
          try { cb({ eventType: 'UPDATE', new: updated }); } catch (e) {}
        });
      }

      return updated;
    },

    /**
     * 4. 실시간 DB 변경 구독
     * @param {Function} callback - (payload) => void
     * @returns {Function} unsubscribe 함수
     */
    subscribe: function (callback) {
      if (typeof callback !== 'function') return () => {};

      subscribers.add(callback);
      initRealtime();

      return () => {
        subscribers.delete(callback);
      };
    },

    /**
     * 데이터 매핑 헬퍼 노출
     */
    mapDbRowToOrder: mapDbRowToOrder,
    mapOrderToDbRow: mapOrderToDbRow
  };

  // 전역 노출
  window.OOMS_DB = OOMS_DB;

  // DOM 로드 완료 시 realtime 자동 초기화
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initRealtime);
    } else {
      initRealtime();
    }
  }

})(typeof window !== 'undefined' ? window : this);
