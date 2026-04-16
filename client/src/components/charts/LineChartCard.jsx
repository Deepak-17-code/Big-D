import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../common/Card'

export default function LineChartCard({ title, subtitle, data, dataKey, xKey, stroke }) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="h-64 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
          <LineChart data={data}>
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
            <Line type="monotone" dataKey={dataKey} stroke={stroke || '#4f8dff'} strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
