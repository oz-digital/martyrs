const inventoryRoutes = [
  {
    path: '',
    name: 'InventoryList',
    meta: {
      title: {
        en: 'Inventory',
        ru: 'Инвентарь',
      },
      authorize: [],
    },
    component: () => import(/* webpackChunkName: 'inventory-list' */ '../components/pages/Inventory.vue'),
  },
  {
    path: 'audit',
    name: 'InventoryAudit',
    meta: {
      title: {
        en: 'Create Inventory Audit',
        ru: 'Создать Инвентаризацию',
      },
      authorize: [],
    },
    component: () => import(/* webpackChunkName: 'inventory-audit' */ '../components/pages/InventoryEdit.vue'),
  },
];

export default inventoryRoutes;