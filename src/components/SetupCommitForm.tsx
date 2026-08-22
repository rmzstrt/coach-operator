import { useState } from "react";
import type { BowProfile, SetupCommit, SetupField } from "../gearTypes";
import { DEFAULT_SETUP_FIELDS } from "../gearTypes";

interface SetupCommitFormProps {
  bow: BowProfile;
  lastCommit: SetupCommit | null;
  onCommit: (commit: SetupCommit) => void;
  onCancel: () => void;
  /** Pré-remplissage venant d'un assistant de tuning : message suggéré + réglages à revoir. */
  initialMessage?: string;
  highlightKeys?: string[];
}

let fieldSeq = 0;
function newRowId() {
  fieldSeq += 1;
  return `row-${Date.now()}-${fieldSeq}`;
}

export function SetupCommitForm({
  bow,
  lastCommit,
  onCommit,
  onCancel,
  initialMessage,
  highlightKeys = [],
}: SetupCommitFormProps) {
  const [message, setMessage] = useState(initialMessage ?? "");
  const [rows, setRows] = useState<Array<SetupField & { rowId: string }>>(() => {
    const base = lastCommit
      ? lastCommit.fields.map((f) => ({ ...f, rowId: newRowId() }))
      : DEFAULT_SETUP_FIELDS.map((f) => ({ ...f, value: "", rowId: newRowId() }));
    if (highlightKeys.length === 0) return base;
    // Les réglages suggérés par le diagnostic remontent en haut de la liste.
    return [...base].sort((a, b) => Number(highlightKeys.includes(b.key)) - Number(highlightKeys.includes(a.key)));
  });

  function updateRow(rowId: string, patch: Partial<SetupField>) {
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)));
  }

  function removeRow(rowId: string) {
    setRows((prev) => prev.filter((r) => r.rowId !== rowId));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: `custom-${newRowId()}`, label: "", value: "", rowId: newRowId() }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fields: SetupField[] = rows
      .filter((r) => r.label.trim() !== "")
      .map((r) => ({ key: r.key, label: r.label.trim(), value: r.value.trim(), unit: r.unit }));

    const commit: SetupCommit = {
      id: crypto.randomUUID(),
      bowId: bow.id,
      timestamp: new Date().toISOString(),
      message: message.trim() || "Réglage",
      fields,
    };
    onCommit(commit);
  }

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onCancel} aria-label="Retour">
          ←
        </button>
        <h1>Nouveau commit — {bow.name}</h1>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Message</span>
          <input
            type="text"
            placeholder="ex : Augmenté la livre après la compét"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoFocus
          />
        </label>

        <div className="commit-fields">
          {rows.map((row) => {
            const suggested = highlightKeys.includes(row.key);
            return (
            <div key={row.rowId} className={`commit-field-row ${suggested ? "commit-field-row--suggested" : ""}`}>
              {suggested && <span className="commit-field-row__hint">💡 à revoir</span>}
              <input
                type="text"
                className="commit-field-row__label"
                placeholder="Réglage"
                value={row.label}
                onChange={(e) => updateRow(row.rowId, { label: e.target.value })}
              />
              <input
                type="text"
                inputMode="decimal"
                className="commit-field-row__value"
                placeholder="Valeur"
                value={row.value}
                onChange={(e) => updateRow(row.rowId, { value: e.target.value })}
              />
              <input
                type="text"
                className="commit-field-row__unit"
                placeholder="unité"
                value={row.unit ?? ""}
                onChange={(e) => updateRow(row.rowId, { unit: e.target.value })}
              />
              <button
                type="button"
                className="btn btn-icon"
                aria-label="Retirer ce réglage"
                onClick={() => removeRow(row.rowId)}
              >
                ✕
              </button>
            </div>
            );
          })}
        </div>

        <button type="button" className="btn btn-secondary btn-block" onClick={addRow}>
          + Ajouter un réglage
        </button>

        <button type="submit" className="btn btn-primary btn-block">
          Enregistrer le commit
        </button>
      </form>
    </div>
  );
}
