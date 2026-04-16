import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import BarChartCard from '../components/charts/BarChartCard'
import Card from '../components/common/Card'
import ConfirmModal from '../components/common/ConfirmModal'
import ToastMessage from '../components/common/ToastMessage'
import ProgressBar from '../components/common/ProgressBar'
import { addDailySteps, removeDailySteps, setSteps, updateDailySteps } from '../redux/slices/stepsSlice'
import { stepsService } from '../services/stepsService'
import { dummySteps } from '../data/dummyData'

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function StepsPage() {
  const dispatch = useDispatch()
  const stepsByDay = useSelector((state) => state.steps.stepsByDay)
  const [form, setForm] = useState({ day: 'Mon', steps: '' })
  const [error, setError] = useState('')
  const [editingEntry, setEditingEntry] = useState(null)
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = stepsByDay[stepsByDay.length - 1] || dummySteps[dummySteps.length - 1]
  const weeklyTotal = useMemo(
    () => stepsByDay.reduce((sum, entry) => sum + Number(entry.steps), 0),
    [stepsByDay],
  )

  useEffect(() => {
    const loadSteps = async () => {
      try {
        const { data } = await stepsService.getAll()
        dispatch(
          setSteps(
            data.length
              ? data.map((item) => ({
                  id: item._id,
                  day: item.day,
                  steps: item.steps,
                }))
              : dummySteps,
          ),
        )
      } catch {
        // Keep defaults if API is not ready.
      }
    }

    loadSteps()
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
    if (!form.steps) {
      return
    }

    const parsedSteps = Number(form.steps)
    if (!Number.isFinite(parsedSteps) || parsedSteps < 0) {
      setError('Steps cannot be negative.')
      return
    }

    setError('')
    setIsSubmitting(true)
    const payload = {
      day: form.day,
      steps: parsedSteps,
    }

    if (editingEntry) {
      try {
        if (editingEntry.id) {
          const { data } = await stepsService.update(editingEntry.id, payload)
          dispatch(
            updateDailySteps({
              id: data._id,
              day: data.day,
              steps: data.steps,
            }),
          )
        } else {
          dispatch(addDailySteps(payload))
        }
      } catch {
        if (editingEntry.id) {
          dispatch(updateDailySteps({ id: editingEntry.id, day: payload.day, steps: payload.steps }))
        } else {
          dispatch(addDailySteps(payload))
        }
      }

      setEditingEntry(null)
      setForm({ day: 'Mon', steps: '' })
      setToastMessage('Steps entry updated.')
      setIsSubmitting(false)
      return
    }

    try {
      const { data } = await stepsService.create(payload)
      dispatch(
        addDailySteps({
          id: data._id,
          day: data.day,
          steps: data.steps,
        }),
      )
    } catch {
      // Keep local update for offline-first feel.
      dispatch(addDailySteps(payload))
    }

    setForm({ ...form, steps: '' })
    setToastMessage('Steps entry saved.')
    setIsSubmitting(false)
  }

  const startEditEntry = (entry) => {
    setEditingEntry({ id: entry.id || null, day: entry.day })
    setForm({ day: entry.day, steps: String(entry.steps) })
    setError('')
  }

  const cancelEditing = () => {
    setEditingEntry(null)
    setForm({ day: 'Mon', steps: '' })
    setError('')
  }

  const requestDeleteEntry = (entry) => {
    setPendingDeleteEntry({ id: entry.id || null, day: entry.day })
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
        await stepsService.remove(entryToDelete.id)
      }
    } catch {
      // Keep local state responsive even if API is unavailable.
    }

    if (entryToDelete.id) {
      dispatch(removeDailySteps(entryToDelete.id))
    } else {
      dispatch(setSteps(stepsByDay.filter((entry) => entry.day !== entryToDelete.day)))
    }

    setToastMessage('Steps entry deleted.')
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Daily Steps">
          <form onSubmit={onSubmit} className="space-y-4">
            <select
              value={form.day}
              onChange={(event) => setForm({ ...form, day: event.target.value })}
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
              value={form.steps}
              min="0"
              step="1"
              onChange={(event) => {
                const value = event.target.value
                if (value === '' || Number(value) >= 0) {
                  setForm({ ...form, steps: value })
                  setError('')
                }
              }}
              className="auth-input"
              placeholder="Steps"
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

          <div className="mt-6 space-y-3">
            <p className="text-sm text-slate-300">
              Today: <span className="font-semibold text-white">{today.steps} steps</span>
            </p>
            <ProgressBar value={today.steps} max={12000} label="Daily goal progress" />
            <p className="text-sm text-slate-300">
              Weekly total: <span className="font-semibold text-white">{weeklyTotal}</span>
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {stepsByDay
              .slice()
              .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
              .map((entry) => (
                <div
                  key={entry.id || entry.day}
                  className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-900/50 px-3 py-2"
                >
                  <p className="text-sm text-slate-200">
                    {entry.day}: <span className="font-semibold text-white">{entry.steps}</span>
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

        <BarChartCard
          title="Weekly Steps"
          subtitle="Stay above 10k"
          data={stepsByDay}
          xKey="day"
          dataKey="steps"
        />
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingDeleteEntry)}
        title="Delete step entry?"
        message="This will remove the selected day from your steps history."
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
