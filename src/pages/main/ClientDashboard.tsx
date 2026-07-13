/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import extractApiError  from "../../lib/errorextrator"
import {
  Search,
  RefreshCw,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Download,
  User,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from "../../store/Client/action";

import { selectCurrentFarm } from "../../store/farm/slice";
import { getUserFarms } from "../../store/farm/action";
import { Client } from "../../models/client";
import { LoadingType } from "../../models/store";

// ── Helpers ───────────────────────────────────────────────────────────────────

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const fmtDate = (d?: Date | string) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// Initiales pour l'avatar
const initials = (name: string) =>
  name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Couleur d'avatar déterministe par nom
const AVATAR_COLORS = [
  "bg-emerald-100 text-vert",
  "bg-blue-100 text-bleu",
  "bg-purple-100 text-purple-600",
  "bg-yellow-100 text-jaune",
  "bg-pink-100 text-pink-600",
  "bg-orange-100 text-orange-600",
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  bg: string;
}> = ({ label, value, sub, icon, bg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-lg font-black text-gray-900 leading-tight truncate">
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Delete Modal ──────────────────────────────────────────────────────────────

const DeleteModal: React.FC<{
  client: Client;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ client, onCancel, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-rouge" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Supprimer ce client ?
          </h3>
          <p className="text-sm text-gray-500">{client.name}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5 bg-red-50 rounded-xl p-3 border border-red-100">
        Cette action est <strong>irréversible</strong>. L'historique des ventes
        associées sera conservé.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rouge text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <>
              <Spinner /> Suppression…
            </>
          ) : (
            "Confirmer"
          )}
        </button>
      </div>
    </div>
  </div>
);

// ── Client Form Modal ─────────────────────────────────────────────────────────

const ClientFormModal: React.FC<{
  farmId: number;
  initial?: Client | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ farmId, initial, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
  });

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const isValid = form.name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Le nom du client doit contenir au moins 2 caractères");
      return;
    }

    setSaving(true);

    try {
      const payload: Partial<Client> = {
        farmId,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      };

      if (initial) {
        await dispatch(updateClient({ id: initial.id, data: payload })).unwrap();
        toast.success("Client mis à jour avec succès");
      } else {
        await dispatch(createClient(payload)).unwrap();
        toast.success("Client créé avec succès");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur Client :", err); 

      const apiError = extractApiError(err);  
      let message = apiError.meta.message;

      if (message.toLowerCase().includes("email") || 
          message.includes("409") || 
          message.toLowerCase().includes("existe déjà")) {
        message = "Un client avec cet email existe déjà pour cette ferme.";
      }

      toast.error(message, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "light",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-vert" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {initial ? "Modifier le client" : "Nouveau client"}
              </h2>
              <p className="text-xs text-gray-400">
                {initial ? initial.name : "Ajouter un client à votre ferme"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Avatar preview */}
          {form.name.trim() && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${avatarColor(form.name)}`}
              >
                {initials(form.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{form.name}</p>
                {form.phone && (
                  <p className="text-xs text-gray-400">{form.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nom <span className="text-rouge">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
              placeholder="Jean Dupont"
            />
            {form.name.trim().length > 0 && form.name.trim().length < 2 && (
              <p className="text-[11px] text-rouge mt-1">
                Au moins 2 caractères
              </p>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> Téléphone
              </span>
            </label>
            <input
              type="tel"
              value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
              placeholder="+237 6XX XXX XXX"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </span>
            </label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
              placeholder="client@exemple.com"
            />
          </div>

          {/* Adresse */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Adresse
              </span>
            </label>
            <textarea
              rows={2}
              value={form.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Quartier, ville…"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !isValid}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-vert text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-dark_vert transition shadow-sm shadow-emerald-200"
          >
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : initial ? (
              "Enregistrer"
            ) : (
              "Créer le client"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Sort ──────────────────────────────────────────────────────────────────────

type SortKey = "name" | "createdAt";

const ColHeader: React.FC<{
  label: string;
  colKey: SortKey;
  current: SortKey;
  dir: "asc" | "desc";
  onSort: (k: SortKey) => void;
}> = ({ label, colKey, current, dir, onSort }) => (
  <button
    onClick={() => onSort(colKey)}
    className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition"
  >
    {label}
    {current === colKey ? (
      dir === "desc" ? (
        <ChevronDown className="w-3 h-3" />
      ) : (
        <ChevronUp className="w-3 h-3" />
      )
    ) : (
      <ChevronDown className="w-3 h-3 opacity-20" />
    )}
  </button>
);

// ── Main Component ────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

const ClientsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFarm = useAppSelector(selectCurrentFarm);
  const clientState = useAppSelector((s: any) => s.client);
  const farmId = currentFarm?.id;

  const clients: Client[] = clientState?.list?.entities ?? [];
  const isLoading = clientState?.list?.status === LoadingType.PENDING;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch ──
  const fetchData = useCallback(() => {
    if (farmId) dispatch(fetchClients({ farmId, page: 1, limit: 1000 }));
  }, [dispatch, farmId]);

  useEffect(() => {
    if (!farmId) dispatch(getUserFarms());
    else fetchData();
  }, [farmId, fetchData, dispatch]);

  const refresh = useCallback(() => {
    fetchData();
    toast.info("Données actualisées");
  }, [fetchData]);

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteClient(deleteTarget.id)).unwrap();
      toast.success("Client supprimé");
      setDeleteTarget(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Sort ──
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  // ── Filtered & sorted ──
  const filtered = useMemo(() => {
    const safeClients = Array.isArray(clients) ? clients : [];
    let list = [...safeClients];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((c) =>
        [c.name, c.email, c.phone, c.address].some((v) =>
          v?.toLowerCase().includes(q),
        ),
      );
    }
    list.sort((a, b) => {
      const aVal = sortKey === "name" ? a.name : String(a.createdAt ?? "");
      const bVal = sortKey === "name" ? b.name : String(b.createdAt ?? "");
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [clients, searchTerm, sortKey, sortDir]);

  // ── Stats ──
  const stats = useMemo(() => {
    const clientsList = Array.isArray(clients) ? clients : [];

    const withEmail = clientsList.filter((c) => c.email).length;
    const withPhone = clientsList.filter((c) => c.phone).length;

    return {
      total: clientsList.length,
      withEmail,
      withPhone,
    };
  }, [clients]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // ── Export CSV ──
  const exportCSV = () => {
    const rows = [
      ["Nom", "Email", "Téléphone", "Adresse", "Créé le"],
      ...filtered.map((c) => [
        c.name,
        c.email ?? "",
        c.phone ?? "",
        c.address ?? "",
        fmtDate(c.createdAt),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !text-sm !font-medium"
      />

      <div className="flex flex-col gap-5 p-4 pt-20 min-h-screen bg-bg_dash">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Finance & Ventes</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium">Clients</span>
            </div>
            <h1 className="text-2xl font-black text-darkText tracking-tight">
              Clients
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Gérez vos acheteurs et partenaires commerciaux
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={refresh}
              className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingClient(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-vert text-white rounded-xl font-semibold text-sm hover:bg-dark_vert transition shadow-sm shadow-emerald-200"
            >
              <Plus className="w-4 h-4" /> Nouveau client
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Total clients"
            value={String(stats.total)}
            sub="enregistrés"
            icon={<Users className="w-5 h-5 text-vert" />}
            bg="bg-emerald-50"
          />
          <StatCard
            label="Avec email"
            value={String(stats.withEmail)}
            sub={`${stats.total > 0 ? Math.round((stats.withEmail / stats.total) * 100) : 0}% contactables`}
            icon={<Mail className="w-5 h-5 text-bleu" />}
            bg="bg-blue-50"
          />
          <StatCard
            label="Avec téléphone"
            value={String(stats.withPhone)}
            sub={`${stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0}% joignables`}
            icon={<Phone className="w-5 h-5 text-jaune" />}
            bg="bg-yellow-50"
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Spinner className="w-8 h-8" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Users className="w-10 h-10 text-gray-200" />
            <p className="font-semibold text-gray-500">
              {searchTerm ? "Aucun client trouvé" : "Aucun client enregistré"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingClient(null);
                  setShowForm(true);
                }}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-vert rounded-xl text-sm font-semibold hover:bg-emerald-100 transition"
              >
                <Plus className="w-4 h-4" /> Nouveau client
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* En-têtes */}
            <div className="hidden md:grid grid-cols-[44px_1fr_160px_160px_1fr_88px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <div />
              <ColHeader
                label="Nom"
                colKey="name"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Téléphone
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Email
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Adresse
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" />
            </div>

            <div className="divide-y divide-gray-50">
              {paginated.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[1fr_auto] md:grid-cols-[44px_1fr_160px_160px_1fr_88px] gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition items-center"
                >
                  {/* Avatar */}
                  <div
                    className={`hidden md:flex w-8 h-8 rounded-full items-center justify-center font-black text-xs flex-shrink-0 ${avatarColor(c.name)}`}
                  >
                    {initials(c.name)}
                  </div>

                  {/* Nom */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {c.name}
                    </p>
                    {/* Mobile : infos condensées */}
                    <div className="flex md:hidden items-center gap-2 mt-0.5 flex-wrap">
                      {c.phone && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <Phone className="w-3 h-3" />
                          {c.phone}
                        </span>
                      )}
                      {c.email && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <Mail className="w-3 h-3" />
                          {c.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div className="hidden md:flex items-center gap-1.5 min-w-0">
                    {c.phone ? (
                      <>
                        <Phone className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">
                          {c.phone}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="hidden md:flex items-center gap-1.5 min-w-0">
                    {c.email ? (
                      <>
                        <Mail className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">
                          {c.email}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </div>

                  {/* Adresse */}
                  <div className="hidden md:flex items-center gap-1.5 min-w-0">
                    {c.address ? (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        <span className="text-sm text-gray-500 truncate">
                          {c.address}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => {
                        setEditingClient(c);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-rouge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {(page - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(page * ITEMS_PER_PAGE, filtered.length)} sur{" "}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg =
                      totalPages <= 5
                        ? i + 1
                        : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${pg === page ? "bg-vert text-white" : "hover:bg-gray-200 text-gray-600"}`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showForm && farmId && (
        <ClientFormModal
          farmId={farmId}
          initial={editingClient}
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          client={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default ClientsDashboard;
