// Networks that belong to cloud and hosting companies. People browse from home,
// work, school and phone networks; visits from these networks are almost always
// crawlers, scrapers and other scripts running on rented servers, even when they
// pretend to be a normal browser.
//
// Each number is the network's ASN (autonomous system number), which Cloudflare
// attaches to every request as request.cf.asn on all plans. Only well-known
// cloud and hosting networks are listed; each one appears in at least one public
// list of hosting networks (github.com/brianhama/bad-asn-list,
// github.com/X4BNet/lists_vpn). Home and phone internet providers are never listed.

/** Cloud and hosting networks: visits from these are not counted. */
export const DATA_CENTER_ASNS: ReadonlySet<number> = new Set([
  // Amazon Web Services
  16509, 14618, 8987,
  // Google and Google Cloud
  15169, 396982,
  // Microsoft Azure
  8075,
  // Oracle Cloud
  31898,
  // DigitalOcean
  14061, 62567,
  // Linode (Akamai Connected Cloud)
  63949,
  // Vultr (Choopa)
  20473,
  // OVH
  16276,
  // Hetzner
  24940,
  // Contabo
  51167,
  // Scaleway
  12876,
  // Alibaba Cloud
  45102, 37963,
  // Tencent Cloud
  132203, 45090,
  // Huawei Cloud
  136907, 55990,
  // M247
  9009,
  // ColoCrossing
  36352,
  // Packet (Equinix Metal)
  54825,
  // QuadraNet
  8100,
  // Servers.com
  7979,
  // CDN77 and Datacamp
  60068, 212238,
  // MultaCom
  35916,
  // iWeb
  32613,
  // Tzulo
  11878,
]);

/**
 * Networks that carry real people's private browsing: iCloud Private Relay
 * (Cloudflare, Akamai and Fastly) and Cloudflare's WARP app. These are always
 * counted, even if their names sound like hosting companies.
 */
export const PRIVATE_RELAY_ASNS: ReadonlySet<number> = new Set([
  13335, // Cloudflare (iCloud Private Relay, WARP)
  36183, // Akamai (iCloud Private Relay)
  20940, // Akamai International
  54113, // Fastly (iCloud Private Relay)
]);

/** Words in a network's name that mean it rents out servers. */
const HOSTING_NAME =
  /\b(hosting|hoster|datacenters?|data cent(er|re)s?|colocation|vps|servers?|cloud)\b/i;

/**
 * True when the visit comes from a cloud or hosting network, by its number or,
 * for smaller hosts that aren't listed, by words in the network's name.
 */
export function isDataCenter(
  asn: number | undefined,
  organization: string,
): boolean {
  if (asn !== undefined && PRIVATE_RELAY_ASNS.has(asn)) return false;
  if (asn !== undefined && DATA_CENTER_ASNS.has(asn)) return true;
  return HOSTING_NAME.test(organization);
}
