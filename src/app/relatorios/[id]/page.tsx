"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./detalhes.module.scss"; // Vamos criar esse SCSS
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export default function DetalhesRelatorioPage() {
  const { id } = useParams();
  const router = useRouter();
  const [relatorio, setRelatorio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const docRef = doc(db, "arquivos_mensais", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRelatorio(docSnap.data());
        } else {
          console.error("Relatório não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar relatório:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, [id]);

  if (loading)
    return <div className={styles.loading}>Carregando relatório...</div>;
  if (!relatorio)
    return <div className={styles.error}>Relatório não encontrado.</div>;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.btnVoltar}>
          <ArrowBackIcon /> Voltar
        </button>
        <h1>Relatório: {relatorio.mesAno}</h1>
        <button onClick={() => window.print()} className={styles.btnDownload}>
          <FileDownloadIcon /> Imprimir / PDF
        </button>
      </header>

      <section className={styles.metaData}>
        <p>
          <strong>Fechado por:</strong> {relatorio.responsavel}
        </p>
        <p>
          <strong>Total de registros:</strong> {relatorio.dados?.length || 0}
        </p>
      </section>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Paciente/Referência</th>
            <th>Item</th>
            <th>Qtd</th>
          </tr>
        </thead>
        <tbody>
          {relatorio.dados?.map((item: any, index: number) => (
            <tr key={index}>
              <td>{item.pacienteReferencia}</td>
              <td>{item.itemNome}</td>
              <td>{item.quantidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
