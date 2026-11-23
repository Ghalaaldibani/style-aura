import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from './auth/RouteGuards'
import Welcome from './pages/Welcome'

// Each screen is loaded only when it is opened (smaller first download).
const SignUp = lazy(() => import('./pages/auth/SignUp'))
const LogIn = lazy(() => import('./pages/auth/LogIn'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const QuizIntro = lazy(() => import('./pages/quiz/QuizIntro'))
const QuizQuestion = lazy(() => import('./pages/quiz/QuizQuestion'))
const StyleResult = lazy(() => import('./pages/quiz/StyleResult'))
const Home = lazy(() => import('./pages/main/Home'))
const BoardDetail = lazy(() => import('./pages/main/BoardDetail'))
const ProductDetail = lazy(() => import('./pages/main/ProductDetail'))
const Favorites = lazy(() => import('./pages/main/Favorites'))
const Avatar = lazy(() => import('./pages/main/Avatar'))
const Wardrobe = lazy(() => import('./pages/wardrobe/Wardrobe'))
const AddItem = lazy(() => import('./pages/wardrobe/AddItem'))
const ItemDetail = lazy(() => import('./pages/wardrobe/ItemDetail'))
const Outfits = lazy(() => import('./pages/outfits/Outfits'))
const CreateOutfit = lazy(() => import('./pages/outfits/CreateOutfit'))
const OutfitDetail = lazy(() => import('./pages/outfits/OutfitDetail'))
const EventPlanner = lazy(() => import('./pages/events/EventPlanner'))
const Share = lazy(() => import('./pages/social/Share'))
const Feed = lazy(() => import('./pages/social/Feed'))
const PostDetail = lazy(() => import('./pages/social/PostDetail'))
const Friends = lazy(() => import('./pages/social/Friends'))
const Profile = lazy(() => import('./pages/profile/Profile'))
const InteractionLog = lazy(() => import('./pages/profile/InteractionLog'))
const NotFound = lazy(() => import('./pages/NotFound'))
const DevPlayground = import.meta.env.DEV ? lazy(() => import('./pages/DevPlayground')) : null
const DevArt = import.meta.env.DEV ? lazy(() => import('./pages/DevArt')) : null

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Only for logged-out users */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Only for logged-in users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/quiz" element={<QuizIntro />} />
          <Route path="/quiz/:n" element={<QuizQuestion />} />
          <Route path="/result" element={<StyleResult />} />
          <Route path="/home" element={<Home />} />
          <Route path="/board/:id" element={<BoardDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/avatar" element={<Avatar />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/wardrobe/add" element={<AddItem />} />
          <Route path="/wardrobe/:id" element={<ItemDetail />} />
          <Route path="/wardrobe/:id/edit" element={<AddItem />} />
          <Route path="/outfits" element={<Outfits />} />
          <Route path="/outfits/create" element={<CreateOutfit />} />
          <Route path="/outfits/:id" element={<OutfitDetail />} />
          <Route path="/events" element={<EventPlanner />} />
          <Route path="/share/:outfitId" element={<Share />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/log" element={<InteractionLog />} />
        </Route>

        {DevPlayground && <Route path="/dev/ui" element={<DevPlayground />} />}
        {DevArt && <Route path="/dev/art" element={<DevArt />} />}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
