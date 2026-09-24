<?php

declare(strict_types=1);

namespace App\Domain\Usage\Exceptions;

use Exception;

class InsufficientCreditsException extends Exception
{
    public function __construct(
        public readonly int $required,
        public readonly int $available,
        string $message = 'Insufficient credit balance for this operation.'
    ) {
        parent::__construct("{$message} Required: {$required}, Available: {$available}");
    }
}
