<?php

declare(strict_types=1);

namespace App\Http\Requests\V1\Search;

use Illuminate\Foundation\Http\FormRequest;

class ExecuteSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['required', 'string', 'min:2', 'max:100'],
            'location' => ['required', 'string', 'min:2', 'max:200'],
            'radius_km' => ['required', 'integer', 'min:1', 'max:50'],
            'has_website' => ['nullable', 'boolean'],
            'min_rating' => ['nullable', 'numeric', 'min:1', 'max:5'],
            'min_reviews' => ['nullable', 'integer', 'min:0'],
            'sync' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'radius_km.min' => 'Search radius must be at least 1 km.',
            'radius_km.max' => 'Search radius cannot exceed 50 km.',
            'category.required' => 'A business category or keyword is required.',
            'location.required' => 'A target location or city is required.',
        ];
    }
}
