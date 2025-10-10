import React from "react";
import StatusPill from "../components/StatusPill";
import { Order } from "../types"; // สมมติว่า Order type มี id, date, customer, status, location

// ไม่มีการใช้ Google API Key หรือฟังก์ชัน reverseGeocode แล้ว

// กำหนด Type สำหรับข้อมูล Delivery ที่ได้จาก API
interface DeliveryData {
    deliveryId: string;
    sender: string;
    receiver: string;
    deliveryDateTime: string;
    receiveDateTime: string;
    signature: string;
    orderIds: string[];
}

// กำหนด Type สำหรับข้อมูล Order ที่ได้จาก API
interface OrderData {
    orderId: string;
    productName: string;
    amount: number;
    unit: string;
    customer: string;
    status: string;
    geoLocationStart: string;
    geoLocationEnd: string; // <-- ใช้ตัวนี้แสดงในช่อง Location
    deliveries: DeliveryData[];
}

// ⚡️ ตารางพิกัดจำลองสำหรับ Reverse Lookup ⚡️
const locations: { [key: string]: { lat: number; lng: number } } = {
    "เมือง, กรุงเทพมหานคร": { lat: 14.0209, lng: 100.5250 },
    "ถลาง, ภูเก็ต": { lat: 13.7600, lng: 100.5100 },
    "เมือง, เชียงใหม่": { lat: 14.9789, lng: 102.0887 },
    "หาดใหญ่, สงขลา": { lat: 14.9789, lng: 102.0887 },
    "เมือง, ขอนแก่น": { lat: 13.6315, lng: 100.5847 },
    "บางละมุง, ชลบุรี": { lat: 14.8999, lng: 100.6500 },
    "ปากเกร็ด, นนทบุรี": { lat: 13.914298, lng: 100.518669 },
    "เมือง, ชลบุรี": { lat: 13.361927, lng: 100.984024 },
    "เมือง, อยุธยา": { lat: 14.35626, lng: 100.56942 },
    "เมือง, ระยอง": { lat: 13.6315, lng: 101.5847 },
    "เมือง, สมุทรปราการ": { lat: 13.600000, lng: 100.600000 },
    "เมือง, นครราชสีมา": { lat: 14.977465, lng: 102.062363 },
};

// ⚡️ ฟังก์ชันช่วยในการค้นหาชื่อสถานที่จากพิกัด ⚡️
const getLocationName = (geoString: string): string => {
    if (!geoString) return "ไม่ระบุตำแหน่ง";

    const [latStr, lngStr] = geoString.split(',').map(s => s.trim());
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    
    // ตั้งค่า Tolerance สำหรับการเปรียบเทียบตัวเลขทศนิยม
    const LAT_TOLERANCE = 0.0001; 
    
    // 1. ค้นหาชื่อสถานที่จาก Object locations
    const foundEntry = Object.entries(locations).find(([name, coords]) => {
        // ใช้การเปรียบเทียบค่าที่ใกล้เคียง
        return Math.abs(coords.lat - lat) < LAT_TOLERANCE &&
            Math.abs(coords.lng - lng) < LAT_TOLERANCE;
    });

    // 2. ถ้าเจอชื่อสถานที่ ให้คืนค่าชื่อ
    if (foundEntry) {
        return foundEntry[0]; 
    }

    // 3. ถ้าไม่เจอชื่อสถานที่ ให้คืนค่าพิกัดที่ถูกจัดรูปแบบ (เพื่อ Debug และความสะอาดตา)
    if (!isNaN(lat) && !isNaN(lng)) {
        // จัดรูปแบบให้เหลือทศนิยม 4 ตำแหน่ง
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; 
    }
    
    return geoString; 
};


function OverviewPage({ onSelect, orders }: { onSelect: (o: Order) => void; orders: Order[] }) {
    const [query, setQuery] = React.useState("");
    const [showAdd, setShowAdd] = React.useState(false);
    const [list, setList] = React.useState<Order[]>(orders);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const ORDERS_API_URL = "/api/Orders";

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. ดึงข้อมูล Order ทั้งหมด
                const response = await fetch(ORDERS_API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} from Orders API`);
                }
                const rawOrders: OrderData[] = await response.json();

                console.log("--- API LOG: Raw Orders Data ---");
                console.log(rawOrders);
                console.log("--------------------------------");

                // 2. แมปข้อมูล Order ให้เป็น Order Type สำหรับตาราง
                const mappedOrders: Order[] = rawOrders.map((order) => {

                    const latestDelivery = order.deliveries && order.deliveries.length > 0
                        ? order.deliveries[order.deliveries.length - 1]
                        : null;

                    const deliveryDate = latestDelivery
                        ? new Date(latestDelivery.deliveryDateTime)
                        : new Date();

                    // ⚡️ LOCATION: ใช้ฟังก์ชัน getLocationName ในการแปลงพิกัดเป็นชื่อสถานที่ ⚡️
                    const location = getLocationName(order.geoLocationEnd);

                    return {
                        id: order.orderId,
                        date: deliveryDate.toLocaleDateString('th-TH', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }),
                        customer: order.customer,
                        status: order.status,
                        location: location, // ใช้ชื่อสถานที่ (อำเภอ, จังหวัด) ที่แปลงแล้ว หรือพิกัดที่ถูกจัดรูปแบบ
                    } as Order;
                });

                // 3. Reverse ข้อมูลเพื่อให้รายการล่าสุดอยู่ด้านบน
                const reversedOrders = mappedOrders.reverse();

                console.log("--- FINAL LOG: Mapped Orders (Ready for Table) ---");
                console.log("Note: This array is reversed to show the latest item first.");
                console.log(reversedOrders);
                console.log("--------------------------------------------------");

                setList(reversedOrders);
                setError(null);

            } catch (e) {
                console.error("Failed to fetch Order data:", e);
                setError("ไม่สามารถดึงข้อมูล Orders ได้: " + (e as Error).message);
                setList(orders);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filtered = list.filter((o) =>
        [o.id, o.customer, o.date, o.status, o.location].join(" ").toLowerCase().includes(query.toLowerCase())
    );

    const [form, setForm] = React.useState<Order>({ id: "OR123999", date: "01/03/2024", customer: "New Customer", status: "Check In", location: "เมือง, กรุงเทพมหานคร" });

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
                    {/* แสดงสถานะการโหลด/ข้อผิดพลาด */}
                    {loading && (
                        <div className="p-4 text-center text-primary">
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            <span>กำลังดึงข้อมูล...</span>
                        </div>
                    )}
                    {error && <div className="p-4 text-center text-danger">⚠️ {error}</div>}

                    {!loading && !error && filtered.length > 0 ? (
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
                    ) : !loading && !error && (
                        <div className="p-4 text-center text-muted">ไม่พบรายการ Order</div>
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