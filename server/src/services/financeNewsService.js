import { XMLParser } from "fast-xml-parser";

const GOOGLE_FINANCE_RSS = "https://news.google.com/rss/search?q=finance+india+when:7d&hl=en-IN&gl=IN&ceid=IN:en";

export async function fetchFinanceNews() {
  try {
    const response = await fetch(GOOGLE_FINANCE_RSS, {
      headers: {
        "User-Agent": "AI Smart Wallet/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Finance news request failed with ${response.status}`);
    }

    const xml = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false
    });
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item || [];
    const newsItems = Array.isArray(items) ? items : [items];

    return newsItems.slice(0, 6).map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: item.source?.["#text"] || item.source || "Google News"
    }));
  } catch (error) {
    console.error("Finance news fallback triggered:", error.message);
    return [
      {
        title: "Live finance news is unavailable right now.",
        link: "",
        pubDate: new Date().toUTCString(),
        source: "AI Smart Wallet"
      }
    ];
  }
}
