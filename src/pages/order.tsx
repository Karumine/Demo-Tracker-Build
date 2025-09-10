import React, { useState } from "react";

// Simple inline icons (no external libs)
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const BoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <path d="M3.27 6.96L12 12l8.73-5.04M12 22V12"/>
  </svg>
);
const TruckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M3 7h9v7H3zM12 10h4l3 3v1h-7z"/>
    <circle cx="7.5" cy="18" r="2"/>
    <circle cx="17.5" cy="18" r="2"/>
  </svg>
);
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>
);
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.11 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.6a2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l.57-1.25a2 2 0 0 1 2.11-.45c.83.28 1.7.48 2.6.6A2 2 0 0 1 22 16.92z"/>
  </svg>
);

// Timeline bullet component
function Stage({ icon, label, time, active }: { icon: React.ReactNode; label: string; time: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className={`flex items-center justify-center w-9 h-9 rounded-full shadow-sm ${active ? "bg-orange-500 text-white" : "bg-white text-slate-700"}`}>{icon}</div>
      <div className="mt-2 text-sm font-medium text-slate-800">{label}</div>
      <div className="text-xs text-slate-500">{time}</div>
    </div>
  );
}

// Badge
function Badge({ color, children }: { color: "green"|"blue"|"orange"|"purple"|"gray"; children: React.ReactNode }) {
  const map: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-violet-100 text-violet-700",
    gray: "bg-slate-100 text-slate-700",
  };
  return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${map[color]}`}>{children}</span>;
}

// Emoji rating button
const Emoji = ({ label, onClick, active, bg }: { label: string; onClick: () => void; active?: boolean; bg: string }) => (
  <button onClick={onClick} className={`w-14 h-14 rounded-full grid place-items-center text-2xl transition-transform ${active ? "scale-105 ring-4 ring-black/5" : "hover:scale-105"}`} style={{ background: bg }} aria-label={label}>
    {label}
  </button>
);

const avatarUrl = "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=160&auto=format&fit=crop";
const boxUrl = "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=200&auto=format&fit=crop";

type Order = { id: string; date: string; customer: string; status: "Delivered"|"Check out"|"On delivery"|"Check in"; rating: number };

function StatusPill({status}:{status: Order["status"]}){
  const map: Record<Order["status"], string> = {
    Delivered: "bg-emerald-100 text-emerald-700",
    "Check out": "bg-orange-100 text-orange-700",
    "On delivery": "bg-red-100 text-red-700",
    "Check in": "bg-blue-100 text-blue-700",
  };
  return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${map[status]}`}>{status}</span>
}

function RatingDots({value}:{value:number}){
  return (
    <div className="flex gap-1">
      {[0,1,2,3].map(i=> (
        <span key={i} className={`w-2.5 h-2.5 rounded-full ${i<value?"bg-slate-800":"bg-slate-300"}`}/>
      ))}
    </div>
  )
}

function Overview({onSelect}:{onSelect:(o:Order)=>void}){
  const [query,setQuery]=React.useState("");
  const [showAdd,setShowAdd]=React.useState(false);
  const [list,setList]=React.useState<Order[]>([
    {id:"OR123460",date:"01/03/2024",customer:"Customer",status:"Delivered",rating:4},
    {id:"OR123459",date:"01/03/2024",customer:"Customer",status:"Check out",rating:3},
    {id:"OR123458",date:"01/03/2024",customer:"Customer",status:"On delivery",rating:2},
    {id:"OR123457",date:"01/03/2024",customer:"Customer",status:"Check in",rating:3},
    {id:"OR123453",date:"01/03/2024",customer:"Customer",status:"Check in",rating:3},
    {id:"OR123462",date:"01/03/2024",customer:"Customer",status:"On delivery",rating:3},
    {id:"OR123440",date:"01/03/2024",customer:"Customer",status:"On delivery",rating:4},
  ]);

  const filtered = list.filter(o=>
    [o.id,o.customer,o.date,o.status].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  // simple add form state
  const [form,setForm]=React.useState<Order>({id:"OR123999",date:"01/03/2024",customer:"New Customer",status:"Check in",rating:0});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Tracking Overview</h1>
        <div className="flex gap-2">
          <div className="relative">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search" className="pl-3 pr-3 py-2 rounded-xl border border-slate-200 text-sm"/>
          </div>
          <button onClick={()=>setShowAdd(true)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm shadow-sm">Add Order</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_0.7fr] gap-3 px-6 py-3 text-slate-500 text-sm font-semibold border-b"> 
          <div>ORDER</div><div>DATE</div><div>CUSTOMER</div><div>STATUS</div><div>RATING</div>
        </div>
        {filtered.map((o,idx)=> (
          <button key={o.id} onClick={()=>onSelect(o)} className={`w-full text-left grid grid-cols-[1.2fr_1fr_1fr_1fr_0.7fr] gap-3 px-6 py-4 items-center hover:bg-slate-50 ${idx!==(filtered.length-1)?"border-b":''}`}>
            <div className="font-semibold">{o.id}</div>
            <div>{o.date}</div>
            <div>{o.customer}</div>
            <div><StatusPill status={o.status}/></div>
            <div><RatingDots value={o.rating}/></div>
          </button>
        ))}
      </div>

      {/* Add Order Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[520px]">
            <div className="text-lg font-semibold mb-4">Add Order</div>
            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1 text-sm">Order No.<input className="border rounded-lg px-3 py-2" value={form.id} onChange={e=>setForm({...form,id:e.target.value})}/></label>
              <label className="grid gap-1 text-sm">Date<input className="border rounded-lg px-3 py-2" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label>
              <label className="grid gap-1 text-sm col-span-2">Customer<input className="border rounded-lg px-3 py-2" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})}/></label>
              <label className="grid gap-1 text-sm">Status
                <select className="border rounded-lg px-3 py-2" value={form.status} onChange={e=>setForm({...form,status:e.target.value as Order["status"]})}>
                  <option>Delivered</option>
                  <option>Check out</option>
                  <option>On delivery</option>
                  <option>Check in</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">Rating
                <input type="number" min={0} max={4} className="border rounded-lg px-3 py-2" value={form.rating} onChange={e=>setForm({...form,rating:Math.max(0,Math.min(4,Number(e.target.value)))})}/>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={()=>setShowAdd(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button onClick={()=>{setList(prev=>[form,...prev]); setShowAdd(false);}} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailDemo(){
  const [page,setPage]=React.useState<"overview"|"detail">("overview");
  const [selected,setSelected]=React.useState<Order|null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top header bar */}
      <div className="h-14 bg-white shadow-sm flex items-center px-4"> 
        <div className="font-semibold">Company</div>
        <div className="ml-auto text-sm text-slate-500">Demo</div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-[260px_1fr] gap-6 px-6 py-8">
        {/* Sidebar */}
        <aside className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1">
          <div className="text-slate-400 text-xs px-3 pb-2">Navigation</div>
          {[
            { name: "Orders", active: true },
            { name: "Drivers" },
            { name: "Customers" },
            { name: "Reports" },
          ].map((m) => (
            <button key={m.name} className={`text-left px-3 py-2 rounded-xl hover:bg-slate-100 ${m.active ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700"}`}>{m.name}</button>
          ))}
        </aside>

        {/* Main content switch */}
        <main className="space-y-6">
          {page==="overview" && (
            <Overview onSelect={(o)=>{setSelected(o); setPage("detail");}}/>
          )}

          {page==="detail" && (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <button onClick={()=>setPage("overview")} className="text-sm text-blue-600 mb-2">← Back to Orders</button>
                  <h1 className="text-2xl font-bold">Order {selected?.id ?? "#12345"}</h1>
                  <p className="text-slate-500 text-sm">Placed on October 22, 2023</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-700 text-sm">Print</button>
                  <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm shadow-sm">Sync Delivery</button>
                </div>
              </div>

              {/* Timeline */}
              <section className="bg-white rounded-2xl shadow-sm p-4">
                <div className="grid grid-cols-5 gap-4 items-start">
                  {[
                    { label: "Confirmed", time: "10:30 AM", icon: <CheckIcon className="w-5 h-5"/> },
                    { label: "Check In", time: "11:15 AM", icon: <BoxIcon className="w-5 h-5"/> },
                    { label: "On Delivery", time: "1:45 PM", icon: <TruckIcon className="w-5 h-5"/>, active: true },
                    { label: "Check Out", time: "3:30 PM", icon: <ArrowRightIcon className="w-5 h-5"/> },
                    { label: "Delivered", time: "4:00 PM", icon: <CheckIcon className="w-5 h-5"/> },
                  ].map((s,i)=> (
                    <div key={i} className="relative">
                      <Stage icon={s.icon} label={s.label} time={s.time} active={s.active}/>
                      {i<4 && <div className="hidden md:block absolute top-4 left-1/2 right-[-50%] h-1 bg-slate-200 -z-10"/>}
                    </div>
                  ))}
                </div>
              </section>

              {/* Recipient + Driver */}
              <section className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="text-slate-500 text-sm">Delivering to</div>
                  <div className="mt-1 font-semibold">John Doe</div>
                  <div className="text-slate-500">+1 234 567 89000</div>
                  <div className="mt-3 flex gap-2 text-sm text-slate-600">
                    <Badge color="green">Priority</Badge>
                    <Badge color="gray">Pallet #CTN0001</Badge>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
                  <img src={avatarUrl} alt="Driver avatar" className="w-14 h-14 rounded-full object-cover"/>
                  <div className="flex-1">
                    <div className="font-semibold">Michael Smith</div>
                    <div className="text-slate-500 text-sm flex items-center gap-1"><PhoneIcon className="w-4 h-4"/> +1 987 654 3210</div>
                    <div className="text-slate-500 text-sm">Vehicle <span className="font-semibold text-slate-800">DEF-4567</span></div>
                  </div>
                  <button className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm">Call</button>
                </div>
              </section>

              {/* POD + Map */}
              <section className="grid md:grid-cols-2 gap-6 items-stretch">
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="font-semibold mb-3">Proof of Delivery</div>
                  <div className="flex items-center gap-3">
                    <img src={boxUrl} className="w-28 h-20 object-cover rounded-xl" alt="Parcel photo"/>
                    <div className="grid gap-1">
                      <div className="grid place-items-center w-28 h-20 rounded-xl border border-slate-200 text-2xl">Jr</div>
                      <a className="text-blue-600 text-sm" href="#">PackingList.pdf</a>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="font-semibold mb-3">Live Map</div>
                  <div className="relative w-full h-44 md:h-[210px] rounded-xl overflow-hidden bg-[linear-gradient(135deg,#e5e7eb_12px,transparent_12px),linear-gradient(225deg,#e5e7eb_12px,transparent_12px),linear-gradient(45deg,#e5e7eb_12px,transparent_12px),linear-gradient(315deg,#e5e7eb_12px,transparent_12px)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Rating */}
              <section className="bg-white rounded-2xl shadow-sm p-5">
                <div className="font-semibold mb-3">Customer Rating</div>
                <div className="flex gap-4 items-center">
                  {[
                    {label:"😡", bg:"#fee2e2"},
                    {label:"😕", bg:"#fde68a"},
                    {label:"🙂", bg:"#fef08a"},
                    {label:"😊", bg:"#d9f99d"},
                    {label:"🟢", bg:"#86efac"},
                  ].map((e, idx) => (
                    <Emoji key={idx} label={e.label} bg={e.bg} active={false} onClick={()=>{}} />
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}