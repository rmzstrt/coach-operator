import { useState } from "react";
import type { BowProfile } from "../gearTypes";

interface CamCheckFormProps {
  bows: BowProfile[];
  onBack: () => void;
  onCreateCommit: (bowId: string, draft: { message: string; highlightKeys: string[] }) => void;
}

type SyncStatus = "" | "synchro" | "sup-avance" | "inf-avance" | "incertain";
type LeanStatus = "" | "aligne" | "interieur" | "exterieur" | "incertain";

const SYNC_LABEL: Record<Exclude<SyncStatus, "">, string> = {
  synchro: "Cames synchronisées",
  "sup-avance": "Câble sup. en avance",
  "inf-avance": "Câble inf. en avance",
  incertain: "Incertain",
};

const LEAN_LABEL: Record<Exclude<LeanStatus, "">, string> = {
  aligne: "Aligné",
  interieur: "Penche vers l'intérieur",
  exterieur: "Penche vers l'extérieur",
  incertain: "Incertain",
};

export function CamCheckForm({ bows, onBack, onCreateCommit }: CamCheckFormProps) {
  const [sync, setSync] = useState<SyncStatus>("");
  const [lean, setLean] = useState<LeanStatus>("");
  const [note, setNote] = useState("");
  const [bowId, setBowId] = useState(bows.length === 1 ? bows[0].id : "");

  const parts = [
    sync ? `synchro : ${SYNC_LABEL[sync]}` : null,
    lean ? `cam lean : ${LEAN_LABEL[lean]}` : null,
  ].filter((x): x is string => x !== null);
  const canSave = bowId !== "" && parts.length > 0;

  function handleSave() {
    const message = `Vérif. cames — ${parts.join(", ")}${note.trim() ? ` (${note.trim()})` : ""}`;
    onCreateCommit(bowId, { message, highlightKeys: ["camSync", "camLean"] });
  }

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>⚙️ Synchro cames & cam lean</h1>
      </header>

      <div className="card">
        <p style={{ margin: 0 }}>
          <strong>Synchro cames</strong> : à pleine allonge, fais vérifier (par toi ou un
          tiers) si les deux cames arrivent en butée en même temps, ou compare la longueur
          de câble sortie de chaque module.
        </p>
        <p style={{ margin: "10px 0 0" }}>
          <strong>Cam lean</strong> : vise dans l'axe de chaque came — elle doit rester
          perpendiculaire au bras, sans pencher d'un côté.
        </p>
        <p className="text-muted" style={{ margin: "10px 0 0" }}>
          ⚠️ Corriger la synchro ou le lean nécessite un poids-presse (bow press) et touche
          aux câbles — si tu n'as pas l'outillage ou l'expérience, fais vérifier/régler en
          pro shop plutôt que d'y toucher toi-même. Cette checklist sert à consigner ce que
          tu observes, pas à faire le réglage.
        </p>
      </div>

      <label className="field">
        <span>Synchro cames</span>
        <select value={sync} onChange={(e) => setSync(e.target.value as SyncStatus)}>
          <option value="">— non vérifié —</option>
          {Object.entries(SYNC_LABEL).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Cam lean</span>
        <select value={lean} onChange={(e) => setLean(e.target.value as LeanStatus)}>
          <option value="">— non vérifié —</option>
          {Object.entries(LEAN_LABEL).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Note (optionnel)</span>
        <input
          type="text"
          placeholder="ex : câble sup. en avance de ~3mm"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {bows.length === 0 ? (
        <p className="text-muted" style={{ textAlign: "center" }}>
          Ajoute un arc dans 🔧 Matériel pour pouvoir consigner cette vérification.
        </p>
      ) : (
        <>
          {bows.length > 1 && (
            <label className="field">
              <span>Arc concerné</span>
              <select value={bowId} onChange={(e) => setBowId(e.target.value)}>
                <option value="">— choisir un arc —</option>
                {bows.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="btn btn-secondary btn-block" disabled={!canSave} onClick={handleSave}>
            💾 Consigner comme commit
          </button>
        </>
      )}
    </div>
  );
}
