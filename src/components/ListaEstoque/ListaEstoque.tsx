"use client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ItemEstoque } from "@/types/Estoque";
import styles from "./ListaEstoque.module.scss";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function ListaEstoque() {
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  const checarUrgencia = (dataValidade: string) => {
    if (!dataValidade) return "normal";
    const hoje = new Date();
    const validade = new Date(dataValidade + "T00:00:00");
    const diffDias = Math.ceil(
      (validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDias <= 0) return "vencido";
    if (diffDias <= 7) return "urgente";
    if (diffDias <= 15) return "atencao";
    return "normal";
  };

  const excluirItem = async (id: string, nome: string) => {
    toast(
      (t) => (
        <span>
          Excluir <b>{nome}</b>?
          <button
            onClick={async () => {
              try {
                await deleteDoc(doc(db, "estoque", id));
                toast.dismiss(t.id);
                toast.success("Excluído com sucesso!");
              } catch (error) {
                toast.error("Erro ao excluir");
              }
            }}
            style={{
              marginLeft: "10px",
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Sim
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              marginLeft: "5px",
              background: "#ccc",
              color: "#333",
              border: "none",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Não
          </button>
        </span>
      ),
      { duration: 5000 },
    );
  };

  useEffect(() => {
    const q = query(collection(db, "estoque"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ItemEstoque[];
      setItens(dados);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Carregando estoque da PACC...</p>;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qtd.</th>
            <th>Validade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => {
            const urgencia = checarUrgencia(item.dataValidade);

            const classeUrgencia =
              {
                vencido: styles.rowVencido,
                urgente: styles.rowUrgente,
                atencao: styles.rowAtencao,
                normal: styles.rowNormal,
              }[urgencia] || styles.rowNormal;

            return (
              <tr key={item.id} className={classeUrgencia}>
                <td style={{ textTransform: "capitalize" }}>{item.nome}</td>
                <td>{item.quantidade}</td>
                <td>
                  {item.dataValidade
                    ? new Date(
                        item.dataValidade + "T00:00:00",
                      ).toLocaleDateString("pt-BR")
                    : "---"}

                  {urgencia !== "normal" && " ⚠️"}
                </td>
                <td>
                  <button
                    onClick={() => excluirItem(item.id!, item.nome)}
                    className={styles.btnDelete}
                    title="Excluir item"
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
