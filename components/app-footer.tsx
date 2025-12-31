'use client'

import { Star } from 'lucide-react'
import Link from 'next/link'
import type { JSX } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Constants
const CURRENT_YEAR = new Date().getFullYear()

// GitHub icon (non-deprecated custom SVG)
function GithubIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <title>GitHub</title>
      <path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' />
      <path d='M9 18c-4.51 2-5-2-7-2' />
    </svg>
  )
}

export function AppFooter(): JSX.Element {
  const [isTermsOpen, setIsTermsOpen] = useState(false)

  return (
    <>
      <footer className='border-t bg-card mt-auto'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between'>
            {/* Links Section */}
            <nav className='flex flex-wrap items-center justify-center gap-6 text-sm'>
              <Link
                href='/about'
                className='group relative font-medium text-muted-foreground transition-colors hover:text-foreground'
              >
                <span className='relative'>
                  Acerca de
                  <span className='absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full' />
                </span>
              </Link>

              <button
                type='button'
                onClick={() => setIsTermsOpen(true)}
                className='group relative font-medium text-muted-foreground transition-colors hover:text-foreground'
              >
                <span className='relative'>
                  Términos y Condiciones
                  <span className='absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full' />
                </span>
              </button>
            </nav>

            {/* Copyright */}
            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
              <span>©</span>
              <span className='font-mono tabular-nums'>{CURRENT_YEAR}</span>
              <span className='font-display font-medium text-foreground'>
                Trello Clone
              </span>
            </div>

            {/* GitHub Star Button */}
            <Button
              asChild
              variant='outline'
              size='sm'
              className='group gap-2 transition-all hover:border-primary hover:bg-primary/5'
            >
              <a
                href='https://github.com/PabloViniegra/trello-next'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Dale una estrella en GitHub'
              >
                <GithubIcon className='h-4 w-4 transition-transform group-hover:scale-110' />
                <Star className='h-4 w-4 fill-primary/20 transition-all group-hover:fill-primary group-hover:scale-110' />
                <span className='font-medium'>Estrella</span>
              </a>
            </Button>
          </div>

          {/* Decorative line */}
          <div className='mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent' />
        </div>
      </footer>

      {/* Terms & Conditions Modal */}
      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='font-display text-2xl'>
              Términos y Condiciones
            </DialogTitle>
            <DialogDescription>
              Última actualización: {CURRENT_YEAR}
            </DialogDescription>
          </DialogHeader>

          <div className='prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground'>
            <section>
              <h3 className='font-display text-lg font-semibold text-foreground'>
                1. Aceptación de los Términos
              </h3>
              <p>
                Al acceder y utilizar Trello Clone, aceptas estar sujeto a estos
                términos y condiciones de uso. Si no estás de acuerdo con alguna
                parte de estos términos, no debes utilizar nuestra aplicación.
              </p>
            </section>

            <section>
              <h3 className='font-display text-lg font-semibold text-foreground'>
                2. Uso del Servicio
              </h3>
              <p>
                Trello Clone es una herramienta de gestión de proyectos y
                tareas. Te comprometes a utilizar el servicio únicamente para
                propósitos legales y de acuerdo con estos términos.
              </p>
              <ul className='ml-6 list-disc space-y-1'>
                <li>No debes usar el servicio para actividades ilegales</li>
                <li>
                  Eres responsable de mantener la confidencialidad de tu cuenta
                </li>
                <li>
                  No debes intentar acceder a cuentas de otros usuarios sin
                  autorización
                </li>
                <li>
                  Debes notificar cualquier uso no autorizado de tu cuenta
                </li>
              </ul>
            </section>

            <section>
              <h3 className='font-display text-lg font-semibold text-foreground'>
                3. Contenido del Usuario
              </h3>
              <p>
                Mantienes todos los derechos sobre el contenido que creas en
                Trello Clone. Al utilizar nuestro servicio, nos otorgas una
                licencia para almacenar, procesar y mostrar tu contenido
                únicamente con el propósito de proporcionar el servicio.
              </p>
            </section>

            <section>
              <h3 className='font-display text-lg font-semibold text-foreground'>
                4. Privacidad
              </h3>
              <p>
                Tu privacidad es importante para nosotros. Recopilamos y
                utilizamos información personal de acuerdo con nuestra política
                de privacidad. Al usar el servicio, consientes la recopilación y
                uso de información según se describe en dicha política.
              </p>
            </section>

            <section>
              <h3 className='font-display text-lg font-semibold text-foreground'>
                5. Limitación de Responsabilidad
              </h3>
              <p>
                Trello Clone se proporciona "tal cual" sin garantías de ningún
                tipo. No garantizamos que el servicio sea ininterrumpido, seguro
                o libre de errores. En ningún caso seremos responsables por
                daños indirectos, incidentales o consecuentes.
              </p>
            </section>

            <section>
              <h3 className='font-display text-lg font-semibold text-foreground'>
                6. Modificaciones del Servicio
              </h3>
              <p>
                Nos reservamos el derecho de modificar o discontinuar el
                servicio en cualquier momento, con o sin previo aviso. No
                seremos responsables ante ti ni ante terceros por cualquier
                modificación, suspensión o interrupción del servicio.
              </p>
            </section>

            <section>
              <h3 className='font-display text-lg font-semibold text-foreground'>
                7. Cambios en los Términos
              </h3>
              <p>
                Podemos actualizar estos términos de vez en cuando. Te
                notificaremos sobre cambios significativos publicando los nuevos
                términos en esta página. Se recomienda revisar periódicamente
                estos términos.
              </p>
            </section>

            <section>
              <h3 className='font-display text-lg font-semibold text-foreground'>
                8. Contacto
              </h3>
              <p>
                Si tienes preguntas sobre estos términos, puedes contactarnos a
                través de nuestros canales de soporte.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
