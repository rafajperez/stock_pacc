"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import toast from "react-hot-toast";
import styles from "./ModalCadastro.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITENS_PADRAO = [
  "Cesta Básica",
  "Suplemento Alimentar",
  "Fralda Geriatrica",
  "Fralda Infantil",
  "Outros",
];

const TAMANHOS_FRALDA = ["P", "M", "G", "GG", "EG/XG"];

export default function ModalCadastro({ isOpen, onClose }: ModalProps) {
  const [nomeBase, setNomeBase] = useState(ITENS_PADRAO[0]);
  const [tamanhoFralda, setTamanhoFralda] = useState(TAMANHOS_FRALDA[1]); // Padrão M
  const [nomePersonalizado, setNomePersonalizado] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [categoria, setCategoria] = useState("Cesta Básica");
  const [loading, setLoading] = useState(false);
  const [dataValidade, setDataValidade] = useState("");

  const hoje = new Date().toISOString().split("T")[0];

  const normalizarTexto = (texto: string) => {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let nomeFinal = nomeBase;

    if (nomeBase.includes("Fralda")) {
      nomeFinal = `${nomeBase} Tam ${tamanhoFralda}`;
    } else if (nomeBase === "Outros") {
      nomeFinal = nomePersonalizado;
    }

    const nomeLimpo = normalizarTexto(nomeFinal);

    try {
      const q = query(
        collection(db, "estoque"),
        where("nome", "==", nomeLimpo),
        where("dataValidade", "==", dataValidade),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const itemExistente = querySnapshot.docs[0];
        const itemRef = doc(db, "estoque", itemExistente.id);

        await updateDoc(itemRef, {
          quantidade: increment(Number(quantidade)),
          dataAtualizacao: serverTimestamp(),
        });

        // TROCADO ALERT POR TOAST
        toast.success("Quantidade somada ao lote existente!");
      } else {
        await addDoc(collection(db, "estoque"), {
          nome: nomeLimpo,
          quantidade: Number(quantidade),
          categoria,
          dataValidade,
          dataCriacao: serverTimestamp(),
        });

        // TROCADO ALERT POR TOAST
        toast.success("Novo item cadastrado com sucesso!");
      }

      // Reseta os estados
      setNomeBase(ITENS_PADRAO[0]);
      setNomePersonalizado("");
      setQuantidade(1);
      setDataValidade("");
      onClose();
    } catch (error) {
      console.error(error);
      // TROCADO ALERT POR TOAST
      toast.error("Erro ao salvar no banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Entrada de Estoque - PACC</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>O que está entrando?</label>
            <select
              value={nomeBase}
              onChange={(e) => setNomeBase(e.target.value)}
              required
            >
              {ITENS_PADRAO.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {nomeBase.includes("Fralda") && (
            <div className={styles.inputGroup}>
              <label>Tamanho da Fralda</label>
              <select
                value={tamanhoFralda}
                onChange={(e) => setTamanhoFralda(e.target.value)}
              >
                {TAMANHOS_FRALDA.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {nomeBase === "Outros" && (
            <div className={styles.inputGroup}>
              <label>Nome do Item Específico</label>
              <input
                type="text"
                value={nomePersonalizado}
                onChange={(e) => setNomePersonalizado(e.target.value)}
                placeholder="Ex: Cadeira de Banho"
                required
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Quantidade</label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              min="1"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Data de Validade</label>
            <input
              type="date"
              value={dataValidade}
              onChange={(e) => setDataValidade(e.target.value)}
              min={hoje}
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
            <button type="submit" className={styles.btnSave} disabled={loading}>
              {loading ? "Gravando..." : "Salvar no Banco"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
