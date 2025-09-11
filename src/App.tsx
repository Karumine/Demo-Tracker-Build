// src/App.tsx
import React, { useState } from "react";
import OverviewPage from "./pages/OverviewPage";
import DetailPage from "./pages/DetailPage";
import { Order } from "./types";
import "./App.css"; // ตรวจสอบให้แน่ใจว่าได้ import ไฟล์ CSS นี้แล้ว

const App: React.FC = () => {
  const [page, setPage] = useState<"overview" | "detail">("overview");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([
    { id: "OR123460", date: "01/03/2024", customer: "Customer", status: "Delivered", location: "เมือง, กรุงเทพมหานคร" },
    { id: "OR123459", date: "01/03/2024", customer: "Customer", status: "Check out", location: "ถลาง, ภูเก็ต" },
    { id: "OR123458", date: "01/03/2024", customer: "Customer", status: "On Delivery", location: "เมือง, เชียงใหม่" },
    { id: "OR123457", date: "01/03/2024", customer: "Customer", status: "Check In", location: "หาดใหญ่, สงขลา" },
    { id: "OR123453", date: "01/03/2024", customer: "Customer", status: "Check In", location: "เมือง, ขอนแก่น" },
    { id: "OR123462", date: "01/03/2024", customer: "Customer", status: "On Delivery", location: "บางละมุง, ชลบุรี" },
    { id: "OR123440", date: "01/03/2024", customer: "Customer", status: "On Delivery", location: "ปากเกร็ด, นนทบุรี" },
    { id: "OR123456", date: "01/03/2024", customer: "Customer", status: "Delivered", location: "เมือง, ชลบุรี" },
    { id: "OR123455", date: "01/03/2024", customer: "Customer", status: "On Delivery", location: "เมือง, อยุธยา" },
    { id: "OR123454", date: "01/03/2024", customer: "Customer", status: "Delivered", location: "เมือง, ระยอง" },
    { id: "OR123452", date: "01/03/2024", customer: "Customer", status: "Check out", location: "เมือง, สมุทรปราการ" },
    { id: "OR123451", date: "01/03/2024", customer: "Customer", status: "On Delivery", location: "เมือง, นครราชสีมา" },
  ]);

  return (
    <div className="d-flex bg-light min-vh-100 position-relative">
      {/* Sidebar - ใช้คลาส 'app-sidebar' และ 'open' สำหรับสถานะการเปิด/ปิด */}
      <aside className={`app-sidebar bg-white shadow-sm d-flex flex-column desktop-only ${isSidebarOpen ? 'open' : ''}`}>
        <div className="p-4 border-bottom">
          <span className="h5 fw-bold text-dark">
            <i className="bi bi-truck me-2 text-primary"></i>Company
          </span>
          {/* ปุ่มปิด Sidebar สำหรับหน้าจอมือถือ (แสดงเฉพาะบนมือถือ) */}
          {isSidebarOpen && (
            <button
              className="btn btn-sm hide-on-desktop position-absolute top-0  end-0 m-2"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
        <div className="p-4 d-flex flex-column gap-1 flex-grow-1">
          <div className="text-muted small mb-2">Navigation</div>
          {[
            { name: "Orders", active: true, icon: "bi-card-list" },
            { name: "Drivers", icon: "bi-person-circle" },
            { name: "Customers", icon: "bi-people" },
            { name: "Reports", icon: "bi-bar-chart" },
          ].map((m) => (
            <button
              key={m.name}
              className={`btn text-start rounded-3 ${m.active ? "bg-primary-subtle text-primary fw-bold" : "text-dark"}`}
            >
              <i className={`bi ${m.icon} me-2`}></i>
              {m.name}
            </button>
          ))}
        </div>
      </aside >

      {/* Main Content - ไม่ต้องมี inline style สำหรับ margin-left แล้ว */}
      < main className="flex-grow-1 p-4 app-main-content" >
        {/* Hamburger Menu Button (แสดงเฉพาะบนมือถือ) */}
        < button
          className="btn btn-primary mobile-only-button mb-3"
          onClick={() => setIsSidebarOpen(true)}
        >
          <i className="bi bi-list"></i>
        </button >

        {page === "overview" && (
          <OverviewPage
            orders={orders}
            onSelect={(o) => {
              setSelectedOrder(o);
              setPage("detail");
            }}
          />
        )}
        {
          page === "detail" && selectedOrder && (
            <DetailPage selected={selectedOrder} onBack={() => setPage("overview")} />
          )
        }
      </main >
    </div >
  );
};

export default App;