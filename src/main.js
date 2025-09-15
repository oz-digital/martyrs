// Define components
// ------------------------------------- //
import {
  Address,
  Breadcrumbs,
  Button,
  Checkbox,
  Chips,
  Countdown,
  Calendar,
  DatePicker,
  Dropdown,
  EmptyState,
  Error,
  Feed,
  Carousel,
  Field,
  FieldBig,
  FieldPhone,
  FieldTags,
  Gradient,
  // Footer,
  // Header,
  Loader,
  LocationMarker,
  Map,
  Marquee,
  Menu,
  MenuItem,
  Popup,
  Radio,
  Select,
  SelectMulti,
  // Navigation,
  // Search,
  Shader,
  Slider,
  Spoiler,
  Status,
  Tab,
  Text,
  Tooltip,
  Upload,
  UploadImage,
  UploadImageMultiple,
  Media
} from './components';

export default {
  install: app => {
    app.component('Address', () => import('./components/Address/Address.vue'));
    app.component('Button', () => import('./components/Button/Button.vue'));
    app.component('Checkbox', () => import('./components/Checkbox/Checkbox.vue'));
    app.component('Calendar', () => import('./components/Calendar/Calendar.vue'));
    app.component('Dropdown', () => import('./components/Dropdown/Dropdown.vue'));
    app.component('Error', () => import('./components/Error/Error.vue'));
    app.component('Field', () => import('./components/Field/Field.vue'));
    app.component('FieldPhone', () => import('./components/FieldPhone/FieldPhone.vue'));
    app.component('LocationMarker', () => import('./components/LocationMarker/LocationMarker.vue'));
    app.component('Map', () => import('./components/Map/Map.vue'));
    app.component('Popup', () => import('./components/Popup/Popup.vue'));
    app.component('Radio', () => import('./components/Radio/Radio.vue'));
    app.component('Select', () => import('./components/Select/Select.vue'));
    app.component('SelectMulti', () => import('./components/SelectMulti/SelectMulti.vue'));
    app.component('Spoiler', () => import('./components/Spoiler/Spoiler.vue'));
    app.component('Tab', () => import('./components/Tab/Tab.vue'));
    app.component('Tooltip', () => import('./components/Tooltip/Tooltip.vue'));
    app.component('Text', () => import('./components/Text/Text.vue'));
    app.component('Menu', () => import('./components/Menu/Menu.vue'));
    app.component('MenuItem', () => import('./components/Menu/MenuItem.vue'));
    app.component('Upload', () => import('./components/Upload/Upload.vue'));
    app.component('UploadImage', () => import('./components/UploadImage/UploadImage.vue'));
    app.component('UploadImageMultiple', () => import('./components/UploadImageMultiple/UploadImageMultiple.vue'));
    app.component('Breadcrumbs', () => import('./components/Breadcrumbs/Breadcrumbs.vue'));
    app.component('Chips', () => import('./components/Chips/Chips.vue'));
    app.component('Countdown', () => import('./components/Countdown/Countdown.vue'));
    app.component('DatePicker', () => import('./components/DatePicker/DatePicker.vue'));
    app.component('EmptyState', () => import('./components/EmptyState/EmptyState.vue'));
    app.component('Feed', () => import('./components/Feed/Feed.vue'));
    app.component('Carousel', () => import('./components/Feed/Carousel.vue'));
    app.component('FieldBig', () => import('./components/FieldBig/FieldBig.vue'));
    app.component('FieldTags', () => import('./components/FieldTags/FieldTags.vue'));
    app.component('Gradient', () => import('./components/Gradient/Gradient.vue'));
    // app.component('Footer',       () => import('./components/Footer/Footer.vue'));
    // app.component('Header',       () => import('./components/Header/Header.vue'));
    app.component('Loader', () => import('./components/Loader/Loader.vue'));
    // app.component('Navigation',   () => import('./components/Navigation/Navigation.vue'));
    // app.component('Search',       () => import('./components/Search/Search.vue'));
    app.component('Shader', () => import('./components/Shader/Shader.vue'));
    app.component('Slider', () => import('./components/Slider/Slider.vue'));
    app.component('Status', () => import('./components/Status/Status.vue'));
    app.component('Marquee', () => import('./components/Marquee/Marquee.vue'));
    app.component('Media', () => import('./components/Media/Media.vue'));
  },
};

export {
  Address,
  Breadcrumbs,
  Button,
  Calendar,
  Checkbox,
  Chips,
  Countdown,
  DatePicker,
  Dropdown,
  EmptyState,
  Error,
  Feed,
  Carousel,
  Field,
  FieldBig,
  FieldPhone,
  FieldTags,
  Gradient,
  // Footer,
  // Header,
  Loader,
  LocationMarker,
  Map,
  Marquee,
  Menu,
  MenuItem,
  Popup,
  Radio,
  Select,
  SelectMulti,
  // Navigation,
  // Search,
  Shader,
  Slider,
  Spoiler,
  Status,
  Tab,
  Text,
  Tooltip,
  Upload,
  UploadImage,
  UploadImageMultiple,
  Media
};
