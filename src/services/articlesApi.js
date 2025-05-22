import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = 'https://blog-platform.kata.academy/api'

export const articlesApi = createApi({
  reducerPath: 'articlesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().user.token || localStorage.getItem('token')

      if (token) {
        headers.set('Authorization', `Token ${token}`)
      }

      return headers
    },
  }),
  endpoints: (builder) => ({
    getArticles: builder.query({
      query: ({ limit = 10, offset = 0 } = {}) => `articles?limit=${limit}&offset=${offset}`,
    }),
    getArticleBySlug: builder.query({
      query: (slug) => `articles/${slug}`,
    }),
    registerUser: builder.mutation({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: { user: userData },
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/user',
    }),
    loginUser: builder.mutation({
      query: (userData) => ({
        url: 'users/login',
        method: 'POST',
        body: { user: userData },
      }),
    }),
    getUser: builder.query({
      query: () => '/user',
    }),
    updateUser: builder.mutation({
      query: (userData) => ({
        url: 'user',
        method: 'PUT',
        body: { user: userData },
      }),
    }),
    createArticle: builder.mutation({
      query: (articleData) => ({
        url: 'articles',
        method: 'POST',
        body: { article: articleData },
      }),
    }),
    updateArticle: builder.mutation({
      query: ({ slug, ...articleData }) => ({
        url: `articles/${slug}`,
        method: 'PUT',
        body: { article: articleData },
      }),
    }),
    deleteArticle: builder.mutation({
      query: (slug) => ({
        url: `articles/${slug}`,
        method: 'DELETE',
      }),
    }),
    favoriteArticle: builder.mutation({
      query: (slug) => ({
        url: `articles/${slug}/favorite`,
        method: 'POST',
      }),
    }),
    unfavoriteArticle: builder.mutation({
      query: (slug) => ({
        url: `articles/${slug}/favorite`,
        method: 'DELETE',
      }),
    }),
  }),
})

export const {
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useRegisterUserMutation,
  useGetCurrentUserQuery,
  useLoginUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useFavoriteArticleMutation,
  useUnfavoriteArticleMutation,
} = articlesApi
