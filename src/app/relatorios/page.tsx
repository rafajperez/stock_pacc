import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";
import styles from "./relatorios.module.scss"; // Crie este SCSS
import FolderZipIcon from "@mui/icons-material/FolderZip";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function RelatoriosPage() {
  const [mesesArquivados, setMesesArquivados] = useState<
    { id: string; nome: string }[]
  >([]);
  useEffect(() => {
    const buscarArquivos = async () => {
      const q = query(
        collection(db, "arquivos_mensais"),
        orderBy("dataCriacao", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().mesAno,
      }));
      setMesesArquivados(docs);
    };
    buscarArquivos();
  }, []);
  return (
    <main className={styles.container}>
      <h1>Arquivo de Relatórios Mensais</h1>
      <div className={styles.grid}>
        {mesesArquivados.map((mes) => (
          <div key={mes.id} className={styles.card}>
            <FolderZipIcon className={styles.icon} />
            <span>{mes.nome}</span>
            <div className={styles.actions}>
              <Link href={`/relatorios/${mes.id}`}>
                <VisibilityIcon /> Visualizar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
