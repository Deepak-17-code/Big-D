import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../common/Card'

export default function BarChartCard({ title, subtitle, data, dataKey, xKey }) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="h-64 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b3f66" />
            <XAxis dataKey={xKey} stroke="#9fb3d8" />
            <YAxis stroke="#9fb3d8" />
            <Tooltip
              contentStyle={{
                background: '#0d1a33',
                border: '1px solid #2b3f66',
                borderRadius: '0.75rem',
              }}
            />
            <Bar dataKey={dataKey} fill="#4f8dff" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
