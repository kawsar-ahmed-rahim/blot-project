import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

// GET a path and track loading / error state. Pass null to skip the request.
export default function useApi(path) {
  const [state, setState] = useState({ data: null, loading: Boolean(path), error: '' })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!path) {
      setState({ data: null, loading: false, error: '' })
      return
    }
    let ignore = false
    setState((s) => ({ ...s, loading: true, error: '' }))
    api
      .get(path)
      .then((data) => !ignore && setState({ data, loading: false, error: '' }))
      .catch((err) => !ignore && setState({ data: null, loading: false, error: err.message }))
    return () => {
      ignore = true
    }
  }, [path, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  const setData = useCallback((data) => setState((s) => ({ ...s, data })), [])

  return { ...state, reload, setData }
}
