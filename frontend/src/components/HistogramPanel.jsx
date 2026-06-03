import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistogramChart({ data, type = "rgb" }) {
  const hasHistogramData = type === "rgb"
    ? Boolean(data?.r?.length || data?.g?.length || data?.b?.length)
    : Boolean(data?.gray?.length);

  if (!hasHistogramData) return (
    <div className="flex items-center justify-center h-full text-gray-600 text-xs italic">
      [ Belum ada data histogram ]
    </div>
  );

  // Konversi array data ke format recharts
  const chartData = Array.from({ length: 256 }, (_, i) => {
    if (type === "rgb") {
      return {
        x: i,
        R: data?.r?.[i] ?? 0,
        G: data?.g?.[i] ?? 0,
        B: data?.b?.[i] ?? 0,
      };
    } else {
      return {
        x: i,
        Gray: data?.gray?.[i] ?? 0,
      };
    }
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <XAxis dataKey="x" tick={{ fontSize: 8, fill: '#6b7280' }} interval={63} />
        <YAxis tick={{ fontSize: 8, fill: '#6b7280' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#101116', border: '1px solid #374151', fontSize: 10 }}
          labelStyle={{ color: '#f3f4f6' }}
          itemStyle={{ color: '#f3f4f6' }}
          labelFormatter={(v) => `Intensity: ${v}`}
        />
        {type === "rgb" ? (
          <>
            <Line type="monotone" dataKey="R" stroke="#ef4444" dot={false} strokeWidth={1} />
            <Line type="monotone" dataKey="G" stroke="#22c55e" dot={false} strokeWidth={1} />
            <Line type="monotone" dataKey="B" stroke="#3b82f6" dot={false} strokeWidth={1} />
          </>
        ) : (
          <Line type="monotone" dataKey="Gray" stroke="#a855f7" dot={false} strokeWidth={1} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
