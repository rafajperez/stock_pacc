"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ListaEstoque from "@/components/ListaEstoque";
import ModalCadastro from "@/components/ModalCadastro";
import ModalSaida from "@/components/ModalSaida";
import styles from "./estoque.module.scss";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import HistoryIcon from "@mui/icons-material/History";

export default function EstoquePage() {
  const router = useRouter();
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [isSaidaOpen, setIsSaidaOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "sans-serif",
          color: "#003366",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    toast(
      (t) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            padding: "8px",
          }}
        >
          <span style={{ fontSize: "15px", fontWeight: "500", color: "#333" }}>
            Deseja realmente sair do sistema?
          </span>
          <div style={{ display: "flex", gap: "15px" }}>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await signOut(auth);
                  router.push("/login");
                  toast.success("Até logo!");
                } catch (error) {
                  toast.error("Erro ao sair");
                }
              }}
              style={{
                background: "#d32f2f",
                color: "#fff",
                border: "none",
                padding: "8px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Sim, Sair
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                background: "#e0e0e0",
                color: "#444",
                border: "none",
                padding: "8px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Não
            </button>
          </div>
        </div>
      ),
      {
        duration: 6000,
        position: "top-center",
        style: {
          minWidth: "300px",
          borderRadius: "12px",
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        },
      },
    );
  };

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <Image
              src="/Logo-PACC-NOVA.png"
              alt="Logo PACC"
              width={45}
              height={40}
              priority
            />
            <h1>Estoque PACC</h1>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.buttonGroup}>
              <button
                className={styles.btnEntrada}
                onClick={() => setIsCadastroOpen(true)}
              >
                <AddCircleOutlineIcon fontSize="small" /> Nova Entrada
              </button>
              <button
                className={styles.btnSaida}
                onClick={() => setIsSaidaOpen(true)}
              >
                <RemoveCircleOutlineIcon fontSize="small" /> Registrar Saída
              </button>
            </div>
            <Link href="/historico" className={styles.btnLink}>
              <HistoryIcon fontSize="small" /> Histórico
            </Link>
            <button onClick={handleLogout} className={styles.btnLogout}>
              <LogoutIcon fontSize="small" /> Sair
            </button>
          </div>
        </header>

        <section className={styles.content}>
          <ListaEstoque />
        </section>

        <ModalCadastro
          isOpen={isCadastroOpen}
          onClose={() => setIsCadastroOpen(false)}
        />
        <ModalSaida
          isOpen={isSaidaOpen}
          onClose={() => setIsSaidaOpen(false)}
        />
      </div>
    </main>
  );
}
