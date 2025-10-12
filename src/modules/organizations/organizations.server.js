import coreabac from '@martyrs/src/modules/core/controllers/classes/abac/abac.js';

import DepartmentsController from './controllers/departments.controller.js';

import DepartmentModel from './models/department.model.js';
import InviteModel from './models/invite.model.js';
import MembershipModel from './models/membership.model.js';
import OrganizationModel from './models/organization.model.js';

import departmentsRoutes from './routes/departments.routes.js';
import invitesRoutes from './routes/invites.routes.js';
import membershipsRoutes from './routes/memberships.routes.js';
import organizationsRoutes from './routes/organizations.routes.js';

import InvitesController from './controllers/invites.controller.js';
import MembershipsController from './controllers/memberships.controller.js';
import OrganizationsController from './controllers/organizations.controller.js';

import initOrganizationPolicies from './policies/organizations.policies.js';

const { getInstance } = coreabac;

function initializeOrganization(app, db, origins, publicPath) {
  // Настраиваем модели в объекте базы данных
  db.department = DepartmentModel(db);
  db.organization = OrganizationModel(db);
  db.membership = MembershipModel(db);
  db.invite = InviteModel(db);
  const abac = getInstance(db);
  const organizationPolicies = initOrganizationPolicies(abac, db);
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    departmentsRoutes(app, db, origins, publicPath);
    organizationsRoutes(app, db, origins, publicPath);
    membershipsRoutes(app, db, origins, publicPath);
    invitesRoutes(app, db, origins, publicPath);
  }
}
export const models = {
  DepartmentModel,
  OrganizationModel,
  MembershipModel,
  InviteModel,
};
export const routes = {
  departmentsRoutes,
  organizationsRoutes,
  membershipsRoutes,
  invitesRoutes,
};
export const controllers = {
  DepartmentsController,
  OrganizationsController,
  MembershipsController,
  InvitesController,
};
export { initializeOrganization as initialize };
export default {
  initialize: initializeOrganization,
  models,
  routes,
  controllers,
};
