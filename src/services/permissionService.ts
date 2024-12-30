import { useAppStore } from '../stores/useAppStore';
import { logService } from './logService';

type Resource = 'laundry' | 'machine' | 'intervention' | 'task' | 'user' | 'report' | 'setting';
type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';
type Role = 'admin' | 'manager' | 'technician' | 'user';

interface Permission {
  resource: Resource;
  action: Action;
  conditions?: {
    ownerOnly?: boolean;
    zoneRestricted?: boolean;
  };
}

class PermissionService {
  private static instance: PermissionService;
  private permissionMap: Map<Role, Permission[]>;

  private constructor() {
    this.permissionMap = new Map();
    this.initializePermissions();
  }

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  private initializePermissions() {
    // Permissions Admin
    this.permissionMap.set('admin', [
      { resource: 'laundry', action: 'manage' },
      { resource: 'machine', action: 'manage' },
      { resource: 'intervention', action: 'manage' },
      { resource: 'task', action: 'manage' },
      { resource: 'user', action: 'manage' },
      { resource: 'report', action: 'manage' },
      { resource: 'setting', action: 'manage' }
    ]);

    // Permissions Manager
    this.permissionMap.set('manager', [
      { resource: 'laundry', action: 'read' },
      { resource: 'laundry', action: 'update', conditions: { ownerOnly: true } },
      { resource: 'machine', action: 'read' },
      { resource: 'machine', action: 'update', conditions: { ownerOnly: true } },
      { resource: 'intervention', action: 'create' },
      { resource: 'intervention', action: 'read' },
      { resource: 'intervention', action: 'update', conditions: { ownerOnly: true } },
      { resource: 'task', action: 'create' },
      { resource: 'task', action: 'read' },
      { resource: 'task', action: 'update', conditions: { ownerOnly: true } },
      { resource: 'report', action: 'read', conditions: { ownerOnly: true } }
    ]);

    // Permissions Technicien
    this.permissionMap.set('technician', [
      { resource: 'laundry', action: 'read' },
      { resource: 'machine', action: 'read' },
      { resource: 'intervention', action: 'read' },
      { resource: 'intervention', action: 'update', conditions: { zoneRestricted: true } },
      { resource: 'task', action: 'read' },
      { resource: 'task', action: 'update', conditions: { zoneRestricted: true } }
    ]);

    // Permissions Utilisateur standard
    this.permissionMap.set('user', [
      { resource: 'laundry', action: 'read' },
      { resource: 'machine', action: 'read' }
    ]);
  }

  public can(
    action: Action,
    resource: Resource,
    conditions: { userId?: string; resourceOwnerId?: string; userZone?: string; resourceZone?: string } = {}
  ): boolean {
    const currentUser = useAppStore.getState().currentUser;
    if (!currentUser) return false;

    const userRole = currentUser.role as Role;
    const permissions = this.permissionMap.get(userRole);
    if (!permissions) return false;

    const hasPermission = permissions.some(permission => {
      // Vérifier si la permission correspond à l'action et la ressource
      if (
        (permission.resource === resource && permission.action === action) ||
        (permission.resource === resource && permission.action === 'manage')
      ) {
        // Vérifier les conditions si elles existent
        if (permission.conditions) {
          if (permission.conditions.ownerOnly && conditions.resourceOwnerId) {
            return conditions.userId === conditions.resourceOwnerId;
          }
          if (permission.conditions.zoneRestricted && conditions.userZone && conditions.resourceZone) {
            return conditions.userZone === conditions.resourceZone;
          }
        }
        return true;
      }
      return false;
    });

    // Logger la vérification de permission
    logService.debug(
      'security',
      `Permission check: ${userRole} ${action} ${resource}`,
      { hasPermission, conditions }
    );

    return hasPermission;
  }

  public getPermissions(role: Role): Permission[] {
    return this.permissionMap.get(role) || [];
  }

  public hasRole(requiredRole: Role): boolean {
    const currentUser = useAppStore.getState().currentUser;
    if (!currentUser) return false;
    return currentUser.role === requiredRole;
  }

  public isAtLeast(minimumRole: Role): boolean {
    const roleHierarchy: Role[] = ['user', 'technician', 'manager', 'admin'];
    const currentUser = useAppStore.getState().currentUser;
    if (!currentUser) return false;
    
    const currentRoleIndex = roleHierarchy.indexOf(currentUser.role as Role);
    const minimumRoleIndex = roleHierarchy.indexOf(minimumRole);
    
    return currentRoleIndex >= minimumRoleIndex;
  }
}

export const permissionService = PermissionService.getInstance();
