<?php

declare(strict_types=1);

namespace App\Domain\Export\Services;

use App\Domain\Lead\Models\Lead;

class CsvExportService
{
    /**
     * Map of available column keys to human-readable RFC 4180 headers.
     */
    public const AVAILABLE_COLUMNS = [
        'id' => 'Lead ID',
        'business_name' => 'Business Name',
        'phone' => 'Phone Number',
        'email' => 'Email Address',
        'website' => 'Website URL',
        'address' => 'Full Address',
        'city' => 'City',
        'rating' => 'Rating',
        'reviews_count' => 'Review Count',
        'lead_score' => 'Lead Score (0-100)',
        'status' => 'Pipeline Status',
        'opportunities_count' => 'Opportunities Count',
        'top_opportunity' => 'Primary Sales Opportunity',
        'technical_deficit' => 'Key Technical Deficit',
        'cms' => 'CMS Detected',
        'has_ssl' => 'SSL Active',
        'mobile_responsive' => 'Mobile Responsive',
        'has_booking' => 'Online Booking',
        'has_whatsapp' => 'WhatsApp Chat',
    ];

    /**
     * Generate an RFC 4180 compliant CSV string from an array/collection of leads.
     *
     * @param iterable<Lead> $leads
     * @param array<string>|null $selectedColumns
     * @return string
     */
    public function generateCsv(iterable $leads, ?array $selectedColumns = null): string
    {
        $columns = $selectedColumns && count($selectedColumns) > 0 
            ? array_intersect($selectedColumns, array_keys(self::AVAILABLE_COLUMNS))
            : array_keys(self::AVAILABLE_COLUMNS);

        if (empty($columns)) {
            $columns = array_keys(self::AVAILABLE_COLUMNS);
        }

        $stream = fopen('php://temp', 'r+');
        if (! $stream) {
            throw new \RuntimeException('Failed to open temporary stream for CSV generation.');
        }

        // Write UTF-8 BOM for seamless Microsoft Excel rendering
        fwrite($stream, "\xEF\xBB\xBF");

        // Write Header Row
        $headerRow = array_map(fn ($col) => self::AVAILABLE_COLUMNS[$col] ?? $col, $columns);
        fputcsv($stream, $headerRow, ',', '"', "\\");

        // Write Data Rows
        foreach ($leads as $lead) {
            $row = $this->formatLeadRow($lead, $columns);
            fputcsv($stream, $row, ',', '"', "\\");
        }

        rewind($stream);
        $csvContent = stream_get_contents($stream);
        fclose($stream);

        return $csvContent !== false ? $csvContent : '';
    }

    /**
     * Extract specific column values for a lead.
     *
     * @param Lead $lead
     * @param array<string> $columns
     * @return array<int, string>
     */
    public function formatLeadRow(object $lead, array $columns): array
    {
        $business = $lead->business;
        $analysis = $lead->websiteAnalysis;
        $rawOpps = $lead->aiOpportunities ?? [];
        $opportunities = is_iterable($rawOpps) ? (is_array($rawOpps) ? $rawOpps : iterator_to_array($rawOpps)) : [];
        $topOpp = count($opportunities) > 0 ? reset($opportunities) : null;

        $rowData = [];
        foreach ($columns as $col) {
            $val = match ($col) {
                'id' => (string) $lead->id,
                'business_name' => $business?->name ?? 'N/A',
                'phone' => $business?->phone_number ?? 'N/A',
                'email' => $business?->email ?? 'N/A',
                'website' => $business?->website_url ?? 'N/A',
                'address' => (isset($business->formatted_address) ? (string) $business->formatted_address : null)
                    ?? (isset($business->address) ? (string) $business->address : 'N/A'),
                'city' => $business?->city ?? 'N/A',
                'rating' => isset($business->rating) && $business->rating !== null ? (string) $business->rating : 'N/A',
                'reviews_count' => (isset($business->review_count) && $business->review_count !== null ? (string) $business->review_count : null)
                    ?? (isset($business->reviews_count) && $business->reviews_count !== null ? (string) $business->reviews_count : '0'),
                'lead_score' => $lead->lead_score !== null ? (string) $lead->lead_score : '0',
                'status' => $lead->status instanceof \BackedEnum ? $lead->status->value : (string) ($lead->status ?? 'NEW'),
                'opportunities_count' => (string) count($opportunities),
                'top_opportunity' => $topOpp ? ($topOpp->title ?? $topOpp->opportunity ?? 'N/A') : 'N/A',
                'technical_deficit' => $topOpp?->evidence ?? ($analysis && ! empty($analysis->load_time_ms) ? "Slow load: {$analysis->load_time_ms}ms" : 'None noted'),
                'cms' => $analysis?->cms_detected ?? 'Custom / Unknown',
                'has_ssl' => (! empty($analysis?->is_ssl_active) || ! empty($analysis?->https_enabled)) ? 'YES' : 'NO',
                'mobile_responsive' => (! empty($analysis?->is_mobile_responsive) || ! empty($analysis?->mobile_friendly)) ? 'YES' : 'NO',
                'has_booking' => (! empty($analysis?->booking_detected) || ! empty($analysis?->has_booking_embed)) ? 'YES' : 'NO',
                'has_whatsapp' => (! empty($analysis?->whatsapp_detected) || ! empty($analysis?->has_whatsapp_chat)) ? 'YES' : 'NO',
                default => '',
            };
            $rowData[] = $this->sanitizeCell($val);
        }

        return $rowData;
    }

    /**
     * Prevent CSV Formula Injection (CWE-1236).
     * Prefix single quote if string begins with =, +, -, @, \t, or \r.
     */
    private function sanitizeCell(string $value): string
    {
        if ($value !== '' && in_array($value[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
            return "'" . $value;
        }

        return $value;
    }
}
