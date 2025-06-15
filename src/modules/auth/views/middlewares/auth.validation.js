import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

function resetUser(to, from, next) {
  next();
  auth.state.user.phone = '';
  auth.state.user.email = '';
  auth.state.user.avatar = '';
  auth.state.user.password = '';
  auth.state.user.passwordRepeat = '';
}

async function initUser(to, from, next) {
  await auth.actions.initialize();
  next();
}

// Check state before open
function checkUser(to, from, next) {
  if (auth.state.user.phone === '' && auth.state.user.email === '') {
    next('/auth/signin');
  } else {
    next();
  }
}

function requiresNoAuth(to, from, next) {
  const isLogin = auth.state.access.status;

  console.log(isLogin);
  console.log(auth.state.access);

  console.log('');

  if (isLogin) {
    console.log('havee login');
    return next('/profile/' + auth.state.user._id);
  }

  console.log('not have login');

  next();
}

function requiresAuth(to, from, next) {
  const isLogin = auth.state.access.status;

  if (isLogin !== true) {
    return next('/auth/signin');
  }

  next();
}

async function requiresAdmin(to, from, next) {
  const isAdmin = auth.state.access.roles?.includes('ROLE_ADMIN') ? auth.state.access.roles.includes('ROLE_ADMIN') : false;

  if (isAdmin !== true) {
    return next('/401');
  }

  next();
}

export { checkUser, initUser, requiresAdmin, requiresAuth, requiresNoAuth, resetUser };
