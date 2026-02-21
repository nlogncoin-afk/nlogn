import { authorize } from './role.middleware.js';

export const adminOnly = authorize('admin');
