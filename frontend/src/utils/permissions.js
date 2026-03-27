// src/utils/permissions.js

// Role definitions with hierarchical structure
export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  HR: 'hr',
  CRS: 'csr',
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer',
  CONTRACTOR: 'contractor',
  PROCUREMENT: 'procurement',
  FINANCE: 'finance'
};

// Menu categories with their items and permissions
// Admin, CRS, HR dashboards will show this structure
export const MENU_CONFIG = [
  {
    category: 'User Management',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M16 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR],
    items: [
      { name: 'Users', path: '/manage-users', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR] }
    ]
  },
  {
    category: 'Network Operations',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CRS, ROLES.TECHNICIAN],
    items: [
      { name: 'Network Infrastructure', path: '/network', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECHNICIAN] },
      { name: 'Customers', path: '/customers', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CRS, ROLES.TECHNICIAN] },
      { name: 'Installations', path: '/installations', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CRS, ROLES.TECHNICIAN, ROLES.CONTRACTOR] },
      { name: 'Network Reports', path: '/reports', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CRS] },
      { name: 'Planning', path: '/planning', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CRS, ROLES.TECHNICIAN] },
      { name: 'Ticketing', path: '/ticketing', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CRS, ROLES.TECHNICIAN, ROLES.CONTRACTOR] }
    ]
  },
  {
    category: 'Finance',
    icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE],
    items: [
      { name: 'Quotations', path: '/quotations', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE, ROLES.CSR] },
      { name: 'Invoices', path: '/invoices', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE, ROLES.HR, ROLES.CSR] },
      { name: 'Receipts', path: '/receipts', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE, ROLES.HR, ROLES.CSR] },
      { name: 'Finance Dashboard', path: '/finance', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE] }
    ]
  },
  {
    category: 'Procurement',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PROCUREMENT],
    items: [
      { name: 'Inventory', path: '/inventory', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PROCUREMENT] },
      { name: 'Accessories', path: '/accessories', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PROCUREMENT] },
      { name: 'Tools', path: '/tools', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PROCUREMENT] },
      { name: 'Bulk Upload', path: '/bulk-upload', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PROCUREMENT] },
      { name: 'Procurement Review', path: '/procurement', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PROCUREMENT] }
    ]
  },
  {
    category: 'Reports',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.CRS],
    items: [
      { name: 'Operational Reports', path: '/reports/operational', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR] },
      { name: 'Customer Reports', path: '/reports/customer', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CRS] },
      { name: 'Network Reports', path: '/reports/network', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CRS] },
      { name: 'Financial Reports', path: '/reports/financial', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR] }
    ]
  },
  {
    category: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    items: [
      { name: 'Roles', path: '/settings/roles', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
      { name: 'Permissions', path: '/settings/permissions', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] }
    ]
  }
];

// Permission matrix - what each role can view and edit
// Based on user requirements:
// - Super Admin: views all pages but NOT edit (view only)
// - Admin: view all, edit most
// - HR: only edits HR pages, views others
// - CRS: view and edit their assigned areas
// - Technician: view only technical/installation pages
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    canView: ['*'], // Can view everything
    canEdit: [], // CANNOT edit anything - VIEW ONLY
    canDelete: [], // CANNOT delete anything
    canCreate: [] // CANNOT create anything
  },
  [ROLES.ADMIN]: {
    canView: ['*'], // Can view everything
    canEdit: ['users', 'customers', 'network', 'installations', 'planning', 'reports', 'roles', 'permissions', 'invoices', 'quotations'], // Can view invoices and quotations but NOT edit finance items
    canDelete: ['customers', 'network', 'installations', 'planning', 'users'], // Cannot delete finance items
    canCreate: ['users', 'customers', 'network', 'installations', 'planning', 'reports'] // Cannot create finance items
  },
  [ROLES.HR]: {
    canView: ['*'], // Can view everything
    canEdit: ['users'], // Can only edit users (HR pages)
    canDelete: ['users'], // Can only delete users
    canCreate: ['users'] // Can only create users
  },
  [ROLES.CRS]: {
    canView: ['customers', 'installations', 'quotations', 'invoices', 'reports', 'planning'],
    canEdit: ['customers', 'installations', 'quotations'], // Can edit their assigned areas
    canDelete: ['quotations'],
    canCreate: ['customers', 'installations', 'quotations']
  },
  [ROLES.TECHNICIAN]: {
    canView: ['network', 'customers', 'installations', 'inventory', 'planning'], // Only technical/installation pages
    canEdit: ['installations', 'network'],
    canDelete: [],
    canCreate: ['installations']
  },
  [ROLES.CUSTOMER]: {
    canView: ['tickets', 'quotations', 'dashboard'],
    canEdit: ['tickets', 'profile'],
    canDelete: ['tickets'],
    canCreate: ['tickets', 'request-installation']
  },
  [ROLES.CONTRACTOR]: {
    canView: ['installations', 'customers', 'planning'],
    canEdit: ['installations'],
    canDelete: [],
    canCreate: ['installations']
  },
  [ROLES.PROCUREMENT]: {
    canView: ['procurement', 'inventory', 'installations'],
    canEdit: ['procurement', 'inventory', 'installations'],
    canDelete: ['inventory'],
    canCreate: ['inventory']
  },
  [ROLES.FINANCE]: {
    canView: ['finance', 'quotations', 'invoices', 'receipts', 'installations'],
    canEdit: ['finance', 'quotations', 'invoices', 'receipts', 'installations'],
    canDelete: ['quotations', 'invoices', 'receipts'],
    canCreate: ['quotations', 'invoices', 'receipts']
  }
};

// Helper function to check if user has permission
export const hasPermission = (userRole, permissionType, resource) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  const permission = permissions[permissionType];
  if (!permission) return false;
  
  // * means all permissions
  if (permission.includes('*')) return true;
  
  return permission.includes(resource);
};

// Helper function to get menu items for a role
export const getMenuForRole = (role) => {
  return MENU_CONFIG.filter(category => 
    category.roles.includes(role) || category.roles.includes('*')
  ).map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.roles.includes(role) || item.roles.includes('*')
    )
  }));
};

// Map paths to resources for permission checking
export const PATH_TO_RESOURCE = {
  '/manage-users': 'users',
  '/customers': 'customers',
  '/network': 'network',
  '/inventory': 'inventory',
  '/manage-installation-requests': 'installations',
  '/my-installations': 'installations',
  '/planning': 'planning',
  '/quotations': 'quotations',
  '/invoices': 'invoices',
  '/receipts': 'receipts',
  '/reports': 'reports',
  '/reports/operational': 'reports',
  '/reports/customer': 'reports',
  '/reports/network': 'reports',
  '/reports/financial': 'reports',
  '/tickets': 'tickets',
  '/tickets/create': 'tickets',
  '/request-installation': 'installations',
  '/analytics': 'analytics',
  '/dashboard': 'dashboard',
  '/dashboard/customer': 'dashboard',
  '/dashboard/csr': 'dashboard',
  '/dashboard/technician': 'dashboard',
  '/dashboard/contractor': 'dashboard',
  '/settings/roles': 'roles',
  '/settings/permissions': 'permissions',
  '/procurement': 'procurement',
  '/finance': 'finance'
};
