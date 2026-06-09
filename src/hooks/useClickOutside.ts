import { useEffect, type RefObject } from 'react'

interface Handler {
  ref: RefObject<Element | null>
  close: () => void
}

export function useClickOutside(...handlers: Handler[]) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      handlers.forEach(({ ref, close }) => {
        if (!ref.current?.contains(e.target as Node)) close()
      })
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
