<?php

namespace Tests\Helpers;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

trait WithPermissions
{
    /**
     * Set up permissions and roles for testing
     * Called in test setUp methods
     */
    protected function setUpPermissions(): void
    {
        // Create admin role if it doesn't exist
        $adminRole = Role::where('name', 'admin')->first() ?? Role::create(['name' => 'admin']);
        
        // Create common permissions
        $permissions = [
            'manage products',
            'edit products',
            'delete products',
            'create products',
            'view products',
            'manage categories',
            'manage brands',
            'manage orders'
        ];
        
        foreach ($permissions as $permissionName) {
            $this->createPermission($permissionName);
        }
        
        // Assign all permissions to admin role
        $adminRole->syncPermissions($permissions);
    }

    /**
     * Create a new role with the given permissions.
     *
     * @param string $roleName
     * @param array $permissions
     * @return \Spatie\Permission\Models\Role
     */
    protected function createRole(string $roleName, array $permissions = []): Role
    {
        $role = Role::create(['name' => $roleName]);
        
        if (!empty($permissions)) {
            foreach ($permissions as $permission) {
                $this->createPermission($permission);
            }
            $role->syncPermissions($permissions);
        }
        
        return $role;
    }

    /**
     * Create a new permission if it doesn't exist.
     *
     * @param string $permissionName
     * @return \Spatie\Permission\Models\Permission
     */
    protected function createPermission(string $permissionName): Permission
    {
        $permission = Permission::where('name', $permissionName)->first();
        
        if (!$permission) {
            $permission = Permission::create(['name' => $permissionName]);
        }
        
        return $permission;
    }

    /**
     * Assign a role to a user.
     *
     * @param \App\Models\User $user
     * @param string $roleName
     * @return \App\Models\User
     */
    protected function assignRole(User $user, string $roleName): User
    {
        $role = Role::where('name', $roleName)->first();
        
        if (!$role) {
            $role = $this->createRole($roleName);
        }
        
        $user->assignRole($role);
        
        return $user;
    }

    /**
     * Create an admin user with appropriate permissions.
     *
     * @return \App\Models\User
     */
    protected function createAdminUser(): User
    {
        $user = User::factory()->create();
        $this->assignRole($user, 'admin');
        
        return $user;
    }

    /**
     * Give direct permissions to a user.
     *
     * @param \App\Models\User $user
     * @param array $permissions
     * @return \App\Models\User
     */
    protected function givePermissionsTo(User $user, array $permissions): User
    {
        foreach ($permissions as $permission) {
            $this->createPermission($permission);
        }
        
        $user->syncPermissions($permissions);
        
        return $user;
    }
}