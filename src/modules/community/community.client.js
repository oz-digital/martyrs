// Store
import * as storeBlogposts from './store/blogposts.js';
import * as storeReactions from './store/reactions.js';

// Router
import routerCommunity from './router/blogposts.js';

// Views
// Layouts
import Community from './components/layouts/Community.vue';

// Pages
import Blog from './components/pages/Blog.vue';
import BlogPost from './components/pages/BlogPost.vue';
import CreateBlogPost from './components/pages/CreateBlogPost.vue';

// Blocks
import Activity from './components/blocks/Activity.vue';
import CardBlogpost from './components/blocks/CardBlogpost.vue';
import FooterBlogpost from './components/blocks/FooterBlogpost.vue';

// Sections
import Comments from './components/sections/Comments.vue';
import HotPosts from './components/sections/HotPosts.vue';

// Пример функции инициализации для модуля сообщества
function initializeCommunity(app, store, router, options = {}) {
  const route = options.route || 'Home';

  router.addRoute(route, routerCommunity);

  store.addStore('blogposts', storeBlogposts);
  store.addStore('reactions', storeReactions);
}

const ModuleCommunity = {
  initialize: initializeCommunity,
  views: {
    store: {
      storeBlogposts,
      storeReactions,
    },
    router: {
      routerCommunity,
    },
    components: {
      // Layouts
      Community,
      // Pages
      CreateBlogPost,
      BlogPost,
      Blog,
      // Blocks
      FooterBlogpost,
      Activity,
      CardBlogpost,
      // Sections
      Comments,
      HotPosts,
    },
  },
};

export { Activity, Blog, BlogPost, CardBlogpost, Comments, Community, CreateBlogPost, FooterBlogpost, HotPosts, routerCommunity, storeBlogposts, storeReactions };

export default ModuleCommunity;
