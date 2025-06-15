const membersRoutes = [
  {
    path: 'members',
    name: 'Organization Members',
    meta: {
      title: {
        en: 'Members',
        ru: 'Участники',
      },
    },
    component: () => import('@martyrs/src/modules/organizations/components/pages/Members.vue'),
  },
  {
    path: 'members/invite',
    name: 'Invite Member',
    component: () => import('@martyrs/src/modules/organizations/components/sections/MembersAdd.vue'),
  },
];

export default membersRoutes;
