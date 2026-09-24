<?php

declare(strict_types=1);

namespace Tests\Unit;

require_once __DIR__ . '/../../app/Domain/WebsiteAnalysis/DTOs/SafeFetchResult.php';
require_once __DIR__ . '/../../app/Domain/WebsiteAnalysis/Services/TechnicalSignalExtractor.php';
require_once __DIR__ . '/../../app/Domain/WebsiteAnalysis/Services/SeoSignalExtractor.php';
require_once __DIR__ . '/../../app/Domain/WebsiteAnalysis/Services/ConversionSignalExtractor.php';

use App\Domain\WebsiteAnalysis\DTOs\SafeFetchResult;
use App\Domain\WebsiteAnalysis\Services\ConversionSignalExtractor;
use App\Domain\WebsiteAnalysis\Services\SeoSignalExtractor;
use App\Domain\WebsiteAnalysis\Services\TechnicalSignalExtractor;

class SignalExtractorsTest
{
    public static function run(): void
    {
        echo "Running SignalExtractorsTest...\n";

        $mockHtml = <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apex Commercial Roofing Denver</title>
    <meta name="description" content="Premier commercial and industrial roofing contractors in Denver, Colorado.">
    <meta property="og:title" content="Apex Commercial Roofing Denver">
    <meta property="og:description" content="Reliable roof replacement and restoration.">
    <meta property="og:image" content="https://www.apexroofingdenver.com/og-banner.jpg">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "RoofingContractor",
        "name": "Apex Commercial Roofing",
        "telephone": "+1-303-555-0142"
    }
    </script>
    <link rel="stylesheet" href="https://www.apexroofingdenver.com/wp-content/themes/apex/style.css">
</head>
<body>
    <header>
        <a href="tel:+13035550142" class="phone-link">Call (303) 555-0142</a>
        <a href="https://wa.me/13035550142" class="wa-chat">WhatsApp Instant Quote</a>
    </header>

    <main>
        <h1>Apex Roofing Solutions Denver</h1>
        <h2>Industrial Single-Ply Membrane Systems</h2>
        <a href="#contact" class="btn btn-primary cta-button">Request a Free Roof Inspection</a>

        <div class="calendar-booking">
            <iframe src="https://calendly.com/apex-roofing/roof-audit"></iframe>
        </div>

        <form action="/contact-submit" method="POST" id="lead-form">
            <input type="text" name="company_name" placeholder="Company Name" required>
            <input type="email" name="email" placeholder="Business Email" required>
            <input type="tel" name="phone" placeholder="Direct Phone">
            <textarea name="details"></textarea>
            <input type="submit" value="Submit Bid Request">
        </form>
    </main>
</body>
</html>
HTML;

        // 1. Test Technical Signal Extractor
        $safeFetchResult = new SafeFetchResult(
            originalUrl: 'https://www.apexroofingdenver.com',
            finalUrl: 'https://www.apexroofingdenver.com/',
            httpStatus: 200,
            loadTimeMs: 430,
            isSslActive: true,
            html: $mockHtml,
            headers: [
                'strict-transport-security' => ['max-age=31536000; includeSubDomains'],
                'x-content-type-options' => ['nosniff'],
                'x-frame-options' => ['SAMEORIGIN'],
            ]
        );

        $technicalExtractor = new TechnicalSignalExtractor();
        $techSignals = $technicalExtractor->extract($safeFetchResult);

        assert($techSignals['http_status'] === 200, 'HTTP status must be 200');
        assert($techSignals['load_time_ms'] === 430, 'Load time must match 430ms');
        assert($techSignals['is_ssl_active'] === true, 'SSL must be active');
        assert($techSignals['is_mobile_responsive'] === true, 'Mobile viewport must be detected');
        assert($techSignals['security_headers']['hsts'] === true, 'HSTS header must be detected');
        assert($techSignals['security_headers']['x_content_type_options'] === true, 'X-Content-Type-Options must be detected');

        // 2. Test SEO Signal Extractor
        $seoExtractor = new SeoSignalExtractor();
        $seoSignals = $seoExtractor->extract($mockHtml);

        assert($seoSignals['title'] === 'Apex Commercial Roofing Denver', 'Title must match');
        assert($seoSignals['has_meta_description'] === true, 'Meta description presence must be true');
        assert(str_contains($seoSignals['meta_description'], 'Premier commercial and industrial'), 'Meta description content must match');
        assert($seoSignals['has_open_graph'] === true, 'OpenGraph must be true');
        assert($seoSignals['has_schema_markup'] === true, 'Schema markup must be true');
        assert(in_array('RoofingContractor', $seoSignals['schema_types'], true), 'Schema type RoofingContractor must be found');
        assert(count($seoSignals['h1_tags']) === 1, 'Exactly one H1 tag must be extracted');
        assert($seoSignals['h1_tags'][0] === 'Apex Roofing Solutions Denver', 'H1 text must match');
        assert($seoSignals['heading_counts']['h1'] === 1, 'H1 count must be 1');
        assert($seoSignals['heading_counts']['h2'] === 1, 'H2 count must be 1');

        // 3. Test Conversion Signal Extractor
        $conversionExtractor = new ConversionSignalExtractor();
        $convSignals = $conversionExtractor->extract($mockHtml);

        assert($convSignals['has_cta'] === true, 'CTA button must be detected');
        assert($convSignals['has_contact_form'] === true, 'Contact form must be detected');
        assert($convSignals['has_tel_links'] === true, 'tel: link must be detected');
        assert(in_array('+13035550142', $convSignals['phone_numbers'], true), 'Phone number +13035550142 must be extracted');
        assert($convSignals['has_whatsapp_chat'] === true, 'WhatsApp click-to-chat must be detected');
        assert($convSignals['has_booking_embed'] === true, 'Calendly embed must be detected');
        assert($convSignals['cms_detected'] === 'WordPress', 'WordPress CMS must be fingerprinted via wp-content');

        echo "SignalExtractorsTest passed successfully! (100% assertions satisfied)\n";
    }
}

if (php_sapi_name() === 'cli' && realpath($argv[0]) === realpath(__FILE__)) {
    SignalExtractorsTest::run();
}
