import { useState } from 'react'
import { useAdaptive } from '../adaptive/AdaptiveContext'
import { useToast } from '../components/ui/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Dialog from '../components/ui/Dialog'
import Tabs from '../components/ui/Tabs'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'

// Dev-only page (route exists only in `npm run dev`) to test the shared components
// and the auto-contrast sensor before the real screens are built.
export default function DevPlayground() {
  const { errorCount, highContrast, logs, reportError } = useAdaptive()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tab, setTab] = useState('ai')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Enter a valid email, e.g. name@example.com')
      reportError('dev-email')
    } else {
      setEmailError('')
      toast.show({ message: 'Email looks good!' })
    }
  }

  function confirmDelete() {
    setDialogOpen(false)
    toast.show({
      message: 'Item deleted',
      actionLabel: 'Undo',
      onAction: () => toast.show({ message: 'Item restored' }),
    })
  }

  return (
    <>
      <PageHeader title="UI playground" backTo="/" />

      <Card className="mb-6 text-sm">
        <p>Errors this session: <strong>{errorCount}</strong></p>
        <p>High contrast: <strong>{highContrast ? 'On' : 'Off'}</strong></p>
        <p>Logged events: <strong>{logs.length}</strong> (see Console)</p>
      </Card>

      <form onSubmit={handleSubmit} noValidate className="mb-6 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          hint="Submit a wrong email 3 times to trigger high contrast"
        />
        <Input label="Password" type="password" autoComplete="new-password" />
        <Button type="submit" fullWidth>Check email</Button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger" onClick={() => setDialogOpen(true)}>Delete…</Button>
        <Button
          loading={loading}
          loadingText="Saving…"
          onClick={() => {
            setLoading(true)
            setTimeout(() => setLoading(false), 2000)
          }}
        >
          Save
        </Button>
      </div>

      <Tabs
        label="Create outfit mode"
        tabs={[
          { id: 'ai', label: 'AI Suggest' },
          { id: 'manual', label: 'Create Manually' },
        ]}
        value={tab}
        onChange={setTab}
      >
        <p className="text-helper">{tab === 'ai' ? 'AI Suggest panel' : 'Manual panel'}</p>
      </Tabs>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Delete this item?"
        description="It will be removed from your wardrobe. You can undo for 5 seconds."
        actions={
          <>
            <Button variant="secondary" fullWidth onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={confirmDelete}>Delete</Button>
          </>
        }
      />
    </>
  )
}
