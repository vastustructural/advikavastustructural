"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calculator, Ruler, Home, Building2, CreditCard,
    ChevronRight, CheckCircle2, XCircle, AlertCircle, Sparkles,
    Package, Compass, LayoutDashboard, Brain
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/* ─── Types ─────────────────────────────────────── */
interface CalculatorField {
    name: string;
    label: string;
    type: string;
    defaultValue: number;
    unit?: string;
}
interface CalculatorItem {
    id: string;
    name: string;
    slug: string;
    description?: string;
    fields: CalculatorField[];
    formula: string;
    resultLabel: string;
    resultUnit: string;
    order: number;
}
interface ToolsContentProps {
    calculators: CalculatorItem[];
}

/* ─── Icon / Color Maps ──────────────────────────── */
const slugIcons: Record<string, React.ElementType> = {
    "construction-cost": Home,
    "interior-design-cost": LayoutDashboard,
    "plot-area": Ruler,
    "fsi-far": Building2,
    "home-loan-emi": CreditCard,
};
const slugColors: Record<string, string> = {
    "construction-cost": "from-orange-500 to-amber-500",
    "interior-design-cost": "from-purple-600 to-pink-500",
    "plot-area": "from-emerald-600 to-teal-500",
    "fsi-far": "from-sky-600 to-blue-500",
    "home-loan-emi": "from-indigo-600 to-violet-600",
};

/* ─── Generic Calculator Card (Firebase-driven) ──── */
function CalculatorCard({ calc }: { calc: CalculatorItem }) {
    const fields = calc.fields || [];
    const initVals: Record<string, number> = {};
    fields.forEach((f) => { initVals[f.name] = f.defaultValue ?? 0; });

    const [values, setValues] = useState<Record<string, number>>(initVals);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const IconComp = slugIcons[calc.slug] || Calculator;
    const gradientClass = slugColors[calc.slug] || "from-navy-primary to-indigo-600";

    const runFormula = () => {
        try {
            const keys = Object.keys(values);
            const vals = Object.values(values);
            const fn = new Function(...keys, calc.formula);
            const res = fn(...vals);
            if (res === null || res === undefined) { setError("Invalid result"); return; }
            const formatted = typeof res === "string" ? res
                : Number(res) > 10000
                    ? Number(res).toLocaleString("en-IN", { maximumFractionDigits: 0 })
                    : String(parseFloat(Number(res).toFixed(2)));
            setResult(formatted);
            setError(null);
        } catch {
            setError("Calculation error. Please check your inputs.");
            setResult(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            <div className={`bg-gradient-to-br ${gradientClass} p-6 text-white`}>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                        <IconComp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-snug">{calc.name}</h3>
                        {calc.description && <p className="text-white/75 text-sm mt-1">{calc.description}</p>}
                    </div>
                </div>
            </div>
            <div className="p-6 flex-1 space-y-4">
                {fields.map((field) => (
                    <div key={field.name} className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700">
                            {field.label}
                            {field.unit && <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2">{field.unit}</span>}
                        </Label>
                        <Input type="number" step="any" value={values[field.name] ?? ""}
                            onChange={(e) => setValues((p) => ({ ...p, [field.name]: parseFloat(e.target.value) || 0 }))}
                            className="h-11 bg-slate-50 border-slate-200 text-base font-medium focus:bg-white" />
                    </div>
                ))}
                <Button onClick={runFormula}
                    className={`w-full h-11 font-semibold bg-gradient-to-r ${gradientClass} text-white border-0 shadow-md hover:opacity-90 transition-all`}>
                    <Calculator className="w-4 h-4 mr-2" /> Calculate
                </Button>
                <AnimatePresence>
                    {result !== null && !error && (
                        <motion.div key="res" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-1 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center border border-slate-700">
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">{calc.resultLabel}</p>
                                <p className="text-3xl font-bold tracking-tight break-words">
                                    {(calc.resultUnit === "₹" || calc.resultUnit === "₹/month")
                                        ? <><span className="text-gold-accent text-xl mr-1">₹</span>{result}</>
                                        : <>{result} <span className="text-slate-400 text-lg font-normal">{calc.resultUnit}</span></>}
                                </p>
                            </div>
                        </motion.div>
                    )}
                    {error && <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-100">{error}</motion.div>}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

/* ─── Tool 6: Material Estimator ──────────────────── */
function MaterialEstimatorTool() {
    const [area, setArea] = useState(1000);
    const [floors, setFloors] = useState(1);
    const [quality, setQuality] = useState("standard");
    const [result, setResult] = useState<null | { cement: number; bricks: number; steel: number; sand: number }>(null);

    const qualityMultipliers: Record<string, { cement: number; bricks: number; steel: number; sand: number }> = {
        basic: { cement: 0.38, bricks: 50, steel: 3.5, sand: 0.048 },
        standard: { cement: 0.42, bricks: 55, steel: 4.0, sand: 0.052 },
        premium: { cement: 0.48, bricks: 60, steel: 5.0, sand: 0.060 },
    };

    const calculate = () => {
        const total = area * floors;
        const m = qualityMultipliers[quality];
        setResult({
            cement: Math.round(total * m.cement),
            bricks: Math.round(total * m.bricks),
            steel: parseFloat((total * m.steel / 1000).toFixed(2)),
            sand: Math.round(total * m.sand),
        });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-6 text-white">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"><Package className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold text-lg">Material Estimator</h3>
                        <p className="text-white/75 text-sm mt-1">Estimate approximate construction materials required for your project.</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Built-up Area <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2">sq.ft</span></Label>
                    <Input type="number" value={area} onChange={(e) => setArea(Number(e.target.value))} className="h-11 bg-slate-50 border-slate-200 text-base font-medium focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Number of Floors</Label>
                    <Input type="number" min={1} max={10} value={floors} onChange={(e) => setFloors(Number(e.target.value))} className="h-11 bg-slate-50 border-slate-200 text-base font-medium focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Construction Quality</Label>
                    <select value={quality} onChange={(e) => setQuality(e.target.value)}
                        className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition-colors">
                        <option value="basic">Basic</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                    </select>
                </div>
                <Button onClick={calculate} className="w-full h-11 font-semibold bg-gradient-to-r from-amber-600 to-orange-700 text-white border-0 shadow-md hover:opacity-90">
                    <Package className="w-4 h-4 mr-2" /> Estimate Materials
                </Button>
                <AnimatePresence>
                    {result && (
                        <motion.div key="mat" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-1 p-5 rounded-2xl bg-slate-900 text-white border border-slate-700">
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">🏗️ Estimated Materials</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Cement", value: `${result.cement.toLocaleString("en-IN")} bags`, icon: "🪣" },
                                        { label: "Bricks", value: `${result.bricks.toLocaleString("en-IN")} nos`, icon: "🧱" },
                                        { label: "Steel", value: `${result.steel} tons`, icon: "⚙️" },
                                        { label: "Sand", value: `${result.sand.toLocaleString("en-IN")} cu.ft`, icon: "🏖️" },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-white/5 rounded-xl p-3">
                                            <div className="text-lg mb-1">{item.icon}</div>
                                            <p className="text-gold-accent font-bold text-base leading-tight">{item.value}</p>
                                            <p className="text-slate-400 text-xs mt-0.5">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-slate-500 text-xs mt-3">* These are indicative estimates. Actual quantities may vary ±10%.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

/* ─── Tool 7: Vastu Checker ───────────────────────── */
const vastuRules: Record<string, Record<string, { status: "good" | "ok" | "bad"; message: string }>> = {
    entrance: {
        north: { status: "good", message: "Ideal — Brings prosperity & opportunities." },
        east: { status: "good", message: "Excellent — Associated with positive energy." },
        west: { status: "ok", message: "Acceptable — Neutral direction." },
        south: { status: "bad", message: "Not recommended — May cause obstacles." },
        "north-east": { status: "good", message: "Highly positive — Great for main entrance." },
        "north-west": { status: "ok", message: "Acceptable — Can work with corrections." },
        "south-east": { status: "bad", message: "Not recommended — Avoid if possible." },
        "south-west": { status: "bad", message: "Not recommended — Brings instability." },
    },
    kitchen: {
        "south-east": { status: "good", message: "Ideal — Fire zone of the house." },
        "north-west": { status: "ok", message: "Acceptable alternative." },
        north: { status: "bad", message: "Not recommended — Conflicts with water energy." },
        east: { status: "ok", message: "Acceptable — Secondary option." },
        south: { status: "ok", message: "Acceptable — Valid alternative." },
        west: { status: "bad", message: "Not recommended — Avoid if possible." },
        "north-east": { status: "bad", message: "Strongly avoid — Very inauspicious." },
        "south-west": { status: "bad", message: "Not recommended." },
    },
    bedroom: {
        "south-west": { status: "good", message: "Ideal for master bedroom — Stable & restful." },
        south: { status: "good", message: "Good — Promotes sound sleep." },
        west: { status: "ok", message: "Acceptable — Moderately positive." },
        north: { status: "ok", message: "Acceptable — Good for unmarried children." },
        east: { status: "ok", message: "Good for children's bedroom." },
        "north-west": { status: "ok", message: "Acceptable for guest bedroom." },
        "north-east": { status: "bad", message: "Not recommended — Leads to health issues." },
        "south-east": { status: "bad", message: "Not ideal — May disturb sleep." },
    },
    toilet: {
        "north-west": { status: "good", message: "Ideal — Best direction for bathrooms." },
        west: { status: "good", message: "Good — Acceptable toilet placement." },
        south: { status: "ok", message: "Acceptable with proper ventilation." },
        east: { status: "ok", message: "Manageable with corrections." },
        "north-east": { status: "bad", message: "Strongly avoid — Most inauspicious." },
        "south-west": { status: "bad", message: "Not recommended — Causes health issues." },
        "south-east": { status: "ok", message: "Marginally acceptable — add ventilation." },
        north: { status: "bad", message: "Not recommended — Blocks positive energy." },
    },
    staircase: {
        south: { status: "good", message: "Ideal — Best placement for staircase." },
        west: { status: "good", message: "Good — Acceptable west staircase." },
        "south-west": { status: "ok", message: "Acceptable with corrections." },
        "north-west": { status: "ok", message: "Manageable — add remedies." },
        "north-east": { status: "bad", message: "Strongly avoid — Very inauspicious." },
        north: { status: "bad", message: "Not recommended." },
        east: { status: "bad", message: "Not recommended." },
        "south-east": { status: "ok", message: "Acceptable — Use with remedies." },
    },
};

const directions = ["north", "south", "east", "west", "north-east", "north-west", "south-east", "south-west"];

function VastuCheckerTool() {
    const [entrance, setEntrance] = useState("east");
    const [kitchen, setKitchen] = useState("south-east");
    const [bedroom, setBedroom] = useState("south-west");
    const [toilet, setToilet] = useState("north-west");
    const [staircase, setStaircase] = useState("south");
    const [report, setReport] = useState<null | { items: { label: string; dir: string; result: { status: "good" | "ok" | "bad"; message: string } }[]; score: number }>(null);

    const check = () => {
        const checks = [
            { label: "Main Entrance", dir: entrance, key: "entrance" as const },
            { label: "Kitchen", dir: kitchen, key: "kitchen" as const },
            { label: "Master Bedroom", dir: bedroom, key: "bedroom" as const },
            { label: "Toilet", dir: toilet, key: "toilet" as const },
            { label: "Staircase", dir: staircase, key: "staircase" as const },
        ];
        const items = checks.map(c => ({
            label: c.label,
            dir: c.dir,
            result: vastuRules[c.key][c.dir] ?? { status: "ok" as const, message: "Standard placement." },
        }));
        const points = items.reduce((acc, i) => acc + (i.result.status === "good" ? 2 : i.result.status === "ok" ? 1 : 0), 0);
        const score = Math.round((points / (items.length * 2)) * 100);
        setReport({ items, score });
    };

    const statusStyle: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
        good: { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-50 border border-emerald-100", text: "text-emerald-700" },
        ok: { icon: <AlertCircle className="w-4 h-4 text-amber-500" />, bg: "bg-amber-50 border border-amber-100", text: "text-amber-700" },
        bad: { icon: <XCircle className="w-4 h-4 text-red-500" />, bg: "bg-red-50 border border-red-100", text: "text-red-700" },
    };

    const scoreColor = !report ? "" : report.score >= 70 ? "text-emerald-500" : report.score >= 40 ? "text-amber-500" : "text-red-500";

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"><Compass className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold text-lg">Vastu Checker</h3>
                        <p className="text-white/75 text-sm mt-1">Check if your room placements comply with Vastu Shastra principles.</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-4">
                {[
                    { label: "Main Entrance Direction", value: entrance, set: setEntrance },
                    { label: "Kitchen Direction", value: kitchen, set: setKitchen },
                    { label: "Master Bedroom Direction", value: bedroom, set: setBedroom },
                    { label: "Toilet / Bathroom Direction", value: toilet, set: setToilet },
                    { label: "Staircase Direction", value: staircase, set: setStaircase },
                ].map((item) => (
                    <div key={item.label} className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700">{item.label}</Label>
                        <select value={item.value} onChange={(e) => item.set(e.target.value)}
                            className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:bg-white transition-colors capitalize">
                            {directions.map(d => <option key={d} value={d} className="capitalize">{d.replace(/-/g, "-").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("-")}</option>)}
                        </select>
                    </div>
                ))}
                <Button onClick={check} className="w-full h-11 font-semibold bg-gradient-to-r from-teal-600 to-emerald-700 text-white border-0 shadow-md hover:opacity-90">
                    <Compass className="w-4 h-4 mr-2" /> Check Vastu
                </Button>
                <AnimatePresence>
                    {report && (
                        <motion.div key="vastu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-2 space-y-2 pt-2">
                                <div className="flex items-center justify-between mb-3 p-3 rounded-xl bg-slate-900 text-white">
                                    <span className="text-sm font-semibold">Overall Vastu Compliance</span>
                                    <span className={`text-2xl font-bold ${scoreColor}`}>{report.score}%</span>
                                </div>
                                {report.items.map((item) => {
                                    const s = statusStyle[item.result.status];
                                    return (
                                        <div key={item.label} className={`p-3 rounded-xl ${s.bg}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                {s.icon}
                                                <span className={`text-sm font-bold ${s.text}`}>{item.label}</span>
                                                <span className="text-xs text-slate-500 ml-auto capitalize">{item.dir.replace(/-/g, " ")}</span>
                                            </div>
                                            <p className={`text-xs ${s.text} opacity-80 ml-6`}>{item.result.message}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

/* ─── Tool 8: Plot Size Suggestion ───────────────── */
function PlotSizeSuggestionTool() {
    const [length, setLength] = useState(40);
    const [width, setWidth] = useState(30);
    const [floors, setFloors] = useState(2);
    const [result, setResult] = useState<null | { plotArea: number; builtUpArea: number; houseType: string; parking: string }>(null);

    const getHouseType = (builtUp: number, bedsApprox: number) => {
        if (builtUp < 600) return "1 BHK";
        if (builtUp < 900) return "2 BHK";
        if (builtUp < 1400) return "3 BHK";
        if (builtUp < 2000) return "4 BHK / Duplex";
        return "5+ BHK / Large Duplex";
    };

    const calculate = () => {
        const plotArea = length * width;
        const builtUpArea = Math.round(plotArea * floors * 0.75);
        const houseType = getHouseType(builtUpArea, 0);
        const parking = plotArea >= 1200 ? "1–2 Cars" : plotArea >= 700 ? "1 Car / 2 Wheeler" : "2 Wheeler Only";
        setResult({ plotArea, builtUpArea, houseType, parking });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            <div className="bg-gradient-to-br from-sky-600 to-cyan-600 p-6 text-white">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"><Ruler className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold text-lg">Plot Size Suggestion</h3>
                        <p className="text-white/75 text-sm mt-1">Find out what type of house fits your plot size and number of floors.</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-4">
                {[
                    { label: "Plot Length", unit: "ft", value: length, set: setLength },
                    { label: "Plot Width", unit: "ft", value: width, set: setWidth },
                    { label: "Number of Floors", unit: "floors", value: floors, set: setFloors },
                ].map((f) => (
                    <div key={f.label} className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700">
                            {f.label} <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2">{f.unit}</span>
                        </Label>
                        <Input type="number" value={f.value} onChange={(e) => f.set(Number(e.target.value))} className="h-11 bg-slate-50 border-slate-200 text-base font-medium focus:bg-white" />
                    </div>
                ))}
                <Button onClick={calculate} className="w-full h-11 font-semibold bg-gradient-to-r from-sky-600 to-cyan-600 text-white border-0 shadow-md hover:opacity-90">
                    <Ruler className="w-4 h-4 mr-2" /> Analyse Plot
                </Button>
                <AnimatePresence>
                    {result && (
                        <motion.div key="plot" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-1 p-5 rounded-2xl bg-slate-900 text-white border border-slate-700 space-y-3">
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Plot Analysis</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-xl p-3">
                                        <p className="text-slate-400 text-xs mb-1">Plot Area</p>
                                        <p className="text-white font-bold text-lg">{result.plotArea.toLocaleString("en-IN")} <span className="text-sm font-normal text-slate-400">sq.ft</span></p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3">
                                        <p className="text-slate-400 text-xs mb-1">Built-up Area</p>
                                        <p className="text-white font-bold text-lg">{result.builtUpArea.toLocaleString("en-IN")} <span className="text-sm font-normal text-slate-400">sq.ft</span></p>
                                    </div>
                                </div>
                                <div className="bg-gold-accent/10 border border-gold-accent/20 rounded-xl p-4">
                                    <p className="text-gold-accent text-xs font-semibold uppercase mb-1">Suggested House Type</p>
                                    <p className="text-white font-bold text-xl">{result.houseType}</p>
                                    <p className="text-slate-400 text-xs mt-1">Parking: {result.parking}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

/* ─── Tool 9: Dream Home Planner ─────────────────── */
function DreamHomePlannerTool() {
    const [plotArea, setPlotArea] = useState(1200);
    const [bedrooms, setBedrooms] = useState(3);
    const [bathrooms, setBathrooms] = useState(2);
    const [floors, setFloors] = useState(2);
    const [budget, setBudget] = useState(5000000);
    const [parking, setParking] = useState("yes");
    const [result, setResult] = useState<null | {
        houseType: string; builtUpArea: number; costLow: number; costHigh: number; feasible: boolean; note: string;
    }>(null);

    const plan = () => {
        const spacePerBed = 250, spacePerBath = 80, commonArea = 400;
        const reqArea = (bedrooms * spacePerBed) + (bathrooms * spacePerBath) + commonArea + (parking === "yes" ? 150 : 0);
        const maxArea = Math.round(plotArea * floors * 0.75);
        const builtUpArea = Math.min(reqArea, maxArea);
        const rateBasic = 1600, ratePremium = 2200;
        const costLow = Math.round(builtUpArea * rateBasic);
        const costHigh = Math.round(builtUpArea * ratePremium);
        const feasible = budget >= costLow * 0.8;
        const bhk = `${bedrooms}BHK${floors > 1 ? ` ${floors === 2 ? "Duplex" : "Triplex"}` : ""}`;
        const note = feasible
            ? "Your budget is well-aligned with this plan. Consult an architect for detailed drawings!"
            : `Your budget may be ₹${Math.round((costLow - budget) / 100000)}L short. Consider reducing scope or increasing budget.`;
        setResult({ houseType: bhk, builtUpArea, costLow, costHigh, feasible, note });
    };

    const formatLakh = (n: number) => (n / 100000).toFixed(1);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"><Brain className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold text-lg">Dream Home Planner</h3>
                        <p className="text-white/75 text-sm mt-1">Design your home concept and check if it fits your budget.</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: "Plot Area", unit: "sq.ft", value: plotArea, set: setPlotArea },
                        { label: "Bedrooms", unit: "rooms", value: bedrooms, set: setBedrooms },
                        { label: "Bathrooms", unit: "rooms", value: bathrooms, set: setBathrooms },
                        { label: "Floors", unit: "", value: floors, set: setFloors },
                    ].map((f) => (
                        <div key={f.label} className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600">
                                {f.label} {f.unit && <span className="text-xs font-normal text-slate-400">({f.unit})</span>}
                            </Label>
                            <Input type="number" value={f.value} onChange={(e) => f.set(Number(e.target.value))} className="h-10 bg-slate-50 border-slate-200 text-sm font-medium focus:bg-white" />
                        </div>
                    ))}
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Total Budget <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2">₹</span></Label>
                    <Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="h-11 bg-slate-50 border-slate-200 text-base font-medium focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Parking Required?</Label>
                    <select value={parking} onChange={(e) => setParking(e.target.value)}
                        className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:bg-white transition-colors">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
                <Button onClick={plan} className="w-full h-11 font-semibold bg-gradient-to-r from-violet-600 to-purple-700 text-white border-0 shadow-md hover:opacity-90">
                    <Brain className="w-4 h-4 mr-2" /> Generate My Plan
                </Button>
                <AnimatePresence>
                    {result && (
                        <motion.div key="plan" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-1 rounded-2xl bg-slate-900 text-white border border-slate-700 overflow-hidden">
                                <div className="p-5 space-y-3">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">🏡 Recommended Plan</p>
                                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-400 text-xs mb-0.5">House Type</p>
                                            <p className="text-white font-bold text-lg">{result.houseType}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 text-xs mb-0.5">Built-up Area</p>
                                            <p className="text-white font-bold text-lg">{result.builtUpArea.toLocaleString("en-IN")} sq.ft</p>
                                        </div>
                                    </div>
                                    <div className="bg-gold-accent/10 border border-gold-accent/20 rounded-xl p-4">
                                        <p className="text-gold-accent text-xs font-semibold uppercase mb-1">Estimated Cost Range</p>
                                        <p className="text-white font-bold text-xl">₹{formatLakh(result.costLow)}L – ₹{formatLakh(result.costHigh)}L</p>
                                    </div>
                                    <div className={`rounded-xl p-3 flex items-start gap-2 ${result.feasible ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                                        {result.feasible
                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                            : <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
                                        <p className={`text-xs ${result.feasible ? "text-emerald-300" : "text-red-300"}`}>{result.note}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

/* ─── Main Component ─────────────────────────────── */
export default function ToolsContent({ calculators }: ToolsContentProps) {
    const specialtyTools = [
        { id: "mat", component: <MaterialEstimatorTool />, label: "Material Estimator" },
        { id: "vastu", component: <VastuCheckerTool />, label: "Vastu Checker" },
        { id: "plot", component: <PlotSizeSuggestionTool />, label: "Plot Suggestion" },
        { id: "dream", component: <DreamHomePlannerTool />, label: "Dream Home Planner" },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="relative pt-28 pb-20 bg-navy-dark text-white overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gold-accent/10 blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[100px]" />
                </div>
                <div className="container-wide relative z-10 text-center px-4">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold-accent text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" /> Free Professional Tools
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight">
                            Construction Tools & Calculators
                        </h1>
                        <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                            Plan your dream home with precision — estimate costs, check Vastu, calculate materials, and design your perfect home layout.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Calculators Section (from Firebase / Admin Panel) */}
            {calculators.length > 0 && (
                <section className="py-14 px-4 pb-0">
                    <div className="container-wide">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-navy-primary/10 flex items-center justify-center">
                                <Calculator className="w-5 h-5 text-navy-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-navy-dark">Quick Calculators</h2>
                                <p className="text-slate-500 text-sm">Instant estimates for your project planning.</p>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {calculators.map((calc) => (
                                <CalculatorCard key={calc.id} calc={calc} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Specialty Tools Section */}
            <section className="py-14 px-4">
                <div className="container-wide">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-navy-dark">Specialty Tools</h2>
                            <p className="text-slate-500 text-sm">Advanced planning tools for materials, Vastu, and home design.</p>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
                        {specialtyTools.map((t) => (
                            <div key={t.id}>{t.component}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 px-4 pb-16">
                <div className="container-wide">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="bg-navy-dark rounded-3xl p-10 text-center text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">Need a Custom Estimate?</h3>
                        <p className="text-slate-300 mb-6 max-w-xl mx-auto">These tools give reliable estimates. For a precise quote tailored to your project, our experts are one click away.</p>
                        <Button asChild className="gold-gradient text-navy-primary font-semibold px-8 h-12 shadow-lg text-base">
                            <a href="/contact">Get a Free Consultation <ChevronRight className="w-4 h-4 ml-1" /></a>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
