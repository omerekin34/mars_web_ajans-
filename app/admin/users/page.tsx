"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Plus, Search, Users } from "lucide-react";
import { AdminModal } from "@/components/admin/modal";
import { EmptyState, inputClass, PageHeader, Panel, SetupNotice, StatusNote, TableSkeleton } from "@/components/admin/primitives";
import { formatAdminUserDate, type AdminUserRow } from "@/lib/admin/users";

const empty = "—";

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "", displayName: "" });

  const load = async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (response.status === 401) {
        window.location.href = "/admin/login?next=/admin/users";
        return;
      }
      const payload = (await response.json().catch(() => null)) as { users?: AdminUserRow[]; error?: string } | null;
      if (!response.ok) {
        setConfigured(response.status !== 503);
        setError(payload?.error || "Kullanıcılar yüklenemedi.");
        if (!isRefresh) setUsers([]);
        return;
      }
      setConfigured(true);
      setError(null);
      setUsers(payload?.users ?? []);
    } catch {
      setError("Bağlantı kurulamadı. Biraz sonra yeniden deneyin.");
      if (!isRefresh) setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(false);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) =>
      [user.id, user.displayName, user.email, user.phone, user.providers].join(" ").toLowerCase().includes(needle),
    );
  }, [query, users]);

  const handleAddUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setAddLoading(true);
    setAddError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok) {
        setAddError(payload.error || "Kullanıcı eklenemedi.");
        return;
      }

      setModalOpen(false);
      setFormData({ email: "", password: "", displayName: "" });
      await load(true);
    } catch {
      setAddError("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kimlik doğrulama"
        title="Users"
        description="Supabase kullanıcı kayıtları şifre olmadan listelenir. Panele yalnızca sizin giriş bilgilerinizle girilir."
        onRefresh={() => void load(true)}
        refreshing={refreshing}
      />

      {!configured && !loading ? <SetupNotice /> : null}
      {configured && error ? <StatusNote tone="error">{error}</StatusNote> : null}

      <Panel>
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={`${inputClass} pl-11`}
              placeholder="Search by email"
              aria-label="E-posta ile ara"
            />
          </label>
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500">Total: {filtered.length} users</p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add user
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Kullanıcı bulunamadı"
            body="Liste boşsa users.sql dosyasını Supabase SQL Editor'da çalıştırıp panele yeniden giriş yapın."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="text-[11px] tracking-[0.14em] text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">UID</th>
                  <th className="px-5 py-3 font-semibold">Display name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Providers</th>
                  <th className="px-5 py-3 font-semibold">Provider type</th>
                  <th className="px-5 py-3 font-semibold">Created at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((user) => (
                  <tr key={user.id} className="text-slate-200">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2 font-mono text-xs text-slate-300">
                        <Users className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                        {user.id || empty}
                      </span>
                    </td>
                    <td className="px-5 py-3">{user.displayName || empty}</td>
                    <td className="px-5 py-3">
                      {user.email ? (
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          {user.email}
                        </span>
                      ) : (
                        empty
                      )}
                    </td>
                    <td className="px-5 py-3">{user.phone || empty}</td>
                    <td className="px-5 py-3">{user.providers || empty}</td>
                    <td className="px-5 py-3">{user.providerType || empty}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-300">{formatAdminUserDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AdminModal
        open={modalOpen}
        title="Kullanıcı Ekle"
        description="Yeni bir admin kullanıcısı oluşturun. Şifre Supabase tarafından güvenli bir şekilde şifrelenecek."
        onClose={() => {
          setModalOpen(false);
          setAddError(null);
          setFormData({ email: "", password: "", displayName: "" });
        }}
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          {addError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{addError}</div>
          ) : null}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              data-autofocus
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
              placeholder="ornek@email.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={inputClass}
              placeholder="En az 6 karakter"
              required
              minLength={6}
            />
          </div>
          <div>
            <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-slate-300">
              Görünen Ad (opsiyonel)
            </label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className={inputClass}
              placeholder="Ad Soyad"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {addLoading ? "Ekleniyor..." : "Ekle"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
