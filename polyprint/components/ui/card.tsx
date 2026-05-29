export function KPICard({ title, value, color }: any) {
  return (
    <div className={`${color} text-white p-5 md:p-6 rounded-2xl shadow-lg transition-transform hover:scale-[1.02]`}>
      <h3 className="text-[10px] md:text-xs uppercase font-bold opacity-80 tracking-wider">
        {title}
      </h3>
      <p className="text-2xl md:text-3xl font-black mt-1 md:mt-2">
        {value}
      </p>
    </div>
  );
}