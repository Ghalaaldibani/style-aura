import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { outfitSlots } from '../../data/avatar'
import { deleteUserDoc, restoreUserDoc, updateUserDoc } from '../../lib/db'
import { useLiveDoc, useUserCollection } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import { useFavorites } from '../../lib/useFavorites'
import { useToast } from '../../components/ui/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'
import Input from '../../components/ui/Input'
import AvatarFigure from '../../components/art/AvatarFigure'
import HeartButton from '../../components/HeartButton'
import FullScreenLoader from '../../components/FullScreenLoader'
import { EmptyState } from '../../components/ui/States'
import SuggestionResult from './SuggestionResult'
import { resolvePieces } from './useOutfitPieces'

export default function OutfitDetail() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const { logEvent } = useAdaptive()
  const toast = useToast()
  const navigate = useNavigate()
  const { data: outfit, loading } = useLiveDoc(['users', user.uid, 'outfits', id])
  const items = useUserCollection(user.uid, 'items')
  const { isFavorite, toggle } = useFavorites()
  const [dialog, setDialog] = useState(null) // 'delete' | 'rename'
  const [newName, setNewName] = useState('')
  usePageTitle(outfit?.name ?? 'Outfit')

  if (loading) return <FullScreenLoader />
  if (!outfit) {
    return (
      <>
        <PageHeader title="Outfit" backTo="/outfits" />
        <EmptyState title="Outfit not found" action={<Button to="/outfits">Back to outfits</Button>} />
      </>
    )
  }

  const pieces = resolvePieces(outfit, items.data)
  const fav = isFavorite('outfit', outfit.id)

  function remove() {
    const { id: outfitId, ...data } = outfit
    setDialog(null)
    deleteUserDoc(user.uid, 'outfits', outfitId).catch(() => {})
    logEvent('outfit_deleted')
    navigate('/outfits', { replace: true })
    toast.show({
      message: `“${outfit.name}” deleted`,
      actionLabel: 'Undo',
      onAction: () => restoreUserDoc(user.uid, 'outfits', outfitId, data).catch(() => {}),
    })
  }

  function rename(e) {
    e.preventDefault()
    if (!newName.trim()) return
    updateUserDoc(user.uid, 'outfits', outfit.id, { name: newName.trim() }).catch(() => {})
    setDialog(null)
    toast.show({ message: 'Outfit renamed' })
  }

  return (
    <section className="page-in">
      <PageHeader
        title={outfit.name}
        backTo="/outfits"
        action={<HeartButton on={fav} label={`Save ${outfit.name} to favorites`} onClick={() => toggle('outfit', outfit.id, outfit.name, fav)} />}
      />

      <div className="mx-auto mb-5 h-64 w-40 rounded-3xl bg-primary-light p-2">
        <AvatarFigure
          skinTone={profile?.avatar?.skinTone}
          bodyShape={profile?.avatar?.bodyShape}
          outfit={outfitSlots(pieces)}
          label="Your avatar wearing this outfit"
        />
      </div>

      <SuggestionResult pieces={pieces.map((p, i) => ({ id: p.id ?? `snap-${i}`, ...p }))} reasons={outfit.reasons} />

      <div className="mt-5 flex flex-col gap-3">
        <Button to={`/share/${outfit.id}`} fullWidth>
          Share outfit
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setNewName(outfit.name)
              setDialog('rename')
            }}
          >
            Rename
          </Button>
          <Button variant="secondary" className="!border-error !text-error" onClick={() => setDialog('delete')}>
            Delete
          </Button>
        </div>
      </div>

      <Dialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        title="Delete this outfit?"
        description="Your clothes stay in your wardrobe. You can undo for 5 seconds."
        actions={
          <>
            <Button variant="secondary" fullWidth onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={remove}>
              Delete
            </Button>
          </>
        }
      />
      <Dialog open={dialog === 'rename'} onClose={() => setDialog(null)} title="Rename outfit">
        <form onSubmit={rename} className="mt-4 flex flex-col gap-4">
          <Input label="Outfit name" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={40} />
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button type="submit" fullWidth disabled={!newName.trim()}>
              Save
            </Button>
          </div>
        </form>
      </Dialog>
    </section>
  )
}
