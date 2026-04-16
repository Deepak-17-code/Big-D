import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import LineChartCard from '../components/charts/LineChartCard'
import Card from '../components/common/Card'
import ConfirmModal from '../components/common/ConfirmModal'
import ToastMessage from '../components/common/ToastMessage'
import {
  addDailyCalories,
  removeDailyCalories,
  setCalories,
  updateDailyCalories,
} from '../redux/slices/nutritionSlice'
import { calorieService } from '../services/calorieService'

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CaloriesPage() {
  const dispatch = useDispatch()
  const caloriesByDay = useSelector((state) => state.nutrition.caloriesByDay)
  const [form, setForm] = useState({ date: 'Mon', calories: '' })
  const [error, setError] = useState('')
  const [editingEntry, setEditingEntry] = useState(null)
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const total = useMemo(
    () => caloriesByDay.reduce((sum, entry) => sum + Number(entry.calories), 0),
    [caloriesByDay],
  )

  useEffect(() => {
    const loadCalories = async () => {
      try {
        const { data } = await calorieService.getAll()
        dispatch(
          setCalories(
            data.map((item) => ({
              id: item._id,
              date: item.day,
              calories: item.calories,
            })),
          ),
        )
      } catch {
        // Dummy data stays as fallback.
      }
    }

    loadCalories()
  }, [dispatch])

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = setTimeout(() => {
      setToastMessage('')
    }, 2500)

    return () => clearTimeout(timeoutId)
  }, [toastMessage])

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!form.calories) {
      return
    }

    const parsedCalories = Number(form.calories)
    if (!Number.isFinite(parsedCalories) || parsedCalories < 0) {
      setError('Calories cannot be negative.')
      return
    }

    setError('')
    setIsSubmitting(true)
    const payload = {
      day: form.date,
      calories: parsedCalories,
    }

    if (editingEntry) {
      try {
        if (editingEntry.id) {
          const { data } = await calorieService.update(editingEntry.id, payload)
          dispatch(
            updateDailyCalories({
              id: data._id,
              date: data.day,
              calories: data.calories,
            }),
          )
        } else {
          dispatch(addDailyCalories({ date: payload.day, calories: payload.calories }))
        }
      } catch {
        if (editingEntry.id) {
          dispatch(updateDailyCalories({ id: editingEntry.id, date: payload.day, calories: payload.calories }))
        } else {
          dispatch(addDailyCalories({ date: payload.day, calories: payload.calories }))
        }
      }

      setEditingEntry(null)
      setForm({ date: 'Mon', calories: '' })
      setToastMessage('Calories entry updated.')
      setIsSubmitting(false)
      return
    }

    try {
      const { data } = await calorieService.create(payload)
      dispatch(
        addDailyCalories({
          id: data._id,
          date: data.day,
          calories: data.calories,
        }),
      )
    } catch {
      // Local state is still updated to keep UX responsive.
      dispatch(addDailyCalories({ date: payload.day, calories: payload.calories }))
    }

    setForm({ ...form, calories: '' })
    setToastMessage('Calories entry saved.')
    setIsSubmitting(false)
  }

  const startEditEntry = (entry) => {
    setEditingEntry({ id: entry.id || null, date: entry.date })
    setForm({ date: entry.date, calories: String(entry.calories) })
    setError('')
  }

  const cancelEditing = () => {
    setEditingEntry(null)
    setForm({ date: 'Mon', calories: '' })
    setError('')
  }

  const requestDeleteEntry = (entry) => {
    setPendingDeleteEntry({ id: entry.id || null, date: entry.date })
  }

  const cancelDeleteEntry = () => {
    setPendingDeleteEntry(null)
  }

  const confirmDeleteEntry = async () => {
    if (!pendingDeleteEntry) {
      return
    }

    const entryToDelete = pendingDeleteEntry
    setPendingDeleteEntry(null)

    try {
      if (entryToDelete.id) {
        await calorieService.remove(entryToDelete.id)
      }
    } catch {
      // Keep local state responsive even if API is unavailable.
    }

    if (entryToDelete.id) {
      dispatch(removeDailyCalories(entryToDelete.id))
    } else {
      dispatch(setCalories(caloriesByDay.filter((entry) => entry.date !== entryToDelete.date)))
    }

    setToastMessage('Calories entry deleted.')
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Daily Calories" subtitle="Input your intake">
          <form onSubmit={onSubmit} className="space-y-4">
            <select
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              className="auth-input"
            >
              {dayOrder.map((day) => (
                <option key={day} value={day} className="bg-slate-900">
                  {day}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={form.calories}
              min="0"
              step="1"
              onChange={(event) => {
                const value = event.target.value
                if (value === '' || Number(value) >= 0) {
                  setForm({ ...form, calories: value })
                  setError('')
                }
              }}
              className="auth-input"
              placeholder="Calories"
            />
            {error && <p className="text-sm text-rose-300">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                className="auth-button flex w-auto items-center gap-2 px-6 disabled:cursor-not-allowed disabled:opacity-80"
                disabled={isSubmitting}
              >
                {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </button>
              {editingEntry && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-blue-500/70 hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-sm text-slate-300">
            Total weekly calories: <span className="font-semibold text-white">{total}</span>
          </p>

          <div className="mt-4 space-y-2">
            {caloriesByDay
              .slice()
              .sort((a, b) => dayOrder.indexOf(a.date) - dayOrder.indexOf(b.date))
              .map((entry) => (
                <div
                  key={entry.id || entry.date}
                  className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-900/50 px-3 py-2"
                >
                  <p className="text-sm text-slate-200">
                    {entry.date}: <span className="font-semibold text-white">{entry.calories}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEditEntry(entry)}
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-blue-500/70 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteEntry(entry)}
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-blue-500/70 hover:text-blue-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <LineChartCard
          title="Calories Trend"
          subtitle="7 day overview"
          data={caloriesByDay}
          xKey="date"
          dataKey="calories"
          stroke="#60a5fa"
        />
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingDeleteEntry)}
        title="Delete calorie entry?"
        message="This will remove the selected day from your calories history."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        confirmLoading={false}
        onConfirm={confirmDeleteEntry}
        onCancel={cancelDeleteEntry}
      />

      <ToastMessage message={toastMessage} onClose={() => setToastMessage('')} />
    </>
  )
}
