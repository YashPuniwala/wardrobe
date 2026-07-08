import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface IconProps {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = colors.onSurface }: IconProps) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

export const iconNames = {
  checkroom: 'checkroom' as const,
  autoAwesome: 'auto-awesome' as const,
  autoFixHigh: 'auto-fix-high' as const,
  favorite: 'favorite' as const,
  favoriteBorder: 'favorite-border' as const,
  gridView: 'grid-view' as const,
  addCircle: 'add-circle' as const,
  person: 'person' as const,
  search: 'search' as const,
  notifications: 'notifications' as const,
  calendarToday: 'calendar-today' as const,
  photoCamera: 'photo-camera' as const,
  bodyFat: 'accessibility-new' as const,
  filterList: 'filter-list' as const,
  expandMore: 'expand-more' as const,
  arrowBack: 'arrow-back' as const,
  arrowForward: 'arrow-forward' as const,
  bookmark: 'bookmark' as const,
  chevronLeft: 'chevron-left' as const,
  chevronRight: 'chevron-right' as const,
  close: 'close' as const,
  check: 'check' as const,
  checkCircle: 'check-circle' as const,
  circle: 'circle' as const,
  umbrella: 'umbrella' as const,
  wbSunny: 'wb-sunny' as const,
  pieChart: 'pie-chart' as const,
  forum: 'forum' as const,
  flare: 'flare' as const,
  settings: 'settings' as const,
  pending: 'pending' as const,
  add: 'add' as const,
  calendarAddOn: 'calendar-add-on' as const,
  autoAwesomeMotion: 'auto-awesome-motion' as const,
  bookmarkHeart: 'bookmark' as const,
  send: 'send' as const,
  lock: 'lock' as const,
  mail: 'mail' as const,
  trendingUp: 'trending-up' as const,
  palette: 'palette' as const,
  logout: 'logout' as const,
  help: 'help' as const,
  info: 'info' as const,
  star: 'star' as const,
  receipt: 'receipt-long' as const,
  publicIcon: 'public' as const,
  group: 'group' as const,
  event: 'event' as const,
  refresh: 'refresh' as const,
};
