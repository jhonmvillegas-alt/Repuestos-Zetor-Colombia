import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, Mail, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function formatApiErrorDetail(detail) {
  if (detail == null) return "Error de autenticación.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function AdminLogin() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("admin@almacenzetorrepuestos.com");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon grid place-items-center px-4">
      <div className="w-full max-w-md bg-white rounded-sm border border-zinc-200">
        <div className="bg-zetor-red text-white px-6 py-5">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-90">Admin</p>
          <h1 className="font-display font-black uppercase text-2xl tracking-tight">Iniciar sesión</h1>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4" data-testid="admin-login-form">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email</label>
            <div className="mt-1 flex items-center border border-zinc-300 px-3 py-2.5 rounded-sm">
              <Mail className="h-4 w-4 text-zinc-500" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="bg-transparent outline-none text-sm w-full ml-2" data-testid="admin-email-input" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Contraseña</label>
            <div className="mt-1 flex items-center border border-zinc-300 px-3 py-2.5 rounded-sm">
              <Lock className="h-4 w-4 text-zinc-500" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="bg-transparent outline-none text-sm w-full ml-2" data-testid="admin-password-input" />
            </div>
          </div>
          {err && <p className="text-sm text-red-600" data-testid="admin-login-error">{err}</p>}
          <button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-carbon text-white font-bold uppercase tracking-widest py-3 rounded-sm hover:bg-zetor-red disabled:opacity-60" data-testid="admin-login-submit">
            <LogIn className="h-4 w-4" /> {loading ? "Ingresando..." : "Ingresar"}
          </button>
          <p className="text-[11px] text-zinc-500 text-center">Solo personal autorizado.</p>
        </form>
      </div>
    </div>
  );
}
