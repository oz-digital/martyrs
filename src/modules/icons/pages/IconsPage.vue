<template>
  <div class="pd-medium">
    <h2 class="mn-b-medium">Martyrs Icons Gallery</h2>
    
    <div v-for="(category, index) in categories" :key="index" class="mn-b-large">
      <h3 class="mn-b-medium t-medium">{{ formatCategoryName(category.name) }} ({{ category.icons.length }})</h3>
      <div class="cols-6 gap-thin">
        <div 
          v-for="(icon, iconIndex) in category.icons" 
          :key="iconIndex" 
          class="aspect-1x1 bg-light radius-medium flex-center flex-v-center flex-column flex hover-scale-1 cursor-pointer"
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
        </div>
      </div>
    </div>

    <div v-if="displayNotification" class="notification bg-third pd-small radius-medium pos-fixed pos-b-0 pos-r-0 mn-b-large mn-r-large">
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Import navigation icons
import IconInfo from '@martyrs/src/modules/icons/navigation/IconInfo.vue';
import IconMinus from '@martyrs/src/modules/icons/navigation/IconMinus.vue';
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue';
import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue';
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
import IconEarn from '@martyrs/src/modules/icons/entities/IconEarn.vue';
import IconPopular from '@martyrs/src/modules/icons/entities/IconPopular.vue';
import IconDate from '@martyrs/src/modules/icons/entities/IconDate.vue';
import IconFeatured from '@martyrs/src/modules/icons/entities/IconFeatured.vue';
import IconLeftovers from '@martyrs/src/modules/icons/entities/IconLeftovers.vue';
import IconOrders from '@martyrs/src/modules/icons/entities/IconOrders.vue';
import IconMusic from '@martyrs/src/modules/icons/entities/IconMusic.vue';
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

const categories = ref([]);
const copiedIcon = ref('');
const displayNotification = ref(false);
const notificationMessage = ref('');

onMounted(() => {
  loadIcons();
});

function loadIcons() {
  categories.value = [
    {
      name: 'navigation',
      icons: [
        { name: 'IconInfo', component: IconInfo },
        { name: 'IconMinus', component: IconMinus },
        { name: 'IconEllipsis', component: IconEllipsis },
        { name: 'IconPlus', component: IconPlus },
        { name: 'IconCheckmark', component: IconCheckmark },
        { name: 'IconPause', component: IconPause },
        { name: 'IconAdd', component: IconAdd },
        { name: 'IconVolume', component: IconVolume },
        { name: 'IconUnMute', component: IconUnMute },
        { name: 'IconCross', component: IconCross },
        { name: 'IconDoubleCheck', component: IconDoubleCheck },
        { name: 'IconSearch', component: IconSearch },
        { name: 'IconChevronRight', component: IconChevronRight },
        { name: 'IconLike', component: IconLike },
        { name: 'IconDelete', component: IconDelete },
        { name: 'IconCheck', component: IconCheck },
        { name: 'IconFilter', component: IconFilter },
        { name: 'IconAttach', component: IconAttach },
        { name: 'IconRefresh', component: IconRefresh },
        { name: 'IconUpload', component: IconUpload },
        { name: 'IconSort', component: IconSort },
        { name: 'IconChevronBottom', component: IconChevronBottom },
        { name: 'IconChevronLeft', component: IconChevronLeft },
        { name: 'IconEdit', component: IconEdit },
        { name: 'IconMute', component: IconMute },
        { name: 'IconSend', component: IconSend },
        { name: 'IconArrow', component: IconArrow },
        { name: 'IconPlay', component: IconPlay },
        { name: 'IconShuffle', component: IconShuffle }
      ]
    },
    {
      name: 'entities',
      icons: [
        { name: 'IconInfo', component: IconInfoEntities },
        { name: 'IconPrice', component: IconPrice },
        { name: 'IconCalendar', component: IconCalendar },
        { name: 'IconPayments', component: IconPayments },
        { name: 'IconBell', component: IconBell },
        { name: 'IconTime', component: IconTime },
        { name: 'IconCommunity', component: IconCommunity },
        { name: 'IconGallery', component: IconGallery },
        { name: 'IconFile', component: IconFile },
        { name: 'IconFollowing', component: IconFollowing },
        { name: 'IconEvents', component: IconEvents },
        { name: 'IconHome', component: IconHome },
        { name: 'IconProducts', component: IconProducts },
        { name: 'IconCatalog', component: IconCatalog },
        { name: 'IconShopcart', component: IconShopcart },
        { name: 'IconRecent', component: IconRecent },
        { name: 'IconEarn', component: IconEarn },
        { name: 'IconPopular', component: IconPopular },
        { name: 'IconDate', component: IconDate },
        { name: 'IconFeatured', component: IconFeatured },
        { name: 'IconLeftovers', component: IconLeftovers },
        { name: 'IconOrders', component: IconOrders },
        { name: 'IconMusic', component: IconMusic },
        { name: 'IconProfile', component: IconProfile },
        { name: 'IconGroups', component: IconGroups }
      ]
    },
    {
      name: 'placeholders',
      icons: [
        { name: 'PlaceholderOrganizationPic', component: PlaceholderOrganizationPic },
        { name: 'PlaceholderChat', component: PlaceholderChat },
        { name: 'PlaceholderImage', component: PlaceholderImage },
        { name: 'PlaceholderUserpic', component: PlaceholderUserpic }
      ]
    },
    {
      name: 'socials',
      icons: [
        { name: 'vk', component: Vk },
        { name: 'instagram', component: Instagram },
        { name: 'telegram', component: Telegram },
        { name: 'twitter', component: Twitter },
        { name: 'linkedin', component: Linkedin },
        { name: 'reddit', component: Reddit },
        { name: 'dribbble', component: Dribbble },
        { name: 'facebook', component: Facebook },
        { name: 'youtube', component: Youtube },
        { name: 'line', component: Line }
      ]
    },
    {
      name: 'actions',
      icons: [
        { name: 'IconDuplicate', component: IconDuplicate },
        { name: 'IconShopcartAdd', component: IconShopcartAdd }
      ]
    },
    {
      name: 'labels',
      icons: [
        { name: 'LabelGooglePlay', component: LabelGooglePlay },
        { name: 'LabelAppStore', component: LabelAppStore }
      ]
    },
    {
      name: 'logos',
      icons: [
        { name: 'Logotype', component: Logotype }
      ]
    },
    {
      name: 'skeletons',
      icons: [
        { name: 'SkeletonEventShort', component: SkeletonEventShort },
        { name: 'SkeletonBlogpost', component: SkeletonBlogpost },
        { name: 'SkeletonOrganization', component: SkeletonOrganization },
        { name: 'SkeletonEvent', component: SkeletonEvent }
      ]
    }
  ];
}

function formatCategoryName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function copyIconName(iconName, categoryName) {
  // Copy the icon import to clipboard
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
</style>