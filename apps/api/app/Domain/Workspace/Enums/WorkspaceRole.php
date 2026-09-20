<?php

declare(strict_types=1);

namespace App\Domain\Workspace\Enums;

enum WorkspaceRole: string
{
    case OWNER = 'OWNER';
    case ADMIN = 'ADMIN';
    case MEMBER = 'MEMBER';
    case VIEWER = 'VIEWER';

    /**
     * Determine if this role has management capabilities.
     */
    public function canManageWorkspace(): bool
    {
        return in_array($this, [self::OWNER, self::ADMIN], true);
    }

    /**
     * Determine if this role has write / lead mutation capabilities.
     */
    public function canMutateLeads(): bool
    {
        return in_array($this, [self::OWNER, self::ADMIN, self::MEMBER], true);
    }
}
