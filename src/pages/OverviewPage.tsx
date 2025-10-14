import React from "react";
import StatusPill from "../components/StatusPill";
import { Order } from "../types"; // สมมติว่า Order type มี id, date, customer, status, location

// =======================================================
// 1. Interfaces และ Data Structures
// =======================================================

interface DeliveryData {
    deliveryId: string;
    sender: string;
    receiver: string;
    deliveryDateTime: string;
    receiveDateTime: string;
    signature: string;
    orderIds: string[];
    geoLocationCheckin?: string;
    geoLocationCheckout?: string;
}

interface OrderData {
    orderId: string;
    productName: string;
    amount: number;
    unit: string;
    customer: string;
    status: string;
    geoLocationStart: string;
    geoLocationEnd: string;
    deliveries: DeliveryData[];
}

interface NewOrderForm extends Order {
    item: string;
    quantity: number;
}

// ⚡️ ตารางพิกัดจำลองสำหรับ Reverse Lookup ⚡️
const locations: { [key: string]: { lat: number; lng: number } } = {
    "เมือง, กรุงเทพมหานคร": { lat: 13.7563, lng: 100.5018 },
    "บางนา, กรุงเทพมหานคร": { lat: 13.6841, lng: 100.6127 },
    "ถลาง, ภูเก็ต": { lat: 8.0400, lng: 98.3129 },
    "เมือง, เชียงใหม่": { lat: 18.7909, lng: 98.9850 },
    "หาดใหญ่, สงขลา": { lat: 7.0051, lng: 100.4705 },
    "เมือง, ขอนแก่น": { lat: 16.4323, lng: 102.8227 },
    "บางละมุง, ชลบุรี": { lat: 12.9806, lng: 100.9161 },
    "ปากเกร็ด, นนทบุรี": { lat: 13.9142, lng: 100.5186 },
    "เมือง, อยุธยา": { lat: 14.3562, lng: 100.5694 },
    "เมือง, นครราชสีมา": { lat: 14.9774, lng: 102.0623 },
    "ปากเกร็ด, นนทบุรี_MOCK": { lat: 13.9142, lng: 100.5186 },
};

// ⚡️ Mock Data (อัปเดตให้ตรงกับภาพ) ⚡️
const MOCK_ORDERS_DATA: OrderData[] = [
    {
        orderId: "OR2024005",
        productName: "Drone Mavic Pro",
        amount: 1,
        unit: "Unit",
        customer: "คุณอรุณรัตน์",
        status: "Check In",
        geoLocationStart: "13.7563, 100.5018",
        geoLocationEnd: "13.9142, 100.5186",
        deliveries: [
            { deliveryId: "D005", sender: "SCG", receiver: "คุณอรุณรัตน์", deliveryDateTime: "2025-10-14T08:00:00Z", receiveDateTime: "", signature: "", orderIds: ["OR2024005"] }
        ],
    },
    {
        orderId: "OR2024002",
        productName: "Server Rack 42U",
        amount: 2,
        unit: "Unit",
        customer: "ธนาคาร Xyz",
        status: "Check out",
        geoLocationStart: "13.6841, 100.6127",
        geoLocationEnd: "14.9774, 102.0623",
        deliveries: [
            { deliveryId: "D002", sender: "WH BNA", receiver: "Kerry Express", deliveryDateTime: "2025-05-14T12:00:00Z", receiveDateTime: "", signature: "", orderIds: ["OR2024002"], geoLocationCheckin: "13.6841, 100.6127" }
        ],
    },
    {
        orderId: "OR2024001",
        productName: "Laptop Model X",
        amount: 5,
        unit: "Pcs",
        customer: "บริษัท นวัตกรรม จำกัด",
        status: "Delivered",
        geoLocationStart: "13.7563, 100.5018",
        geoLocationEnd: "18.7909, 98.9850",
        deliveries: [
            { deliveryId: "D001", sender: "WH BKK", receiver: "SCG Logistics", deliveryDateTime: "2025-05-10T10:00:00Z", receiveDateTime: "2025-05-10T15:30:00Z", signature: "Signed", orderIds: ["OR2024001"], geoLocationCheckin: "13.7562, 100.5017", geoLocationCheckout: "18.7909, 98.9850" }
        ],
    },
];

// ... (โค้ด getLocationName เดิม) ...
const getLocationName = (geoString: string): string => {
    if (!geoString) return "ไม่ระบุตำแหน่ง";

    const [latStr, lngStr] = geoString.split(',').map(s => s.trim());
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    const LAT_TOLERANCE = 0.0002;

    const foundEntry = Object.entries(locations).find(([name, coords]) => {
        return Math.abs(coords.lat - lat) < LAT_TOLERANCE &&
            Math.abs(coords.lng - lng) < LAT_TOLERANCE;
    });

    if (foundEntry) {
        return foundEntry[0].replace(/_MOCK$/, '');
    }

    if (!isNaN(lat) && !isNaN(lng)) {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    return geoString;
};

// ... (โค้ด QrCodeModal เดิม) ...
interface QrCodeModalProps {
    order: Order;
    onClose: () => void;
}

const generateQRCodeUrl = (orderId: string, locationType: 'Checkin' | 'Checkout') => {
    const baseApi = "https://api2.agile.in.th/scan";
    const dataToEmbed = `${baseApi}/${orderId}/${locationType}`;
    return `https://quickchart.io/qr?text=${encodeURIComponent(dataToEmbed)}&size=150&ecLevel=H`;
};

const QrCodeModal: React.FC<QrCodeModalProps> = ({ order, onClose }) => {
    const checkinQrUrl = generateQRCodeUrl(order.id, 'Checkin');
    const checkoutQrUrl = generateQRCodeUrl(order.id, 'Checkout');

    const handlePrint = () => {
        window.print();
    };

    const OrderDetailsBlock = () => (
        <div className="order-details-print-header mb-4 p-3 border rounded bg-light">
            <h6 className="fw-bold text-primary">รายละเอียด Order: #{order.id}</h6>
            <div className="row small">
                <div className="col-4"><strong>Customer:</strong> {order.customer}</div>
                <div className="col-4"><strong>Date:</strong> {order.date}</div>
                <div className="col-4"><strong>Status:</strong> <StatusPill status={order.status} /></div>
                <div className="col-12 mt-2"><strong>Delivery To:</strong> {order.location}</div>
                <div className="col-12 small text-muted">Geo Target: {order.location}</div>
            </div>
        </div>
    );

    return (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1} role="dialog" onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={e => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title fw-bold">QR Code & Details: Order #{order.id}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="row g-4">
                            <div className="col-md-5 border-end">
                                <h6 className="fw-bold mb-3 text-primary">รายละเอียด Order</h6>
                                <p className="mb-1 small"><strong>Customer:</strong> {order.customer}</p>
                                <p className="mb-1 small"><strong>Date:</strong> {order.date}</p>
                                <p className="mb-1 small"><strong>Status:</strong> <StatusPill status={order.status} /></p>
                                <p className="mb-1 small"><strong>Delivery To:</strong> {order.location}</p>
                                <p className="mb-1 small text-muted">Geo Target: {order.location}</p>
                            </div>
                            <div className="col-md-7">
                                <h6 className="fw-bold mb-3 text-success">QR Code สำหรับการยืนยันพิกัด</h6>
                                <div className="d-flex justify-content-around">
                                    <div className="text-center">
                                        <div className="small fw-bold text-muted mb-2">1. Check-in (จุดรับ)</div>
                                        <img src={checkinQrUrl} alt="Check-in QR" style={{ width: '200px', height: '200px' }} className="border p-1" />
                                        <p className="small mt-2 text-danger">สแกน ณ จุดรับสินค้า</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="small fw-bold text-muted mb-2">2. Check-out (จุดส่ง)</div>
                                        <img src={checkoutQrUrl} alt="Check-out QR" style={{ width: '200px', height: '200px' }} className="border p-1" />
                                        <p className="small mt-2 text-danger">สแกน ณ จุดส่งสินค้า</p>
                                    </div>
                                </div>
                                <div className="alert alert-info small mt-4">
                                    ℹ️ QR Code จะบันทึก **ละติจูด/ลองจิจูด** ที่พนักงานสแกน
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        <button type="button" className="btn btn-primary" onClick={handlePrint}>
                            <i className="bi bi-printer me-1"></i> Print QR Codes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// =======================================================
// 4. OverviewPage Component
// =======================================================

function OverviewPage({ onSelect, orders }: { onSelect: (o: Order) => void; orders: Order[] }) {
    const [query, setQuery] = React.useState("");
    const [showAdd, setShowAdd] = React.useState(false);
    const [showQrModal, setShowQrModal] = React.useState<Order | null>(null);

    const [list, setList] = React.useState<Order[]>(orders);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadMockData = () => {
            setTimeout(() => {
                const mappedOrders: Order[] = MOCK_ORDERS_DATA.map((order) => {
                    const latestDelivery = order.deliveries && order.deliveries.length > 0
                        ? order.deliveries[order.deliveries.length - 1]
                        : null;

                    const dateString = latestDelivery?.receiveDateTime || latestDelivery?.deliveryDateTime || new Date().toISOString();
                    const deliveryDate = new Date(dateString);

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
                        location: location,
                    } as Order;
                });

                const reversedOrders = mappedOrders.reverse();

                setList(reversedOrders);
                setError(null);
                setLoading(false);

            }, 1000);
        };

        loadMockData();
    }, []);

    const filtered = list.filter((o) =>
        [o.id, o.customer, o.date, o.status, o.location].join(" ").toLowerCase().includes(query.toLowerCase())
    );

    const initialFormState: NewOrderForm = {
        id: "OR" + Math.floor(Math.random() * 100000), // สร้าง ID ใหม่ทุกครั้ง
        date: new Date().toLocaleDateString('th-TH'),
        customer: "",
        status: "Check In",
        location: "เมือง, กรุงเทพมหานคร",
        item: "สินค้า A", // ค่าเริ่มต้นของสินค้า
        quantity: 1 // ค่าเริ่มต้นของจำนวน
    };

    const [form, setForm] = React.useState<NewOrderForm>(initialFormState);

    const handleCreateOrder = () => {
        // สร้าง Order Object ที่จะถูกเพิ่ม (ตัด item/quantity ออก เพื่อให้ตรงกับ Order[] interface)
        const newOrder: Order = {
            id: form.id,
            date: form.date,
            customer: form.customer,
            status: form.status,
            location: form.location,
        };

        setList((prev) => [newOrder, ...prev]);
        setShowAdd(false);

        // รีเซ็ตฟอร์มสำหรับ Order ถัดไป
        setForm({
            ...initialFormState,
            id: "OR" + Math.floor(Math.random() * 100000), // สร้าง ID ใหม่ที่ไม่ซ้ำ
            date: new Date().toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            customer: "",
        });
    };

    return (
        <div className="container py-4">
            <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-center mb-4">
                <h1 className="h2 mb-3 mb-md-0">📦 Order Tracking Overview (Mock Data)</h1>
                <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
                    <div className="position-relative w-100 w-sm-auto">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search Order, Customer, Status..."
                            className="form-control"
                        />
                    </div>
                    <button onClick={() => setShowAdd(true)} className="btn btn-primary w-100 w-sm-auto">
                        + Add New Order
                    </button>
                </div>
            </div>

            <div className="card shadow-sm">
                {/* ⚡️ ส่วนที่ 1: หัวข้อตาราง (Header) - รวม 12 คอลัมน์ ⚡️ */}
                <div className="card-header bg-light text-secondary fw-bold d-none d-md-block">
                    <div className="row align-items-center">
                        <div className="col-md-2 ">ORDER</div>
                        <div className="col-md-2">DATE</div>
                        <div className="col-md-3">CUSTOMER</div>
                        <div className="col-md-2 ">STATUS</div>
                        <div className="col-md-2">LOCATION</div>
                        <div className="col-md-1 text-center">QR</div>
                    </div>
                </div>

                <div className="list-group list-group-flush">
                    {/* แสดงสถานะการโหลด/ข้อผิดพลาด */}
                    {loading && (
                        <div className="p-4 text-center text-primary">
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            <span>กำลังจำลองการโหลดข้อมูล Order...</span>
                        </div>
                    )}
                    {error && <div className="p-4 text-center text-danger">⚠️ {error}</div>}

                    {!loading && !error && filtered.length > 0 ? (
                        filtered.map((o) => (
                            <div
                                key={o.id}
                                className="list-group-item list-group-item-action"
                            >
                                <div className="row align-items-center">

                                    {/* Order ID (col-md-2) */}
                                    <div
                                        className="col-md-2 d-flex align-items-center cursor-pointer"
                                        onClick={() => onSelect(o)}
                                    >
                                        <span className="d-inline d-md-none fw-bold me-1">ORDER: </span>
                                        <span className="fw-bold text-primary">{o.id}</span>
                                    </div>

                                    {/* Date (col-md-2) */}
                                    <div
                                        className="col-md-2 d-flex align-items-center cursor-pointer"
                                        onClick={() => onSelect(o)}
                                    >
                                        <span className="d-inline d-md-none fw-bold me-1">Date: </span>
                                        {o.date}
                                    </div>

                                    {/* Customer (col-md-3) */}
                                    <div
                                        className="col-md-3 text-truncate d-flex align-items-center cursor-pointer"
                                        onClick={() => onSelect(o)}
                                    >
                                        <span className="d-inline d-md-none fw-bold me-1">Customer: </span>
                                        {o.customer}
                                    </div>

                                    {/* Status (col-md-2) */}
                                    <div
                                        className="col-md-2  d-flex align-items-center cursor-pointer"
                                        onClick={() => onSelect(o)}
                                    >
                                        <span className="d-inline d-md-none fw-bold me-1">Status: </span>
                                        <StatusPill status={o.status} />
                                    </div>

                                    {/* Location (col-md-2) */}
                                    <div
                                        className="col-md-2 p-3 text-truncate d-flex align-items-center cursor-pointer"
                                        onClick={() => onSelect(o)}
                                    >
                                        <span className="d-inline d-md-none fw-bold me-1">Location: </span>
                                        {o.location}
                                    </div>

                                    {/* ⚡️ ปุ่ม QR Code (col-md-1) ⚡️ */}
                                    <div className="col-md-1 col-12 d-flex justify-content-center align-items-center p-3 p-md-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // สำคัญมาก
                                                setShowQrModal(o);
                                            }}
                                            className="btn btn-sm btn-outline-info"
                                            title="View QR Codes"
                                        >
                                            <i className="bi bi-qr-code"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : !loading && !error && filtered.length > 0 ? (
                        filtered.map((o) => (
                            <div
                                key={o.id}
                                className="list-group-item list-group-item-action"
                            >
                                <div className="row g-0 align-items-center">
                                    {/* ... (รายการข้อมูลเดิม) ... */}
                                </div>
                            </div>
                        ))
                    ) : !loading && !error && (
                        <div className="p-4 text-center text-muted">ไม่พบรายการ Order</div>
                    )}
                </div>
            </div>

            {/* Modal Add Order */}
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
                                <h5 className="modal-title">Add New Order (Mock)</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAdd(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="row g-3">
                                        {/* Order No. - แก้ไขให้เป็น System Generated และอ่านได้อย่างเดียว */}
                                        <div className="col-12">
                                            <label htmlFor="orderNo" className="form-label">Order No. (System Generated)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="orderNo"
                                                value={form.id}
                                                disabled // 👈 ทำให้แก้ไขไม่ได้
                                            />
                                        </div>

                                        {/* Customer */}
                                        <div className="col-12">
                                            <label htmlFor="customer" className="form-label">Customer Name</label>
                                            <input type="text" className="form-control" id="customer" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required />
                                        </div>

                                        {/* Location - เปลี่ยนเป็น Dropdown เพื่อให้ค่าตรงกับ Mock Data */}
                                        <div className="col-12">
                                            <label htmlFor="location" className="form-label">Location</label>
                                            <select
                                                className="form-select"
                                                id="location"
                                                value={form.location}
                                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                                required
                                            >
                                                <option value="เมือง, กรุงเทพมหานคร">ออฟฟิศ กทม.</option>
                                                <option value="เมือง, เชียงใหม่">คลังสินค้า เชียงใหม่</option>
                                                <option value="บางบ่อ, สมุทรปราการ">โรงงานหลัก สมุทรปราการ</option>
                                            </select>
                                        </div>

                                        {/* ⚡️ ส่วนที่เพิ่มใหม่: Item และ Quantity ⚡️ */}
                                        <div className="col-md-6">
                                            <label htmlFor="item" className="form-label">Item Name (Mock)</label>
                                            <input type="text" className="form-control" id="item" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="quantity" className="form-label">Quantity</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="quantity"
                                                value={form.quantity}
                                                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                                                min="1"
                                                required
                                            />
                                        </div>
                                        {/* สิ้นสุดส่วนที่เพิ่มใหม่ */}

                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreateOrder}
                                    // 👈 ปรับปรุงเงื่อนไข disabled ให้ตรวจสอบ Item และ Quantity ด้วย
                                    disabled={!form.customer || !form.location || !form.item || form.quantity < 1}
                                >
                                    Create Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal แสดง QR Code */}
            {showQrModal && (
                <QrCodeModal
                    order={showQrModal}
                    onClose={() => setShowQrModal(null)}
                />
            )}
        </div>
    );
}

export default OverviewPage;