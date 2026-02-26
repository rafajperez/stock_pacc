"use client";

import { useAuth } from "@/context/AuthContext";
import { fecharMesHistorico } from "@/lib/funcoesEstoque";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import styles from "./config.module.scss";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BackupIcon from "@mui/icons-material/Backup";

export default function ConfigPage() {
  const { user, loading } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [estoqueAtual, setEstoqueAtual] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Monitora histórico para o card de fechamento
    const qH = query(collection(db, "historico_saidas"));
    const unsubH = onSnapshot(qH, (snap) => {
      setHistorico(snap.docs.map((doc) => doc.data()) as any);
    });

    // Monitora estoque para o card de backup
    const qE = query(collection(db, "estoque"));
    const unsubE = onSnapshot(qE, (snap) => {
      setEstoqueAtual(snap.docs.map((doc) => doc.data()) as any);
    });

    return () => {
      unsubH();
      unsubE();
    };
  }, [user]);

  if (loading) return <div className={styles.loading}>Carregando...</div>;

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

        <div className={styles.grid}>
          {/* CARD 1: FECHAMENTO MENSAL */}
          <section className={styles.card}>
            <div className={styles.cardIcon} style={{ color: "#e65100" }}>
              <HistoryToggleOffIcon fontSize="large" />
            </div>
            <h2>Fechamento Mensal</h2>
            <p>
              Arquiva saídas e limpa o histórico atual. O saldo do estoque não
              será alterado.
            </p>
            <div className={styles.status}>
              <strong>Itens para arquivar:</strong> {historico.length}
            </div>
            <button
              onClick={() => fecharMesHistorico(historico)}
              className={styles.btnAcao}
            >
              Executar Fechamento
            </button>
          </section>

          {/* CARD 2: BACKUP DE SEGURANÇA */}
          <section className={styles.card}>
            <div className={styles.cardIcon} style={{ color: "#004a99" }}>
              <BackupIcon fontSize="large" />
            </div>
            <h2>Backup de Segurança</h2>
            <p>
              Baixe uma planilha Excel (.csv) com todo o seu estoque atual agora
              mesmo.
            </p>
            <button
              onClick={() => exportarEstoqueParaCSV(estoqueAtual)}
              className={styles.btnBackup}
            >
              Baixar CSV
            </button>
          </section>

          {/* CARD 3: RELATÓRIOS ANTIGOS */}
          <section className={styles.card}>
            <div className={styles.cardIcon} style={{ color: "#64748b" }}>
              <AssessmentIcon fontSize="large" />
            </div>
            <h2>Arquivos Mortos</h2>
            <p>
              Acesse a base de dados de meses anteriores que já foram
              processados.
            </p>
            <Link href="/relatorios" className={styles.btnLink}>
              Ver Relatórios
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
