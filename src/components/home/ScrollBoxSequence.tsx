import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import boxFrame1 from '../../assets/box-sequence/1.png'
import boxFrame2 from '../../assets/box-sequence/2.png'
import boxFrame3 from '../../assets/box-sequence/3.png'
import boxFrame4 from '../../assets/box-sequence/4.png'

interface SequenceStep {
  title: string
  description: string
}

interface ScrollBoxSequenceProps {
  frames?: string[]
  steps?: SequenceStep[]
  className?: string
}

const defaultFrames = [boxFrame1, boxFrame2, boxFrame3, boxFrame4]

const defaultSteps: SequenceStep[] = [
  {
    title: 'Hace tu pedido',
    description: 'Elegi tus productos, variantes y confirmalo en segundos.',
  },
  {
    title: 'Lo preparamos',
    description: 'Nuestro equipo valida stock y prepara cada detalle.',
  },
  {
    title: 'Lo cerramos y despachamos',
    description: 'Empaque premium, control final y salida a distribucion.',
  },
  {
    title: 'Tu pedido esta en camino',
    description: 'Seguimiento claro para que sepas cuando llega.',
  },
]

function preloadImages(sources: string[]) {
  return Promise.all(
    sources.map(
      (source) =>
        new Promise<void>((resolve) => {
          const image = new Image()
          image.src = source
          if (image.complete) {
            resolve()
            return
          }
          image.onload = () => resolve()
          image.onerror = () => resolve()
        }),
    ),
  )
}

function createFrameRange(index: number, total: number) {
  const denominator = Math.max(total - 1, 1)
  const center = index / denominator
  const span = 1 / denominator
  const left = Math.max(0, center - span)
  const right = Math.min(1, center + span)
  const edgeStart = index === 0 ? 1 : 0
  const edgeEnd = index === total - 1 ? 1 : 0

  return {
    input: [left, center, right] as [number, number, number],
    output: [edgeStart, 1, edgeEnd] as [number, number, number],
  }
}

interface SequenceFrameProps {
  index: number
  total: number
  source: string
  progress: MotionValue<number>
}

function SequenceFrame({ index, total, source, progress }: SequenceFrameProps) {
  const range = useMemo(() => createFrameRange(index, total), [index, total])
  const opacity = useTransform(progress, range.input, range.output)
  const y = useTransform(progress, [0, 1], [12, -14])
  const scale = useTransform(progress, [0, 1], [1.04, 0.99])

  return (
    <motion.img
      src={source}
      alt={`Caja frame ${index + 1}`}
      className="absolute inset-0 h-full w-full object-contain"
      style={{ opacity, y, scale }}
      draggable={false}
      loading={index === 0 ? 'eager' : 'lazy'}
    />
  )
}

interface StoryItemProps {
  index: number
  title: string
  description: string
  progress: MotionValue<number>
  total: number
}

function StoryItem({
  index,
  title,
  description,
  progress,
  total,
}: StoryItemProps) {
  const denominator = Math.max(total - 1, 1)
  const center = index / denominator
  const span = 0.25
  const left = Math.max(0, center - span)
  const right = Math.min(1, center + span)

  const opacity = useTransform(progress, [left, center, right], [0.45, 1, 0.5])
  const x = useTransform(progress, [left, center, right], [10, 0, -8])
  const textY = useTransform(progress, [left, center, right], [6, 0, -4])

  return (
    <motion.li className="grid grid-cols-[auto_1fr] gap-3" style={{ opacity, x }}>
      <motion.span
        className="mt-2 h-2.5 w-2.5 rounded-full bg-slate-800"
        style={{ y: textY }}
      />
      <motion.div style={{ y: textY }}>
        <p className="font-title text-xl text-slate-900 md:text-2xl">{title}</p>
        <p className="mt-1 text-sm text-slate-600 md:text-base">{description}</p>
      </motion.div>
    </motion.li>
  )
}

export function ScrollBoxSequence({
  frames = defaultFrames,
  steps = defaultSteps,
  className = '',
}: ScrollBoxSequenceProps) {
  const sequenceRef = useRef<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const storySteps = useMemo(
    () => steps.slice(0, Math.min(steps.length, frames.length)),
    [frames.length, steps],
  )

  const { scrollYProgress } = useScroll({
    target: sequenceRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 28,
    mass: 0.22,
  })

  const glowY = useTransform(smoothProgress, [0, 1], [-30, 40])
  const progressWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%'])

  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    const maxIndex = Math.max(storySteps.length - 1, 0)
    const nextStep = Math.min(maxIndex, Math.round(latest * maxIndex))
    setActiveStep((current) => (current === nextStep ? current : nextStep))
  })

  useEffect(() => {
    let mounted = true
    setReady(false)
    preloadImages(frames)
      .then(() => {
        if (mounted) {
          setReady(true)
        }
      })
      .catch(() => {
        if (mounted) {
          setReady(true)
        }
      })
    return () => {
      mounted = false
    }
  }, [frames])

  return (
    <section className={`relative mt-12 ${className}`} ref={sequenceRef}>
      <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white">
        <div className="absolute inset-x-8 top-0 z-20 h-0.5 bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-slate-900"
            style={{ width: progressWidth }}
          />
        </div>

        <div className="relative h-[230vh] md:h-[260vh]">
          <div className="sticky top-16 flex min-h-[calc(100vh-4.5rem)] items-center px-4 py-10 md:px-10 md:py-14">
            <div className="grid w-full gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
              <div className="order-2 space-y-6 lg:order-1">
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                    Scroll Story
                  </p>
                  <h2 className="font-title text-3xl leading-tight text-slate-900 md:text-5xl">
                    Del carrito a tu puerta, paso a paso.
                  </h2>
                  <p className="max-w-xl text-sm text-slate-600 md:text-base">
                    La secuencia responde al scroll real para mostrar como evoluciona
                    el pedido hasta salir a envio.
                  </p>
                </div>

                <ol className="space-y-4 md:space-y-6">
                  {storySteps.map((step, index) => (
                    <StoryItem
                      key={step.title}
                      index={index}
                      title={step.title}
                      description={step.description}
                      progress={smoothProgress}
                      total={storySteps.length}
                    />
                  ))}
                </ol>

                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Paso activo: {activeStep + 1} / {storySteps.length}
                </p>
              </div>

              <div className="order-1 lg:order-2">
                <motion.div
                  className="pointer-events-none absolute -right-10 -bottom-16 h-40 w-40 rounded-full bg-amber-200/35 blur-3xl md:h-52 md:w-52"
                  style={{ y: glowY }}
                />

                <div className="relative mx-auto w-full max-w-[30rem]">
                  <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-100/80 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.55)]">
                    {frames.map((source, index) => (
                      <SequenceFrame
                        key={source}
                        index={index}
                        total={frames.length}
                        source={source}
                        progress={smoothProgress}
                      />
                    ))}

                    <motion.div
                      className="pointer-events-none absolute inset-0 bg-white"
                      initial={false}
                      animate={{ opacity: ready ? 0 : 0.65 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
