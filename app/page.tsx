"use client";

import { useMemo, useState } from "react";
import {
  BedDouble,
  Bell,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  DoorOpen,
  KeyRound,
  MessageSquareText,
  Moon,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

type RoomStatus = "Occupied" | "Arriving" | "Departing" | "Vacant";
type CleanStatus = "Clean" | "Dirty" | "Needs Inspection";
type FilterKey = "All" | RoomStatus | "Dirty";

type Room = {
  id: string;
  tier: string;
  floor: number;
  status: RoomStatus;
  guest: string;
  initials: string;
  eta: string;
  clean: CleanStatus;
  rate: number;
  checkIn: string;
  checkOut: string;
  vip: string;
  veraNote: string;
};

type ChatMessage = {
  role: "staff" | "vera";
  content: string;
};

const INITIAL_ROOMS: Room[] = [
  { id: "101", tier: "Deluxe King", floor: 1, status: "Occupied", guest: "Elena Rostova", initials: "ER", eta: "In-Room", clean: "Clean", rate: 450, checkIn: "Aug 3", checkOut: "Aug 7", vip: "VIP Tier - 4th Stay", veraNote: "Guest requested extra feather pillows and a high floor." },
  { id: "102", tier: "Standard Queen", floor: 1, status: "Departing", guest: "Marcus Vance", initials: "MV", eta: "Out 11:00 AM", clean: "Needs Inspection", rate: 320, checkIn: "Aug 2", checkOut: "Aug 4", vip: "Standard", veraNote: "Express checkout requested via SMS." },
  { id: "103", tier: "Corner Suite", floor: 1, status: "Arriving", guest: "Sarah Jenkins", initials: "SJ", eta: "At 2:00 PM", clean: "Dirty", rate: 680, checkIn: "Aug 4", checkOut: "Aug 8", vip: "VIP Platinum", veraNote: "Early check-in requested at 1:30 PM." },
  { id: "104", tier: "Deluxe Queen", floor: 1, status: "Occupied", guest: "Luca Moretti", initials: "LM", eta: "In-Room", clean: "Clean", rate: 390, checkIn: "Aug 1", checkOut: "Aug 5", vip: "Standard", veraNote: "Prefers sparkling water at turndown." },
  { id: "105", tier: "Loft King", floor: 1, status: "Occupied", guest: "Nadia Patel", initials: "NP", eta: "In-Room", clean: "Clean", rate: 520, checkIn: "Aug 3", checkOut: "Aug 6", vip: "Corporate Plus", veraNote: "Late checkout approved until 1:00 PM." },
  { id: "106", tier: "Atelier Suite", floor: 1, status: "Arriving", guest: "Theo Morrison", initials: "TM", eta: "At 5:45 PM", clean: "Clean", rate: 740, checkIn: "Aug 4", checkOut: "Aug 7", vip: "VIP Gold", veraNote: "Anniversary stay. Add handwritten welcome card." },
  { id: "201", tier: "Penthouse Suite", floor: 2, status: "Occupied", guest: "Julian Thorne", initials: "JT", eta: "In-Room", clean: "Clean", rate: 1200, checkIn: "Aug 2", checkOut: "Aug 9", vip: "Ultra VIP", veraNote: "Champagne bottle delivered to suite." },
  { id: "202", tier: "Deluxe King", floor: 2, status: "Vacant", guest: "Available", initials: "A", eta: "Ready", clean: "Clean", rate: 480, checkIn: "-", checkOut: "-", vip: "-", veraNote: "Inspected by Housekeeping Supervisor at 9:30 AM." },
  { id: "203", tier: "Standard Queen", floor: 2, status: "Arriving", guest: "David Kim", initials: "DK", eta: "At 4:15 PM", clean: "Clean", rate: 310, checkIn: "Aug 4", checkOut: "Aug 6", vip: "Corporate Member", veraNote: "Online pre-check-in completed." },
  { id: "204", tier: "Corner Suite", floor: 2, status: "Occupied", guest: "Amara Holt", initials: "AH", eta: "In-Room", clean: "Clean", rate: 690, checkIn: "Aug 1", checkOut: "Aug 4", vip: "VIP Platinum", veraNote: "Do not disturb until noon." },
  { id: "205", tier: "Deluxe Queen", floor: 2, status: "Occupied", guest: "Mika Sato", initials: "MS", eta: "In-Room", clean: "Clean", rate: 410, checkIn: "Aug 3", checkOut: "Aug 5", vip: "Standard", veraNote: "Guest asked about museum tickets." },
  { id: "206", tier: "Terrace King", floor: 2, status: "Departing", guest: "Iris Fontaine", initials: "IF", eta: "Out 12:00 PM", clean: "Dirty", rate: 560, checkIn: "Aug 1", checkOut: "Aug 4", vip: "VIP Gold", veraNote: "Send folio to assistant before checkout." },
  { id: "301", tier: "Deluxe King", floor: 3, status: "Occupied", guest: "Oscar Bennett", initials: "OB", eta: "In-Room", clean: "Clean", rate: 470, checkIn: "Aug 2", checkOut: "Aug 6", vip: "Standard", veraNote: "Requested a quiet room away from elevator." },
  { id: "302", tier: "Standard Queen", floor: 3, status: "Occupied", guest: "Priya Rao", initials: "PR", eta: "In-Room", clean: "Clean", rate: 335, checkIn: "Aug 3", checkOut: "Aug 8", vip: "Corporate Member", veraNote: "Breakfast meeting at 8:00 AM in the lounge." },
  { id: "303", tier: "Corner Suite", floor: 3, status: "Arriving", guest: "Leo Hart", initials: "LH", eta: "At 6:30 PM", clean: "Dirty", rate: 705, checkIn: "Aug 4", checkOut: "Aug 10", vip: "VIP Silver", veraNote: "Flight delayed. Offer late dinner options." },
  { id: "304", tier: "Deluxe Queen", floor: 3, status: "Occupied", guest: "Grace Lin", initials: "GL", eta: "In-Room", clean: "Clean", rate: 405, checkIn: "Aug 3", checkOut: "Aug 5", vip: "Standard", veraNote: "Prefers hypoallergenic pillows." },
  { id: "305", tier: "Loft King", floor: 3, status: "Occupied", guest: "Samuel Reed", initials: "SR", eta: "In-Room", clean: "Clean", rate: 545, checkIn: "Aug 2", checkOut: "Aug 7", vip: "VIP Gold", veraNote: "Mobile key already active on iPhone." },
  { id: "306", tier: "Terrace King", floor: 3, status: "Vacant", guest: "Available", initials: "A", eta: "Ready", clean: "Clean", rate: 575, checkIn: "-", checkOut: "-", vip: "-", veraNote: "Ready for upsell to suite waitlist." },
  { id: "401", tier: "Deluxe King", floor: 4, status: "Occupied", guest: "Maya Laurent", initials: "ML", eta: "In-Room", clean: "Clean", rate: 490, checkIn: "Aug 1", checkOut: "Aug 5", vip: "VIP Platinum", veraNote: "Send spa availability for tomorrow afternoon." },
  { id: "402", tier: "Standard Queen", floor: 4, status: "Occupied", guest: "Ben Carter", initials: "BC", eta: "In-Room", clean: "Clean", rate: 340, checkIn: "Aug 4", checkOut: "Aug 6", vip: "Standard", veraNote: "Guest arrived with two garment bags." },
  { id: "403", tier: "Corner Suite", floor: 4, status: "Arriving", guest: "Ava Sinclair", initials: "AS", eta: "At 3:20 PM", clean: "Clean", rate: 720, checkIn: "Aug 4", checkOut: "Aug 9", vip: "Ultra VIP", veraNote: "Prepare private elevator greeting." },
  { id: "404", tier: "Deluxe Queen", floor: 4, status: "Occupied", guest: "Noah Weiss", initials: "NW", eta: "In-Room", clean: "Clean", rate: 415, checkIn: "Aug 2", checkOut: "Aug 5", vip: "Standard", veraNote: "Asked for Soho dinner recommendations." },
  { id: "405", tier: "Loft King", floor: 4, status: "Occupied", guest: "Talia Brooks", initials: "TB", eta: "In-Room", clean: "Clean", rate: 555, checkIn: "Aug 3", checkOut: "Aug 8", vip: "Corporate Plus", veraNote: "No minibar charges without approval." },
  { id: "406", tier: "Terrace King", floor: 4, status: "Occupied", guest: "Henry Fox", initials: "HF", eta: "In-Room", clean: "Clean", rate: 590, checkIn: "Aug 2", checkOut: "Aug 6", vip: "Standard", veraNote: "Requested wake-up call at 6:45 AM." },
];

const STATUS_STYLES: Record<RoomStatus, { chip: string; border: string; dot: string }> = {
  Occupied: {
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "border-t-emerald-400",
    dot: "bg-emerald-500",
  },
  Arriving: {
    chip: "bg-blue-50 text-blue-700 border-blue-200",
    border: "border-t-blue-400",
    dot: "bg-blue-500",
  },
  Departing: {
    chip: "bg-amber-50 text-amber-800 border-amber-200",
    border: "border-t-amber-400",
    dot: "bg-amber-500",
  },
  Vacant: {
    chip: "bg-slate-100 text-slate-600 border-slate-200",
    border: "border-t-slate-300",
    dot: "bg-slate-400",
  },
};

const CLEAN_STYLES: Record<CleanStatus, string> = {
  Clean: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Dirty: "text-rose-700 bg-rose-50 border-rose-200",
  "Needs Inspection": "text-amber-800 bg-amber-50 border-amber-200",
};

const PROMPTS = [
  "Show dirty rooms",
  "Which arrivals are pending?",
  "Run night audit preview",
];

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value: number) {
  return `${Math.round(value)}%`;
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [search, setSearch] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [veraOpen, setVeraOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "vera",
      content:
        "Good morning. The Grand Soho is at 63% occupancy with 5 arrivals pending. I am watching room readiness and front-desk exceptions.",
    },
  ]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;

  const metrics = useMemo(() => {
    const occupied = rooms.filter((room) => room.status === "Occupied").length;
    const arriving = rooms.filter((room) => room.status === "Arriving").length;
    const departing = rooms.filter((room) => room.status === "Departing").length;
    const vacant = rooms.filter((room) => room.status === "Vacant").length;
    const dirty = rooms.filter((room) => room.clean === "Dirty").length;
    const adr = Math.round(
      rooms
        .filter((room) => room.status !== "Vacant")
        .reduce((sum, room) => sum + room.rate, 0) /
        Math.max(1, rooms.filter((room) => room.status !== "Vacant").length),
    );
    const occupancy = (occupied / rooms.length) * 100;
    const revPar = Math.round(adr * (occupancy / 100));

    return { occupied, arriving, departing, vacant, dirty, adr, occupancy, revPar };
  }, [rooms]);

  const filters: Array<{ label: FilterKey; count: number }> = [
    { label: "All", count: rooms.length },
    { label: "Occupied", count: metrics.occupied },
    { label: "Arriving", count: metrics.arriving },
    { label: "Departing", count: metrics.departing },
    { label: "Vacant", count: metrics.vacant },
    { label: "Dirty", count: metrics.dirty },
  ];

  const visibleRooms = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Dirty" ? room.clean === "Dirty" : room.status === activeFilter);

      const matchesSearch =
        !term ||
        room.id.toLowerCase().includes(term) ||
        room.guest.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, rooms, search]);

  const groupedRooms = useMemo(() => {
    return visibleRooms.reduce<Record<number, Room[]>>((acc, room) => {
      acc[room.floor] = [...(acc[room.floor] ?? []), room];
      return acc;
    }, {});
  }, [visibleRooms]);

  function toggleHousekeeping(roomId: string) {
    setRooms((current) =>
      current.map((room) =>
        room.id === roomId
          ? { ...room, clean: room.clean === "Clean" ? "Dirty" : "Clean" }
          : room,
      ),
    );
  }

  function getVeraResponse(prompt: string) {
    if (prompt === "Show dirty rooms") {
      const dirtyRooms = rooms.filter((room) => room.clean === "Dirty");
      return dirtyRooms.length
        ? `Dirty rooms: ${dirtyRooms.map((room) => `#${room.id} ${room.tier}`).join(", ")}. Prioritize arrivals first.`
        : "No dirty rooms are currently marked in the PMS.";
    }

    if (prompt === "Which arrivals are pending?") {
      const arrivals = rooms.filter((room) => room.status === "Arriving");
      return arrivals
        .map((room) => `#${room.id} ${room.guest}, ${room.eta}, ${room.clean.toLowerCase()}`)
        .join(" | ");
    }

    return `Night audit preview: ${metrics.occupied} occupied, ${metrics.arriving} arrivals pending, ${metrics.departing} departures, ADR ${currency(metrics.adr)}, projected RevPAR ${currency(metrics.revPar)}.`;
  }

  function sendPrompt(prompt: string) {
    setMessages((current) => [
      ...current,
      { role: "staff", content: prompt },
      { role: "vera", content: getVeraResponse(prompt) },
    ]);
  }

  return (
    <main className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-4 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-white shadow-soft">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <span>Boutique</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>24 Keys</span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                  The Grand Soho
                </h1>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={BedDouble} label="Occupancy" value={percent(metrics.occupancy)} detail={`${metrics.occupied}/24 in-house`} />
              <Metric icon={CalendarCheck} label="Arrivals" value={String(metrics.arriving)} detail="Today" />
              <Metric icon={ClipboardCheck} label="Dirty Rooms" value={String(metrics.dirty)} detail="Needs turn" />
              <Metric icon={TrendingUp} label="ADR / RevPAR" value={`${currency(metrics.adr)} / ${currency(metrics.revPar)}`} detail="Live forecast" />
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative flex min-h-12 flex-1 items-center rounded-2xl border border-black/[0.06] bg-white px-4 shadow-sm lg:max-w-xl">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search guest or room number"
                className="h-11 w-full border-0 bg-transparent px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setVeraOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-black/[0.06] bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:shadow-soft"
              >
                <Bot className="h-4 w-4 text-blue-600" />
                Ask Vera AI
              </button>
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                New Reservation
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-black/[0.06] bg-white/70 p-3 shadow-sm backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setActiveFilter(filter.label)}
                className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition ${
                  activeFilter === filter.label
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-black/[0.06] bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {filter.label}
                <span className={`rounded-full px-2 py-0.5 text-xs ${activeFilter === filter.label ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
            <DoorOpen className="h-4 w-4" />
            Showing {visibleRooms.length} keys
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedRooms).map(([floor, floorRooms]) => (
            <section key={floor}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                  Floor {floor}
                </h2>
                <div className="h-px flex-1 bg-black/[0.06]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {floorRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onClick={() => setSelectedRoomId(room.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <RoomDrawer
        room={selectedRoom}
        onClose={() => setSelectedRoomId(null)}
        onToggleClean={toggleHousekeeping}
      />

      <VeraDrawer
        open={veraOpen}
        onClose={() => setVeraOpen(false)}
        messages={messages}
        onPrompt={sendPrompt}
      />
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white/75 px-4 py-3 shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 font-mono text-lg font-semibold text-slate-950">{value}</div>
      <div className="text-xs font-medium text-slate-500">{detail}</div>
    </div>
  );
}

function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  const status = STATUS_STYLES[room.status];

  return (
    <button
      onClick={onClick}
      className={`group min-h-[230px] rounded-3xl border border-t-4 border-black/[0.06] ${status.border} bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-apple`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-2xl font-semibold tracking-tight text-slate-950">
            #{room.id}
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-500">{room.tier}</div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${status.chip}`}>
          {room.status}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 font-semibold text-slate-700">
          {room.initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-950">{room.guest}</div>
          <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {room.eta}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-400">Night Rate</div>
          <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
            {currency(room.rate)}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-400">Housekeeping</div>
          <div className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${CLEAN_STYLES[room.clean]}`}>
            {room.clean}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>Open room profile</span>
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function RoomDrawer({
  room,
  onClose,
  onToggleClean,
}: {
  room: Room | null;
  onClose: () => void;
  onToggleClean: (roomId: string) => void;
}) {
  const isOpen = Boolean(room);

  return (
    <div className={`fixed inset-0 z-40 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/20 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-black/[0.06] bg-white shadow-apple transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        {room ? (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] p-6">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Room Inspection
                </div>
                <h2 className="font-mono text-3xl font-semibold text-slate-950">#{room.id}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{room.tier}</p>
              </div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full border border-black/[0.06] bg-white text-slate-500 transition hover:bg-slate-50"
                aria-label="Close room drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoTile icon={UserRound} label="Guest" value={room.guest} detail={room.vip} />
                <InfoTile icon={Moon} label="Stay Dates" value={`${room.checkIn} - ${room.checkOut}`} detail={`${room.eta} today`} />
                <InfoTile icon={CreditCard} label="Deposit" value="$250 pre-authorized" detail="Card ending 0428" />
                <InfoTile icon={BedDouble} label="Revenue" value={currency(room.rate)} detail="Nightly rate" />
              </div>

              <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  <Bot className="h-4 w-4" />
                  Vera AI Intelligence
                </div>
                <p className="mt-2 text-sm leading-6 text-blue-950">{room.veraNote}</p>
              </div>

              <div className="mt-5 grid gap-3">
                <button className="flex min-h-12 items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:shadow-soft">
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-slate-500" />
                    Issue Digital Mobile Key
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
                <button
                  onClick={() => onToggleClean(room.id)}
                  className="flex min-h-12 items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:shadow-soft"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    Toggle Housekeeping Clean/Dirty
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${CLEAN_STYLES[room.clean]}`}>
                    {room.clean}
                  </span>
                </button>
                <button className="flex min-h-12 items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:shadow-soft">
                  <span className="flex items-center gap-2">
                    <MessageSquareText className="h-4 w-4 text-slate-500" />
                    Send SMS via Vera Assistant
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="border-t border-black/[0.06] p-6">
              <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800">
                {room.status === "Departing" ? "Process Check-Out" : "Process Check-In"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-black/[0.06] bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-3 text-sm font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-semibold text-slate-500">{detail}</div>
    </div>
  );
}

function VeraDrawer({
  open,
  onClose,
  messages,
  onPrompt,
}: {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onPrompt: (prompt: string) => void;
}) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/20 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l border-black/[0.06] bg-white shadow-apple transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] p-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Staff Copilot
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Ask Vera AI</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Front-desk intelligence for rooms, guests, and audit readiness.</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-black/[0.06] bg-white text-slate-500 transition hover:bg-slate-50"
            aria-label="Close Vera drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onPrompt(prompt)}
                className="rounded-full border border-black/[0.06] bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-white hover:shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "staff" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[86%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                  message.role === "staff"
                    ? "bg-slate-950 text-white"
                    : "border border-blue-100 bg-blue-50 text-blue-950"
                }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/[0.06] p-4">
          <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-black/[0.06] bg-slate-50 px-3">
            <Bell className="h-4 w-4 text-slate-400" />
            <input
              readOnly
              value="Choose a prompt chip to simulate Vera"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-500 outline-none"
            />
            <Send className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </aside>
    </div>
  );
}
