import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as blog from '@martyrs/src/modules/community/store/blogposts.js';

import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

const { hasAccess } = useGlobalMixins();

async function requiresEditAccess(to, from, next) {
  const postId = to.params.url; // Предполагается, что `url` является идентификатором поста
  const userId = auth.state.user._id; // Получаем текущего пользователя

  try {
    // Получаем данные поста, чтобы проверить его принадлежность к организации или авторство
    const post = (await blog.read({ url: to.params.url }))[0];

    console.log('post is', post);

    if (!post) {
      return next('/404'); // Если пост не найден, перенаправляем на страницу 404
    }

    if (post.owner.type === 'organization') {
      // Если пост принадлежит организации, проверяем права на редактирование через `hasAccess`
      const isAccess = hasAccess(post.owner.target._id, 'posts', 'edit', auth.state.accesses, auth.state.access.roles);

      if (!isAccess) {
        return next('/401'); // Если у пользователя нет прав на редактирование в организации, перенаправляем на 403
      }
    } else {
      // Если пост не принадлежит организации, проверяем авторство
      if (post.creator.target._id !== userId) {
        return next('/401'); // Если пользователь не является автором, перенаправляем на 403
      }
    }

    next(); // Если все проверки прошли, продолжаем
  } catch (error) {
    console.error('Error during post access check:', error);
    return next('/500'); // Если произошла ошибка, перенаправляем на страницу 500
  }
}

function requiresAccess(resource, action) {
  return (to, from, next) => {
    const isAccess = hasAccess(to.params._id, resource, action, auth.state.accesses, auth.state.access.roles);

    if (isAccess) {
      return next();
    } else {
      return next('/401');
    }
  };
}

export { requiresAccess, requiresEditAccess };
