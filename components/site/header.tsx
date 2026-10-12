import { getMenu, getSiteConfig, getTrips } from "@/lib/site";
import { formatPrice, whatsappLink } from "@/lib/media";
import { tripMeta } from "./trip-card";
import type { MenuTrip } from "./mega-menu";
import HeaderClient from "./header-client";

export default async function Header() {
  const [config, menu, { trips }] = await Promise.all([getSiteConfig(), getMenu(), getTrips({ limit: 50 })]);
  const nav = config.content.nav;
  const currency = config.content.tripCard?.currency || "$";
  // Photo, meta line and price for the Discover panel's trip cards.
  const menuTrips: Record<string, MenuTrip> = Object.fromEntries(
    trips.map((t) => [t.slug, { image: t.images[0], meta: tripMeta(t), price: formatPrice(t.price, currency) }]),
  );
  return (
    <HeaderClient
      name={config.name}
      logo={config.logo}
      showName={config.showName}
      items={menu}
      trips={menuTrips}
      whatsapp={whatsappLink(config.whatsAppNumber)}
      labels={{
        bookNow: nav?.bookNow || "Customize your trip",
        more: nav?.more || "More",
        menu: nav?.menu || "Menu",
        openMenu: nav?.openMenu || "Open menu",
        search: {
          placeholder: config.content.hero?.searchPlaceholder || "Search trips and stories",
          button: config.content.hero?.exploreButton || "Search",
          trips: config.content.pageHeaders?.explore?.title || "Trips",
          blogs: config.content.pageHeaders?.blog?.title || config.content.sections?.blog?.title || "Journal",
          empty: "No matches",
          currency: config.content.tripCard?.currency || "$",
        },
      }}
    />
  );
}
