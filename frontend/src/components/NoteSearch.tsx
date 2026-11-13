import { Search, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { transactionApi } from '../api/endpoints'
import { autocorrect, buildVocabulary } from '../lib/autocorrect'
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
const POOL_PAGES = 5 // read up to 5 x 100 notes to learn the person's own words (for spelling help)

interface Option {
  kind: 'fix' | 'note' // 'fix' is the "Did you mean ...?" row
  value: string
}

/** The distinct notes in a list of transactions (case-insensitive), in order. */
const uniqueNotes = (items: { description?: string | null }[]) => {
  const seen = new Set<string>()
  const notes: string[] = []
  for (const t of items) {
    const note = (t.description || '').trim()
    if (note && !seen.has(note.toLowerCase())) {
      seen.add(note.toLowerCase())
      notes.push(note)
    }
  }
  return notes
}

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
  const [fix, setFix] = useState<{ for: string; to: string } | null>(null) // spelling correction for what was typed
  const pool = useRef<{ key: string; notes: string[] } | null>(null) // all the person's notes, loaded once per set of filters
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
        let notes = uniqueNotes(res.items)
        let correction: string | null = null

        if (!notes.length) {
          // nothing contains what was typed: maybe it is misspelled. Learn the person's words and look for a close match.
          const key = JSON.stringify(scope)
          if (pool.current?.key !== key) {
            const all: { description?: string | null }[] = []
            for (let page = 1; page <= POOL_PAGES; page++) {
              const r = await transactionApi.list({ ...scope, page, limit: 100 })
              all.push(...r.items)
              if (all.length >= r.total) break
            }
            pool.current = { key, notes: uniqueNotes(all) }
          }
          if (cancelled) return
          correction = autocorrect(query, buildVocabulary(pool.current.notes))
          if (correction) notes = pool.current.notes.filter((n) => n.toLowerCase().includes(correction!.toLowerCase()))
        }

        // notes that START with what was typed come first, then the ones that only contain it
        const q = (correction ?? query).toLowerCase()
        notes.sort((a, b) => Number(b.toLowerCase().startsWith(q)) - Number(a.toLowerCase().startsWith(q)))
        setFix(correction ? { for: query, to: correction } : null)
        setSuggestions(notes.filter((n) => n.toLowerCase() !== q).slice(0, MAX_SUGGESTIONS))
        setActive(-1)
      } catch {
        if (!cancelled) {
          setSuggestions([]) // suggestions are a bonus: if the lookup fails, just show none
          setFix(null)
        }
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

  // the spelling fix only counts while it still belongs to what is typed right now
  const activeFix = fix && fix.for === query ? fix.to : null
  const options: Option[] = [
    ...(activeFix ? [{ kind: 'fix' as const, value: activeFix }] : []),
    ...suggestions.map((value) => ({ kind: 'note' as const, value })),
  ]
  const showList = open && options.length > 0

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
      if (options.length) setActive((a) => (a + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (options.length) setActive((a) => (a <= 0 ? options.length - 1 : a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (showList && active >= 0) choose(options[active].value)
      else if (activeFix) choose(activeFix) // autocorrect: nothing matched what was typed, so search the corrected spelling
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
            {options.map((o, i) => (
              <li
                key={`${o.kind}-${o.value}`}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown (not click) so it runs before the input loses focus
                onMouseDown={(e) => {
                  e.preventDefault()
                  choose(o.value)
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 ${i === active ? 'bg-brand-50' : ''} ${
                  o.kind === 'fix' ? 'border-b border-slate-100' : ''
                }`}
              >
                {o.kind === 'fix' ? (
                  <>
                    <Sparkles className="size-3.5 shrink-0 text-accent-500" />
                    <span className="truncate">
                      Did you mean <strong className="font-bold text-brand-700">{o.value}</strong>?
                    </span>
                  </>
                ) : (
                  <>
                    <Search className="size-3.5 shrink-0 text-slate-300" />
                    <span className="truncate"><Highlight text={o.value} query={activeFix ?? query} /></span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}