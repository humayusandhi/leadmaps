<?php

declare(strict_types=1);

namespace App\Http\Requests\V1\Lead;

use Illuminate\Foundation\Http\FormRequest;

class SaveLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => ['required', 'string', 'uuid'],
            'assigned_to_user_id' => ['nullable', 'string', 'uuid'],
        ];
    }
}
