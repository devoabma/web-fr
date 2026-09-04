import Image from 'next/image'

export function DashboardPreview() {
  return (
    <section className="relative mx-auto mt-10 max-w-295 px-4 sm:mt-14 sm:px-7 lg:mt-16.5">
      {/* Brilho de fundo: fica atrás da moldura, com blur menor no mobile porque desfoque grande custa caro no scroll. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-10 bottom-4 -z-10 rounded-[3rem] bg-rose-700/12 blur-[60px] sm:blur-[110px]"
      />

      {/* Moldura tipo tablet: o próprio print já traz o cabeçalho do app, por isso não há barra de navegador aqui. */}
      <div className="rounded-4xl border border-white/10 bg-primary p-2 shadow-[0_30px_70px_rgba(22,33,62,0.25)]">
        <Image
          src="/assets/sala-livre-content.png"
          alt="Painel do Sala Livre exibindo os computadores de uma sala com seus status de liberação"
          width={1600}
          height={767}
          priority
          sizes="(min-width: 1200px) 1120px, 100vw"
          className="h-auto w-full rounded-2xl"
        />
      </div>
    </section>
  )
}
