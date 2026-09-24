<?php

declare(strict_types=1);

namespace App\Domain\WebsiteAnalysis\Services;

use DOMDocument;
use DOMXPath;

class SeoSignalExtractor
{
    /**
     * Extract SEO signals from HTML.
     *
     * @return array{
     *     title: ?string,
     *     title_length: int,
     *     has_meta_description: bool,
     *     meta_description: ?string,
     *     has_open_graph: bool,
     *     open_graph_tags: array<string, string>,
     *     has_schema_markup: bool,
     *     schema_types: array<int, string>,
     *     h1_tags: array<int, string>,
     *     heading_counts: array{h1: int, h2: int, h3: int}
     * }
     */
    public function extract(string $html): array
    {
        $dom = $this->createDom($html);
        $xpath = new DOMXPath($dom);

        // 1. Title
        $titleNodes = $xpath->query('//title');
        $title = null;
        if ($titleNodes !== false && $titleNodes->length > 0) {
            $title = trim($titleNodes->item(0)->textContent);
        }

        // 2. Meta description
        $descNodes = $xpath->query('//meta[translate(@name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="description"]/@content');
        $metaDescription = null;
        if ($descNodes !== false && $descNodes->length > 0) {
            $metaDescription = trim($descNodes->item(0)->textContent);
        }
        $hasMetaDescription = !empty($metaDescription);

        // 3. OpenGraph tags
        $ogNodes = $xpath->query('//meta[starts-with(@property, "og:")]');
        $ogTags = [];
        if ($ogNodes !== false) {
            foreach ($ogNodes as $ogNode) {
                /** @var \DOMElement $ogNode */
                $property = $ogNode->getAttribute('property');
                $content = $ogNode->getAttribute('content');
                if ($property !== '') {
                    $ogTags[$property] = $content;
                }
            }
        }
        $hasOpenGraph = !empty($ogTags);

        // 4. Schema markup
        $schemaTypes = [];
        $hasSchema = false;

        // Check JSON-LD
        $scriptNodes = $xpath->query('//script[@type="application/ld+json"]');
        if ($scriptNodes !== false) {
            foreach ($scriptNodes as $script) {
                $hasSchema = true;
                $content = trim($script->textContent);
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    $this->collectSchemaTypes($decoded, $schemaTypes);
                }
            }
        }

        // Check Microdata
        $itemtypes = $xpath->query('//*[@itemtype]/@itemtype');
        if ($itemtypes !== false && $itemtypes->length > 0) {
            $hasSchema = true;
            foreach ($itemtypes as $it) {
                $val = trim($it->textContent);
                $parts = explode('/', $val);
                $schemaTypes[] = end($parts);
            }
        }

        $schemaTypes = array_values(array_unique(array_filter($schemaTypes)));

        // 5. Headings
        $h1Nodes = $xpath->query('//h1');
        $h1Tags = [];
        if ($h1Nodes !== false) {
            foreach ($h1Nodes as $h1) {
                $text = trim(preg_replace('/\s+/', ' ', $h1->textContent) ?? '');
                if ($text !== '') {
                    $h1Tags[] = $text;
                }
            }
        }

        $h2Nodes = $xpath->query('//h2');
        $h3Nodes = $xpath->query('//h3');

        $headingCounts = [
            'h1' => $h1Nodes !== false ? $h1Nodes->length : 0,
            'h2' => $h2Nodes !== false ? $h2Nodes->length : 0,
            'h3' => $h3Nodes !== false ? $h3Nodes->length : 0,
        ];

        return [
            'title' => $title,
            'title_length' => $title !== null ? (function_exists('mb_strlen') ? mb_strlen($title) : strlen($title)) : 0,
            'has_meta_description' => $hasMetaDescription,
            'meta_description' => $metaDescription,
            'has_open_graph' => $hasOpenGraph,
            'open_graph_tags' => $ogTags,
            'has_schema_markup' => $hasSchema,
            'schema_types' => $schemaTypes,
            'h1_tags' => $h1Tags,
            'heading_counts' => $headingCounts,
        ];
    }

    /**
     * Parse HTML into DOMDocument safely suppressing libxml errors.
     */
    private function createDom(string $html): DOMDocument
    {
        $dom = new DOMDocument();
        $prevErrors = libxml_use_internal_errors(true);

        if ($html !== '') {
            // Prepend meta charset to handle UTF-8 properly in DOMDocument
            $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_NONET);
        }

        libxml_clear_errors();
        libxml_use_internal_errors($prevErrors);

        return $dom;
    }

    /**
     * Recursively collect @type from JSON-LD schema objects.
     *
     * @param array<string, mixed> $data
     * @param array<int, string> $types
     */
    private function collectSchemaTypes(array $data, array &$types): void
    {
        if (isset($data['@type'])) {
            if (is_string($data['@type'])) {
                $types[] = $data['@type'];
            } elseif (is_array($data['@type'])) {
                foreach ($data['@type'] as $t) {
                    if (is_string($t)) {
                        $types[] = $t;
                    }
                }
            }
        }

        if (isset($data['@graph']) && is_array($data['@graph'])) {
            foreach ($data['@graph'] as $sub) {
                if (is_array($sub)) {
                    $this->collectSchemaTypes($sub, $types);
                }
            }
        }
    }
}
