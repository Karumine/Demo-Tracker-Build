// src/pages/DetailPage.tsx

import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Order } from "../types";
import Stage from "../components/Stage";
import Badge from "../components/Badge";
import Emoji from "../components/Emoji";
import StatusPill from "../components/StatusPill";

// URLs ของรูปภาพ
const avatarUrl = "https://png.pngtree.com/png-clipart/20190115/ourlarge/pngtree-hand-drawn-cartoon-send-delivery-shopping-pickpocket-png-image_362759.jpg";
const boxUrl = "https://img.freepik.com/premium-vector/cartoon-style-parcel-box-thin-icon-vector-illustration_1323048-54962.jpg";
const signatureUrl = "https://a.storyblok.com/f/191576/1176x882/0707bde47c/make_signature_hero_after.webp";

// กำหนด containerStyle สำหรับแผนที่
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '12rem',
};

// =======================================================
// ⚡️ 1. Interface สำหรับ Delivery Details ⚡️
// =======================================================
interface DeliveryDetails {
  deliveryId: string;
  sender: string;   // คนขับ/ผู้ส่ง
  receiver: string; // ผู้รับ
  // สามารถเพิ่มข้อมูลอื่น ๆ จาก Delivery API ได้
}

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
  // =======================================================
  // ⚡️ 2. State สำหรับ Delivery Details ⚡️
  // =======================================================
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);

  // สร้าง mapping ของ status กับ Stages
  const allStages = [
    { label: "Confirmed", time: "10:30 AM", icon: "bi-check-lg", color: "success" },
    { label: "Check In", time: "11:15 AM", icon: "bi-box", color: "info" },
    { label: "On Delivery", time: "1:45 PM", icon: "bi-truck", color: "warning" },
    { label: "Check out", time: "3:30 PM", icon: "bi-arrow-right", color: "secondary" },
    { label: "Delivered", time: "4:00 PM", icon: "bi-truck", color: "secondary" },
  ];

  const currentStatusIndex = allStages.findIndex(s => s.label === selected.status);


  // State สำหรับเก็บพิกัดแผนที่
  const [center, setCenter] = useState(locations[selected.location] || { lat: 13.736717, lng: 100.523186 });
  const [heading, setHeading] = useState(0);

  // โหลดสคริปต์ Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyC4qFRXRw5Eqcy-OPlqZb3ok0nACr2-9Nw", // <-- **แทนที่ด้วย API Key ของคุณ**
  });

  // =======================================================
  // ⚡️ 3. Fetch Delivery Data ใน useEffect ⚡️
  // =======================================================
  useEffect(() => {
    // 1. Logic ดึงข้อมูล Delivery
    const fetchDeliveryData = async () => {
      try {
        // สมมติว่า Delivery API คืนค่าเป็น Array ของ Deliveries ทั้งหมด
        const response = await fetch("/api/Delivery");
        if (!response.ok) throw new Error("Failed to fetch Delivery API");
        const rawDeliveries: any[] = await response.json();

        // ค้นหา Delivery ที่มี Order ID ปัจจุบันอยู่ในรายการ orderIds
        const matchingDelivery = rawDeliveries.find((d: any) =>
          d.orderIds && d.orderIds.includes(selected.id)
        );

        if (matchingDelivery) {
          setDeliveryDetails({
            deliveryId: matchingDelivery.deliveryId,
            sender: matchingDelivery.sender,
            receiver: matchingDelivery.receiver,
          });
        } else {
          console.warn(`No matching delivery found for Order ID: ${selected.id}`);
        }

      } catch (error) {
        console.error("Error fetching delivery details:", error);
      }
    };

    fetchDeliveryData();

    // 2. Logic สำหรับ Map/Heading เดิม
    if (locations[selected.location]) {
      setCenter(locations[selected.location]);
    }
    const interval = setInterval(() => {
      setHeading(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);

  }, [selected.location, selected.id]); // เพิ่ม selected.id เป็น dependency

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

  // กำหนดค่า Fallback
  const recipientName = deliveryDetails?.receiver || selected.customer || "กำลังโหลด...";
  const driverName = deliveryDetails?.sender || "กำลังโหลด...";


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
        <div className="d-flex justify-content-between align-items-start">
          {allStages.map((s, i) => {
            const isDelivered = selected.status === "Delivered";
            const isCompleted = isDelivered || i < currentStatusIndex;
            const isActive = !isDelivered && i === currentStatusIndex;
            const isNotStarted = !isDelivered && i > currentStatusIndex;

            let stageIcon;
            let stageColor;
            let stageTime;
            let progressLineColor;

            if (isDelivered) {
              stageIcon = "bi-check-lg";
              stageColor = "success";
              stageTime = s.time;
              progressLineColor = 'bg-primary';
            } else {
              if (isCompleted) {
                stageIcon = "bi-check-lg";
                stageColor = "success";
                stageTime = s.time;
              } else if (isActive) {
                stageIcon = "spinner-border spinner-border-sm text-primary";
                stageColor = s.color;
                stageTime = s.time;
              } else {
                stageIcon = s.icon;
                stageColor = "secondary";
                stageTime = null;
              }
              progressLineColor = isCompleted || isActive ? 'bg-primary' : 'bg-secondary';
            }

            return (
              <div key={i} className="text-center position-relative flex-grow-1">
                <Stage
                  icon={stageIcon}
                  label={s.label}
                  time={stageTime}
                  isCompleted={isCompleted}
                  isActive={isActive}
                  color={stageColor}
                />
                {i < allStages.length - 1 && (
                  <div className={`position-absolute top-50 start-100 translate-middle-y w-100 ${progressLineColor}`}
                    style={{ height: '2px', zIndex: -1 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Other Sections (Delivering to & Driver/Sender) */}
      <section className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100">
            <div className="text-muted small">Delivering to</div>
            {/* ⚡️ แทนที่ John Doe ด้วย deliveryDetails?.receiver ⚡️ */}
            <div className="fw-bold fs-5">{recipientName}</div>
            <div className="text-muted">+1 234 567 89000</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-4 d-flex flex-row align-items-center gap-3 h-100">
            <img src={avatarUrl} alt="Driver avatar" className="rounded-circle" style={{ width: '4rem', height: '4rem', objectFit: 'cover' }} />
            <div className="flex-grow-1">
              {/* ⚡️ แทนที่ Michael Smith ด้วย deliveryDetails?.sender ⚡️ */}
              <div className="fw-bold">{driverName}</div>
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

      {/* ======================================================= */}
      {/* ⚡️ Conditional Rendering: Proof of Delivery & Live Map ⚡️ */}
      {/* ======================================================= */}
      <section className="row g-4 mb-4 align-items-stretch">
        {/* Proof of Delivery จะแสดงเมื่อสถานะเป็น 'Delivered' แล้วเท่านั้น */}
        {selected.status === "Delivered" ? (
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
        ) : (
          // แสดงส่วนนี้เมื่อสถานะยังไม่ Delivered (เช่น แสดงแค่ Live Map เต็มพื้นที่)
          // เราอาจจะแสดงข้อมูลสรุป Order แทน Proof of Delivery ได้
          <div className="col-md-6">
            <div className="card shadow-sm p-4 h-100">
              <div className="fw-bold mb-3">Order Details</div>
              <p className="small text-muted">Product: {selected.id}</p>
              <p className="small text-muted">Customer: {selected.customer}</p>
              <p className="small text-muted">Location: {selected.location}</p>

            </div>
          </div>
        )}

        {/* Live Map จะแสดงตลอด */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100">
            <div className="fw-bold mb-3">Live Map</div>
            <div className="position-relative w-100 h-100 rounded-3 overflow-hidden bg-light" style={{ minHeight: '12rem' }}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  options={mapOptions}
                >
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

      {/* ======================================================= */}
      {/* ⚡️ Conditional Rendering: Customer Rating ⚡️ */}
      {/* ======================================================= */}
      {selected.status === "Delivered" && (
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
              <Emoji key={idx} label={e.label} bg={e.bg} active={false} onClick={() => { }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DetailPage;