// Entities
import IconBell from './entities/IconBell.vue';
import IconCalendar from './entities/IconCalendar.vue';
import IconCatalog from './entities/IconCatalog.vue';
import IconCommunity from './entities/IconCommunity.vue';
import IconDate from './entities/IconDate.vue';
import IconEarn from './entities/IconEarn.vue';
import IconEvents from './entities/IconEvents.vue';
import IconFeatured from './entities/IconFeatured.vue';
import IconFollowing from './entities/IconFollowing.vue';
import IconGallery from './entities/IconGallery.vue';
import IconGroups from './entities/IconGroups.vue';
import IconHome from './entities/IconHome.vue';
import IconEntityInfo from './entities/IconInfo.vue';
import IconLeftovers from './entities/IconLeftovers.vue';
import IconOrders from './entities/IconOrders.vue';
import IconPayments from './entities/IconPayments.vue';
import IconPopular from './entities/IconPopular.vue';
import IconPrice from './entities/IconPrice.vue';
import IconProducts from './entities/IconProducts.vue';
import IconProfile from './entities/IconProfile.vue';
import IconRecent from './entities/IconRecent.vue';
import IconShopcart from './entities/IconShopcart.vue';
import IconTime from './entities/IconTime.vue';

// Labels
import LabelAppStore from './labels/LabelAppStore.vue';
import LabelGooglePlay from './labels/LabelGooglePlay.vue';

// Actions
import IconShopcartAdd from './actions/IconShopcartAdd.vue';

// Navigation
import IconAdd from './navigation/IconAdd.vue';
import IconArrow from './navigation/IconArrow.vue';
import IconCheckmark from './navigation/IconCheckmark.vue';
import IconChevronBottom from './navigation/IconChevronBottom.vue';
import IconChevronLeft from './navigation/IconChevronLeft.vue';
import IconChevronRight from './navigation/IconChevronRight.vue';
import IconCross from './navigation/IconCross.vue';
import IconDelete from './navigation/IconDelete.vue';
import IconEdit from './navigation/IconEdit.vue';
import IconEllipsis from './navigation/IconEllipsis.vue';
import IconFilter from './navigation/IconFilter.vue';
import IconInfo from './navigation/IconInfo.vue';
import IconLike from './navigation/IconLike.vue';
import IconMinus from './navigation/IconMinus.vue';
import IconMute from './navigation/IconMute.vue';
import IconPlus from './navigation/IconPlus.vue';
import IconSearch from './navigation/IconSearch.vue';
import IconSort from './navigation/IconSort.vue';
import IconUnMute from './navigation/IconUnMute.vue';
import IconUpload from './navigation/IconUpload.vue';

// Placeholders
import PlaceholderChat from './placeholders/PlaceholderChat.vue';
import PlaceholderImage from './placeholders/PlaceholderImage.vue';
import PlaceholderOrganizationPic from './placeholders/PlaceholderOrganizationPic.vue';
import PlaceholderUserpic from './placeholders/PlaceholderUserpic.vue';

// Skeletons
import SkeletonBlogpost from './skeletons/SkeletonBlogpost.vue';
import SkeletonEvent from './skeletons/SkeletonEvent.vue';
import SkeletonEventShort from './skeletons/SkeletonEventShort.vue';
import SkeletonOrganization from './skeletons/SkeletonOrganization.vue';

// Socials
import Dribbble from './socials/dribbble.vue';
import Facebook from './socials/facebook.vue';
import Instagram from './socials/instagram.vue';
import Line from './socials/line.vue';
import Linkedin from './socials/linkedin.vue';
import Reddit from './socials/reddit.vue';
import Telegram from './socials/telegram.vue';
import Twitter from './socials/twitter.vue';
import Vk from './socials/vk.vue';
import Youtube from './socials/youtube.vue';

export {
  Dribbble,
  Facebook,
  IconAdd,
  IconArrow,
  IconBell,
  IconCalendar,
  IconCatalog,
  IconCheckmark,
  IconChevronBottom,
  IconChevronLeft,
  IconChevronRight,
  // Entities
  IconCommunity,
  // Navigation
  IconCross,
  IconDate,
  IconDelete,
  IconEarn,
  IconEdit,
  IconEllipsis,
  IconEntityInfo,
  IconEvents,
  IconFeatured,
  IconFilter,
  IconFollowing,
  IconGallery,
  IconGroups,
  IconHome,
  IconInfo,
  IconLeftovers,
  IconLike,
  IconMinus,
  IconMute,
  IconOrders,
  IconPayments,
  IconPlus,
  IconPopular,
  IconPrice,
  IconProducts,
  IconProfile,
  IconRecent,
  IconSearch,
  IconShopcart,
  // Actions
  IconShopcartAdd,
  IconSort,
  IconTime,
  IconUnMute,
  IconUpload,
  Instagram,
  LabelAppStore,
  // Labels
  LabelGooglePlay,
  Line,
  Linkedin,
  PlaceholderChat,
  PlaceholderImage,
  PlaceholderOrganizationPic,
  // Placeholders
  PlaceholderUserpic,
  Reddit,
  SkeletonBlogpost,
  SkeletonEvent,
  // Skeletons
  SkeletonEventShort,
  SkeletonOrganization,
  Telegram,
  Twitter,
  // Socials
  Vk,
  Youtube,
};

import iconsRouter from './router/icons.router.js';

// Icons page component
import IconsPage from './pages/IconsPage.vue';


function initializeIcons(app, store, router, options = {}) {
  const route = options.route || 'Home';

  // Регистрация маршрута для галереи иконок
  router.addRoute(route, iconsRouter);
}

const ModuleIcons = {
  initialize: initializeIcons,
  views: {
    router: {
      iconsRouter,
    },
    components: {
      IconsPage,
    },
  },
};

export default ModuleIcons;