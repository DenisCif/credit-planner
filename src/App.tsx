import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area,
} from "recharts";

export default function App() {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500);
  const [totalDays, setTotalDays] = useState<number>(30);
  const [daysLeft, setDaysLeft] = useState<number>(30);
  const [creditsLeft, setCreditsLeft] = useState<number>(500);
  const [plannedDaily, setPlannedDaily] = useState<number>(16);

  const daysElapsed = useMemo(() => Math.max(totalDays - daysLeft, 0), [totalDays, daysLeft]);
  const actualUsed = useMemo(() => Math.max(monthlyBudget - creditsLeft, 0), [monthlyBudget, creditsLeft]);

  const neededPerDay = useMemo(() => daysLeft <= 0 ? 0 : +(creditsLeft / daysLeft).toFixed(2), [daysLeft, creditsLeft]);
  const baselineDaily = useMemo(() => totalDays <= 0 ? 0 : +(monthlyBudget / totalDays).toFixed(2), [monthlyBudget, totalDays]);
  const expectedUsedByTodayPlan = useMemo(() => +(plannedDaily * daysElapsed).toFixed(2), [plannedDaily, daysElapsed]);
  const varianceVsPlan = useMemo(() => +(actualUsed - expectedUsedByTodayPlan).toFixed(2), [actualUsed, expectedUsedByTodayPlan]);
  const surplus = useMemo(() => Math.max(0, +(expectedUsedByTodayPlan - actualUsed).toFixed(2)), [expectedUsedByTodayPlan, actualUsed]);
  const deficit = useMemo(() => Math.max(0, varianceVsPlan), [varianceVsPlan]);

  const todayPlan = plannedDaily;
  const todayEqualize = neededPerDay;
  const todayMaxKeepingPlan = useMemo(() => +(todayPlan + surplus).toFixed(2), [todayPlan, surplus]);

  const statusOk = plannedDaily <= neededPerDay;

  const projection = useMemo(() => {
    const arr: { day: number; remaining: number }[] = [];
    for (let d = 1; d <= Math.max(daysLeft, 1); d++) {
      const remaining = +(creditsLeft - plannedDaily * (d - 1)).toFixed(2);
      arr.push({ day: d, remaining: Math.max(remaining, 0) });
    }
    return arr;
  }, [daysLeft, creditsLeft, plannedDaily]);

  return (
    <div className="min-h-screen bg-radial-[at_50%_75%] from-sky-700 to-sky-400 text-gray-900">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1 text-white">Planner de créditos Windsurf</h1>
        <p className="text-sm text-white mb-4">
          Ingresa tus datos y revisa si vas en línea con tu plan. También te digo cuánto podrías gastar <b>hoy</b>.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <section className="bg-white rounded-2xl shadow-md p-4">
            <h2 className="font-semibold mb-3">Parámetros</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <LabelInput label="Presupuesto mensual (créditos)">
                <input type="number" className="w-full border rounded-xl px-3 py-2"
                  value={monthlyBudget} min={0} onChange={(e) => setMonthlyBudget(+e.target.value || 0)} />
              </LabelInput>

              <LabelInput label="Días totales del mes">
                <input type="number" className="w-full border rounded-xl px-3 py-2"
                  value={totalDays} min={1} onChange={(e) => setTotalDays(+e.target.value || 0)} />
              </LabelInput>

              <LabelInput label="Días restantes">
                <input type="number" className="w-full border rounded-xl px-3 py-2"
                  value={daysLeft} min={0} onChange={(e) => setDaysLeft(+e.target.value || 0)} />
              </LabelInput>

              <LabelInput label="Créditos disponibles (hoy)">
                <input type="number" className="w-full border rounded-xl px-3 py-2"
                  value={creditsLeft} min={0} onChange={(e) => setCreditsLeft(+e.target.value || 0)} />
              </LabelInput>

              <div className="sm:col-span-2">
                <LabelInput label="Plan diario (tu objetivo)">
                  <input type="number" className="w-40 border rounded-xl px-3 py-2"
                    value={plannedDaily} min={0} step={0.5} onChange={(e) => setPlannedDaily(+e.target.value || 0)} />
                </LabelInput>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-md p-4">
            <h2 className="font-semibold mb-3">Resumen</h2>
            <Metric label="Necesario por día (desde hoy)" value={`${neededPerDay} créditos`} hint="Para terminar exactamente en 0." />
            <Metric label={`Promedio mensual (${monthlyBudget}/${totalDays})`} value={`${baselineDaily} créditos`} hint="Si repartes parejo todo el mes." />
            <Metric label="Días transcurridos" value={`${daysElapsed} días`} />
            <div className={`flex items-center gap-2 rounded-xl border p-3 mt-2 ${statusOk ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${statusOk ? "bg-green-600" : "bg-red-600"}`} />
              <span className="font-medium">{statusOk ? "Vas bien: alcanzarás el mes" : "Ajusta: te quedarás sin créditos antes"}</span>
            </div>
          </section>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <section className="bg-white rounded-2xl shadow-md p-4">
            <h2 className="font-semibold mb-3">Acumulado vs objetivo</h2>
            <Metric label="Gastado real hasta hoy" value={`${actualUsed} créditos`} />
            <Metric label="Deberías llevar (según tu plan)" value={`${expectedUsedByTodayPlan} créditos`} />
            {surplus > 0
              ? <Metric label="Ahorro acumulado (puedes usarlo extra)" value={`${surplus} créditos`} />
              : <Metric label="Déficit vs plan" value={`${deficit} créditos`} />}
          </section>

          <section className="bg-white rounded-2xl shadow-md p-4">
            <h2 className="font-semibold mb-3">¿Cuánto gastar HOY?</h2>
            <Metric label="Para seguir tu plan" value={`${todayPlan} créditos`} hint="Tu objetivo diario." />
            <Metric label="Para igualar y terminar en 0" value={`${todayEqualize} créditos`} hint="Promedio recalculado desde hoy." />
            <Metric label="Máximo hoy manteniendo el plan" value={`${todayMaxKeepingPlan} créditos`} hint="Puedes consumir el ahorro sin romper el objetivo mensual." />
          </section>
        </div>

        <section className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="font-semibold mb-3">Proyección de créditos restantes (usando tu plan diario)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projection} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickFormatter={(v) => `D${v}`} />
                <YAxis />
                <Tooltip formatter={(v: number) => `${v} créditos`} labelFormatter={(l) => `Día ${l}`} />
                <ReferenceLine y={0} strokeDasharray="3 3" />
                <Area type="monotone" dataKey="remaining" fillOpacity={0.15} />
                <Line type="monotone" dataKey="remaining" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2">La línea muestra cómo bajan tus créditos si gastas tu “plan diario”.</p>
        </section>
      </div>
    </div>
  );
}

function LabelInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border rounded-xl p-3 mb-2">
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        {hint && <div className="text-xs text-gray-400">{hint}</div>}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
