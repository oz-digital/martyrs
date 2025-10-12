export default async function scrollBehavior(to, from, savedPosition) {
  if (to.hash) {
    const findEl = async (hash, x) => {
      return (
        document.querySelector(hash) ||
        new Promise((resolve, reject) => {
          if (x > 50) {
            return resolve();
          }
          setTimeout(() => {
            resolve(findEl(hash, ++x || 1));
          }, 1000);
        })
      );
    };

    if (to.hash) {
      let el = await findEl(to.hash);
      let screen = await findEl('#scrollview');

      if ('scrollBehavior' in document.documentElement.style) {
        return screen.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
      } else {
        return screen.scrollTo(0, el.offsetTop);
      }
    }
  } else if (to.matched.some(m => m.meta.scrollTo)) {
    return { top: m.meta.scrollTo.top, left: m.meta.scrollTo.left };
  } else if (savedPosition) {
    return { savedPosition };
  } else {
    return { top: 0 };
  }
}
