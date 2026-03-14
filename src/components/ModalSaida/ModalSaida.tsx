"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  onSnapshot,
  query,
} from "firebase/firestore";
import { ItemEstoque } from "@/types/Estoque";
import styles from "./ModalSaida.module.scss";
import toast from "react-hot-toast";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalSaida({ isOpen, onClose }: ModalProps) {
  const [itensNoEstoque, setItensNoEstoque] = useState<ItemEstoque[]>([]);
  const [itemId, setItemId] = useState("");
  const [quantidadeSaida, setQuantidadeSaida] = useState(1);
  const [pacienteId, setPacienteId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "estoque"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ItemEstoque[];
      setItensNoEstoque(dados.filter((item) => item.quantidade > 0));
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSaida = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const itemSelecionado = itensNoEstoque.find((i) => i.id === itemId);

    if (!itemSelecionado || itemSelecionado.quantidade < quantidadeSaida) {
      toast.error("Quantidade insuficiente no estoque!");
      setLoading(false);
      return;
    }

    try {
      const itemRef = doc(db, "estoque", itemId);

      await updateDoc(itemRef, {
        quantidade: increment(-Number(quantidadeSaida)),
      });

      await addDoc(collection(db, "historico_saidas"), {
        pacienteReferencia: pacienteId,
        itemNome: itemSelecionado.nome,
        quantidade: Number(quantidadeSaida),
        dataSaida: serverTimestamp(),
      });

      toast.success("Baixa realizada com sucesso!");
      setPacienteId("");
      setItemId("");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao dar baixa no sistema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Registrar Saída de Item</h2>
        <form onSubmit={handleSaida}>
          <div className={styles.inputGroup}>
            <label>ID / Prontuário do Paciente</label>
            <input
              type="text"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              placeholder="Digite o código do paciente"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Item para Saída</label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              required
            >
              <option value="">Selecione um item...</option>
              {itensNoEstoque.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome} (Disponível: {item.quantidade})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Quantidade</label>
            <input
              type="number"
              value={quantidadeSaida}
              onChange={(e) => setQuantidadeSaida(Number(e.target.value))}
              min="1"
              required
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnConfirm}
              disabled={loading}
            >
              {loading ? "Processando..." : "Confirmar Saída"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
