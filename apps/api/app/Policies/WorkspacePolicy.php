<?php

declare(strict_types=1);

namespace App\Policies;

use App\Domain\Auth\Models\User;
use App\Domain\Workspace\Enums\WorkspaceRole;
use App\Domain\Workspace\Models\Workspace;

class WorkspacePolicy
{
    /**
     * Determine whether the user can view the workspace.
     */
    public function view(User $user, Workspace $workspace): bool
    {
        return $user->workspaces()->where('workspaces.id', $workspace->id)->exists();
    }

    /**
     * Determine whether the user can update workspace settings.
     */
    public function update(User $user, Workspace $workspace): bool
    {
        return $this->hasRole($user, $workspace, [WorkspaceRole::OWNER, WorkspaceRole::ADMIN]);
    }

    /**
     * Determine whether the user can delete the workspace.
     */
    public function delete(User $user, Workspace $workspace): bool
    {
        return $this->hasRole($user, $workspace, [WorkspaceRole::OWNER]);
    }

    /**
     * Determine whether the user can manage workspace team members.
     */
    public function manageMembers(User $user, Workspace $workspace): bool
    {
        return $this->hasRole($user, $workspace, [WorkspaceRole::OWNER, WorkspaceRole::ADMIN]);
    }

    /**
     * Determine whether the user can purchase credits or manage billing.
     */
    public function manageBilling(User $user, Workspace $workspace): bool
    {
        return $this->hasRole($user, $workspace, [WorkspaceRole::OWNER, WorkspaceRole::ADMIN]);
    }

    /**
     * Determine whether the user can execute searches and consume credits.
     */
    public function executeSearch(User $user, Workspace $workspace): bool
    {
        return $this->hasRole($user, $workspace, [
            WorkspaceRole::OWNER,
            WorkspaceRole::ADMIN,
            WorkspaceRole::MEMBER,
        ]);
    }

    /**
     * Determine whether the user can save, edit, or delete leads.
     */
    public function mutateLeads(User $user, Workspace $workspace): bool
    {
        return $this->hasRole($user, $workspace, [
            WorkspaceRole::OWNER,
            WorkspaceRole::ADMIN,
            WorkspaceRole::MEMBER,
        ]);
    }

    /**
     * Helper to assert user has one of the allowed roles within the target workspace.
     *
     * @param array<WorkspaceRole> $allowedRoles
     */
    private function hasRole(User $user, Workspace $workspace, array $allowedRoles): bool
    {
        $membership = $user->workspaceMemberships()
            ->where('workspace_id', $workspace->id)
            ->first();

        if (! $membership) {
            return false;
        }

        return in_array($membership->role, $allowedRoles, true);
    }
}
