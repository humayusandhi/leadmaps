<?php

declare(strict_types=1);

namespace App\Domain\WebsiteAnalysis\Services;

class ConversionSignalExtractor
{
    /**
     * Common booking widget domains / identifiers.
     */
    private const BOOKING_INDICATORS = [
        'calendly.com',
        'acuityscheduling.com',
        'setmore.com',
        'chilipiper.com',
        'meetings.hubspot.com',
        'tidycal.com',
        'simplybook.me',
        'zoho.com/bookings',
        'youcanbook.me',
        'appointlet.com',
    ];

    /**
     * Common CMS fingerprints (keyword/regex => CMS name).
     */
    private const CMS_FINGERPRINTS = [
        'WordPress' => ['/wp-content\//i', '/wp-includes\//i', '/name=["\']generator["\'] content=["\']WordPress/i'],
        'Shopify' => ['/cdn\.shopify\.com/i', '/myshopify\.com/i', '/Shopify\.theme/i'],
        'Squarespace' => ['/static1\.squarespace\.com/i', '/squarespace\.com/i', '/Squarespace\.Constants/i'],
        'Wix' => ['/static\.parastorage\.com/i', '/wix\.com/i', '/wixsite\.com/i'],
        'Webflow' => ['/assets\.website-files\.com/i', '/data-wf-page/i', '/webflow\.com/i'],
        'Ghost' => ['/ghost-sdk/i', '/name=["\']generator["\'] content=["\']Ghost/i'],
        'Drupal' => ['/drupal\.js/i', '/sites\/default\/files/i'],
        'Joomla' => ['/media\/jui\/js/i', '/name=["\']generator["\'] content=["\']Joomla/i'],
    ];

    /**
     * Extract conversion signals from HTML.
     *
     * @return array{
     *     has_cta: bool,
     *     has_contact_form: bool,
     *     has_tel_links: bool,
     *     has_whatsapp_chat: bool,
     *     has_booking_embed: bool,
     *     cms_detected: ?string,
     *     phone_numbers: array<int, string>,
     *     social_links: array<string, string>
     * }
     */
    public function extract(string $html): array
    {
        $hasCta = $this->detectCta($html);
        $hasContactForm = $this->detectContactForm($html);
        $phoneNumbers = $this->extractTelLinks($html);
        $hasTelLinks = !empty($phoneNumbers);
        $hasWhatsappChat = $this->detectWhatsapp($html);
        $hasBookingEmbed = $this->detectBookingEmbed($html);
        $cmsDetected = $this->detectCms($html);
        $socialLinks = $this->extractSocialLinks($html);

        return [
            'has_cta' => $hasCta,
            'has_contact_form' => $hasContactForm,
            'has_tel_links' => $hasTelLinks,
            'has_whatsapp_chat' => $hasWhatsappChat,
            'has_booking_embed' => $hasBookingEmbed,
            'cms_detected' => $cmsDetected,
            'phone_numbers' => $phoneNumbers,
            'social_links' => $socialLinks,
        ];
    }

    /**
     * Detect Call To Action buttons/links.
     */
    private function detectCta(string $html): bool
    {
        // Check for button tags or elements with CTA classes
        if (preg_match('/<button[^>]*>.*?<\/button>/is', $html)) {
            return true;
        }

        if (preg_match('/<(a|div|span)[^>]+class=["\'][^"\']*(btn|button|cta|call-to-action)[^"\']*["\']/i', $html)) {
            return true;
        }

        // Action keywords in links
        $ctaWords = 'contact|quote|book|schedule|call us|consultation|get started|request|order now';
        if (preg_match('/<a[^>]*>[^<]*(' . $ctaWords . ')[^<]*<\/a>/i', $html)) {
            return true;
        }

        return false;
    }

    /**
     * Detect contact forms and form embeds.
     */
    private function detectContactForm(string $html): bool
    {
        if (preg_match('/<form[^>]*>/i', $html)) {
            // Ensure form contains interactive inputs
            if (preg_match('/<input[^>]+type=["\'](text|email|tel|submit)["\']/i', $html) || preg_match('/<textarea/i', $html)) {
                return true;
            }
        }

        // Embeds from Typeform, HubSpot, Formspree, etc.
        if (preg_match('/(typeform\.com|formspree\.io|hs-form|wpforms|gform_wrapper|wpcf7)/i', $html)) {
            return true;
        }

        return false;
    }

    /**
     * Extract phone numbers from tel: hyperlinks.
     *
     * @return array<int, string>
     */
    private function extractTelLinks(string $html): array
    {
        $numbers = [];
        if (preg_match_all('/href=["\']tel:([^"\']+)["\']/i', $html, $matches)) {
            foreach ($matches[1] as $num) {
                $cleaned = trim(urldecode($num));
                if ($cleaned !== '') {
                    $numbers[] = $cleaned;
                }
            }
        }

        return array_values(array_unique($numbers));
    }

    /**
     * Detect WhatsApp chat widgets or links.
     */
    private function detectWhatsapp(string $html): bool
    {
        return (bool) preg_match('/(wa\.me\/|api\.whatsapp\.com|whatsapp:\/\/)/i', $html);
    }

    /**
     * Detect calendar / appointment booking embeds.
     */
    private function detectBookingEmbed(string $html): bool
    {
        foreach (self::BOOKING_INDICATORS as $indicator) {
            if (stripos($html, $indicator) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Detect CMS via fingerprinting.
     */
    private function detectCms(string $html): ?string
    {
        foreach (self::CMS_FINGERPRINTS as $cmsName => $patterns) {
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $html)) {
                    return $cmsName;
                }
            }
        }

        return null;
    }

    /**
     * Extract social media links.
     *
     * @return array<string, string>
     */
    private function extractSocialLinks(string $html): array
    {
        $socials = [];
        $networks = [
            'facebook' => 'facebook\.com',
            'instagram' => 'instagram\.com',
            'linkedin' => 'linkedin\.com',
            'twitter' => '(twitter\.com|x\.com)',
            'youtube' => 'youtube\.com',
        ];

        foreach ($networks as $name => $pattern) {
            if (preg_match('/href=["\'](https?:\/\/(www\.)?' . $pattern . '\/[^"\']+)["\']/i', $html, $matches)) {
                $socials[$name] = $matches[1];
            }
        }

        return $socials;
    }
}
