import { useEffect, useState } from 'react'
import { Heart, ImagePlus, LoaderCircle, Pencil, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import Card from '../components/common/Card'
import ConfirmModal from '../components/common/ConfirmModal'
import SocialLinks from '../components/common/SocialLinks'
import ToastMessage from '../components/common/ToastMessage'
import { addPost, removePost, setPosts, toggleLike, updatePost } from '../redux/slices/feedSlice'
import { formatDate } from '../utils/format'
import { feedService } from '../services/feedService'

const FALLBACK_AVATAR = '/avatar-placeholder.svg'

export default function FeedPage() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const posts = useSelector((state) => state.feed.posts)
  const [caption, setCaption] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState('')
  const [error, setError] = useState('')
  const [deletingPostId, setDeletingPostId] = useState('')
  const [pendingDeletePostId, setPendingDeletePostId] = useState('')
  const [editingPostId, setEditingPostId] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [editMediaUrl, setEditMediaUrl] = useState('')
  const [savingPostId, setSavingPostId] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [isCreatingPost, setIsCreatingPost] = useState(false)

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreview('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(mediaFile)
    setMediaPreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [mediaFile])

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { data } = await feedService.getAll()
        dispatch(
          setPosts(
            data.map((item) => ({
              ...item,
              id: item._id,
              user: {
                name: item.user?.name || 'Athlete',
                avatar: item.user?.avatar || FALLBACK_AVATAR,
                  socialLinks: item.user?.socialLinks || {},
              },
            })),
          ),
        )
      } catch {
        // Keep dummy feed entries if backend is unavailable.
      }
    }

    loadPosts()
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

    if (!caption.trim()) {
      setError('Caption is required.')
      return
    }

    if (!mediaUrl.trim() && !mediaFile) {
      setError('Provide image URL or choose a file from device.')
      return
    }

    setError('')
    setIsCreatingPost(true)

    const payload = {
      caption: caption.trim(),
      mediaUrl: mediaUrl.trim(),
      mediaType: 'image',
    }

    try {
      let data

      if (mediaFile) {
        const formData = new FormData()
        formData.append('caption', payload.caption)
        formData.append('media', mediaFile)
        const response = await feedService.create(formData)
        data = response.data
      } else {
        const response = await feedService.create(payload)
        data = response.data
      }

      dispatch(
        addPost({
          ...data,
          id: data._id,
          user: {
            name: data.user?.name || 'Athlete',
            avatar: data.user?.avatar || FALLBACK_AVATAR,
            socialLinks: data.user?.socialLinks || user?.socialLinks || {},
          },
        }),
      )
    } catch {
      dispatch(
        addPost({
          id: crypto.randomUUID(),
          user: {
            name: user?.name || 'Athlete',
            avatar: user?.avatar || FALLBACK_AVATAR,
            socialLinks: user?.socialLinks || {},
          },
          caption: payload.caption,
          mediaUrl: mediaPreview || payload.mediaUrl,
          mediaType: 'image',
          likes: 0,
          createdAt: new Date().toISOString(),
        }),
      )
    }

    setCaption('')
    setMediaUrl('')
    setMediaFile(null)
    setIsCreatingPost(false)
  }

  const deletePost = async (postId) => {
    setDeletingPostId(postId)

    try {
      await feedService.remove(postId)
    } catch {
      // Keep local deletion to avoid stale UI when backend fails for local-only posts.
    } finally {
      dispatch(removePost(postId))
      setDeletingPostId('')
      setToastMessage('Post deleted.')
    }
  }

  const onDeleteClick = (postId) => {
    setPendingDeletePostId(postId)
  }

  const onCancelDelete = () => {
    setPendingDeletePostId('')
  }

  const onConfirmDelete = async () => {
    if (!pendingDeletePostId) {
      return
    }

    const postId = pendingDeletePostId
    setPendingDeletePostId('')
    await deletePost(postId)
  }

  const onStartEditPost = (post) => {
    setEditingPostId(post.id)
    setEditCaption(post.caption || '')
    setEditMediaUrl(post.mediaUrl || '')
    setError('')
  }

  const onCancelEditPost = () => {
    setEditingPostId('')
    setEditCaption('')
    setEditMediaUrl('')
  }

  const onSaveEditPost = async (post) => {
    const normalizedCaption = editCaption.trim()
    const normalizedMediaUrl = editMediaUrl.trim() || post.mediaUrl

    if (!normalizedCaption) {
      setError('Edited caption cannot be empty.')
      return
    }

    if (!normalizedMediaUrl) {
      setError('Media URL is required.')
      return
    }

    setSavingPostId(post.id)
    setError('')

    try {
      const { data } = await feedService.update(post.id, {
        caption: normalizedCaption,
        mediaUrl: normalizedMediaUrl,
      })

      dispatch(
        updatePost({
          ...data,
          id: data._id,
          user: {
            name: data.user?.name || 'Athlete',
            avatar: data.user?.avatar || FALLBACK_AVATAR,
          },
        }),
      )
    } catch {
      dispatch(
        updatePost({
          id: post.id,
          caption: normalizedCaption,
          mediaUrl: normalizedMediaUrl,
        }),
      )
    } finally {
      setSavingPostId('')
      onCancelEditPost()
      setToastMessage('Post updated.')
    }
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card title="Share Progress" subtitle="Upload image or video URL with caption">
          <form onSubmit={onSubmit} className="space-y-4">
            <textarea
              value={caption}
              onChange={(event) => {
                setCaption(event.target.value)
                setError('')
              }}
              className="auth-input min-h-28"
              placeholder="Today felt strong. Hit every target set."
            />
            <input
              value={mediaUrl}
              onChange={(event) => {
                setMediaUrl(event.target.value)
                setError('')
              }}
              className="auth-input"
              placeholder="https://..."
            />
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-3">
              <p className="text-sm text-slate-300">Or upload image from device</p>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null
                  setMediaFile(file)
                  setError('')
                }}
                className="mt-2 block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border file:border-slate-600 file:bg-slate-900 file:px-3 file:py-2 file:text-slate-200"
              />
            </div>

            {mediaPreview && (
              <img
                src={mediaPreview}
                alt="Selected upload preview"
                className="h-48 w-full rounded-xl object-cover"
              />
            )}

            {error && <p className="text-sm text-rose-300">{error}</p>}

            <button
              className="auth-button flex w-auto items-center gap-2 px-6 disabled:cursor-not-allowed disabled:opacity-80"
              disabled={isCreatingPost}
            >
                {isCreatingPost ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {isCreatingPost ? 'Posting...' : 'Post Update'}
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="glass-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.user.avatar || FALLBACK_AVATAR}
                    alt={post.user.name}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_AVATAR
                    }}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{post.user.name}</h3>
                    <p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteClick(post.id)}
                  disabled={deletingPostId === post.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-blue-500/70 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={14} />
                  {deletingPostId === post.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              {editingPostId === post.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editCaption}
                    onChange={(event) => {
                      setEditCaption(event.target.value)
                      setError('')
                    }}
                    className="auth-input min-h-24"
                    placeholder="Edit caption"
                  />
                  <input
                    value={editMediaUrl}
                    onChange={(event) => {
                      setEditMediaUrl(event.target.value)
                      setError('')
                    }}
                    className="auth-input"
                    placeholder="Edit media URL"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onSaveEditPost(post)}
                      disabled={savingPostId === post.id}
                      className="rounded-lg bg-linear-to-r from-blue-500 to-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                            {savingPostId === post.id ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEditPost}
                      className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-200">{post.caption}</p>
                  <img src={post.mediaUrl} alt={post.caption} className="mt-4 h-72 w-full rounded-xl object-cover" />
                </>
              )}

              <SocialLinks socialLinks={post.user?.socialLinks} className="mt-4" />

              {editingPostId !== post.id && (
                <button
                  type="button"
                  onClick={() => onStartEditPost(post)}
                  className="mt-4 inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-blue-500/70 hover:text-blue-300"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}

              <button
                type="button"
                onClick={() => dispatch(toggleLike(post.id))}
                className={`mt-4 flex items-center gap-2 text-sm ${post.isLiked ? 'text-rose-300' : 'text-slate-300'}`}
              >
                <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
                {post.likes} likes
              </button>
            </article>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingDeletePostId)}
        title="Delete this post?"
        message="This will permanently remove the post from your progress feed."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        confirmLoading={Boolean(deletingPostId)}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />

      <ToastMessage message={toastMessage} onClose={() => setToastMessage('')} />
    </>
  )
}
