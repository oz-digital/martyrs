import addRoutes from '@martyrs/src/modules/globals/views/router/addRoutes.js';
import routerInventory from './router/inventory.router.js';

// Views
import Inventory from './components/pages/Inventory.vue';
import InventoryEdit from './components/pages/InventoryEdit.vue';

// Forms
import AdjustmentForm from './components/forms/AdjustmentForm.vue';
import HistoryView from './components/forms/HistoryView.vue';
import ColumnSettingsMenu from './components/forms/ColumnSettingsMenu.vue';
import StockAlertsForm from './components/forms/StockAlertsForm.vue';

// Экспорт компонентов
export {
  Inventory,
  InventoryEdit,
  AdjustmentForm,
  HistoryView,
  ColumnSettingsMenu,
  StockAlertsForm
};

// Функция инициализации для модуля inventory
function initializeInventory(app, store, router, options = {}) {
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';

  // Backoffice routes
  if (!options.withBackoffice) {
    addRoutes(router, {
      parentName: routeBackoffice,
      basePath: 'inventory',
      routes: routerInventory,
      routeNamePrefix: 'Backoffice',
      filterConfig: {
        include: ['InventoryList', 'InventoryAudit'], // Все роуты для бэкофиса
      },
      meta: {
        context: 'backoffice',
      },
    });
  }

  // Organization routes
  if (!options.withOrganizationRoutes) {
    addRoutes(router, {
      parentName: routeOrganizations,
      basePath: 'inventory',
      routes: routerInventory,
      routeNamePrefix: 'Organization',
      filterConfig: {
        include: ['InventoryList', 'InventoryAudit'], // Роуты для организации
      },
      meta: {
        context: 'organization',
      },
    });
  }
}

// Экспорт модуля
export default {
  initialize: initializeInventory
};
