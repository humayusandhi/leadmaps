<?php

declare(strict_types=1);

namespace App\Domain\WebsiteAnalysis\Services;

use App\Domain\WebsiteAnalysis\Exceptions\SecurityViolationException;

class SsrfProtectionService
{
    /**
     * Allowed URI schemes.
     */
    private const ALLOWED_SCHEMES = ['http', 'https'];

    /**
     * Allowed standard ports.
     */
    private const ALLOWED_PORTS = [80, 443, 8080, 8443];

    /**
     * Blocked hostnames or suffix patterns.
     */
    private const BLOCKED_HOST_SUFFIXES = [
        'localhost',
        '.local',
        '.localhost',
        '.internal',
        '.corp',
        '.lan',
        '.home',
        '.test',
        'metadata.google.internal',
        'metadata.goog',
    ];

    /**
     * Blocked IPv4 CIDR blocks.
     */
    private const BLOCKED_IPV4_CIDRS = [
        '0.0.0.0/8',       // "This host on this network"
        '10.0.0.0/8',      // RFC 1918 Private-Use
        '100.64.0.0/10',   // Shared Address Space (Carrier NAT)
        '127.0.0.0/8',     // Loopback
        '169.254.0.0/16',  // Link-Local & Cloud Metadata (169.254.169.254)
        '172.16.0.0/12',   // RFC 1918 Private-Use
        '192.0.0.0/24',    // IETF Protocol Assignments
        '192.0.2.0/24',    // TEST-NET-1
        '192.168.0.0/16',  // RFC 1918 Private-Use
        '198.18.0.0/15',   // Benchmarking
        '198.51.100.0/24', // TEST-NET-2
        '203.0.113.0/24',  // TEST-NET-3
        '224.0.0.0/4',     // Multicast
        '240.0.0.0/4',     // Reserved
        '255.255.255.255/32', // Broadcast
    ];

    /**
     * Validate an arbitrary URL against SSRF attack vectors.
     *
     * @param string $url
     * @return string Normalized URL
     * @throws SecurityViolationException
     */
    public function validateUrl(string $url): string
    {
        $trimmed = trim($url);
        if ($trimmed === '') {
            throw new SecurityViolationException('Website URL cannot be empty.');
        }

        // Add scheme if missing
        if (!preg_match('#^https?://#i', $trimmed)) {
            $trimmed = 'https://' . $trimmed;
        }

        $parsed = parse_url($trimmed);
        if ($parsed === false || !isset($parsed['host'])) {
            throw new SecurityViolationException("Invalid URL structure: {$url}");
        }

        $scheme = strtolower($parsed['scheme'] ?? '');
        if (!in_array($scheme, self::ALLOWED_SCHEMES, true)) {
            throw new SecurityViolationException("Disallowed protocol scheme: {$scheme}. Only HTTP/HTTPS are allowed.");
        }

        $host = strtolower($parsed['host']);

        // Check port
        if (isset($parsed['port'])) {
            if (!in_array($parsed['port'], self::ALLOWED_PORTS, true)) {
                throw new SecurityViolationException("Forbidden port: {$parsed['port']}. Only standard web ports (80, 443, 8080, 8443) are allowed.");
            }
        }

        // Block internal and suspicious hostnames
        if ($this->isBlockedHostname($host)) {
            throw new SecurityViolationException("Forbidden internal hostname: {$host}");
        }

        // Check if host is direct IP address
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            $this->validateIp($host);
        } else {
            // DNS resolution check
            $resolvedIps = $this->resolveHost($host);
            if (empty($resolvedIps)) {
                throw new SecurityViolationException("Failed to resolve hostname to IP: {$host}");
            }

            foreach ($resolvedIps as $ip) {
                $this->validateIp($ip);
            }
        }

        return $trimmed;
    }

    /**
     * Validate an IP address against private, loopback, and metadata ranges.
     *
     * @throws SecurityViolationException
     */
    public function validateIp(string $ip): void
    {
        // Check for IPv4-mapped IPv6 (e.g. ::ffff:192.168.1.1)
        if (str_starts_with(strtolower($ip), '::ffff:')) {
            $extractedIpv4 = substr($ip, 7);
            if (filter_var($extractedIpv4, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                $this->validateIpv4($extractedIpv4);
                return;
            }
        }

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $this->validateIpv4($ip);
            return;
        }

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $this->validateIpv6($ip);
            return;
        }

        throw new SecurityViolationException("Invalid IP address: {$ip}");
    }

    /**
     * Validate IPv4 against RFC ranges.
     */
    private function validateIpv4(string $ip): void
    {
        // PHP built-in filter flags
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            throw new SecurityViolationException("Access to reserved/private IP {$ip} is prohibited.");
        }

        // Deep CIDR match check
        $ipLong = ip2long($ip);
        if ($ipLong === false) {
            throw new SecurityViolationException("Failed to convert IP to long: {$ip}");
        }

        foreach (self::BLOCKED_IPV4_CIDRS as $cidr) {
            if ($this->ipMatchesCidr($ipLong, $cidr)) {
                throw new SecurityViolationException("IP {$ip} belongs to prohibited CIDR block {$cidr}.");
            }
        }
    }

    /**
     * Validate IPv6 against loopback, link-local, and unique-local ranges.
     */
    private function validateIpv6(string $ip): void
    {
        $normalized = strtolower(inet_ntop((string) inet_pton($ip)));

        // Unspecified :: or loopback ::1
        if ($normalized === '::' || $normalized === '::1') {
            throw new SecurityViolationException("Access to IPv6 loopback/unspecified {$ip} is prohibited.");
        }

        // fc00::/7 (Unique local) or fe80::/10 (Link local) or ff00::/8 (Multicast)
        $packed = inet_pton($ip);
        if ($packed === false) {
            throw new SecurityViolationException("Invalid IPv6 structure: {$ip}");
        }

        $firstByte = ord($packed[0]);
        // fc00::/7 -> 0xfc or 0xfd
        if (($firstByte & 0xfe) === 0xfc) {
            throw new SecurityViolationException("Access to IPv6 unique local address {$ip} is prohibited.");
        }
        // fe80::/10 -> 0xfe and top 2 bits of second byte are 10 (0x80)
        if ($firstByte === 0xfe && (ord($packed[1]) & 0xc0) === 0x80) {
            throw new SecurityViolationException("Access to IPv6 link-local address {$ip} is prohibited.");
        }
        // ff00::/8 -> multicast
        if ($firstByte === 0xff) {
            throw new SecurityViolationException("Access to IPv6 multicast address {$ip} is prohibited.");
        }
    }

    /**
     * Check if IP (as long) matches CIDR notation.
     */
    private function ipMatchesCidr(int $ipLong, string $cidr): bool
    {
        [$subnet, $mask] = explode('/', $cidr);
        $subnetLong = ip2long($subnet);
        $maskBits = (int) $mask;

        if ($maskBits === 0) {
            return true;
        }

        $netmask = ~((1 << (32 - $maskBits)) - 1);

        return ($ipLong & $netmask) === ($subnetLong & $netmask);
    }

    /**
     * Check if hostname matches any blacklisted prefix, suffix, or internal indicator.
     */
    private function isBlockedHostname(string $host): bool
    {
        $lowerHost = strtolower($host);

        if ($lowerHost === 'localhost') {
            return true;
        }

        foreach (self::BLOCKED_HOST_SUFFIXES as $suffix) {
            if (str_ends_with($lowerHost, $suffix)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Resolve host to all available IPv4 and IPv6 addresses.
     *
     * @return array<int, string>
     */
    public function resolveHost(string $host): array
    {
        $ips = [];

        // Try dns_get_record first
        if (function_exists('dns_get_record')) {
            $records = @dns_get_record($host, DNS_A | DNS_AAAA);
            if (is_array($records)) {
                foreach ($records as $record) {
                    if (isset($record['ip'])) {
                        $ips[] = $record['ip'];
                    } elseif (isset($record['ipv6'])) {
                        $ips[] = $record['ipv6'];
                    }
                }
            }
        }

        // Fallback to gethostbynamel for IPv4
        if (empty($ips)) {
            $ipv4List = @gethostbynamel($host);
            if (is_array($ipv4List)) {
                $ips = array_merge($ips, $ipv4List);
            }
        }

        return array_unique($ips);
    }
}
