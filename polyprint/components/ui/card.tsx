export function KPICard({ title, value, color }: any) {
  return (
    <div className={`${color} text-white p-6 rounded-2xl shadow-lg`}>
      <h3 className="text-xs uppercase font-bold opacity-80">{title}</h3>
      <p className="text-3xl font-black mt-2">{value}</p>
    </div>
  );
}