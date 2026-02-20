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

interface HistoricoItem {
  id: string;
  pacienteReferencia: string;
  itemNome: string;
  quantidade: number;
  dataSaida: any;
}

export default function HistoricoPage() {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  useEffect(() => {
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
  }, []);

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
