<template>
  <div class="pd-medium">
    <div class="flex-between mn-b-medium">
      <h2>Martyrs Icons Gallery</h2>
      <button @click="openAddIconPopup" class="pd-small pd-h-medium bg-primary t-white radius-medium hover-scale-1 cursor-pointer border-none">
        Add New Icon
      </button>
    </div>
    
    <div v-for="(category, index) in categories" :key="index" class="mn-b-large">
      <h3 class="mn-b-medium t-medium">{{ formatCategoryName(category.name) }} ({{ category.icons.length }})</h3>
      <div class="cols-6 gap-thin">
        <div 
          v-for="(icon, iconIndex) in category.icons" 
          :key="iconIndex" 
          class="icon-card aspect-1x1 bg-light radius-medium flex-center flex-v-center flex-column flex hover-scale-1 cursor-pointer pos-relative"
          @click="copyIconName(icon.name, category.name)"
        >
          <div class="flex-center flex h-60">
            <component :is="icon.component" class="w-2r h-2r" />
          </div>
          <div class="pd-t-thin pd-b-thin t-center t-small t-truncate">
            {{ icon.name }}
          </div>
          <div v-if="copiedIcon === icon.name" class="pd-thin bg-black radius-small t-small t-white pos-absolute pos-t-0 pos-r-0 mn-t-thin mn-r-thin">
            Copied!
          </div>
          <button 
            @click.stop="openReplaceIconPopup(icon, category.name)"
            class="replace-btn pos-absolute pos-t-0 pos-r-0 mn-t-thin mn-r-thin pd-micro bg-second radius-small hover-scale-1 cursor-pointer border-none"
            title="Replace icon"
          >
            <IconRefresh class="w-1r h-1r" :fill="'rgb(var(--white))'" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="displayNotification" class="notification bg-third pd-small radius-medium pos-fixed pos-b-0 pos-r-0 mn-b-large mn-r-large">
      {{ notificationMessage }}
    </div>

    <IconSearchPopup 
      :isOpen="showSearchPopup" 
      :mode="popupMode"
      :currentIcon="currentIconForReplace"
      @close="showSearchPopup = false"
      @icon-selected="handleIconSelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import IconSearchPopup from '../components/IconSearchPopup.vue';

// Import navigation icons
import IconInfo from '@martyrs/src/modules/icons/navigation/IconInfo.vue';
import IconMinus from '@martyrs/src/modules/icons/navigation/IconMinus.vue';
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue';
import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue';
import IconHeart from '@martyrs/src/modules/icons/navigation/IconHeart.vue';
import IconCheckmark from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue';
import IconPause from '@martyrs/src/modules/icons/navigation/IconPause.vue';
import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue';
import IconVolume from '@martyrs/src/modules/icons/navigation/IconVolume.vue';
import IconUnMute from '@martyrs/src/modules/icons/navigation/IconUnMute.vue';
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';
import IconDoubleCheck from '@martyrs/src/modules/icons/navigation/IconDoubleCheck.vue';
import IconSearch from '@martyrs/src/modules/icons/navigation/IconSearch.vue';
import IconChevronRight from '@martyrs/src/modules/icons/navigation/IconChevronRight.vue';
import IconLike from '@martyrs/src/modules/icons/navigation/IconLike.vue';
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';
import IconCheck from '@martyrs/src/modules/icons/navigation/IconCheck.vue';
import IconFilter from '@martyrs/src/modules/icons/navigation/IconFilter.vue';
import IconAttach from '@martyrs/src/modules/icons/navigation/IconAttach.vue';
import IconRefresh from '@martyrs/src/modules/icons/navigation/IconRefresh.vue';
import IconUpload from '@martyrs/src/modules/icons/navigation/IconUpload.vue';
import IconSort from '@martyrs/src/modules/icons/navigation/IconSort.vue';
import IconChevronBottom from '@martyrs/src/modules/icons/navigation/IconChevronBottom.vue';
import IconChevronLeft from '@martyrs/src/modules/icons/navigation/IconChevronLeft.vue';
import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue';
import IconMute from '@martyrs/src/modules/icons/navigation/IconMute.vue';
import IconSend from '@martyrs/src/modules/icons/navigation/IconSend.vue';
import IconArrow from '@martyrs/src/modules/icons/navigation/IconArrow.vue';
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';
import IconShuffle from '@martyrs/src/modules/icons/navigation/IconShuffle.vue';

// Import entities icons
import IconInfoEntities from '@martyrs/src/modules/icons/entities/IconInfo.vue';
import IconPrice from '@martyrs/src/modules/icons/entities/IconPrice.vue';
import IconCalendar from '@martyrs/src/modules/icons/entities/IconCalendar.vue';
import IconPayments from '@martyrs/src/modules/icons/entities/IconPayments.vue';
import IconBell from '@martyrs/src/modules/icons/entities/IconBell.vue';
import IconTime from '@martyrs/src/modules/icons/entities/IconTime.vue';
import IconCommunity from '@martyrs/src/modules/icons/entities/IconCommunity.vue';
import IconGallery from '@martyrs/src/modules/icons/entities/IconGallery.vue';
import IconFile from '@martyrs/src/modules/icons/entities/IconFile.vue';
import IconFollowing from '@martyrs/src/modules/icons/entities/IconFollowing.vue';
import IconEvents from '@martyrs/src/modules/icons/entities/IconEvents.vue';
import IconHome from '@martyrs/src/modules/icons/entities/IconHome.vue';
import IconProducts from '@martyrs/src/modules/icons/entities/IconProducts.vue';
import IconCatalog from '@martyrs/src/modules/icons/entities/IconCatalog.vue';
import IconShopcart from '@martyrs/src/modules/icons/entities/IconShopcart.vue';
import IconRecent from '@martyrs/src/modules/icons/entities/IconRecent.vue';
import IconList from '@martyrs/src/modules/icons/entities/IconList.vue';
import IconSettings from '@martyrs/src/modules/icons/entities/IconSettings.vue';
import IconEarn from '@martyrs/src/modules/icons/entities/IconEarn.vue';
import IconPopular from '@martyrs/src/modules/icons/entities/IconPopular.vue';
import IconDiscount from '@martyrs/src/modules/icons/entities/IconDiscount.vue';
import IconDate from '@martyrs/src/modules/icons/entities/IconDate.vue';
import IconFeatured from '@martyrs/src/modules/icons/entities/IconFeatured.vue';
import IconLeftovers from '@martyrs/src/modules/icons/entities/IconLeftovers.vue';
import IconOrders from '@martyrs/src/modules/icons/entities/IconOrders.vue';
import IconMusic from '@martyrs/src/modules/icons/entities/IconMusic.vue';
import IconPhone from '@martyrs/src/modules/icons/entities/IconPhone.vue';
import IconEmail from '@martyrs/src/modules/icons/entities/IconEmail.vue';
import IconAddress from '@martyrs/src/modules/icons/entities/IconAddress.vue';
import IconProfile from '@martyrs/src/modules/icons/entities/IconProfile.vue';
import IconGroups from '@martyrs/src/modules/icons/entities/IconGroups.vue';

// Import placeholders icons
import PlaceholderOrganizationPic from '@martyrs/src/modules/icons/placeholders/PlaceholderOrganizationPic.vue';
import PlaceholderChat from '@martyrs/src/modules/icons/placeholders/PlaceholderChat.vue';
import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue';
import PlaceholderUserpic from '@martyrs/src/modules/icons/placeholders/PlaceholderUserpic.vue';

// Import socials icons
import Vk from '@martyrs/src/modules/icons/socials/vk.vue';
import Instagram from '@martyrs/src/modules/icons/socials/instagram.vue';
import Telegram from '@martyrs/src/modules/icons/socials/telegram.vue';
import Twitter from '@martyrs/src/modules/icons/socials/twitter.vue';
import Linkedin from '@martyrs/src/modules/icons/socials/linkedin.vue';
import Reddit from '@martyrs/src/modules/icons/socials/reddit.vue';
import Dribbble from '@martyrs/src/modules/icons/socials/dribbble.vue';
import Facebook from '@martyrs/src/modules/icons/socials/facebook.vue';
import Youtube from '@martyrs/src/modules/icons/socials/youtube.vue';
import Line from '@martyrs/src/modules/icons/socials/line.vue';

// Import actions icons
import IconDuplicate from '@martyrs/src/modules/icons/actions/IconDuplicate.vue';
import IconShopcartAdd from '@martyrs/src/modules/icons/actions/IconShopcartAdd.vue';
import IconShow from '@martyrs/src/modules/icons/actions/IconShow.vue';

// Import labels icons
import LabelGooglePlay from '@martyrs/src/modules/icons/labels/LabelGooglePlay.vue';
import LabelAppStore from '@martyrs/src/modules/icons/labels/LabelAppStore.vue';

// Import logos icons
import Logotype from '@martyrs/src/modules/icons/logos/Logotype.vue';

// Import skeletons icons
import SkeletonEventShort from '@martyrs/src/modules/icons/skeletons/SkeletonEventShort.vue';
import SkeletonBlogpost from '@martyrs/src/modules/icons/skeletons/SkeletonBlogpost.vue';
import SkeletonOrganization from '@martyrs/src/modules/icons/skeletons/SkeletonOrganization.vue';
import SkeletonEvent from '@martyrs/src/modules/icons/skeletons/SkeletonEvent.vue';

// Icons map to avoid duplication
const iconsMap = {
  navigation: {
    IconInfo,
    IconMinus,
    IconEllipsis,
    IconPlus,
    IconHeart,
    IconCheckmark,
    IconPause,
    IconAdd,
    IconVolume,
    IconUnMute,
    IconCross,
    IconDoubleCheck,
    IconSearch,
    IconChevronRight,
    IconLike,
    IconDelete,
    IconCheck,
    IconFilter,
    IconAttach,
    IconRefresh,
    IconUpload,
    IconSort,
    IconChevronBottom,
    IconChevronLeft,
    IconEdit,
    IconMute,
    IconSend,
    IconArrow,
    IconPlay,
    IconShuffle
  },
  entities: {
    IconInfo: IconInfoEntities,
    IconPrice,
    IconCalendar,
    IconPayments,
    IconBell,
    IconTime,
    IconCommunity,
    IconGallery,
    IconFile,
    IconFollowing,
    IconEvents,
    IconHome,
    IconProducts,
    IconCatalog,
    IconShopcart,
    IconRecent,
    IconList,
    IconSettings,
    IconPhone,
    IconEmail,
    IconAddress,
    IconEarn,
    IconPopular,
    IconDiscount,
    IconDate,
    IconFeatured,
    IconLeftovers,
    IconOrders,
    IconMusic,
    IconProfile,
    IconGroups
  },
  placeholders: {
    PlaceholderOrganizationPic,
    PlaceholderChat,
    PlaceholderImage,
    PlaceholderUserpic
  },
  socials: {
    vk: Vk,
    instagram: Instagram,
    telegram: Telegram,
    twitter: Twitter,
    linkedin: Linkedin,
    reddit: Reddit,
    dribbble: Dribbble,
    facebook: Facebook,
    youtube: Youtube,
    line: Line
  },
  actions: {
    IconDuplicate,
    IconShopcartAdd,
    IconShow
  },
  labels: {
    LabelGooglePlay,
    LabelAppStore
  },
  logos: {
    Logotype
  },
  skeletons: {
    SkeletonEventShort,
    SkeletonBlogpost,
    SkeletonOrganization,
    SkeletonEvent
  }
};

const categories = ref([]);
const copiedIcon = ref('');
const displayNotification = ref(false);
const notificationMessage = ref('');
const showSearchPopup = ref(false);
const popupMode = ref('add');
const currentIconForReplace = ref(null);

onMounted(() => {
  loadIcons();
});

function loadIcons() {
  categories.value = Object.entries(iconsMap).map(([categoryName, icons]) => ({
    name: categoryName,
    icons: Object.entries(icons).map(([name, component]) => ({
      name,
      component
    }))
  }));
}

function formatCategoryName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function copyIconName(iconName, categoryName) {
  const importStatement = `import ${iconName} from '@martyrs/src/modules/icons/${categoryName}/${iconName}.vue';`;
  navigator.clipboard.writeText(importStatement);
  
  copiedIcon.value = iconName;
  notificationMessage.value = `Copied: ${importStatement}`;
  displayNotification.value = true;
  
  setTimeout(() => {
    copiedIcon.value = '';
    setTimeout(() => {
      displayNotification.value = false;
    }, 2000);
  }, 1000);
}

function openAddIconPopup() {
  popupMode.value = 'add';
  currentIconForReplace.value = null;
  showSearchPopup.value = true;
}

function openReplaceIconPopup(icon, categoryName) {
  popupMode.value = 'replace';
  currentIconForReplace.value = {
    name: icon.name,
    category: categoryName,
    component: icon.component
  };
  showSearchPopup.value = true;
}

function handleIconSelected(data) {
  // Reload icons after successful save
  loadIcons();
  
  // Show success notification
  notificationMessage.value = data.mode === 'add' 
    ? `Added new icon: ${data.icon.name}` 
    : `Replaced icon: ${data.icon.name}`;
  displayNotification.value = true;
  
  setTimeout(() => {
    displayNotification.value = false;
  }, 3000);
}
</script>

<style scoped>
.h-60 {
  height: 60%;
}

.notification {
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.icon-card .replace-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.icon-card:hover .replace-btn {
  opacity: 1;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>