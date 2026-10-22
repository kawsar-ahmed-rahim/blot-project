import { useEffect } from 'react'
import { SITE_NAME } from '../config'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  }, [title])
}
