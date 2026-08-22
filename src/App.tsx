import { useState } from "react";
import type { Session } from "./types";
import { loadSessions, upsertSession, deleteSession } from "./storage";
import type { BowProfile, SetupCommit } from "./gearTypes";
import { loadBows, loadCommits, upsertBow, deleteBow, addCommit } from "./gearStorage";
import { SessionList } from "./components/SessionList";
import { NewSessionForm } from "./components/NewSessionForm";
import { ScoreEntry } from "./components/ScoreEntry";
import { Palmares } from "./components/Palmares";
import { GearList } from "./components/GearList";
import { BowHistory } from "./components/BowHistory";
import { SetupCommitForm } from "./components/SetupCommitForm";
import { SetupDiffView } from "./components/SetupDiffView";
import { GroupingPicker } from "./components/GroupingPicker";
import { GroupingCompare } from "./components/GroupingCompare";
import { TuningHub } from "./components/TuningHub";
import type { TuningWizard } from "./components/TuningHub";
import { PaperTuningWizard } from "./components/PaperTuningWizard";
import { BareshaftTuningWizard } from "./components/BareshaftTuningWizard";
import { WalkbackTuningWizard } from "./components/WalkbackTuningWizard";
import { CamCheckForm } from "./components/CamCheckForm";
import { Chrono } from "./components/Chrono";
import { FreeShooting } from "./components/FreeShooting";
import { GroupAnalysisView } from "./components/GroupAnalysisView";
import "./App.css";

interface CommitDraft {
  message: string;
  highlightKeys: string[];
}

type View =
  | { name: "list" }
  | { name: "new" }
  | { name: "entry"; id: string }
  | { name: "free-shooting"; id: string }
  | { name: "palmares" }
  | { name: "gear" }
  | { name: "gear-bow"; bowId: string }
  | { name: "gear-commit"; bowId: string; draft?: CommitDraft }
  | { name: "gear-diff"; bowId: string; aId: string; bId: string }
  | { name: "grouping" }
  | { name: "grouping-compare"; aId: string; bId: string }
  | { name: "grouping-analysis" }
  | { name: "tuning" }
  | { name: "tuning-wizard"; wizard: TuningWizard }
  | { name: "chrono" };

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions());
  const [bows, setBows] = useState<BowProfile[]>(() => loadBows());
  const [commits, setCommits] = useState<SetupCommit[]>(() => loadCommits());
  const [view, setView] = useState<View>({ name: "list" });

  function handleCreate(session: Session) {
    setSessions(upsertSession(session));
    setView({ name: "entry", id: session.id });
  }

  function handleChange(session: Session) {
    setSessions(upsertSession(session));
  }

  function handleDelete(id: string) {
    setSessions(deleteSession(id));
  }

  function handleCreateBow(bow: BowProfile) {
    setBows(upsertBow(bow).bows);
  }

  function handleDeleteBow(bowId: string) {
    const data = deleteBow(bowId);
    setBows(data.bows);
    setCommits(data.commits);
  }

  function handleAddCommit(commit: SetupCommit) {
    setCommits(addCommit(commit).commits);
    setView({ name: "gear-bow", bowId: commit.bowId });
  }

  /** Un assistant de tuning propose un diagnostic : on ouvre le commit de l'arc choisi, pré-rempli. */
  function handleTuningCommitDraft(bowId: string, draft: CommitDraft) {
    if (!bowId) return;
    setView({ name: "gear-commit", bowId, draft });
  }

  return (
    <div className="app">
      {view.name === "list" && (
        <SessionList
          sessions={sessions}
          onOpen={(id) => setView({ name: "entry", id })}
          onNew={() => setView({ name: "new" })}
          onDelete={handleDelete}
          onOpenPalmares={() => setView({ name: "palmares" })}
          onOpenGear={() => setView({ name: "gear" })}
          onOpenGrouping={() => setView({ name: "grouping" })}
          onOpenGroupingAnalysis={() => setView({ name: "grouping-analysis" })}
          onOpenTuning={() => setView({ name: "tuning" })}
          onOpenChrono={() => setView({ name: "chrono" })}
        />
      )}
      {view.name === "new" && (
        <NewSessionForm
          bows={bows}
          onCreate={handleCreate}
          onCancel={() => setView({ name: "list" })}
        />
      )}
      {view.name === "palmares" && (
        <Palmares sessions={sessions} onBack={() => setView({ name: "list" })} />
      )}
      {view.name === "entry" &&
        (() => {
          const session = sessions.find((s) => s.id === view.id);
          if (!session) {
            setView({ name: "list" });
            return null;
          }
          return (
            <ScoreEntry
              session={session}
              allSessions={sessions}
              onChange={handleChange}
              onBack={() => setView({ name: "list" })}
              onFreeShooting={() => setView({ name: "free-shooting", id: view.id })}
            />
          );
        })()}
      {view.name === "free-shooting" &&
        (() => {
          const session = sessions.find((s) => s.id === view.id);
          if (!session) {
            setView({ name: "list" });
            return null;
          }
          return (
            <FreeShooting
              session={session}
              onChange={handleChange}
              onBack={() => setView({ name: "entry", id: view.id })}
            />
          );
        })()}
      {view.name === "gear" && (
        <GearList
          bows={bows}
          commits={commits}
          onOpenBow={(bowId) => setView({ name: "gear-bow", bowId })}
          onCreateBow={handleCreateBow}
          onDeleteBow={handleDeleteBow}
          onBack={() => setView({ name: "list" })}
        />
      )}
      {view.name === "gear-bow" &&
        (() => {
          const bow = bows.find((b) => b.id === view.bowId);
          if (!bow) {
            setView({ name: "gear" });
            return null;
          }
          const bowCommits = commits
            .filter((c) => c.bowId === bow.id)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          return (
            <BowHistory
              bow={bow}
              commits={bowCommits}
              sessions={sessions}
              onBack={() => setView({ name: "gear" })}
              onNewCommit={() => setView({ name: "gear-commit", bowId: bow.id })}
              onRevert={(commit) =>
                handleAddCommit({
                  id: crypto.randomUUID(),
                  bowId: bow.id,
                  timestamp: new Date().toISOString(),
                  message: `Retour à : ${commit.message}`,
                  fields: commit.fields,
                })
              }
              onCompare={(aId, bId) => setView({ name: "gear-diff", bowId: bow.id, aId, bId })}
            />
          );
        })()}
      {view.name === "gear-commit" &&
        (() => {
          const bow = bows.find((b) => b.id === view.bowId);
          if (!bow) {
            setView({ name: "gear" });
            return null;
          }
          const bowCommits = commits
            .filter((c) => c.bowId === bow.id)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          return (
            <SetupCommitForm
              bow={bow}
              lastCommit={bowCommits[0] ?? null}
              onCommit={handleAddCommit}
              onCancel={() => setView({ name: "gear-bow", bowId: bow.id })}
              initialMessage={view.draft?.message}
              highlightKeys={view.draft?.highlightKeys}
            />
          );
        })()}
      {view.name === "gear-diff" &&
        (() => {
          const bow = bows.find((b) => b.id === view.bowId);
          const commitA = commits.find((c) => c.id === view.aId);
          const commitB = commits.find((c) => c.id === view.bId);
          if (!bow || !commitA || !commitB) {
            setView({ name: "gear" });
            return null;
          }
          // On affiche toujours du plus ancien vers le plus récent.
          const [older, newer] =
            commitA.timestamp <= commitB.timestamp ? [commitA, commitB] : [commitB, commitA];
          return (
            <SetupDiffView
              bow={bow}
              a={older}
              b={newer}
              onBack={() => setView({ name: "gear-bow", bowId: bow.id })}
              onRevertToA={() =>
                handleAddCommit({
                  id: crypto.randomUUID(),
                  bowId: bow.id,
                  timestamp: new Date().toISOString(),
                  message: `Retour à : ${older.message}`,
                  fields: older.fields,
                })
              }
            />
          );
        })()}
      {view.name === "grouping" && (
        <GroupingPicker
          sessions={sessions}
          onCompare={(aId, bId) => setView({ name: "grouping-compare", aId, bId })}
          onBack={() => setView({ name: "list" })}
        />
      )}
      {view.name === "grouping-compare" &&
        (() => {
          const sessionA = sessions.find((s) => s.id === view.aId);
          const sessionB = sessions.find((s) => s.id === view.bId);
          if (!sessionA || !sessionB) {
            setView({ name: "grouping" });
            return null;
          }
          // On affiche toujours la plus ancienne des deux à gauche.
          const [older, newer] =
            sessionA.date <= sessionB.date ? [sessionA, sessionB] : [sessionB, sessionA];
          return (
            <GroupingCompare a={older} b={newer} onBack={() => setView({ name: "grouping" })} />
          );
        })()}
      {view.name === "grouping-analysis" && (
        <GroupAnalysisView
          sessions={sessions}
          onBack={() => setView({ name: "list" })}
        />
      )}
      {view.name === "tuning" && (
        <TuningHub
          onSelect={(wizard) => setView({ name: "tuning-wizard", wizard })}
          onBack={() => setView({ name: "list" })}
        />
      )}
      {view.name === "tuning-wizard" && (
        <>
          {view.wizard === "paper" && (
            <PaperTuningWizard
              bows={bows}
              onBack={() => setView({ name: "tuning" })}
              onCreateCommit={handleTuningCommitDraft}
            />
          )}
          {view.wizard === "bareshaft" && (
            <BareshaftTuningWizard
              bows={bows}
              onBack={() => setView({ name: "tuning" })}
              onCreateCommit={handleTuningCommitDraft}
            />
          )}
          {view.wizard === "walkback" && (
            <WalkbackTuningWizard
              bows={bows}
              onBack={() => setView({ name: "tuning" })}
              onCreateCommit={handleTuningCommitDraft}
            />
          )}
          {view.wizard === "cams" && (
            <CamCheckForm
              bows={bows}
              onBack={() => setView({ name: "tuning" })}
              onCreateCommit={handleTuningCommitDraft}
            />
          )}
        </>
      )}
      {view.name === "chrono" && <Chrono onBack={() => setView({ name: "list" })} />}
    </div>
  );
}
