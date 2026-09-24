<?php

declare(strict_types=1);

namespace App\Http\Requests\V1\Lead;

use Illuminate\Foundation\Http\FormRequest;

class AssignLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assigned_to_user_id' => ['nullable', 'string', 'uuid'],
        ];
    }
}
