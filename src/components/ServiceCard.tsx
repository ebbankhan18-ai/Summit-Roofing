import { business } from '#/config/business'
import { track } from '#/lib/track'

interface ServiceCardProps {
  name: string
  icon: string
  blurb: string
  points: readonly string[]
}

/**
 * Fires whop.track("service_viewed", ...) the first time a visitor expands a
 * service card — the "views/interacts with a service" moment.
 */
export function ServiceCard({ name, icon, blurb, points }: ServiceCardProps) {
  return (
    <details
      className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm open:shadow-md"
      onToggle={(e) => {
        if ((e.target as HTMLDetailsElement).open) {
          track('service_viewed', {
            service_name: name,
            source_section: 'services',
            city: business.city,
          })
        }
      }}
    >
      <summary className="flex cursor-pointer list-none items-start gap-4 focus-visible:outline-2 focus-visible:outline-amber-600">
        <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-xl">
          {icon}
        </span>
        <span className="flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="text-lg font-semibold text-stone-900">{name}</span>
            <span aria-hidden="true" className="text-stone-400 transition group-open:rotate-45">＋</span>
          </span>
          <span className="mt-1 block text-sm leading-6 text-stone-600">{blurb}</span>
        </span>
      </summary>
      <ul className="mt-4 space-y-1.5 border-t border-stone-100 pt-4 text-sm text-stone-700">
        {points.map((point) => (
          <li key={point} className="flex gap-2">
            <span aria-hidden="true" className="text-amber-600">✓</span>
            {point}
          </li>
        ))}
      </ul>
    </details>
  )
}
