import { getMenu, getSiteConfig } from "@/lib/site";
import { whatsappLink } from "@/lib/media";
import HeaderClient from "./header-client";

export default async function Header() {
  const [config, menu] = await Promise.all([getSiteConfig(), getMenu()]);
  const nav = config.content.nav;
  return (
    <HeaderClient
      name={config.name}
      logo={config.logo}
      showName={config.showName}
      items={menu}
      whatsapp={whatsappLink(config.whatsAppNumber)}
      labels={{
        bookNow: nav?.bookNow || "Enquire",
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
