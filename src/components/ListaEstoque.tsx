// src/components/ListaEstoque.tsx
"use client";

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

    if (diffDias <= 0) return "vencido"; // Já venceu
    if (diffDias <= 7) return "urgente"; // Menos de uma semana
    if (diffDias <= 15) return "atencao"; // Entre 8 e 15 dias
    return "normal";
  };
  const verificarValidadeProxima = (dataValidade: string) => {
    if (!dataValidade) return false;
    const hoje = new Date();
    const validade = new Date(dataValidade + "T00:00:00");
    const diffTempo = validade.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));
    return diffDias <= 15;
  };

  const excluirItem = async (id: string, nome: string) => {
    if (confirm(`Remover "${nome}" do estoque?`)) {
      await deleteDoc(doc(db, "estoque", id));
    }
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

  if (loading) return <p>Carregando estoque...</p>;

  return (
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
          // 1. Pegamos apenas a urgência (o semáforo)
          const urgencia = checarUrgencia(item.dataValidade);

          // 2. Definimos a classe CSS com base na urgência
          const classeUrgencia =
            {
              vencido: styles.rowVencido,
              urgente: styles.rowUrgente,
              atencao: styles.rowAtencao,
              normal: "",
            }[urgencia] || "";

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
                >
                  🗑️
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
