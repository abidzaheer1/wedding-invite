"use client";

import { useState, type FormEvent } from "react";
import { wedding } from "@/data/wedding";

export const ATTENDANCE_OPTIONS = [
  { value: "both", label: "Both Nikah & Valima", hint: `${wedding.nikah.date.split(",")[0]} & ${wedding.valima.date.split(",")[0]}` },
  { value: "nikah", label: "Nikah only", hint: `${wedding.nikah.venue} · ${wedding.nikah.time}` },
  { value: "valima", label: "Valima only", hint: `${wedding.valima.venue} · ${wedding.valima.time}` },
  { value: "none", label: "Regretfully, I can't attend", hint: "We will miss you — send your duas" },
] as const;

export type Attendance = (typeof ATTENDANCE_OPTIONS)[number]["value"];

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; name: string; attending: Attendance } | { kind: "error"; message: string };

export function RsvpForm() {
  const [attending, setAttending] = useState<Attendance>("both");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      guests: Number(data.get("guests") ?? 1),
      attending,
      message: String(data.get("message") ?? "").trim(),
      company: String(data.get("company") ?? ""),
    };
    if (!payload.name) {
      setStatus({ kind: "error", message: "Please tell us your name so we can save your seat." });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        throw new Error(body?.error || "Something went wrong while sending your reply.");
      }
      setStatus({ kind: "done", name: payload.name, attending });
      form.reset();
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  if (status.kind === "done") {
    const option = ATTENDANCE_OPTIONS.find((o) => o.value === status.attending);
    return (
      <div className="rsvp-card rsvp-card--done" role="status" aria-live="polite">
        <span className="kicker">JazakAllah Khair</span>
        <h3 className="rsvp-done-title">
          {status.attending === "none" ? `We will miss you, ${status.name}.` : `See you there, ${status.name}!`}
        </h3>
        <p className="rsvp-done-text">
          {status.attending === "none"
            ? "Thank you for letting us know. Please keep us in your duas."
            : `Your reply has been recorded — ${option?.label}. We cannot wait to celebrate with you.`}
        </p>
        <p className="rsvp-hashtag">{wedding.hashtag}</p>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form className="rsvp-card" onSubmit={onSubmit} noValidate>
      <div className="rsvp-grid">
        <label className="field">
          <span>Your name</span>
          <input name="name" type="text" autoComplete="name" placeholder="Full name" required maxLength={120} disabled={sending} />
        </label>
        <label className="field">
          <span>Phone / WhatsApp</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="Optional" maxLength={40} disabled={sending} />
        </label>
        <label className="field field--small">
          <span>Guests</span>
          <select name="guests" defaultValue="1" disabled={sending}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="attend" disabled={sending}>
        <legend>I will be attending</legend>
        {ATTENDANCE_OPTIONS.map((o) => (
          <label key={o.value} className={`attend-option ${attending === o.value ? "attend-option--on" : ""}`}>
            <input
              type="radio"
              name="attending"
              value={o.value}
              checked={attending === o.value}
              onChange={() => setAttending(o.value)}
            />
            <span className="attend-label">{o.label}</span>
            <span className="attend-hint">{o.hint}</span>
          </label>
        ))}
      </fieldset>

      <label className="field">
        <span>A message for the couple</span>
        <textarea name="message" rows={2} placeholder="Duas, wishes, dietary notes…" maxLength={600} disabled={sending} />
      </label>

      {/* Honeypot: hidden from people, filled only by bots */}
      <input className="hp" name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      {status.kind === "error" && (
        <p className="rsvp-error" role="alert">
          {status.message}
        </p>
      )}

      <button className="rsvp" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Send my reply"}
        <span aria-hidden="true">{sending ? "…" : "→"}</span>
      </button>
      <p className="rsvp-fineprint">Kindly reply by {wedding.rsvpDeadline}. Replies are saved to the family&apos;s guest sheet.</p>
    </form>
  );
}
