// src/pages/OverviewPage.tsx

import React from "react";
import StatusPill from "../components/StatusPill";
import { Order } from "../types";

function OverviewPage({ onSelect, orders }: { onSelect: (o: Order) => void; orders: Order[] }) {
  const [query, setQuery] = React.useState("");
  const [showAdd, setShowAdd] = React.useState(false);
  const [list, setList] = React.useState<Order[]>(orders);

  const filtered = list.filter((o) =>
    [o.id, o.customer, o.date, o.status, o.location].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  const [form, setForm] = React.useState<Order>({ id: "OR123999", date: "01/03/2024", customer: "New Customer", status: "Check In", location: "เมือง, กรุงเทพมหานคร" });

  React.useEffect(() => {
    if (showAdd) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling on body
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showAdd]);

  const handleCreateOrder = () => {
    setList((prev) => [form, ...prev]);
    setShowAdd(false);
    setForm({ id: "OR" + Math.floor(Math.random() * 100000), date: new Date().toLocaleDateString('th-TH'), customer: "", status: "Check In", location: "" });
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-center mb-4">
        <h1 className="h2 mb-3 mb-md-0">Order Tracking Overview</h1>
        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
          <div className="position-relative w-100 w-sm-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="form-control"
            />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary w-100 w-sm-auto">
            Add Order
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-light text-secondary fw-bold d-none d-md-block">
          <div className="row">
            <div className="col-md-2">ORDER</div>
            <div className="col-md-2">DATE</div>
            <div className="col-md-2">CUSTOMER</div>
            <div className="col-md-3">STATUS</div>
            <div className="col-md-3">LOCATION</div>
          </div>
        </div>
        <div className="list-group list-group-flush">
          {filtered.length > 0 ? (
            filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => onSelect(o)}
                className="list-group-item list-group-item-action"
              >
                <div className="row g-2 align-items-center">
                  {/* Order ID */}
                  <div className="col-12 col-md-2">
                    <span className="d-inline d-md-none fw-bold">ORDER: </span>
                    <span className="fw-bold">{o.id}</span>
                  </div>
                  {/* Date */}
                  <div className="col-12 col-md-2">
                    <span className="d-inline d-md-none fw-bold">Date: </span>
                    {o.date}
                  </div>
                  {/* Customer */}
                  <div className="col-12 col-md-2">
                    <span className="d-inline d-md-none fw-bold">Customer: </span>
                    {o.customer}
                  </div>
                  {/* Status */}
                  <div className="col-12 col-md-3">
                    <span className="d-inline d-md-none fw-bold">Status: </span>
                    <StatusPill status={o.status} />
                  </div>
                  {/* Location */}
                  <div className="col-12 col-md-3">
                    <span className="d-inline d-md-none fw-bold">Location: </span>
                    {o.location}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-muted">No orders found.</div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1} role="dialog" onClick={(e) => {
          const target = e.target as HTMLElement; 
          if (target.classList.contains('modal')) {
            setShowAdd(false);
          }
        }}>
          <div className="modal-dialog modal-dialog-centered" role="document" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowAdd(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="orderNo" className="form-label">Order No.</label>
                      <input type="text" className="form-control" id="orderNo" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label htmlFor="date" className="form-label">Date</label>
                      <input type="text" className="form-control" id="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label htmlFor="customer" className="form-label">Customer</label>
                      <input type="text" className="form-control" id="customer" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label htmlFor="location" className="form-label">Location</label>
                      <input type="text" className="form-control" id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select className="form-select" id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Order['status'] })}>
                        <option value="Check In">Check In</option>
                        <option value="On Delivery">On Delivery</option>
                        <option value="Check out">Check out</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateOrder}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OverviewPage;