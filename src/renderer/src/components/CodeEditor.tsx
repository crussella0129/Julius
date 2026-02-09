import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'
import { closeBrackets } from '@codemirror/autocomplete'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--bg-code)',
    color: 'var(--text-code)',
    border: '1px solid var(--border-secondary)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem'
  },
  '.cm-content': {
    fontFamily: 'var(--font-mono)',
    padding: '0.75rem 0'
  },
  '.cm-gutters': {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-tertiary)',
    border: 'none',
    borderRight: '1px solid var(--border-secondary)'
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--bg-tertiary)'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--bg-tertiary)'
  },
  '&.cm-focused': {
    outline: '2px solid var(--accent-primary)',
    outlineOffset: '-1px'
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--text-primary)'
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(100, 181, 246, 0.2) !important'
  }
}, { dark: false })

export default function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        closeBrackets(),
        python(),
        syntaxHighlighting(defaultHighlightStyle),
        darkTheme,
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorState.readOnly.of(readOnly)
      ]
    })

    const view = new EditorView({
      state,
      parent: containerRef.current
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, []) // intentionally empty — we manage updates below

  // Sync external value changes (but not user edits)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value }
      })
    }
  }, [value])

  return <div ref={containerRef} />
}
