import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { transactionApi } from '../api/endpoints'
import type { TransactionFilters } from '../types'

interface Props {
  id: string
  label: string
  value: string // what is typed in the box (NOT what the table is filtered by)
  onChange: (value: string) => void // called on every keystroke
  onSubmit: (value: string) => void // called only when the person presses Enter, picks a suggestion or clears the box
  // the other filters on the page, so a suggestion is only offered if it would still give results
  scope: Pick<TransactionFilters, 'type' | 'category_id' | 'start' | 'end'>
}

const MAX_SUGGESTIONS = 6

/** Shows `text` with the part that matches `query` in bold. */
function Highlight({ text, query }: { text: string; query: string }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase())
  if (i < 0 || !query) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <strong className="font-bold text-brand-700">{text.slice(i, i + query.length)}</strong>
      {text.slice(i + query.length)}
    </>
  )
}

/**
 * A search box for notes with a row of suggestions under it.
 * The suggestions are looked up on their own, so typing here never changes the table:
 * the table only changes when the person presses Enter, clicks a suggestion or clears the box.
 */
export default function NoteSearch({ id, label, value, onChange, onSubmit, scope }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1) // which suggestion the arrow keys are on (-1 = none)
  const box = useRef<HTMLDivElement>(null)

  const query = value.trim()

  // Look up suggestions 200ms after typing stops. A newer search cancels an older one that is still running.
  useEffect(() => {
    if (!query) {
      setSuggestions([])
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await transactionApi.list({ ...scope, search: query, page: 1, limit: 50 })
        if (cancelled) return
        const seen = new Set<string>()
        const notes: string[] = []
        for (const t of res.items) {
          const note = (t.description || '').trim()
          if (note && !seen.has(note.toLowerCase())) {
            seen.add(note.toLowerCase())
            notes.push(note)
          }
        }
        // notes that START with what was typed come first, then the ones that only contain it
        const q = query.toLowerCase()
        notes.sort((a, b) => Number(b.toLowerCase().startsWith(q)) - Number(a.toLowerCase().startsWith(q)))
        setSuggestions(notes.filter((n) => n.toLowerCase() !== q).slice(0, MAX_SUGGESTIONS))
        setActive(-1)
      } catch {
        if (!cancelled) setSuggestions([]) // suggestions are a bonus: if the lookup fails, just show none
      }
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, scope.type, scope.category_id, scope.start, scope.end])

  // close the list when you click somewhere else
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const showList = open && suggestions.length > 0

  const choose = (note: string) => {
    onChange(note)
    onSubmit(note)
    setOpen(false)
    setActive(-1)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      if (suggestions.length) setActive((a) => (a + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (suggestions.length) setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (showList && active >= 0) choose(suggestions[active])
      else {
        onSubmit(value)
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <div ref={box}>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          className="input pl-9 pr-9"
          placeholder="Search notes…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onChange('')
              onSubmit('')
              setOpen(false)
            }}
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-3.5" />
          </button>
        )}

        {showList && (
          <ul
            id={`${id}-list`}
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            {suggestions.map((s, i) => (
              <li
                key={s}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown (not click) so it runs before the input loses focus
                onMouseDown={(e) => {
                  e.preventDefault()
                  choose(s)
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 ${i === active ? 'bg-brand-50' : ''}`}
              >
                <Search className="size-3.5 shrink-0 text-slate-300" />
                <span className="truncate"><Highlight text={s} query={query} /></span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
