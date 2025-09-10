export type Order = {
    id: string;
    date: string;
    customer: string;
    status: "Delivered" | "Check out" | "On Delivery" | "Check In";
    location: string; // ข้อมูล Location เช่น "อ.เมือง, จ.เชียงใหม่"
};