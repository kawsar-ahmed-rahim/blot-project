import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import useApi from '../../hooks/useApi'
import usePageTitle from '../../hooks/usePageTitle'
import { api } from '../../lib/api'
import CoverImage from '../../components/CoverImage'
import Spinner from '../../components/Spinner'
import ErrorMessage from '../../components/ErrorMessage'

const emptyPost = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: 'General',
  tags: [],
  status: 'draft',
  featured: false,
}

export default function PostEditor() {
  const { id } = useParams()
  const { data, loading, error } = useApi(id ? `/admin/posts/${id}` : null)
  usePageTitle(id ? 'Edit post' : 'New post')

  if (loading) return <Spinner />
  if (error) return <ErrorMessage message={error} />

  return <EditorForm key={id || 'new'} id={id} initial={data?.post || emptyPost} />
}

function EditorForm({ id, initial }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ ...initial, tags: (initial.tags || []).join(', ') })
  const [tab, setTab] = useState('write')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const wasPublished = initial.status === 'published'

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function save(status) {
    setBusy(true)
    setError('')
    try {
      const payload = { ...form, status }
      if (id) await api.put(`/admin/posts/${id}`, payload)
      else await api.post('/admin/posts', payload)
      navigate('/admin/posts')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save(wasPublished ? 'published' : 'draft')
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">{id ? 'Edit post' : 'New post'}</h1>
        <Link to="/admin/posts" className="btn btn-ghost btn-sm">Back to posts</Link>
      </div>

      <div className="mt-6">
        <ErrorMessage message={error} />
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Title</span>
            <input required maxLength={160} className="input input-bordered w-full text-lg font-semibold" value={form.title} onChange={set('title')} />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Excerpt</span>
            <textarea rows={2} maxLength={300} className="textarea textarea-bordered w-full" placeholder="A short summary shown on cards. Leave empty to generate one." value={form.excerpt} onChange={set('excerpt')} />
          </label>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Content (Markdown)</span>
              <div role="tablist" className="tabs tabs-box tabs-sm">
                <button type="button" role="tab" className={`tab ${tab === 'write' ? 'tab-active' : ''}`} onClick={() => setTab('write')}>Write</button>
                <button type="button" role="tab" className={`tab ${tab === 'preview' ? 'tab-active' : ''}`} onClick={() => setTab('preview')}>Preview</button>
              </div>
            </div>
            {tab === 'write' ? (
              <textarea
                required
                rows={18}
                aria-label="Post content"
                className="textarea textarea-bordered mt-1 w-full font-mono text-sm"
                placeholder={'## A heading\n\nWrite with **bold**, *italic*, `code`, lists and [links](https://example.com).'}
                value={form.content}
                onChange={set('content')}
              />
            ) : (
              <div className="mt-1 min-h-[24rem] rounded-box border border-base-300 bg-base-100 p-5">
                {form.content.trim() ? (
                  <div className="article"><ReactMarkdown>{form.content}</ReactMarkdown></div>
                ) : (
                  <p className="text-base-content/60">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-box border border-base-300 bg-base-100 p-4">
            <p className="text-sm font-semibold">Status</p>
            <p className="mt-1 text-sm text-base-content/70">
              {wasPublished ? 'This post is published.' : 'Drafts are only visible to admins.'}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {wasPublished ? (
                <>
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save('published')}>Update post</button>
                  <button type="button" className="btn btn-outline" disabled={busy} onClick={() => save('draft')}>Unpublish</button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save('published')}>Publish</button>
                  <button type="button" className="btn btn-outline" disabled={busy} onClick={() => save('draft')}>Save draft</button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-box border border-base-300 bg-base-100 p-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Category</span>
              <input maxLength={40} className="input input-bordered w-full" value={form.category} onChange={set('category')} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Tags</span>
              <input className="input input-bordered w-full" placeholder="react, css, tips" value={form.tags} onChange={set('tags')} />
              <span className="mt-1 block text-xs text-base-content/60">Separate tags with commas.</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" className="checkbox checkbox-primary" checked={form.featured} onChange={set('featured')} />
              <span className="text-sm font-semibold">Featured post</span>
            </label>
          </div>

          <div className="rounded-box border border-base-300 bg-base-100 p-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Cover image URL</span>
              <input type="url" placeholder="https://..." className="input input-bordered w-full" value={form.coverImage} onChange={set('coverImage')} />
            </label>
            {form.coverImage && (
              <CoverImage key={form.coverImage} src={form.coverImage} alt="Cover preview" className="mt-3 aspect-[16/10] w-full rounded-box" />
            )}
          </div>
        </aside>
      </div>
    </form>
  )
}
