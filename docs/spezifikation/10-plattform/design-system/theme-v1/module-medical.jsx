// Medical module — calm, sensitive design
// 6 tabs: Overview · Labs · Medications · History · Documents · Appointments

const MedCtx = React.createContext(null);

// ── Data fixtures ───────────────────────────────────────────
const LAB_BIOMARKERS = [
  { id: "totalT",  name: "Total Testosterone", category: "Hormone",  value: 712, unit: "ng/dL", range: [600, 900],   status: "in", trend: "stable",
    history: [580, 620, 650, 680, 700, 712], lastDate: "2026-04-23" },
  { id: "freeT",   name: "Free Testosterone",  category: "Hormone",  value: 18.4, unit: "ng/dL", range: [15, 25],     status: "in", trend: "up",
    history: [12, 14, 15.5, 17, 18, 18.4], lastDate: "2026-04-23" },
  { id: "e2",      name: "Estradiol (sens.)",  category: "Hormone",  value: 26, unit: "pg/mL", range: [20, 35],       status: "in", trend: "stable",
    history: [22, 28, 32, 25, 27, 26], lastDate: "2026-04-23" },
  { id: "lh",      name: "LH",                  category: "Hormone",  value: 4.2, unit: "IU/L", range: [1.7, 8.6],    status: "in", trend: "stable",
    history: [4.0, 4.1, 4.3, 4.0, 4.1, 4.2], lastDate: "2026-04-23" },
  { id: "hct",     name: "Hematocrit",          category: "Blood",    value: 48, unit: "%", range: [39, 50],          status: "watch", trend: "up",
    history: [44, 45, 45, 46, 47, 48], lastDate: "2026-04-23" },
  { id: "hgb",     name: "Hemoglobin",          category: "Blood",    value: 15.8, unit: "g/dL", range: [13.5, 17.5], status: "in", trend: "stable",
    history: [15.0, 15.2, 15.5, 15.6, 15.8, 15.8], lastDate: "2026-04-23" },
  { id: "psa",     name: "PSA",                 category: "Prostate", value: 0.9, unit: "ng/mL", range: [0, 2.5],     status: "in", trend: "stable",
    history: [0.7, 0.8, 0.8, 0.9, 0.9, 0.9], lastDate: "2026-04-23" },
  { id: "ferritin",name: "Ferritin",            category: "Iron",     value: 142, unit: "ng/mL", range: [30, 300],    status: "in", trend: "up",
    history: [88, 102, 118, 128, 138, 142], lastDate: "2026-04-23" },
  { id: "vitd",    name: "Vitamin D (25-OH)",   category: "Vitamin",  value: 48, unit: "ng/mL", range: [30, 80],      status: "in", trend: "up",
    history: [22, 28, 36, 42, 46, 48], lastDate: "2026-04-23" },
  { id: "tsh",     name: "TSH",                 category: "Thyroid",  value: 1.8, unit: "mIU/L", range: [0.5, 4.0],   status: "in", trend: "stable",
    history: [1.9, 1.8, 1.7, 1.8, 1.9, 1.8], lastDate: "2026-04-23" },
  { id: "alt",     name: "ALT",                 category: "Liver",    value: 28, unit: "U/L", range: [0, 40],         status: "in", trend: "stable",
    history: [24, 26, 27, 28, 28, 28], lastDate: "2026-04-23" },
  { id: "ast",     name: "AST",                 category: "Liver",    value: 22, unit: "U/L", range: [0, 40],         status: "in", trend: "stable",
    history: [20, 21, 22, 22, 23, 22], lastDate: "2026-04-23" },
  { id: "chol",    name: "Total Cholesterol",   category: "Lipid",    value: 184, unit: "mg/dL", range: [0, 200],     status: "in", trend: "stable",
    history: [192, 188, 186, 184, 185, 184], lastDate: "2026-04-23" },
  { id: "ldl",     name: "LDL",                 category: "Lipid",    value: 102, unit: "mg/dL", range: [0, 130],     status: "in", trend: "down",
    history: [118, 112, 108, 104, 102, 102], lastDate: "2026-04-23" },
  { id: "hdl",     name: "HDL",                 category: "Lipid",    value: 58, unit: "mg/dL", range: [40, 100],     status: "in", trend: "up",
    history: [48, 52, 54, 56, 57, 58], lastDate: "2026-04-23" },
  { id: "glucose", name: "Fasting Glucose",     category: "Metabolic",value: 102, unit: "mg/dL", range: [70, 99],     status: "out", trend: "up",
    history: [88, 92, 94, 96, 99, 102], lastDate: "2026-04-23" },
  { id: "hba1c",   name: "HbA1c",               category: "Metabolic",value: 5.4, unit: "%", range: [0, 5.7],         status: "in", trend: "stable",
    history: [5.2, 5.3, 5.3, 5.4, 5.4, 5.4], lastDate: "2026-04-23" },
  { id: "igf1",    name: "IGF-1",               category: "Hormone",  value: 286, unit: "ng/mL", range: [115, 355],   status: "in", trend: "up",
    history: [180, 210, 240, 270, 282, 286], lastDate: "2026-04-23" },
  { id: "crp",     name: "CRP (hs)",            category: "Inflam",   value: 0.6, unit: "mg/L", range: [0, 1.0],      status: "in", trend: "stable",
    history: [0.7, 0.6, 0.5, 0.7, 0.6, 0.6], lastDate: "2026-04-23" },
];

const MEDICATIONS = [
  { id: "test_c",     name: "Testosterone Cypionate", form: "IM injection", dose: "150 mg", schedule: "Mon + Thu",     started: "2024-09-12", rx: "RX-44102", physician: "Dr. M. Kessler", category: "Prescription · TRT",      adherence: 100, refillDays: 18, notes: "Standard TRT protocol." },
  { id: "hcg",        name: "HCG",                    form: "SubQ injection", dose: "500 IU", schedule: "Tue + Fri",   started: "2024-09-12", rx: "RX-44103", physician: "Dr. M. Kessler", category: "Prescription · TRT",      adherence: 98,  refillDays: 22, notes: "Testicular preservation." },
  { id: "anastro",    name: "Anastrozole",            form: "Tablet",         dose: "0.25 mg", schedule: "Every 3rd d",started: "2024-10-04", rx: "RX-44104", physician: "Dr. M. Kessler", category: "Prescription · AI",       adherence: 95,  refillDays: 38, notes: "Estrogen control. Titrated by E2." },
  { id: "ibuprofen",  name: "Ibuprofen 400",          form: "Tablet",         dose: "400 mg", schedule: "as needed",   started: "—",         rx: null,        physician: "—",              category: "OTC · as-needed",         adherence: null, refillDays: null, notes: "Right elbow flare-ups. Last used Apr 11." },
  { id: "pantoprazole",name:"Pantoprazole",           form: "Tablet",         dose: "40 mg",  schedule: "as needed",   started: "2025-02-01", rx: "RX-39822", physician: "Dr. S. Wagner",  category: "Prescription · GI",       adherence: null, refillDays: 90, notes: "Reflux during cuts. Last used Jan 30." },
];

const DIAGNOSES = [
  { id: "d1", title: "Right patellar tendinopathy",  status: "active",   onset: "2024-02-12", icd: "M76.5",   notes: "Resolved with progressive loading. Monitoring for recurrence." },
  { id: "d2", title: "Right lateral epicondylopathy",status: "active",   onset: "2025-03-04", icd: "M77.1",   notes: "Tendon-related. BPC-157 + eccentric loading protocol since April." },
  { id: "d3", title: "Primary hypogonadism (mild)",  status: "active",   onset: "2024-08-22", icd: "E29.1",   notes: "Confirmed by repeat panels + LH/FSH. TRT initiated 2024-09-12." },
];

const HISTORY_TIMELINE = [
  { date: "2025-03-04", category: "Diagnosis", title: "Right lateral epicondylopathy", icon: "alert", color: "var(--warn)",
    summary: "Onset after high-volume pulling block. Confirmed by US ultrasound at PhysioMed.", linkedDoc: "DOC-018" },
  { date: "2024-10-04", category: "Medication", title: "Started Anastrozole 0.25mg",   icon: "supplements", color: "var(--acc-suppl)",
    summary: "E2 sensitive trending 42 pg/mL after 4 weeks of TRT. Dose titrated to keep mid-20s." },
  { date: "2024-09-12", category: "Treatment", title: "TRT protocol initiated",        icon: "supplements", color: "var(--acc-medic)",
    summary: "Test Cyp 150mg/wk + HCG 500 IU 2x/wk. Trough target 600-800 ng/dL.", linkedDoc: "DOC-014" },
  { date: "2024-08-22", category: "Diagnosis", title: "Primary hypogonadism diagnosed",icon: "alert", color: "var(--warn)",
    summary: "Total T 280 ng/dL on two morning panels 4 weeks apart. LH/FSH normal, ruled out secondary.", linkedDoc: "DOC-013" },
  { date: "2024-02-12", category: "Diagnosis", title: "Right patellar tendinopathy",   icon: "alert", color: "var(--warn)",
    summary: "Post-squat-block flare. Conservative management (load mgmt + isometrics) resolved within 11 wks." },
  { date: "2023-06-08", category: "Imaging",   title: "Right shoulder MRI",            icon: "medical", color: "var(--acc-coach)",
    summary: "Mild supraspinatus tendinopathy. No tear. Conservative mgmt. Symptoms resolved by Aug 2023.", linkedDoc: "DOC-008" },
  { date: "2018-11-14", category: "Surgery",   title: "Wisdom teeth extraction (4)",   icon: "medical", color: "var(--neg)",
    summary: "Routine, no complications. 4 days off training." },
  { date: "2014-03-22", category: "Surgery",   title: "Right ACL reconstruction (hamstring autograft)", icon: "medical", color: "var(--neg)",
    summary: "Soccer injury Feb 2014, surgery Mar 2014. 9-month return to sport. No re-injury since." },
];

const DOCUMENTS = [
  { id: "DOC-022", name: "Q2 2026 full hormonal + metabolic panel", type: "Lab report", date: "2026-04-23", size: "1.4 MB", source: "MVZ Lab Berlin", tags: ["TRT", "MK-677 monitoring"], linkedLabs: 18 },
  { id: "DOC-021", name: "MK-677 baseline glucose panel",            type: "Lab report", date: "2026-03-25", size: "320 KB", source: "MVZ Lab Berlin", tags: ["MK-677"], linkedLabs: 4 },
  { id: "DOC-020", name: "Anastrozole prescription renewal",         type: "Prescription", date: "2026-03-01", size: "180 KB", source: "Dr. M. Kessler", tags: ["Rx"], linkedLabs: 0 },
  { id: "DOC-019", name: "Right elbow ultrasound report",            type: "Imaging",    date: "2025-03-20", size: "2.1 MB", source: "PhysioMed Berlin", tags: ["epicondylopathy"], linkedLabs: 0 },
  { id: "DOC-018", name: "Right elbow consult notes",                type: "Notes",      date: "2025-03-12", size: "85 KB",  source: "Dr. R. Klein · Ortho", tags: ["epicondylopathy"], linkedLabs: 0 },
  { id: "DOC-017", name: "Q1 2026 panel",                             type: "Lab report", date: "2026-01-18", size: "1.2 MB", source: "MVZ Lab Berlin", tags: ["TRT"], linkedLabs: 18 },
  { id: "DOC-016", name: "Q4 2025 panel",                             type: "Lab report", date: "2025-10-22", size: "1.3 MB", source: "MVZ Lab Berlin", tags: ["TRT"], linkedLabs: 18 },
  { id: "DOC-015", name: "Q3 2025 panel",                             type: "Lab report", date: "2025-07-15", size: "1.2 MB", source: "MVZ Lab Berlin", tags: ["TRT"], linkedLabs: 18 },
  { id: "DOC-014", name: "TRT initiation protocol · physician memo", type: "Notes",      date: "2024-09-12", size: "210 KB", source: "Dr. M. Kessler", tags: ["TRT", "baseline"], linkedLabs: 0 },
  { id: "DOC-013", name: "Hypogonadism confirmatory panel",          type: "Lab report", date: "2024-08-22", size: "1.1 MB", source: "MVZ Lab Berlin", tags: ["baseline"], linkedLabs: 12 },
  { id: "DOC-012", name: "Annual physical 2024",                      type: "Notes",      date: "2024-04-08", size: "320 KB", source: "Dr. S. Wagner · GP", tags: ["annual"], linkedLabs: 0 },
  { id: "DOC-008", name: "Right shoulder MRI report",                 type: "Imaging",    date: "2023-06-08", size: "2.6 MB", source: "Radiologie Charlottenburg", tags: ["shoulder"], linkedLabs: 0 },
];

const APPOINTMENTS = [
  { id: "AP-006", date: "2026-05-21", time: "10:30", duration: 45, who: "Sarah Müller · Physio", where: "PhysioMed Berlin",   reason: "Elbow follow-up · isometrics review", status: "upcoming", reminder: "1 day before" },
  { id: "AP-007", date: "2026-07-15", time: "09:00", duration: 60, who: "Dr. M. Kessler",       where: "Endokrinologie · Charlottenburg", reason: "Q3 2026 panel + protocol review", status: "upcoming", reminder: "3 days before" },
  { id: "AP-008", date: "2026-09-04", time: "11:00", duration: 60, who: "Dr. S. Wagner · GP",   where: "Praxis Wagner",       reason: "Annual physical", status: "upcoming", reminder: "1 week before" },
  { id: "AP-005", date: "2026-04-23", time: "08:30", duration: 30, who: "MVZ Lab Berlin",       where: "MVZ Lab Berlin",      reason: "Q2 2026 lab draw (fasting)", status: "done" },
  { id: "AP-004", date: "2026-04-23", time: "11:00", duration: 60, who: "Dr. M. Kessler",       where: "Endokrinologie",       reason: "Q2 review + MK-677 baseline", status: "done" },
  { id: "AP-003", date: "2026-03-12", time: "16:00", duration: 30, who: "Dr. R. Klein · Ortho", where: "Klinik am Park",       reason: "Right elbow consult", status: "done" },
  { id: "AP-002", date: "2026-03-20", time: "09:00", duration: 30, who: "PhysioMed · Imaging",  where: "PhysioMed Berlin",     reason: "Right elbow ultrasound", status: "done" },
];

// ── Module shell ────────────────────────────────────────────
const MedicalModule = () => {
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(null);
  const open = (type, payload) => setModal({type, payload});
  const close = () => setModal(null);
  const ctx = { open, close };
  return (
    <>
      <div className="module-header module-hero-lite">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Medical</span>
            <Pill>Sat · May 16</Pill>
            <Pill style={{borderColor: "color-mix(in oklch, var(--acc-medic) 35%, var(--border))", color: "var(--acc-medic)", background: "color-mix(in oklch, var(--acc-medic) 6%, transparent)"}}>Sensitive · encrypted at rest</Pill>
            <Pill><span className="dot" style={{background: "var(--pos)"}}/>{DIAGNOSES.filter(d => d.status === "active").length} active conditions</Pill>
          </div>
          <div className="module-sub">Labs, medications, history, documents, appointments · GP Dr. Wagner · Endo Dr. Kessler</div>
        </div>
        <div className="module-actions">
          <button className="btn" onClick={() => open("upload")}><Icon name="camera" className="ic ic-sm"/> Upload</button>
          <button className="btn" onClick={() => open("apt")}><Icon name="calendar" className="ic ic-sm"/> Book appointment</button>
          <button className="btn btn-primary" onClick={() => open("addLab")}><Icon name="plus" className="ic ic-sm"/> Add lab result</button>
        </div>
      </div>

      <Tabs items={[
        { id: "overview",    label: "Overview" },
        { id: "labs",        label: "Lab results", count: LAB_BIOMARKERS.length },
        { id: "meds",        label: "Medications", count: MEDICATIONS.length },
        { id: "history",     label: "History",     count: HISTORY_TIMELINE.length },
        { id: "documents",   label: "Documents",   count: DOCUMENTS.length },
        { id: "appointments",label: "Appointments",count: APPOINTMENTS.filter(a => a.status === "upcoming").length },
      ]} active={tab} onChange={setTab}/>

      <MedCtx.Provider value={ctx}>
      {tab === "overview"     && <MedOverview/>}
      {tab === "labs"         && <MedLabs/>}
      {tab === "meds"         && <MedMedications/>}
      {tab === "history"      && <MedHistory/>}
      {tab === "documents"    && <MedDocuments/>}
      {tab === "appointments" && <MedAppointments/>}
      </MedCtx.Provider>

      {modal?.type === "addLab"   && <AddLabModal onClose={close}/>}
      {modal?.type === "upload"   && <UploadDocModal onClose={close}/>}
      {modal?.type === "apt"      && <BookAptModal onClose={close}/>}
      {modal?.type === "labDet"   && <LabDetailModal lab={modal.payload} onClose={close}/>}
      {modal?.type === "medDet"   && <MedDetailModal med={modal.payload} onClose={close}/>}
      {modal?.type === "docDet"   && <DocDetailModal doc={modal.payload} onClose={close}/>}
      {modal?.type === "aptDet"   && <AptDetailModal apt={modal.payload} onClose={close}/>}
      {modal?.type === "diagDet"  && <DiagDetailModal diag={modal.payload} onClose={close}/>}
    </>
  );
};

// ── OVERVIEW ────────────────────────────────────────────────
const MedOverview = () => {
  const { open } = React.useContext(MedCtx);
  const watchLabs = LAB_BIOMARKERS.filter(l => l.status !== "in");
  const upcomingApt = APPOINTMENTS.filter(a => a.status === "upcoming").slice(0, 3);
  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 16}}>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Active conditions" sub={`${DIAGNOSES.length} tracked · click for detail`}>
          <div className="col-gap" style={{gap: 6}}>
            {DIAGNOSES.map(d => (
              <div key={d.id} onClick={() => open("diagDet", d)} style={{padding: 12, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12}}>
                <div style={{width: 3, alignSelf: "stretch", background: "var(--acc-medic)", borderRadius: 2, flexShrink: 0}}/>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3}}>
                    <span style={{fontSize: 13, fontWeight: 600}}>{d.title}</span>
                    <Pill className="mono" style={{fontSize: 10}}>{d.icd}</Pill>
                    <Pill variant="acc">{d.status}</Pill>
                    <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>onset {d.onset}</span>
                  </div>
                  <div className="muted" style={{fontSize: 11.5, lineHeight: 1.45}}>{d.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Out-of-range / watch labs" sub={`${watchLabs.length} marker${watchLabs.length === 1 ? "" : "s"}`}>
          {watchLabs.length === 0
            ? <div className="dim" style={{fontSize: 12, textAlign: "center", padding: 14}}>All markers in range.</div>
            : (
              <div className="col-gap" style={{gap: 6}}>
                {watchLabs.map(l => {
                  const color = l.status === "out" ? "var(--neg)" : "var(--warn)";
                  return (
                    <div key={l.id} onClick={() => open("labDet", l)} style={{padding: 12, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 12}}>
                      <span className="dot" style={{background: color, width: 8, height: 8, flexShrink: 0}}/>
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{fontSize: 12.5, fontWeight: 500, marginBottom: 2}}>{l.name}</div>
                        <div className="dim mono" style={{fontSize: 10}}>{l.category} · ref {l.range[0]}–{l.range[1]} {l.unit}</div>
                      </div>
                      <div style={{textAlign: "right"}}>
                        <div className="num" style={{fontSize: 16, color}}>{l.value}<span className="dim" style={{fontSize: 10, marginLeft: 3}}>{l.unit}</span></div>
                        <div className="dim" style={{fontSize: 10, fontFamily: "var(--font-mono)"}}>{l.trend === "up" ? "↑ trending" : l.trend === "down" ? "↓ trending" : "stable"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </Card>

        <Card title="Active medications" sub={`${MEDICATIONS.filter(m => m.rx).length} prescription · ${MEDICATIONS.filter(m => !m.rx).length} OTC`}>
          <table className="tbl">
            <tbody>
              {MEDICATIONS.map(m => (
                <tr key={m.id} className="clickable" style={{cursor: "pointer"}} onClick={() => open("medDet", m)}>
                  <td style={{width: 18}}><span className="dot" style={{background: m.rx ? "var(--acc-medic)" : "var(--fg-dim)"}}/></td>
                  <td>{m.name}</td>
                  <td className="num">{m.dose}</td>
                  <td className="muted">{m.schedule}</td>
                  <td className="muted" style={{fontSize: 11}}>{m.physician}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Next appointments" actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => open("apt")}>Book new</button>}>
          <div className="col-gap" style={{gap: 0}}>
            {upcomingApt.map((a, i) => (
              <div key={a.id} onClick={() => open("aptDet", a)} style={{padding: "10px 0", borderBottom: i < upcomingApt.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer"}}>
                <div style={{display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2}}>
                  <span className="num" style={{fontSize: 11, color: "var(--acc-medic)", fontWeight: 600, width: 64}}>{daysUntil(a.date)}</span>
                  <span style={{fontSize: 12.5, fontWeight: 500}}>{a.who}</span>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--fg-muted)", paddingLeft: 72}}>
                  <span className="mono">{a.date} · {a.time}</span>
                  <span>·</span>
                  <span>{a.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent documents" sub="last 4 · click to view" actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}} onClick={() => open("upload")}>Upload</button>}>
          <div className="col-gap" style={{gap: 6}}>
            {DOCUMENTS.slice(0, 4).map(d => (
              <div key={d.id} onClick={() => open("docDet", d)} style={{display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, cursor: "pointer"}}>
                <Icon name="medical" className="ic" style={{color: "var(--acc-medic)", flexShrink: 0}}/>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{d.name}</div>
                  <div className="dim mono" style={{fontSize: 10}}>{d.type} · {d.date} · {d.size}</div>
                </div>
                <Icon name="download" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Trust circle" sub="who can see what">
          <Row label="Tom · self" value="all" />
          <Row label="Dr. M. Kessler · Endo" value="labs + meds + Rx" />
          <Row label="Dr. S. Wagner · GP" value="full" />
          <Row label="Sarah Müller · Physio" value="history (injuries only)" />
          <Row label="Anders · Coach" value="hidden" />
          <Row label="Buddy" value="trends · aggregate" />
          <div className="divider"/>
          <button className="btn btn-ghost" style={{width: "100%"}}><Icon name="edit" className="ic ic-sm"/>Edit visibility</button>
        </Card>
      </div>
    </div>
  );
};

function daysUntil(dateStr) {
  const target = new Date(dateStr + "T12:00:00");
  const now = new Date("2026-05-16T12:00:00");
  const days = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `in ${days}d`;
  if (days < 30) return `in ${Math.floor(days / 7)}w`;
  return `in ${Math.floor(days / 30)}mo`;
}

// ── LABS ────────────────────────────────────────────────────
const MedLabs = () => {
  const { open } = React.useContext(MedCtx);
  const [cat, setCat] = useState("All");
  const cats = ["All", ...new Set(LAB_BIOMARKERS.map(l => l.category))];
  const filtered = cat === "All" ? LAB_BIOMARKERS : LAB_BIOMARKERS.filter(l => l.category === cat);
  return (
    <div>
      <div style={{display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center"}}>
        <span className="eyebrow" style={{marginRight: 6}}>Category</span>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} className={cat === c ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>{c}</button>
        ))}
        <div style={{marginLeft: "auto", display: "flex", gap: 6, alignItems: "center"}}>
          <span className="dim" style={{fontSize: 11}}>Last panel: <span className="num" style={{color: "var(--fg)"}}>23 Apr 2026</span> · 6 panels in DB</span>
          <button className="btn btn-sm" onClick={() => open("addLab")}><Icon name="plus" className="ic ic-sm"/>Add</button>
        </div>
      </div>
      <Card>
        <table className="tbl">
          <thead>
            <tr>
              <th>Marker</th>
              <th style={{width: 100}}>Category</th>
              <th style={{width: 110, textAlign: "right"}}>Value</th>
              <th style={{width: 110}}>Reference</th>
              <th style={{width: 180}}>Trend · 6 panels</th>
              <th style={{width: 80}}>Status</th>
              <th style={{width: 30}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => {
              const color = l.status === "out" ? "var(--neg)" : l.status === "watch" ? "var(--warn)" : "var(--pos)";
              return (
                <tr key={l.id} className="clickable" style={{cursor: "pointer"}} onClick={() => open("labDet", l)}>
                  <td>{l.name}</td>
                  <td><Pill>{l.category}</Pill></td>
                  <td className="num" style={{textAlign: "right", color, fontWeight: 500}}>{l.value}<span className="dim" style={{fontSize: 10, marginLeft: 3}}>{l.unit}</span></td>
                  <td className="num muted" style={{fontSize: 11}}>{l.range[0]}–{l.range[1]}</td>
                  <td style={{padding: "4px 8px 4px 0"}}>
                    <Sparkline data={l.history} color={color} h={22}/>
                  </td>
                  <td>
                    {l.status === "in" && <Pill variant="pos">in range</Pill>}
                    {l.status === "watch" && <Pill variant="warn">watch</Pill>}
                    {l.status === "out" && <Pill variant="neg">out of range</Pill>}
                  </td>
                  <td><Icon name="chevron_right" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── MEDICATIONS ─────────────────────────────────────────────
const MedMedications = () => {
  const { open } = React.useContext(MedCtx);
  return (
    <div className="col-gap" style={{gap: 12}}>
      {MEDICATIONS.map(m => (
        <Card key={m.id} onClick={() => open("medDet", m)} style={{cursor: "pointer"}}>
          <div style={{display: "flex", alignItems: "flex-start", gap: 14}}>
            <div style={{
              width: 36, height: 36, borderRadius: 7,
              background: m.rx ? "color-mix(in oklch, var(--acc-medic) 18%, transparent)" : "color-mix(in oklch, var(--fg-dim) 12%, transparent)",
              border: `1px solid ${m.rx ? "color-mix(in oklch, var(--acc-medic) 35%, var(--border))" : "var(--border)"}`,
              color: m.rx ? "var(--acc-medic)" : "var(--fg-muted)",
              display: "grid", placeItems: "center", flexShrink: 0
            }}><Icon name="medical" className="ic"/></div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap"}}>
                <span style={{fontSize: 14, fontWeight: 600}}>{m.name}</span>
                <Pill>{m.category}</Pill>
                {m.rx && <Pill className="mono" style={{fontSize: 10}}>{m.rx}</Pill>}
              </div>
              <div className="muted" style={{fontSize: 12, marginBottom: 10}}>{m.notes}</div>
              <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, fontSize: 11}}>
                <div><div className="eyebrow" style={{marginBottom: 2}}>Form</div><div>{m.form}</div></div>
                <div><div className="eyebrow" style={{marginBottom: 2}}>Dose</div><div className="num">{m.dose}</div></div>
                <div><div className="eyebrow" style={{marginBottom: 2}}>Schedule</div><div>{m.schedule}</div></div>
                <div><div className="eyebrow" style={{marginBottom: 2}}>Physician</div><div>{m.physician}</div></div>
                <div>
                  <div className="eyebrow" style={{marginBottom: 2}}>Refill in</div>
                  <div className="num">{m.refillDays != null ? `${m.refillDays}d` : "—"}</div>
                </div>
              </div>
            </div>
            {m.adherence != null && (
              <div style={{textAlign: "right", flexShrink: 0}}>
                <div className="eyebrow">Adherence</div>
                <div className="num" style={{fontSize: 18, color: "var(--pos)"}}>{m.adherence}%</div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

// ── HISTORY ─────────────────────────────────────────────────
const MedHistory = () => {
  const [filter, setFilter] = useState("All");
  const cats = ["All", "Diagnosis", "Medication", "Treatment", "Imaging", "Surgery"];
  const filtered = filter === "All" ? HISTORY_TIMELINE : HISTORY_TIMELINE.filter(h => h.category === filter);
  return (
    <div>
      <div style={{display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap"}}>
        <span className="eyebrow" style={{marginRight: 6, alignSelf: "center"}}>Filter</span>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={filter === c ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>{c}</button>
        ))}
      </div>
      <Card>
        <div style={{position: "relative", paddingLeft: 24}}>
          <div style={{position: "absolute", left: 8, top: 0, bottom: 0, width: 1, background: "var(--border)"}}/>
          <div className="col-gap" style={{gap: 14}}>
            {filtered.map((h, i) => (
              <div key={i} style={{position: "relative"}}>
                <div style={{
                  position: "absolute", left: -24, top: 8,
                  width: 16, height: 16, borderRadius: 999,
                  background: "var(--bg)",
                  border: `2px solid ${h.color}`,
                  display: "grid", placeItems: "center"
                }}>
                  <Icon name={h.icon} className="ic" style={{width: 7, height: 7, color: h.color}}/>
                </div>
                <div style={{padding: 12, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 6}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                    <span className="num dim" style={{fontSize: 10}}>{h.date}</span>
                    <Pill>{h.category}</Pill>
                    {h.linkedDoc && <Pill className="mono" style={{fontSize: 10}}><Icon name="medical" className="ic ic-sm"/>{h.linkedDoc}</Pill>}
                  </div>
                  <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>{h.title}</div>
                  <div className="muted" style={{fontSize: 12, lineHeight: 1.5}}>{h.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ── DOCUMENTS ───────────────────────────────────────────────
const MedDocuments = () => {
  const { open } = React.useContext(MedCtx);
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const types = ["All", "Lab report", "Imaging", "Notes", "Prescription"];
  const filtered = DOCUMENTS.filter(d => {
    if (type !== "All" && d.type !== type) return false;
    if (q && !d.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 14}}>
        <div style={{flex: 1, position: "relative"}}>
          <Icon name="search" className="ic ic-sm" style={{position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)"}}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search documents by name, source, tag…"
            style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px 0 30px", fontSize: 12, outline: "none"}}/>
        </div>
        <button className="btn" onClick={() => open("upload")}><Icon name="plus" className="ic ic-sm"/>Upload PDF</button>
      </div>
      <div style={{display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap"}}>
        {types.map(t => (
          <button key={t} onClick={() => setType(t)} className={type === t ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>{t}</button>
        ))}
      </div>
      <Card>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width: 80}}>ID</th>
              <th>Name</th>
              <th style={{width: 110}}>Type</th>
              <th style={{width: 100}}>Date</th>
              <th>Source</th>
              <th style={{width: 80, textAlign: "right"}}>Size</th>
              <th style={{width: 80}}>Linked</th>
              <th style={{width: 30}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="clickable" style={{cursor: "pointer"}} onClick={() => open("docDet", d)}>
                <td className="num">{d.id}</td>
                <td>{d.name}</td>
                <td><Pill>{d.type}</Pill></td>
                <td className="num muted">{d.date}</td>
                <td className="muted" style={{fontSize: 11.5}}>{d.source}</td>
                <td className="num muted" style={{textAlign: "right", fontSize: 11}}>{d.size}</td>
                <td>{d.linkedLabs > 0 && <Pill className="mono" style={{fontSize: 10}}>{d.linkedLabs} labs</Pill>}</td>
                <td><Icon name="download" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── APPOINTMENTS ────────────────────────────────────────────
const MedAppointments = () => {
  const { open } = React.useContext(MedCtx);
  const upcoming = APPOINTMENTS.filter(a => a.status === "upcoming");
  const past = APPOINTMENTS.filter(a => a.status === "done");
  return (
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
      <div className="col-gap" style={{gap: 12}}>
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <span className="eyebrow">Upcoming</span>
          <span className="dim mono" style={{fontSize: 10}}>{upcoming.length} appointments</span>
          <div className="spacer"/>
          <button className="btn" onClick={() => open("apt")}><Icon name="plus" className="ic ic-sm"/>Book new</button>
        </div>
        {upcoming.map(a => (
          <Card key={a.id} onClick={() => open("aptDet", a)} style={{cursor: "pointer"}}>
            <div style={{display: "flex", alignItems: "center", gap: 14}}>
              <div style={{
                width: 56, padding: "8px 0", borderRadius: 6, textAlign: "center",
                background: "color-mix(in oklch, var(--acc-medic) 8%, var(--surface))",
                border: "1px solid color-mix(in oklch, var(--acc-medic) 25%, var(--border))",
              }}>
                <div className="num" style={{fontSize: 18, color: "var(--acc-medic)", fontWeight: 600, lineHeight: 1}}>{a.date.slice(8)}</div>
                <div className="dim mono" style={{fontSize: 9, marginTop: 3}}>{monthAbbr(a.date.slice(5,7))} · {dayAbbr(a.date)}</div>
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                  <span style={{fontSize: 13.5, fontWeight: 600}}>{a.who}</span>
                  <Pill variant="acc" className="mono" style={{fontSize: 10}}>{daysUntil(a.date)}</Pill>
                </div>
                <div style={{fontSize: 12, color: "var(--fg-muted)", marginBottom: 4}}>{a.reason}</div>
                <div style={{display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "var(--fg-dim)", fontFamily: "var(--font-mono)"}}>
                  <span>🕐 {a.time} · {a.duration}min</span>
                  <span>📍 {a.where}</span>
                  <span>🔔 {a.reminder}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="col-gap" style={{gap: 10}}>
        <Card title="Past · last 4">
          <div className="col-gap" style={{gap: 0}}>
            {past.slice(0, 4).map((a, i) => (
              <div key={a.id} onClick={() => open("aptDet", a)} style={{padding: "9px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none", cursor: "pointer"}}>
                <div style={{display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2}}>
                  <span className="num dim" style={{fontSize: 10, width: 70}}>{a.date}</span>
                  <span style={{fontSize: 12, fontWeight: 500}}>{a.who}</span>
                </div>
                <div className="muted" style={{fontSize: 11, paddingLeft: 78}}>{a.reason}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Calendar sync">
          <Row label="Google Calendar" value="Connected"/>
          <Row label="iCal feed" value="Active"/>
          <Row label="Reminders" value="Default 1d"/>
          <Row label="Insurance card" value="On file"/>
        </Card>
      </div>
    </div>
  );
};

function monthAbbr(mm) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[parseInt(mm) - 1];
}
function dayAbbr(dateStr) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return days[new Date(dateStr + "T12:00:00").getDay()];
}

// ── MODALS ──────────────────────────────────────────────────
const MedModal = ({ title, subtitle, eyebrow, accent, onClose, footer, children, width = 580 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        {eyebrow && (
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: `color-mix(in oklch, ${accent || "var(--acc-medic)"} 18%, transparent)`,
            border: `1px solid color-mix(in oklch, ${accent || "var(--acc-medic)"} 35%, transparent)`,
            color: accent || "var(--acc-medic)", display: "grid", placeItems: "center"
          }}><Icon name={eyebrow} className="ic" /></div>
        )}
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600}}>{title}</div>
          {subtitle && <div className="dim" style={{fontSize: 11}}>{subtitle}</div>}
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic" /></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div>
  </div>
);

const MField = ({ label, sub, children }) => (
  <div style={{marginBottom: 14}}>
    <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5}}>
      <label className="eyebrow">{label}</label>
      {sub && <span className="dim" style={{fontSize: 10}}>{sub}</span>}
    </div>
    {children}
  </div>
);
const MInput = props => <input {...props} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none"}}/>;

// Lab detail
const LabDetailModal = ({ lab, onClose }) => {
  const color = lab.status === "out" ? "var(--neg)" : lab.status === "watch" ? "var(--warn)" : "var(--pos)";
  return (
    <MedModal title={lab.name} subtitle={`${lab.category} · ${lab.unit} · 6 panels tracked`} eyebrow="trend_up" onClose={onClose} width={620}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="download" className="ic ic-sm"/>Export trend</button></>}>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16}}>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 3}}>Current</div>
          <div className="num" style={{fontSize: 22, fontWeight: 500, color}}>{lab.value}<span className="dim" style={{fontSize: 11, marginLeft: 3}}>{lab.unit}</span></div>
          <div className="dim mono" style={{fontSize: 10}}>23 Apr 2026</div>
        </Card>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 3}}>Reference range</div>
          <div className="num" style={{fontSize: 16}}>{lab.range[0]} – {lab.range[1]}</div>
          <div className="dim" style={{fontSize: 10}}>population norm</div>
        </Card>
        <Card className="card-tight" style={{padding: 12}}>
          <div className="eyebrow" style={{marginBottom: 3}}>Trend</div>
          <div className="num" style={{fontSize: 16, color: lab.trend === "up" ? (lab.status === "out" ? "var(--warn)" : "var(--pos)") : lab.trend === "down" ? "var(--fg-dim)" : "var(--fg)"}}>{lab.trend === "up" ? "↑" : lab.trend === "down" ? "↓" : "→"} {lab.trend}</div>
          <div className="dim" style={{fontSize: 10}}>over 6 panels</div>
        </Card>
      </div>
      <div className="eyebrow" style={{marginBottom: 6}}>Trend · last 18 months</div>
      <Card className="card-tight" style={{padding: 12, marginBottom: 14}}>
        <LineChart h={140} range={[Math.min(...lab.history, lab.range[0]) * 0.95, Math.max(...lab.history, lab.range[1]) * 1.05]}
          xLabels={["Q1 25","Q2 25","Q3 25","Q4 25","Q1 26","Q2 26"]}
          series={[
            { data: lab.history, color },
            { data: Array(lab.history.length).fill(lab.range[0]), color: "var(--fg-dim)" },
            { data: Array(lab.history.length).fill(lab.range[1]), color: "var(--fg-dim)" },
          ]}/>
      </Card>
      <div className="eyebrow" style={{marginBottom: 6}}>Linked context</div>
      <div className="col-gap" style={{gap: 4}}>
        {lab.id === "glucose" && <Card className="card-tight" style={{padding: 10}}><div style={{fontSize: 11.5}}>Trending up since MK-677 cycle start (Mar 30). Buddy flagged for earlier next panel.</div></Card>}
        {lab.id === "hct" && <Card className="card-tight" style={{padding: 10}}><div style={{fontSize: 11.5}}>Watch · TRT-associated rise. Within range but trending. Re-test Jul 15.</div></Card>}
        {(lab.id === "totalT" || lab.id === "freeT") && <Card className="card-tight" style={{padding: 10}}><div style={{fontSize: 11.5}}>TRT protocol since Sep 2024. Trough at 712 ng/dL — within mid-range target.</div></Card>}
      </div>
    </MedModal>
  );
};

const MedDetailModal = ({ med, onClose }) => (
  <MedModal title={med.name} subtitle={med.notes} eyebrow="medical" onClose={onClose} width={620}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button>{med.rx && <button className="btn"><Icon name="download" className="ic ic-sm"/>Renewal request</button>}</>}>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow" style={{marginBottom: 3}}>Dose · schedule</div><div className="num" style={{fontSize: 15}}>{med.dose}</div><div className="muted" style={{fontSize: 11}}>{med.form} · {med.schedule}</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow" style={{marginBottom: 3}}>Status</div><div className="num" style={{fontSize: 15}}>{med.adherence != null ? `${med.adherence}% adherence` : "As-needed"}</div><div className="muted" style={{fontSize: 11}}>Started {med.started}</div></Card>
      {med.physician !== "—" && <Card className="card-tight" style={{padding: 12}}><div className="eyebrow" style={{marginBottom: 3}}>Prescriber</div><div style={{fontSize: 13}}>{med.physician}</div><div className="dim mono" style={{fontSize: 10}}>{med.rx}</div></Card>}
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow" style={{marginBottom: 3}}>Refill</div><div className="num" style={{fontSize: 15}}>{med.refillDays != null ? `in ${med.refillDays} days` : "—"}</div><div className="muted" style={{fontSize: 11}}>{med.category}</div></Card>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Linked monitoring</div>
    <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
      {med.id === "test_c" && "Quarterly panel — Total T, Free T, E2, Hematocrit, PSA, Lipids."}
      {med.id === "hcg" && "Quarterly panel — LH, FSH, E2."}
      {med.id === "anastro" && "Sensitive E2 titration. Target 20–30 pg/mL."}
      {med.id === "ibuprofen" && "Not on continuous schedule — no monitoring."}
      {med.id === "pantoprazole" && "Long-term Mg + B12 risk if continuous; currently as-needed only."}
    </div>
  </MedModal>
);

const DocDetailModal = ({ doc, onClose }) => (
  <MedModal title={doc.name} subtitle={`${doc.type} · ${doc.source} · ${doc.date}`} eyebrow="medical" onClose={onClose} width={620}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="download" className="ic ic-sm"/>Download</button><button className="btn btn-primary"><Icon name="search" className="ic ic-sm"/>Open viewer</button></>}>
    <div style={{padding: 24, background: "var(--surface-2)", borderRadius: 8, marginBottom: 14, textAlign: "center"}}>
      <Icon name="medical" className="ic" style={{width: 36, height: 36, color: "var(--fg-dim)", margin: "0 auto 8px"}}/>
      <div className="num" style={{fontSize: 13, fontWeight: 500}}>{doc.id} · {doc.size}</div>
      <div className="dim" style={{fontSize: 11, marginTop: 4}}>PDF preview · click "Open viewer" to read</div>
    </div>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Type</div><div style={{fontSize: 12}}>{doc.type}</div></Card>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Source</div><div style={{fontSize: 12}}>{doc.source}</div></Card>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Date</div><div className="num" style={{fontSize: 12}}>{doc.date}</div></Card>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Linked labs</div><div className="num" style={{fontSize: 12}}>{doc.linkedLabs} markers</div></Card>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Tags</div>
    <div style={{display: "flex", flexWrap: "wrap", gap: 4}}>{doc.tags.map(t => <Pill key={t}>{t}</Pill>)}</div>
  </MedModal>
);

const AptDetailModal = ({ apt, onClose }) => (
  <MedModal title={apt.who} subtitle={apt.reason} eyebrow="calendar" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button>{apt.status === "upcoming" && <><button className="btn">Reschedule</button><button className="btn"><Icon name="x" className="ic ic-sm"/>Cancel</button></>}</>}>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">When</div><div className="num" style={{fontSize: 14}}>{apt.date} · {apt.time}</div><div className="dim" style={{fontSize: 11}}>{apt.duration} minutes</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Where</div><div style={{fontSize: 13}}>{apt.where}</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Reminder</div><div style={{fontSize: 12}}>{apt.reminder}</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Status</div>{apt.status === "upcoming" ? <Pill variant="acc">upcoming</Pill> : <Pill variant="pos">done</Pill>}</Card>
    </div>
    {apt.status === "done" && (
      <>
        <div className="eyebrow" style={{marginBottom: 6}}>Visit notes</div>
        <div style={{padding: 12, background: "var(--surface)", borderRadius: 6, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.55, marginBottom: 14}}>
          {apt.id === "AP-004" && "Q2 review. Trough 712 ng/dL — within target. E2 26 pg/mL on Anastrozole. Discussed MK-677 cycle start — agreed monitoring plan (fasting glucose + IGF-1 at wk 4 and 8). Next panel July 15."}
          {apt.id === "AP-005" && "Standard quarterly draw. Fasting confirmed (16h)."}
          {apt.id === "AP-003" && "Right lateral epicondylopathy confirmed clinically. Recommended US imaging + 6w eccentric protocol. No imaging contraindication for low-dose BPC-157 trial."}
          {apt.id === "AP-002" && "Right elbow US: tendon thickening at insertion, no tear. Mild neovascularization."}
        </div>
      </>
    )}
    <div className="eyebrow" style={{marginBottom: 6}}>Linked context</div>
    <div className="col-gap" style={{gap: 4}}>
      <div style={{padding: 8, background: "var(--surface)", borderRadius: 5, fontSize: 11.5, display: "flex", gap: 6, alignItems: "center"}}>
        <Icon name="medical" className="ic ic-sm" style={{color: "var(--acc-medic)"}}/>
        {apt.id.startsWith("AP-00") && (apt.id === "AP-007" || apt.id === "AP-004" || apt.id === "AP-005") ? "Lab panel attached → DOC-022" : "No linked documents yet"}
      </div>
    </div>
  </MedModal>
);

const DiagDetailModal = ({ diag, onClose }) => (
  <MedModal title={diag.title} subtitle={`${diag.icd} · onset ${diag.onset}`} eyebrow="alert" accent="var(--warn)" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn"><Icon name="edit" className="ic ic-sm"/>Update notes</button></>}>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Status</div><Pill variant="acc">{diag.status}</Pill></Card>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">ICD-10</div><div className="num" style={{fontSize: 13}}>{diag.icd}</div></Card>
      <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Onset</div><div className="num" style={{fontSize: 13}}>{diag.onset}</div></Card>
    </div>
    <div className="eyebrow" style={{marginBottom: 6}}>Clinical notes</div>
    <div style={{padding: 12, background: "var(--surface)", borderRadius: 6, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.55}}>{diag.notes}</div>
  </MedModal>
);

const AddLabModal = ({ onClose }) => (
  <MedModal title="Add lab panel" subtitle="Upload PDF, paste values, or manual entry" eyebrow="plus" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Save panel</button></>}>
    <div style={{display: "flex", gap: 6, marginBottom: 14}}>
      <button className="btn"><Icon name="camera" className="ic ic-sm"/>Upload PDF</button>
      <button className="btn"><Icon name="copy" className="ic ic-sm"/>Paste values</button>
      <button className="btn"><Icon name="edit" className="ic ic-sm"/>Manual</button>
    </div>
    <MField label="Panel date"><MInput type="date" defaultValue="2026-05-25"/></MField>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
      <MField label="Lab"><MInput defaultValue="MVZ Lab Berlin"/></MField>
      <MField label="Panel type"><MInput defaultValue="Full hormonal + metabolic"/></MField>
    </div>
    <div className="dim" style={{fontSize: 11, padding: 10, background: "var(--surface)", borderRadius: 6, lineHeight: 1.5}}>
      PDF parser will detect 18 markers from this lab's format automatically. Out-of-range markers will surface in Overview and route alerts to your active compounds and watch-list.
    </div>
  </MedModal>
);

const UploadDocModal = ({ onClose }) => (
  <MedModal title="Upload document" subtitle="Lab report, imaging, notes, or prescription" eyebrow="plus" onClose={onClose}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary"><Icon name="download" className="ic ic-sm"/>Upload</button></>}>
    <div style={{padding: 32, border: "1px dashed var(--border)", borderRadius: 8, textAlign: "center", background: "var(--surface)", marginBottom: 14, cursor: "pointer"}}>
      <Icon name="camera" className="ic" style={{width: 28, height: 28, color: "var(--fg-dim)", margin: "0 auto 8px"}}/>
      <div style={{fontSize: 13, fontWeight: 500, marginBottom: 4}}>Drop PDF or image here</div>
      <div className="dim" style={{fontSize: 11}}>Lab reports auto-parse into biomarker entries.</div>
    </div>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
      <MField label="Type"><select defaultValue="Lab report" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}><option>Lab report</option><option>Imaging</option><option>Notes</option><option>Prescription</option></select></MField>
      <MField label="Date"><MInput type="date" defaultValue="2026-05-25"/></MField>
    </div>
    <MField label="Source"><MInput placeholder="e.g. MVZ Lab Berlin"/></MField>
    <MField label="Tags · comma-separated"><MInput placeholder="TRT, Q2 2026, …"/></MField>
  </MedModal>
);

const BookAptModal = ({ onClose }) => (
  <MedModal title="Book appointment" subtitle="Calendar-synced · auto-reminder set" eyebrow="calendar" onClose={onClose} width={620}
    footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary"><Icon name="check" className="ic ic-sm"/>Book</button></>}>
    <MField label="Provider">
      <select style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
        <option>Dr. M. Kessler · Endo</option>
        <option>Dr. S. Wagner · GP</option>
        <option>Sarah Müller · Physio</option>
        <option>Dr. R. Klein · Ortho</option>
        <option>MVZ Lab Berlin · Draw</option>
        <option>+ Add provider</option>
      </select>
    </MField>
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10}}>
      <MField label="Date"><MInput type="date" defaultValue="2026-06-04"/></MField>
      <MField label="Time"><MInput type="time" defaultValue="10:00"/></MField>
      <MField label="Duration"><MInput type="number" defaultValue="60"/></MField>
    </div>
    <MField label="Reason"><MInput placeholder="Q3 review · panel + protocol"/></MField>
    <MField label="Reminder">
      <select style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
        <option>1 day before</option>
        <option>3 days before</option>
        <option>1 week before</option>
        <option>No reminder</option>
      </select>
    </MField>
    <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)"}}>
      <Icon name="check" className="ic ic-sm" style={{color: "var(--pos)", display: "inline", marginRight: 4}}/>
      Will sync to Google Calendar (default). 5 prep tasks auto-created if Endo + lab draw.
    </div>
  </MedModal>
);

window.MedicalModule = MedicalModule;
