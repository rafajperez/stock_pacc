"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import styles from "./historico.module.scss";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ConsumoChart from "@/components/ConsumoChart"; // Certifique-se de ter criado este arquivo

interface HistoricoItem {
  id: string;
  pacienteReferencia: string;
  itemNome: string;
  quantidade: number;
  dataSaida: any;
}

export default function HistoricoPage() {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "historico_saidas"),
      orderBy("dataSaida", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HistoricoItem[];
      setHistorico(dados);
    });

    return () => unsubscribe();
  }, [user]);

  // FUNÇÃO PARA AGRUPAR DADOS DO GRÁFICO
  const dadosParaOGrafico = () => {
    const somaPorItem: { [key: string]: number } = {};

    historico.forEach((log) => {
      const nome = log.itemNome.trim();
      somaPorItem[nome] = (somaPorItem[nome] || 0) + Number(log.quantidade);
    });

    return Object.keys(somaPorItem)
      .map((nome) => ({
        name: nome,
        total: somaPorItem[nome],
      }))
      .sort((a, b) => b.total - a.total) // Ordena do mais consumido para o menos
      .slice(0, 6); // Pega apenas os 6 principais para não poluir
  };

  if (loading || !user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#003366",
          fontFamily: "sans-serif",
        }}
      >
        Verificando permissões...
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.leftSide}>
          <Link href="/estoque" className={styles.btnVoltar}>
            <ArrowBackIcon />
            Voltar
          </Link>
          <div className={styles.brand}>
            <Image
              src="/Logo-PACC-NOVA.png"
              alt="Logo PACC"
              width={40}
              height={35}
            />
            <h1>Histórico de Saídas</h1>
          </div>
        </div>

        <button onClick={() => window.print()} className={styles.btnImprimir}>
          Imprimir Relatório
        </button>
      </header>

      {/* ÁREA DO GRÁFICO */}
      <section style={{ marginBottom: "2rem", padding: "0 10px" }}>
        {historico.length > 0 && <ConsumoChart data={dadosParaOGrafico()} />}
      </section>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Paciente/Prontuário</th>
              <th>Item Retirado</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {historico.length > 0 ? (
              historico.map((log) => (
                <tr key={log.id}>
                  <td>
                    {log.dataSaida?.toDate
                      ? format(log.dataSaida.toDate(), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })
                      : "---"}
                  </td>
                  <td>{log.pacienteReferencia}</td>
                  <td className={styles.itemName}>{log.itemNome}</td>
                  <td>{log.quantidade} unid.</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Nenhuma saída registrada até o momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
