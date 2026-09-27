import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/checkout/emergency-repair')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/checkout/emergency-repair"!</div>
}
