import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  getMapping,
  getProfiles,
  getRoles,
  ingestProfile,
  overrideMapping,
  resetMapping
} from "./api";
import { sampleProfiles } from "./sampleProfiles";
import type { CurrentMapping, MappingRow, Role, StoredProfile } from "./types";
import "./styles.css";

function App() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rows, setRows] = useState<MappingRow[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading mappings...");
  const [loading, setLoading] = useState(false);

  async function loadDashboard(keepSelection = false) {
    setLoading(true);
    setMessage("Loading roles and profiles...");
    try {
      const nextRoles = await getRoles();
      let profiles = await getProfiles();

      if (profiles.length === 0) {
        setMessage("No profiles found. Loading assignment sample profiles...");
        for (const profile of sampleProfiles) {
          await ingestProfile(profile);
        }
        profiles = await getProfiles();
      }

      const nextRows = await Promise.all(
        profiles.map(async (profile) => ({
          profile,
          mapping: await getMapping(profile.externalUserId)
        }))
      );

      setRoles(nextRoles);
      setRows(nextRows);
      setSelectedUserId((current) => (keepSelection ? current ?? nextRows[0]?.profile.externalUserId ?? null : nextRows[0]?.profile.externalUserId ?? null));
      setMessage("Ready. Select usr_006 or usr_007 to review ambiguity, then override or reset.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const selected = rows.find((row) => row.profile.externalUserId === selectedUserId) ?? null;
  const counts = useMemo(
    () => ({
      profiles: rows.length,
      review: rows.filter((row) => row.mapping.latestInference?.status !== "inferred").length,
      overrides: rows.filter((row) => row.mapping.source === "overridden").length
    }),
    [rows]
  );

  async function handleOverride(userId: string, roleId: string, reason: string) {
    setMessage("Applying override...");
    await overrideMapping(userId, roleId, reason);
    setMessage("Override applied. Mapping source is now overridden.");
    await loadDashboard(true);
  }

  async function handleReset(userId: string) {
    setMessage("Resetting override...");
    await resetMapping(userId);
    setMessage("Override reset. Mapping source is now inferred.");
    await loadDashboard(true);
  }

  return (
    <main className="shell">
      <header className="header">
        <div>
          <p className="eyebrow">Role Inference Service</p>
          <h1>Admin Mapping Review</h1>
        </div>
        <button className="secondary" onClick={() => void loadDashboard(true)} disabled={loading}>
          Refresh
        </button>
      </header>

      <section className="summary" aria-live="polite">
        <SummaryCard value={counts.profiles} label="Profiles" />
        <SummaryCard value={counts.review} label="Need review" />
        <SummaryCard value={counts.overrides} label="Overrides" />
        <p>{message}</p>
      </section>

      <section className="layout">
        <MappingDashboard rows={rows} selectedUserId={selectedUserId} onSelect={setSelectedUserId} />
        <ProfileDetails row={selected} roles={roles} onOverride={handleOverride} onReset={handleReset} />
      </section>
    </main>
  );
}

function SummaryCard({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

function MappingDashboard({
  rows,
  selectedUserId,
  onSelect
}: {
  rows: MappingRow[];
  selectedUserId: string | null;
  onSelect: (userId: string) => void;
}) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>Mapping Dashboard</h2>
        <span className="hint">Select a row for details</span>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Selected Role</th>
              <th>Source</th>
              <th>Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.profile.externalUserId}
                className={row.profile.externalUserId === selectedUserId ? "selected" : ""}
                onClick={() => onSelect(row.profile.externalUserId)}
              >
                <td>
                  <strong>{row.profile.displayName}</strong>
                  <span className="muted">{row.profile.externalUserId}</span>
                </td>
                <td>
                  <strong>{row.mapping.selectedRole?.roleName ?? "No role selected"}</strong>
                  <span className="muted">
                    {row.mapping.latestInference?.inferredRoleName ? `Inferred: ${row.mapping.latestInference.inferredRoleName}` : ""}
                  </span>
                </td>
                <td>
                  <Badge value={row.mapping.source} kind="source" />
                </td>
                <td>
                  <Badge value={row.mapping.latestInference?.status ?? "none"} kind="status" />
                </td>
                <td>
                  <Confidence value={row.mapping.latestInference?.confidence ?? null} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProfileDetails({
  row,
  roles,
  onOverride,
  onReset
}: {
  row: MappingRow | null;
  roles: Role[];
  onOverride: (userId: string, roleId: string, reason: string) => Promise<void>;
  onReset: (userId: string) => Promise<void>;
}) {
  const [roleId, setRoleId] = useState("");
  const [reason, setReason] = useState("Admin reviewed this mapping.");

  useEffect(() => {
    setRoleId(roles[0]?.roleId ?? "");
  }, [roles]);

  if (!row) {
    return (
      <aside className="panel details">
        <p className="empty">Select a profile to inspect inference details.</p>
      </aside>
    );
  }

  const { profile, mapping } = row;
  const raw = readRawProfile(profile);
  const inference = mapping.latestInference;

  return (
    <aside className="panel details">
      <div className="detailsHeader">
        <div>
          <h2>{profile.displayName}</h2>
          <span className="muted">{profile.externalUserId}</span>
        </div>
        <Badge value={mapping.source} kind="source" />
      </div>

      <div className="detailsGrid">
        <Field label="Selected Role" value={mapping.selectedRole?.roleName ?? "No role selected"} />
        <Field label="Status" value={inference?.status ?? "No inference"} />
        <Field label="Confidence" value={inference ? String(inference.confidence) : "n/a"} />
        <Field label="Department" value={raw.department ?? "n/a"} />
      </div>

      <DetailSection title="Explanation">
        <p className="empty">{inference?.explanation ?? "No inference has been created."}</p>
      </DetailSection>
      <DetailSection title="Signals">
        <List items={inference?.signals ?? []} />
      </DetailSection>
      <DetailSection title="Conflict Signals">
        <List items={inference?.conflictSignals ?? []} />
      </DetailSection>
      <DetailSection title="Alternative Roles">
        <List items={(inference?.alternatives ?? []).map((candidate) => `${candidate.roleName} — confidence ${candidate.confidence}`)} />
      </DetailSection>
      {mapping.activeOverride ? (
        <DetailSection title="Active Override">
          <p className="empty">
            {mapping.activeOverride.role.roleName} — {mapping.activeOverride.reason}
          </p>
        </DetailSection>
      ) : null}

      <div className="overrideBox">
        <h3>Admin Override</h3>
        <label>
          Role
          <select value={roleId} onChange={(event) => setRoleId(event.target.value)}>
            {roles.map((role) => (
              <option key={role.roleId} value={role.roleId}>
                {role.roleName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Reason
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
        <div className="actions">
          <button disabled={!roleId || !reason.trim()} onClick={() => void onOverride(profile.externalUserId, roleId, reason)}>
            Apply Override
          </button>
          <button className="danger" onClick={() => void onReset(profile.externalUserId)}>
            Reset To Inferred
          </button>
        </div>
      </div>
    </aside>
  );
}

function Badge({ value, kind }: { value: string; kind: "source" | "status" }) {
  return <span className={`badge ${kind}_${value}`}>{value}</span>;
}

function Confidence({ value }: { value: number | null }) {
  return (
    <div className="confidence">
      <span>{value ?? "n/a"}</span>
      <div className="bar">
        <span style={{ width: `${Math.round((value ?? 0) * 100)}%` }} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="empty">None.</p>;
  }

  return (
    <ul className="list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function readRawProfile(profile: StoredProfile): Record<string, string | null | undefined> {
  try {
    return JSON.parse(profile.rawPayload) as Record<string, string | null | undefined>;
  } catch {
    return {};
  }
}

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
