const ATTENDANCE_LABELS = {
  both: "Both Nikah & Valima",
  nikah: "Nikah only",
  valima: "Valima only",
  none: "Unable to attend",
} as const;

type Attendance = keyof typeof ATTENDANCE_LABELS;

type Rsvp = {
  name: string;
  phone: string;
  guests: number;
  attending: Attendance;
  message: string;
};

function parse(input: unknown): { rsvp?: Rsvp; honeypot?: boolean; error?: string } {
  if (!input || typeof input !== "object") return { error: "Invalid request body." };
  const b = input as Record<string, unknown>;

  if (typeof b.company === "string" && b.company.trim() !== "") return { honeypot: true };

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { error: "Please tell us your name." };
  if (name.length > 120) return { error: "That name is a little long — 120 characters max." };

  const phone = typeof b.phone === "string" ? b.phone.trim().slice(0, 40) : "";
  const guests = Number(b.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 10) return { error: "Guests must be a number between 1 and 10." };

  const attending = typeof b.attending === "string" ? b.attending : "";
  if (!(attending in ATTENDANCE_LABELS)) return { error: "Please choose which celebrations you will attend." };

  const message = typeof b.message === "string" ? b.message.trim().slice(0, 600) : "";

  return { rsvp: { name, phone, guests, attending: attending as Attendance, message } };
}

/** Accepts a viewform / formResponse link (or the bare form id) and returns the submit URL. */
function formActionUrl(raw: string) {
  let value = raw.trim().split("?")[0].replace(/\/+$/, "");
  if (!value.includes("/")) return `https://docs.google.com/forms/d/e/${value}/formResponse`;
  if (value.endsWith("/viewform")) value = value.slice(0, -"/viewform".length);
  if (!value.endsWith("/formResponse")) value += "/formResponse";
  return value;
}

function entryKey(raw: string | undefined) {
  const value = raw?.trim();
  if (!value) return undefined;
  return value.startsWith("entry.") ? value : `entry.${value}`;
}

async function sendToGoogleForm(rsvp: Rsvp) {
  const action = formActionUrl(process.env.GOOGLE_FORM_ACTION_URL!);
  const fields: [string | undefined, string][] = [
    [entryKey(process.env.GOOGLE_FORM_ENTRY_NAME), rsvp.name],
    [entryKey(process.env.GOOGLE_FORM_ENTRY_PHONE), rsvp.phone],
    [entryKey(process.env.GOOGLE_FORM_ENTRY_GUESTS), String(rsvp.guests)],
    [entryKey(process.env.GOOGLE_FORM_ENTRY_ATTENDING), ATTENDANCE_LABELS[rsvp.attending]],
    [entryKey(process.env.GOOGLE_FORM_ENTRY_MESSAGE), rsvp.message],
  ];

  const body = new URLSearchParams();
  for (const [key, value] of fields) if (key) body.set(key, value);
  if (![...body.keys()].length) {
    throw new Error("GOOGLE_FORM_ACTION_URL is set but no GOOGLE_FORM_ENTRY_* ids are configured.");
  }

  const res = await fetch(action, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Google Form rejected the submission (HTTP ${res.status}).`);
}

async function sendToSheetsWebApp(rsvp: Rsvp) {
  const res = await fetch(process.env.GOOGLE_SHEETS_WEBAPP_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...rsvp,
      attendingLabel: ATTENDANCE_LABELS[rsvp.attending],
      submittedAt: new Date().toISOString(),
    }),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Google Sheets web app rejected the submission (HTTP ${res.status}).`);
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = parse(json);
  if (parsed.error) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  // Pretend success for bots so they stop retrying, but store nothing.
  if (parsed.honeypot) return Response.json({ ok: true });

  const rsvp = parsed.rsvp!;
  const hasForm = Boolean(process.env.GOOGLE_FORM_ACTION_URL);
  const hasSheet = Boolean(process.env.GOOGLE_SHEETS_WEBAPP_URL);

  if (!hasForm && !hasSheet) {
    console.warn("[rsvp] No destination configured; dropping reply:", rsvp);
    return Response.json(
      {
        ok: false,
        error:
          "RSVP delivery is not set up yet. Set GOOGLE_FORM_ACTION_URL (plus GOOGLE_FORM_ENTRY_* ids) or GOOGLE_SHEETS_WEBAPP_URL — see README.",
      },
      { status: 503 }
    );
  }

  try {
    if (hasForm) await sendToGoogleForm(rsvp);
    if (hasSheet) await sendToSheetsWebApp(rsvp);
  } catch (err) {
    console.error("[rsvp] delivery failed:", err);
    return Response.json(
      { ok: false, error: "We could not save your reply right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
