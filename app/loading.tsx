export default function Loading() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
        <p className='text-sm text-muted-foreground'>Cargando...</p>
      </div>
    </div>
  )
}
