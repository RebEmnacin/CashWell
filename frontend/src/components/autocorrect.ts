/**
 * Spelling help for the notes search.
 * It only ever "corrects" toward words that already exist in the person's own notes (their vocabulary),
 * so a correction always leads somewhere: it never invents a word.
 */

/** How many single-letter edits (insert, delete, change, swap two neighbours) it takes to turn `a` into `b`. */
export function editDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array<number>(n).fill(0)])
  for (let j = 1; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      // swapped neighbours ("utnag" -> "utang") count as ONE edit
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[m][n]
}

const wordsOf = (text: string) => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []

/** Every word used in the notes, with how many times it is used. */
export function buildVocabulary(notes: string[]): Map<string, number> {
  const vocab = new Map<string, number>()
  for (const note of notes) for (const w of wordsOf(note)) vocab.set(w, (vocab.get(w) ?? 0) + 1)
  return vocab
}

/**
 * Fixes spelling mistakes in what was typed, using words from the notes.
 * Returns the corrected text, or null when nothing needs fixing (or nothing can be fixed).
 *  - a word that is the start of a real word ("inas" -> "inasal") is left alone: the person is still typing
 *  - otherwise the closest real word within 1 edit (up to 4 letters) or 2 edits (longer) wins; ties go to the most used word
 */
export function autocorrect(typed: string, vocab: Map<string, number>): string | null {
  const tokens = wordsOf(typed)
  if (!tokens.length) return null
  const words = [...vocab.keys()]
  const last = tokens.length - 1
  let changed = false

  const fixed: string[] = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.length < 3 || vocab.has(t) || words.some((w) => w.startsWith(t))) {
      fixed.push(t)
      continue
    }
    const maxEdits = t.length <= 4 ? 1 : 2
    let best: string | null = null
    let bestDist = Infinity
    for (const w of words) {
      // the word being typed (the last one) may be unfinished, so also compare it with the same-length start of the word
      let dist = editDistance(t, w)
      if (i === last) dist = Math.min(dist, editDistance(t, w.slice(0, t.length)) + 0.5)
      if (dist < bestDist || (dist === bestDist && best !== null && (vocab.get(w) ?? 0) > (vocab.get(best) ?? 0))) {
        best = w
        bestDist = dist
      }
    }
    if (best === null || bestDist > maxEdits) return null // can't fix this word, so don't guess
    fixed.push(best)
    changed = true
  }
  return changed ? fixed.join(' ') : null
}
