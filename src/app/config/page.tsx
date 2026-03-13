"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import styles from "./config.module.scss";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  fecharMesHistorico,
  exportarEstoqueParaCSV,
} from "@/lib/funcoesEstoque";
export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState("historico"); // Controle das abas
  const { user, loading } = useAuth();
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "historico_saidas"));
    return onSnapshot(q, (snap) => {
      setHistorico(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any,
      );
    });
  }, [user]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        <header className={styles.header}>
          <Link href="/estoque" className={styles.btnVoltar}>
            <ArrowBackIcon fontSize="small" /> Voltar ao Estoque
          </Link>
          <h1>
            <SettingsIcon /> Painel Administrativo
          </h1>
        </header>

        <nav className={styles.tabs}>
          <button
            className={activeTab === "historico" ? styles.active : ""}
            onClick={() => setActiveTab("historico")}
          >
            <HistoryIcon /> Histórico de Saídas
          </button>
          <button
            className={activeTab === "graficos" ? styles.active : ""}
            onClick={() => setActiveTab("graficos")}
          >
            <BarChartIcon /> Gráficos
          </button>
          <button
            className={activeTab === "fechamento" ? styles.active : ""}
            onClick={() => setActiveTab("fechamento")}
          >
            <AssessmentIcon /> Fechamento de Mês
          </button>
        </nav>
        <div className={styles.tabContent}>
          {activeTab === "historico" && (
            <section>
              <h2>Histórico Mensal</h2>
              <p>Lista de todas as saídas registradas neste período.</p>
            </section>
          )}

          {activeTab === "graficos" && (
            <section>
              <h2>Análise de Dados</h2>
              <p>Visualização das doações e movimentações.</p>
            </section>
          )}

          {activeTab === "fechamento" && (
            <section>
              <h2>Área de Fechamento</h2>
              <p>Ações irreversíveis e exportação de dados.</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
