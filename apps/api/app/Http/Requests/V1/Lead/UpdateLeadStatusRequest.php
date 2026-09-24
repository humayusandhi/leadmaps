<?php

declare(strict_types=1);

namespace App\Http\Requests\V1\Lead;

use App\Domain\Lead\Enums\LeadStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateLeadStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(LeadStatusEnum::class)],
        ];
    }
}
