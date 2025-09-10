// src/pages/DetailPage.tsx

import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"; // <-- เพิ่ม Marker ที่นี่
import { Order } from "../types";
import Stage from "../components/Stage";
import Badge from "../components/Badge";
import Emoji from "../components/Emoji";

// URLs ของรูปภาพ
const avatarUrl = "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=160&auto=format&fit=crop";
const boxUrl = "https://img.freepik.com/premium-vector/cartoon-style-parcel-box-thin-icon-vector-illustration_1323048-54962.jpg";
const signatureUrl = "https://a.storyblok.com/f/191576/1176x882/0707bde47c/make_signature_hero_after.webp";

// กำหนด containerStyle สำหรับแผนที่
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '12rem',
};

// ข้อมูลจำลองพิกัดสำหรับ Locations ต่างๆ (ในโลกจริงต้องใช้ Geocoding API)
const locations: { [key: string]: { lat: number; lng: number } } = {
    "เมือง, กรุงเทพมหานคร": { lat: 13.736717, lng: 100.523186 },
    "ถลาง, ภูเก็ต": { lat: 8.040051, lng: 98.31295 },
    "เมือง, เชียงใหม่": { lat: 18.788322, lng: 98.987251 },
    "หาดใหญ่, สงขลา": { lat: 7.005063, lng: 100.470512 },
    "เมือง, ขอนแก่น": { lat: 16.432362, lng: 102.822769 },
    "บางละมุง, ชลบุรี": { lat: 12.980656, lng: 100.91617 },
    "ปากเกร็ด, นนทบุรี": { lat: 13.914298, lng: 100.518669 },
    "เมือง, ชลบุรี": { lat: 13.361927, lng: 100.984024 },
    "เมือง, อยุธยา": { lat: 14.35626, lng: 100.56942 },
    "เมือง, ระยอง": { lat: 12.67807, lng: 101.27216 },
    "เมือง, สมุทรปราการ": { lat: 13.600000, lng: 100.600000 },
    "เมือง, นครราชสีมา": { lat: 14.977465, lng: 102.062363 },
};

function DetailPage({ selected, onBack }: { selected: Order; onBack: () => void }) {
  // สร้าง mapping ของ status กับ Stages
  const allStages = [
    { label: "Confirmed", time: "10:30 AM", icon: "bi-check-lg", color: "success" },
    { label: "Check In", time: "11:15 AM", icon: "bi-box", color: "info" },
    { label: "On Delivery", time: "1:45 PM", icon: "bi-truck", color: "warning" },
    { label: "Check out", time: "3:30 PM", icon: "bi-arrow-right", color: "secondary" },
    { label: "Delivered", time: "4:00 PM", icon: "bi-check-lg", color: "secondary" },
  ];

  const currentStatusIndex = allStages.findIndex(s => s.label === selected.status);

  // กรองเอาเฉพาะ Stage ที่เสร็จแล้วหรือกำลังดำเนินการเท่านั้น
  const stages = allStages.filter((s, index) => index <= currentStatusIndex).map((s, index) => ({
    ...s,
    isCompleted: index < currentStatusIndex,
    isActive: index === currentStatusIndex,
  }));

  // State สำหรับเก็บพิกัดแผนที่
  const [center, setCenter] = useState(locations[selected.location] || { lat: 13.736717, lng: 100.523186 });
  const [heading, setHeading] = useState(0);

  // โหลดสคริปต์ Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyC4qFRXRw5Eqcy-OPlqZb3ok0nACr2-9Nw", // <-- **แทนที่ด้วย API Key ของคุณ**
  });

  // ใช้ useEffect เพื่ออัปเดต heading สำหรับการหมุนแผนที่
  useEffect(() => {
    // หาพิกัดจาก location ที่เลือก
    if (locations[selected.location]) {
      setCenter(locations[selected.location]);
    }
    const interval = setInterval(() => {
      setHeading(prev => (prev + 1) % 360); // เพิ่มค่า heading ทุกๆ 1 องศา
    }, 50); // ความเร็วในการหมุน
    return () => clearInterval(interval);
  }, [selected.location]); // dependency array เพื่อให้ effect ทำงานใหม่เมื่อ location เปลี่ยน

  // กำหนด options สำหรับแผนที่
  const mapOptions = {
    mapId: "YOUR_MAP_ID", // (Optional) ใส่ Map ID หากคุณสร้างไว้
    zoom: 12,
    center: center,
    mapTypeId: "roadmap", // ตั้งค่าเป็น satellite เพื่อให้ดูสมจริงขึ้น
    disableDefaultUI: true, // ซ่อน UI ที่ไม่จำเป็น
    heading: heading, // ใช้ state heading ในการหมุนแผนที่
    tilt: 45, // เอียงแผนที่เล็กน้อย
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="d-flex align-items-center mb-4">
        <button onClick={onBack} className="btn btn-link text-decoration-none text-dark p-0 me-3">
          <i className="bi bi-arrow-left fs-5"></i>
        </button>
        <div>
          <h1 className="h4 fw-bold mb-0">Order #{selected.id}</h1>
          <p className="text-muted small mb-0">Placed on March 1, 2024</p>
        </div>
      </div>

      {/* Stage Tracking Timeline */}
      <section className="card shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          {stages.map((s, i) => (
            <div key={i} className="text-center position-relative flex-grow-1">
              <Stage
                icon={s.icon}
                label={s.label}
                time={s.time}
                isCompleted={s.isCompleted}
                isActive={s.isActive}
                color={s.color}
              />
              {i < stages.length - 1 && (
                <div
                  className={`position-absolute top-50 start-100 translate-middle-y w-100 ${s.isCompleted || s.isActive ? 'bg-primary' : 'bg-secondary'}`}
                  style={{ height: '2px', zIndex: -1 }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Other Sections (เหมือนเดิม) */}
      <section className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100">
            <div className="text-muted small">Delivering to</div>
            <div className="fw-bold fs-5">John Doe</div>
            <div className="text-muted">+1 234 567 89000</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-4 d-flex flex-row align-items-center gap-3 h-100">
            <img src={avatarUrl} alt="Driver avatar" className="rounded-circle" style={{ width: '4rem', height: '4rem', objectFit: 'cover' }} />
            <div className="flex-grow-1">
              <div className="fw-bold">Michael Smith</div>
              <div className="text-muted small d-flex align-items-center gap-1">
                <i className="bi bi-phone-fill"></i> +1 987 654 3210
              </div>
              <div className="text-muted small">
                Vehicle <span className="fw-bold text-dark">DEF-4567</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="row g-4 mb-4 align-items-stretch">
        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100">
            <div className="fw-bold mb-3">Proof of Delivery</div>
            <div className="d-flex align-items-center gap-3">
              <img src={boxUrl} className="rounded-3" style={{ width: '7rem', height: '5rem', objectFit: 'cover' }} alt="Parcel photo" />
              <div className="d-flex align-items-center gap-2">
                <img src={signatureUrl} alt="Customer signature" className="rounded-3" style={{ width: '7rem', height: '5rem', objectFit: 'contain' }} />
                <a className="link-primary small text-decoration-none" href="#">
                    <i className="bi bi-file-earmark-pdf-fill me-1"></i> PackingList.pdf
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100">
            <div className="fw-bold mb-3">Live Map</div>
            <div className="position-relative w-100 h-100 rounded-3 overflow-hidden bg-light" style={{ minHeight: '12rem' }}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  options={mapOptions}
                >
                    {/* เพิ่ม Marker ที่นี่ */}
                    <Marker position={center} />
                </GoogleMap>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="text-center mt-5">
        <div className="fw-bold mb-3">Customer Rating</div>
        <div className="d-flex justify-content-center gap-4 align-items-center">
          {[
            { label: "😡", bg: "#FBE6E7" },
            { label: "😕", bg: "#FDF5DE" },
            { label: "🙂", bg: "#FCFBE0" },
            { label: "😊", bg: "#EEF8E1" },
            { label: "🟢", bg: "#E6F6E6" },
          ].map((e, idx) => (
            <Emoji key={idx} label={e.label} bg={e.bg} active={false} onClick={() => {}} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default DetailPage;