import type { SerializedEditorState } from 'lexical'

type SerializedParagraphNode = {
  children: unknown[]
  direction: 'ltr' | 'rtl'
  format: string
  indent: number
  type: 'paragraph'
  version: number
  textFormat?: number
}

/**
 * Creates an empty Lexical editor state.
 * Returns a minimal valid state with a single empty paragraph.
 */
export function createEmptyEditorState(): SerializedEditorState {
  const emptyParagraph: SerializedParagraphNode = {
    children: [],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
    textFormat: 0,
  }

  return {
    root: {
      children: [emptyParagraph],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

/**
 * Converts plain text to Lexical editor state.
 * Each line becomes a paragraph node.
 *
 * @param text - Plain text to convert
 * @returns Serialized Lexical editor state
 */
export function plainTextToEditorState(text: string): SerializedEditorState {
  if (!text) {
    return createEmptyEditorState()
  }

  const lines = text.split('\n')
  const children: SerializedParagraphNode[] = lines.map((line) => {
    const paragraph: SerializedParagraphNode = {
      children:
        line.length > 0
          ? [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: line,
                type: 'text',
                version: 1,
              },
            ]
          : [],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
      textFormat: 0,
    }
    return paragraph
  })

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

type TEditorNode = {
  type?: string
  text?: string
  children?: TEditorNode[]
}

/**
 * Converts Lexical editor state to plain text.
 * Useful for backward compatibility or search.
 */
export function editorStateToPlainText(
  editorState: SerializedEditorState,
): string {
  if (!editorState || !editorState.root) {
    return ''
  }

  const extractText = (node: TEditorNode): string => {
    if (node.type === 'text') {
      return node.text || ''
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children
        .map((child: TEditorNode) => extractText(child))
        .join('')
    }

    return ''
  }

  const paragraphs = (editorState.root.children || []) as TEditorNode[]
  return paragraphs.map((node: TEditorNode) => extractText(node)).join('\n')
}

/**
 * Validates if a value is a valid Lexical editor state.
 */
export function isValidEditorState(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false
  }

  const state = value as Record<string, unknown>
  return (
    'root' in state &&
    typeof state.root === 'object' &&
    state.root !== null &&
    'children' in state.root
  )
}
