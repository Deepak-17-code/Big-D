import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Card from '../components/common/Card'
import SocialLinks from '../components/common/SocialLinks'
import { formatDate } from '../utils/format'
import { updateProfile } from '../redux/slices/authSlice'
import { authService } from '../services/authService'

const FALLBACK_AVATAR = '/avatar-placeholder.svg'
const socialLinkFields = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourname' },
  { key: 'x', label: 'X', placeholder: 'https://x.com/yourname' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourname' },
  { key: 'website', label: 'Website', placeholder: 'https://yoursite.com' },
]

const normalizeProfileLinks = (socialLinks = {}) =>
  socialLinkFields.reduce((links, field) => {
    links[field.key] = String(socialLinks?.[field.key] || '')
    return links
  }, {})

export default function ProfilePage() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const workouts = useSelector((state) => state.workouts.workouts)
  const posts = useSelector((state) => state.feed.posts)
  const [form, setForm] = useState({
    name: '',
    avatar: '',
    bio: '',
    goal: '',
    socialLinks: normalizeProfileLinks(),
  })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    setForm({
      name: user?.name || '',
      avatar: user?.avatar || '',
      bio: user?.bio || '',
      goal: user?.goal || '',
      socialLinks: normalizeProfileLinks(user?.socialLinks),
    })
  }, [user])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await authService.me()
        if (data?.user) {
          dispatch(updateProfile(data.user))
        }
      } catch {
        // Retain client-side profile when API is unavailable.
      }
    }

    loadProfile()
  }, [dispatch])

  const totalVolume = useMemo(
    () =>
      workouts.reduce(
        (sum, workout) =>
          sum +
          workout.exercises.reduce(
            (exerciseTotal, exercise) => exerciseTotal + exercise.sets * exercise.reps * exercise.weight,
            0,
          ),
        0,
      ),
    [workouts],
  )

  const onChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
    setStatus('')
    setError('')
  }

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(avatarFile)
    setAvatarPreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [avatarFile])

  const onAvatarFileChange = (event) => {
    const selected = event.target.files?.[0]
    if (!selected) {
      setAvatarFile(null)
      return
    }

    if (!selected.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      setStatus('')
      setAvatarFile(null)
      return
    }

    setAvatarFile(selected)
    setStatus('')
    setError('')
  }

  const uploadSelectedAvatar = async () => {
    if (!avatarFile) {
      return null
    }

    const formData = new FormData()
    formData.append('avatar', avatarFile)

    const { data } = await authService.uploadAvatar(formData)
    const nextUser = data.user || {}

    dispatch(updateProfile(nextUser))
    setForm((current) => ({
      ...current,
      avatar: nextUser.avatar || current.avatar,
    }))
    setAvatarFile(null)

    return nextUser.avatar || null
  }

  const onUploadAvatar = async () => {
    if (!avatarFile) {
      setError('Please choose an image file first.')
      return
    }

    setUploadingAvatar(true)
    setStatus('')
    setError('')

    try {
      await uploadSelectedAvatar()
      setStatus('Profile image uploaded successfully.')
    } catch {
      setError('Could not upload profile image. Please try again.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const onSave = async (event) => {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }

    setSaving(true)
    setStatus('')
    setError('')

    try {
      let uploadedAvatar = null

      if (avatarFile) {
        uploadedAvatar = await uploadSelectedAvatar()
      }

      const payload = {
        name: form.name.trim(),
        avatar: (uploadedAvatar || form.avatar || '').trim(),
        bio: form.bio.trim(),
        goal: form.goal.trim(),
        socialLinks: Object.fromEntries(
          Object.entries(form.socialLinks || {}).map(([key, value]) => [key, String(value || '').trim()]),
        ),
      }

      const { data } = await authService.updateMe(payload)
      dispatch(updateProfile(data.user || payload))
      setStatus('Profile updated successfully.')
    } catch {
      setError('Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <div className="flex items-center gap-4">
          <img
            src={avatarPreview || form.avatar || user?.avatar || FALLBACK_AVATAR}
            alt={form.name || user?.name || 'Profile'}
            className="h-20 w-20 rounded-2xl object-cover"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_AVATAR
            }}
          />
          <div>
            <h2 className="text-2xl font-bold text-white">{form.name || user?.name || 'Athlete'}</h2>
            <p className="text-sm text-slate-300">{user?.email || 'No email set'}</p>
          </div>
        </div>
        <p className="mt-4 text-slate-300">{form.bio || user?.bio || 'No bio yet.'}</p>
        <p className="mt-2 text-sm text-red-300">Goal: {form.goal || user?.goal || 'Set your next goal'}</p>

        <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Social Links</p>
          <SocialLinks
            socialLinks={form.socialLinks || user?.socialLinks || {}}
            emptyMessage="No social links added yet."
            className="mt-3"
          />
        </div>

        <form onSubmit={onSave} className="mt-6 space-y-3 rounded-xl border border-slate-700/70 bg-slate-900/40 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Edit Profile</p>
          <label className="block text-sm text-slate-300">
            Name
            <input
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              className="auth-input"
              placeholder="Your name"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Profile Image URL
            <input
              value={form.avatar}
              onChange={(event) => onChange('avatar', event.target.value)}
              className="auth-input"
              placeholder="https://..."
            />
          </label>
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-3">
            <p className="text-sm text-slate-300">Or upload image from device</p>
            <input
              type="file"
              accept="image/*"
              onChange={onAvatarFileChange}
              className="mt-2 block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border file:border-slate-600 file:bg-slate-900 file:px-3 file:py-2 file:text-slate-200"
            />
            <button
              type="button"
              onClick={onUploadAvatar}
              disabled={uploadingAvatar || !avatarFile}
              className="mt-3 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-red-500/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
          <label className="block text-sm text-slate-300">
            Bio
            <textarea
              value={form.bio}
              onChange={(event) => onChange('bio', event.target.value)}
              className="auth-input min-h-24"
              placeholder="Tell people about your training"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Goal
            <input
              value={form.goal}
              onChange={(event) => onChange('goal', event.target.value)}
              className="auth-input"
              placeholder="e.g. Reach 10 pull-ups"
            />
          </label>

          <div className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-3">
            <p className="text-sm text-slate-300">Social Media Links</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {socialLinkFields.map((field) => (
                <label key={field.key} className="block text-sm text-slate-300">
                  {field.label}
                  <input
                    value={form.socialLinks?.[field.key] || ''}
                    onChange={(event) =>
                      onChange('socialLinks', {
                        ...(form.socialLinks || {}),
                        [field.key]: event.target.value,
                      })
                    }
                    className="auth-input"
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
            </div>
          </div>

          {status && <p className="text-sm text-emerald-300">{status}</p>}
          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button type="submit" disabled={saving} className="auth-button w-auto px-6 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-700/70 p-3">
            <p className="text-xs uppercase text-slate-400">Workouts</p>
            <p className="text-2xl font-bold text-white">{workouts.length}</p>
          </div>
          <div className="rounded-xl border border-slate-700/70 p-3">
            <p className="text-xs uppercase text-slate-400">Training Volume</p>
            <p className="text-2xl font-bold text-white">{Math.round(totalVolume)}</p>
          </div>
        </div>
      </Card>

      <Card title="Progress History">
        <div className="space-y-3">
          {posts.map((post) => (
            <article key={post.id} className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
              <p className="text-sm text-slate-200">{post.caption}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDate(post.createdAt)}</p>
            </article>
          ))}
        </div>
      </Card>
    </div>
  )
}
