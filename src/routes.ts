import { Router } from 'express';
import { identityRoutes } from './contexts/identity';
import { libraryRoutes } from './contexts/library';
import { auditRoutes } from './contexts/audit';
import { adminCatalogRoutes, catalogRoutes } from './contexts/catalog';
import { adminMarketplaceRoutes, marketplaceRoutes } from './contexts/marketplace';
import { paymentsRoutes } from './contexts/payments';
import { playgroundRoutes } from './contexts/playground';

// Each bounded context owns its URL prefixes (identity: /auth; library: /books, /stats; marketplace: /marketplace).
const routes = Router();

routes.use(identityRoutes);
routes.use(libraryRoutes);
routes.use('/admin/audit-logs', auditRoutes);
routes.use('/catalog', catalogRoutes);
routes.use('/admin/catalog', adminCatalogRoutes);
routes.use('/marketplace', marketplaceRoutes);
routes.use('/admin/marketplace', adminMarketplaceRoutes);
routes.use('/payments', paymentsRoutes);
routes.use('/playground', playgroundRoutes);

export default routes;
