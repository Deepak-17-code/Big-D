import { createSlice } from '@reduxjs/toolkit'
import { dummyFeed } from '../../data/dummyData'

const FALLBACK_AVATAR = '/avatar-placeholder.svg'

const normalizePost = (post) => ({
  ...post,
  id: post.id || post._id,
  user: {
    name: post.user?.name || 'Athlete',
    avatar: post.user?.avatar || FALLBACK_AVATAR,
    socialLinks: post.user?.socialLinks || {},
  },
})

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts: dummyFeed,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload.map(normalizePost)
    },
    addPost: (state, action) => {
      state.posts = [normalizePost(action.payload), ...state.posts]
    },
    updatePost: (state, action) => {
      state.posts = state.posts.map((post) =>
        post.id === action.payload.id ? normalizePost({ ...post, ...action.payload }) : post,
      )
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload)
    },
    toggleLike: (state, action) => {
      state.posts = state.posts.map((post) => {
        if (post.id !== action.payload) {
          return post
        }
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked,
        }
      })
    },
  },
})

export const { setPosts, addPost, updatePost, removePost, toggleLike } = feedSlice.actions
export default feedSlice.reducer
