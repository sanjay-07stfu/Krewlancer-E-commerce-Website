"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { RefreshCcw, AlertCircle, CheckCircle2, Package, Truck, User, CreditCard, ArrowLeft, Undo2 } from "lucide-react"
import { getApiBase } from "@/lib/api-base"

interface OrderItem {
  productName: string
  quantity: number
  price: number
  size: string
}

interface Order {
  id: number
  user_id: number
  order_number: string
  total: number
  status: string
  payment_status: string
  shipping_address: any
  customerName: string
  customerEmail: string
  date: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  razorpay_payment_id?: string
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("")
  const [refunding, setRefunding] = useState(false)
  const API_BASE = getApiBase()

  const fetchOrderDetail = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/orders/${id}`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        setStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
        credentials: "include"
      });

      const data = await response.json();
      if (data.success) {
        alert("Status updated and email sent.");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleDispatchBorzo = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/dispatch/${order?.order_number || id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include"
      });

      const data = await response.json();
      if (data.success) {
        alert("Order Dispatched via Borzo!\nTracking Link: " + data.tracking_url);
        fetchOrderDetail();
      } else {
        alert("Borzo Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to dispatch order.");
    }
  };

  const handleRefund = async () => {
    if (!order?.razorpay_payment_id) {
      alert("No payment ID found for this order.");
      return;
    }

    if (!confirm("Are you sure you want to refund this order? This will return the money to the customer via Razorpay.")) {
      return;
    }

    setRefunding(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          razorpay_payment_id: order.razorpay_payment_id,
          amount: order.total 
        }),
        credentials: "include"
      });

      const data = await response.json();
      if (data.success) {
        alert("Refund successful!");
        fetchOrderDetail();
      } else {
        alert("Refund Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process refund.");
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#030303] min-h-screen flex items-center justify-center">
        <RefreshCcw className="animate-spin text-gray-500" size={24} />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-[#030303] text-[#e8e8e3] min-h-screen px-4 sm:px-6 md:px-8 py-10 md:py-16 text-center">
        <Link href="/admin/orders" className="uppercase tracking-widest text-xs text-gray-500">
          ← Back to Orders
        </Link>
        <p className="mt-12 font-serif text-2xl uppercase tracking-widest text-gray-700">Order not found.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#030303] text-[#e8e8e3] min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 py-10 md:py-14 lg:py-20 max-w-7xl mx-auto space-y-10 md:space-y-16">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
        <div className="space-y-6">
          <Link href="/admin/orders" className="inline-flex items-center gap-2 uppercase tracking-[0.3em] text-[10px] text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={12} />
            Registry / Orders
          </Link>

          <div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-4 break-all">
              {order.order_number}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-[10px] uppercase tracking-[0.2em] text-gray-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-green-500" />
                Placed {new Date(order.date).toLocaleDateString()}
              </span>
              <span className="w-1 h-1 bg-white/10 rounded-full" />
              <span>{order.customerEmail}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {order.payment_status === "Paid" && (
            <button
              onClick={handleRefund}
              disabled={refunding || order.status === "Cancelled"}
              className="px-8 py-4 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              <Undo2 size={14} className={refunding ? "animate-spin" : ""} />
              {refunding ? "Processing..." : "Refund Treasury"}
            </button>
          )}
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid lg:grid-cols-3 gap-12 lg:gap-20">
        {/* ITEMS & SUMMARY */}
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white/2 border border-white/5 p-5 sm:p-7 md:p-10 space-y-8">
            <h2 className="flex items-center gap-3 uppercase tracking-[0.3em] text-[10px] text-gray-500 mb-8">
              <Package size={14} />
              Manifested Items
            </h2>

            <div className="space-y-8">
              {order.items.map((item, i) => (
                <div key={i} className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start border-b border-white/5 pb-8 last:border-0 last:pb-0 group">
                  <div className="space-y-1">
                    <p className="font-serif text-lg text-[#e8e8e3] group-hover:text-white transition-colors">
                      {item.productName}
                    </p>
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-gray-500">
                      <span>Size {item.size}</span>
                      <span className="w-1 h-1 bg-white/10 rounded-full" />
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <p className="text-sm font-light text-[#e8e8e3]">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-10 space-y-4 border-t border-white/5">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
                <span>Shipping</span>
                <span>₹{order.shipping.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="text-[10px] uppercase tracking-[0.4em] font-medium text-gray-400">Total Magintude</span>
                <span className="text-3xl font-serif text-[#e8e8e3]">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* SHIPPING ADDRESS */}
          <div className="bg-white/2 border border-white/5 p-5 sm:p-7 md:p-10">
            <h2 className="flex items-center gap-3 uppercase tracking-[0.3em] text-[10px] text-gray-500 mb-8">
              <Truck size={14} />
              Logistics Destination
            </h2>
            <div className="space-y-2 text-sm text-gray-400 font-light leading-relaxed max-w-md">
              <p className="text-[#e8e8e3] font-medium mb-3 uppercase tracking-widest">
                {order.shipping_address?.firstName} {order.shipping_address?.lastName}
              </p>
              <p>{order.shipping_address?.street}</p>
              <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}</p>
              <p className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                <span className="text-[9px] uppercase tracking-widest text-gray-600">Contact:</span>
                {order.shipping_address?.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS SIDEBAR */}
        <div className="space-y-8">
          {/* CUSTOMER PROFILE */}
          <div className="bg-white/2 border border-white/5 p-5 sm:p-8 space-y-6">
            <h2 className="flex items-center gap-3 uppercase tracking-[0.3em] text-[10px] text-gray-500">
              <User size={14} />
              Identity
            </h2>
            <div>
              <p className="text-sm font-medium text-[#e8e8e3]">{order.customerName}</p>
              <p className="text-[10px] text-gray-600 tracking-widest mt-1">{order.customerEmail}</p>
            </div>
            <Link 
              href={`/admin/customers/${order.user_id}`}
              className="block w-full text-center py-3 border border-white/5 text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              View Full Profile
            </Link>
          </div>

          {/* PAYMENT STATUS */}
          <div className="bg-white/2 border border-white/5 p-5 sm:p-8 space-y-6">
            <h2 className="flex items-center gap-3 uppercase tracking-[0.3em] text-[10px] text-gray-500">
              <CreditCard size={14} />
              Financial Status
            </h2>
            <div className={`inline-flex items-center gap-3 px-4 py-2 text-[9px] uppercase tracking-widest rounded-full ${
              order.payment_status === 'Paid' ? 'text-green-400 bg-green-400/10' : 
              order.payment_status === 'Refunded' ? 'text-blue-400 bg-blue-400/10' :
              'text-orange-400 bg-orange-400/10'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                order.payment_status === 'Paid' ? 'bg-green-400' : 
                order.payment_status === 'Refunded' ? 'bg-blue-400' : 
                'bg-orange-400'
              }`} />
              {order.payment_status}
            </div>
            {order.razorpay_payment_id && (
              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-[0.2em] text-gray-600">Gateway ID</p>
                <p className="text-[10px] font-mono text-gray-400">{order.razorpay_payment_id}</p>
              </div>
            )}
          </div>

          {/* WORKFLOW CONTROLS */}
          <div className="bg-white/2 border border-white/5 p-5 sm:p-8 space-y-8">
            <h2 className="uppercase tracking-[0.3em] text-[10px] text-gray-500">Execution</h2>

            <div className="space-y-4">
              <label className="text-[8px] uppercase tracking-[0.2em] text-gray-600">Lifecycle State</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-4 py-4 text-[10px] tracking-[0.2em] uppercase focus:outline-none focus:border-white/20 transition-all"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={handleUpdateStatus}
                className="w-full py-4 border border-white/20 uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-black transition-all"
              >
                Sync Status
              </button>
            </div>

            <div className="pt-8 border-t border-white/10 space-y-4">
              <button
                onClick={handleDispatchBorzo}
                disabled={status === 'delivered' || status === 'cancelled' || status === 'shipped'}
                className="w-full py-5 bg-[#e8e8e3] text-black disabled:opacity-30 disabled:grayscale uppercase tracking-[0.2em] text-[10px] font-bold transition-all shadow-[0_10px_20px_rgba(232,232,227,0.1)] hover:shadow-none"
              >
                Deploy Courier (Borzo)
              </button>
              <p className="text-[9px] text-gray-600 text-center uppercase tracking-widest leading-relaxed px-4">
                automated logistics handoff
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
