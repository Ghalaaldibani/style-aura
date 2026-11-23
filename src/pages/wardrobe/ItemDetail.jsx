import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { CATEGORY_NAMES, OCCASIONS, SEASONS } from '../../data/categories'
import { COLORS } from '../../data/colors'
import { STYLES } from '../../data/styles'
import { deleteUserDoc, restoreUserDoc } from '../../lib/db'
import { useLiveDoc } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import { useToast } from '../../components/ui/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'
import ItemImage from '../../components/art/ItemImage'
import FullScreenLoader from '../../components/FullScreenLoader'
import { EmptyState } from '../../components/ui/States'

export default function ItemDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { logEvent } = useAdaptive()
  const toast = useToast()
  const navigate = useNavigate()
  const { data: item, loading } = useLiveDoc(['users', user.uid, 'items', id])
  const [confirm, setConfirm] = useState(false)
  usePageTitle(item?.name ?? 'Item')

  if (loading) return <FullScreenLoader />
  if (!item) {
    return (
      <>
        <PageHeader title="Item" backTo="/wardrobe" />
        <EmptyState title="Item not found" text="It may have been deleted." action={<Button to="/wardrobe">Back to wardrobe</Button>} />
      </>
    )
  }

  function remove() {
    const { id: itemId, ...data } = item
    setConfirm(false)
    deleteUserDoc(user.uid, 'items', itemId).catch(() => toast.show({ message: 'Delete failed. Try again.' }))
    logEvent('item_deleted', { category: item.category })
    navigate('/wardrobe', { replace: true })
    // Undo for 5 seconds (user control & freedom).
    toast.show({
      message: `${item.name} deleted`,
      actionLabel: 'Undo',
      onAction: () => {
        restoreUserDoc(user.uid, 'items', itemId, data).catch(() => {})
        logEvent('item_delete_undo')
      },
    })
  }

  const details = [
    ['Category', CATEGORY_NAMES[item.category]],
    ['Colour', COLORS[item.color]?.name],
    ['Season', SEASONS.find((s) => s.id === item.season)?.name],
    ['Occasion', OCCASIONS.find((o) => o.id === item.formality)?.name],
  ].filter(([, value]) => value)

  return (
    <section className="page-in">
      <PageHeader title={item.name} backTo="/wardrobe" />
      <div className="mx-auto h-56 w-56 rounded-3xl bg-white p-4">
        <ItemImage item={item} decorative={false} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        {details.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-3">
            <dt className="text-xs font-medium text-muted">{label}</dt>
            <dd className="font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      {item.tags?.length > 0 && (
        <ul aria-label="Style tags" className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <li key={t} className="rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary-dark">
              {STYLES[t]?.name ?? t}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <Button to={`/wardrobe/${item.id}/edit`} fullWidth>
          Edit item
        </Button>
        <Button variant="secondary" fullWidth className="!border-error !text-error" onClick={() => setConfirm(true)}>
          Delete item
        </Button>
      </div>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete this item?"
        description={`“${item.name}” will be removed from your wardrobe. You can undo for 5 seconds.`}
        actions={
          <>
            <Button variant="secondary" fullWidth onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={remove}>
              Delete
            </Button>
          </>
        }
      />
    </section>
  )
}
