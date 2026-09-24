<?php

declare(strict_types=1);

namespace Tests\Feature;

if (!class_exists('Illuminate\Foundation\Http\FormRequest')) {
    eval('namespace Illuminate\Foundation\Http { class FormRequest {} }');
}

require_once __DIR__ . '/../../app/Http/Requests/V1/Search/ExecuteSearchRequest.php';

use App\Http\Requests\V1\Search\ExecuteSearchRequest;

class SearchValidationTest
{
    public static function run(): void
    {
        echo "Running SearchValidationTest...\n";

        $request = new ExecuteSearchRequest();
        $rules = $request->rules();

        // 1. Assert radius bounds: min 1, max 50
        assert(in_array('min:1', $rules['radius_km'], true), 'Radius must enforce min 1');
        assert(in_array('max:50', $rules['radius_km'], true), 'Radius must enforce max 50');
        assert(in_array('required', $rules['radius_km'], true), 'Radius must be required');
        echo "  ✓ Radius boundaries strictly enforced between 1 and 50 km.\n";

        // 2. Assert category & location required
        assert(in_array('required', $rules['category'], true), 'Category is required');
        assert(in_array('required', $rules['location'], true), 'Location is required');
        echo "  ✓ Category and Location fields are required.\n";

        echo "SEARCH VALIDATION TESTS PASSED GREEN!\n";
    }
}

SearchValidationTest::run();
