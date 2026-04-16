import { cloudinary } from '../config/cloudinary.js'
import Post from '../models/Post.js'

export async function getPosts(req, res) {
  const posts = await Post.find({ user: req.user._id })
    .populate('user', 'name avatar socialLinks')
    .sort({ createdAt: -1 })
  res.json(posts)
}

export async function createPost(req, res) {
  const { caption, mediaUrl, mediaType } = req.body

  if (!caption) {
    res.status(400)
    throw new Error('Caption is required.')
  }

  let finalMediaUrl = mediaUrl || ''
  let finalMediaType = mediaType || 'image'

  if (req.file) {
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'hevyx-progress',
      resource_type: 'auto',
    })

    finalMediaUrl = uploadResult.secure_url
    finalMediaType = uploadResult.resource_type === 'video' ? 'video' : 'image'
  }

  if (!finalMediaUrl) {
    res.status(400)
    throw new Error('Provide mediaUrl or upload a file.')
  }

  const post = await Post.create({
    user: req.user._id,
    caption,
    mediaUrl: finalMediaUrl,
    mediaType: finalMediaType,
  })

  const populated = await post.populate('user', 'name avatar socialLinks')
  res.status(201).json(populated)
}

export async function deletePost(req, res) {
  const post = await Post.findById(req.params.id)

  if (!post) {
    res.status(404)
    throw new Error('Post not found.')
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized to delete this post.')
  }

  await post.deleteOne()
  res.json({ message: 'Post deleted successfully.' })
}

export async function updatePost(req, res) {
  const { caption, mediaUrl } = req.body

  if (!caption || !String(caption).trim()) {
    res.status(400)
    throw new Error('Caption is required.')
  }

  const post = await Post.findById(req.params.id)
  if (!post) {
    res.status(404)
    throw new Error('Post not found.')
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized to edit this post.')
  }

  post.caption = String(caption).trim()

  if (mediaUrl !== undefined) {
    const normalizedMediaUrl = String(mediaUrl).trim()
    if (!normalizedMediaUrl) {
      res.status(400)
      throw new Error('Media URL cannot be empty.')
    }
    post.mediaUrl = normalizedMediaUrl
  }

  await post.save()
  const populated = await post.populate('user', 'name avatar socialLinks')
  res.json(populated)
}
