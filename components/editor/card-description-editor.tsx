'use client'

import {
  type InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import type { EditorState, SerializedEditorState } from 'lexical'
import { useEffect, useId, useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardDescriptionPlugins } from './plugins/card-description-plugins'
import { nodes } from './plugins/nodes'
import { editorTheme } from './themes/editor-theme'

const editorConfig: InitialConfigType = {
  namespace: 'CardDescriptionEditor',
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Editor error:', error)
    }
    // In production, this should log to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  },
}

type TCardDescriptionEditorProps = {
  initialValue?: SerializedEditorState | null
  onChange?: (editorState: SerializedEditorState) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Card description editor component.
 * Rich text editor for card descriptions using Lexical.
 * Supports headings, lists, bold, italic, and basic formatting.
 *
 * @param initialValue - Initial editor state (serialized JSON)
 * @param onChange - Callback when editor state changes
 * @param placeholder - Placeholder text
 * @param disabled - Whether the editor is disabled
 */
export function CardDescriptionEditor({
  initialValue,
  onChange,
  placeholder = 'Añade una descripción más detallada...',
  disabled = false,
  className,
}: TCardDescriptionEditorProps) {
  const [key, setKey] = useState(0)
  const editorId = useId()
  const descriptionId = useId()

  // Reset editor when initialValue changes
  useEffect(() => {
    setKey((prev) => prev + 1)
  }, [])

  return (
    <section
      className={className}
      aria-labelledby={editorId}
      aria-describedby={descriptionId}
    >
      <div id={editorId} className='sr-only'>
        Editor de descripción de tarjeta
      </div>
      <div id={descriptionId} className='sr-only'>
        Editor de texto enriquecido. Utiliza las herramientas de formato para
        dar estilo a tu texto.
      </div>
      <LexicalComposer
        key={key}
        initialConfig={{
          ...editorConfig,
          editable: !disabled,
          ...(initialValue
            ? { editorState: JSON.stringify(initialValue) }
            : {}),
        }}
      >
        <TooltipProvider>
          <CardDescriptionPlugins placeholder={placeholder} />
          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState: EditorState) => {
              onChange?.(editorState.toJSON())
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </section>
  )
}
