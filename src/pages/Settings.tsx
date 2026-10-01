import { useRef, useState } from "react";
import { downloadText } from "../utils/download";
import { Download, Upload, ShieldCheck } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { parseWorkspace, MAX_BACKUP_BYTES } from "../data/workspace";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

export function Settings() {
  const {
    exportBackup,
    restoreBackup,
    error,
    recoveryRaw,
    recoverStorage,
    retainedBackups,
  } = useWorkspace();
  const [pending, setPending] = useState<{
    raw: string;
    name: string;
    summary: string;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [fileError, setFileError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const chooseFile = async (file?: File) => {
    setFileError("");
    setNotice("");
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES)
        throw new Error("Backup exceeds the 5 MB limit.");
      const raw = await file.text();
      const parsed = parseWorkspace(raw);
      setPending({
        raw,
        name: file.name,
        summary: `${parsed.companies.length} companies, ${parsed.contacts.length} contacts, ${parsed.tasks.length} tasks and ${parsed.deals.length} deals`,
      });
    } catch (cause) {
      setFileError(
        cause instanceof Error ? cause.message : "Could not read this backup.",
      );
    } finally {
      if (input.current) input.current.value = "";
    }
  };
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workspace settings</h1>
        <p className="text-gray-600">Keep a portable copy of your local CRM</p>
      </div>
      <Card>
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-blue-600 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold">
              Your browser is the workspace
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              This is a single-browser local CRM. The sign-in screen is a demo
              gate, not secure authentication. Records are stored on this
              browser and origin, with no server, cloud sync or multi-user
              access. Clearing browser data removes the workspace. Export
              backups regularly and avoid sensitive customer data on shared
              devices.
            </p>
          </div>
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold mb-2">Backup and restore</h2>
        <p className="text-sm text-gray-600 mb-4">
          Export includes companies, contacts, tasks, sample deals and real
          workspace activity. Restore validates the whole file first, then asks
          before replacing records. The previous saved snapshot is retained
          locally for recovery.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            icon={Download}
            onClick={() => {
              downloadText(
                exportBackup(),
                `crm-backup-${new Date().toISOString().slice(0, 10)}.json`,
              );
              setNotice("Backup downloaded. Keep it somewhere safe.");
            }}
          >
            Export backup
          </Button>
          <Button
            icon={Upload}
            variant="outline"
            onClick={() => input.current?.click()}
          >
            Import backup
          </Button>
        </div>
        <label className="sr-only" htmlFor="backup-file">
          Choose backup file
        </label>
        <input
          ref={input}
          id="backup-file"
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={(event) => void chooseFile(event.target.files?.[0])}
        />
        {notice && (
          <p role="status" className="mt-4 text-sm text-green-700">
            {notice}
          </p>
        )}
        {fileError && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {fileError}
          </p>
        )}
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Retained recovery copies</h2>
        <p className="text-sm text-gray-600 my-3">
          Download these copies and use Import backup to review and restore a
          valid workspace. Recovery copies stay on this browser.
        </p>
        <div className="flex flex-wrap gap-3">
          {retainedBackups.previous && (
            <Button
              variant="outline"
              onClick={() =>
                downloadText(
                  retainedBackups.previous!,
                  "crm-previous-workspace.json",
                )
              }
            >
              Download previous workspace
            </Button>
          )}
          {retainedBackups.damaged && (
            <Button
              variant="outline"
              onClick={() =>
                downloadText(
                  retainedBackups.damaged!,
                  "crm-preserved-damaged-data.json",
                )
              }
            >
              Download preserved damaged data
            </Button>
          )}
          {!retainedBackups.previous && !retainedBackups.damaged && (
            <p className="text-sm text-gray-500">No recovery copies yet</p>
          )}
        </div>
      </Card>
      {recoveryRaw !== null && (
        <Card>
          <h2 className="text-lg font-semibold">Recover damaged storage</h2>
          <p className="text-sm text-gray-600 my-3">
            The original saved bytes are untouched. Download them for
            inspection, then start the sample workspace. A recovery copy will
            also be kept in browser storage.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                downloadText(recoveryRaw, "crm-damaged-storage.json")
              }
            >
              Download damaged data
            </Button>
            <Button onClick={recoverStorage}>Start recovered workspace</Button>
          </div>
        </Card>
      )}
      <Modal
        isOpen={pending !== null}
        onClose={() => setPending(null)}
        title="Restore workspace backup"
      >
        <p className="text-gray-700 break-words">
          {pending?.name}: {pending?.summary}
        </p>
        <p className="text-sm text-gray-600 mt-3">
          This replaces the current workspace. Export a backup first if you want
          a separate copy.
        </p>
        {error && (
          <p role="alert" className="text-red-700 mt-3">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setPending(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (pending && restoreBackup(pending.raw)) {
                setPending(null);
                setNotice("Workspace restored successfully.");
              }
            }}
          >
            Restore backup
          </Button>
        </div>
      </Modal>
    </div>
  );
}
