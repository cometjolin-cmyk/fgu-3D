import { DEFAULT_CACHE_TIMESTAMP, DEMO_NEWS_ITEMS } from '../data/newsData.js';
import { NewsFetchResult, NewsItem } from '../types/island';

const NEWS_CACHE_KEY = 'fgu_learning_islands_news_cache_v1';

interface CachedNewsSnapshot {
  lastSuccessSyncAt: string;
  items: NewsItem[];
}

function formatSlashTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}`;
}

export function ensureInitialNewsCache(): void {
  try {
    const existing = localStorage.getItem(NEWS_CACHE_KEY);
    if (!existing) {
      localStorage.setItem(
        NEWS_CACHE_KEY,
        JSON.stringify({
          lastSuccessSyncAt: DEFAULT_CACHE_TIMESTAMP,
          items: DEMO_NEWS_ITEMS,
        })
      );
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function readCachedNewsSnapshot(): CachedNewsSnapshot {
  try {
    const raw = localStorage.getItem(NEWS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CachedNewsSnapshot>;
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        return {
          lastSuccessSyncAt: parsed.lastSuccessSyncAt || DEFAULT_CACHE_TIMESTAMP,
          items: parsed.items,
        };
      }
    }
  } catch {
    // Ignore parse errors
  }
  return {
    lastSuccessSyncAt: DEFAULT_CACHE_TIMESTAMP,
    items: DEMO_NEWS_ITEMS,
  };
}

export async function fetchCollegeNews(options?: {
  simulateFailure?: boolean;
}): Promise<NewsFetchResult> {
  const simulateFailure = Boolean(options?.simulateFailure);
  ensureInitialNewsCache();

  await new Promise((resolve) => setTimeout(resolve, 180));

  try {
    if (simulateFailure) {
      throw new Error('模擬官網資料抓取失敗');
    }

    const syncTimestamp = formatSlashTimestamp();
    const freshItems: NewsItem[] = DEMO_NEWS_ITEMS.map((item) => ({
      ...item,
      siteUpdatedAt: syncTimestamp,
    }));

    try {
      localStorage.setItem(
        NEWS_CACHE_KEY,
        JSON.stringify({ lastSuccessSyncAt: syncTimestamp, items: freshItems })
      );
    } catch {
      // Non-fatal
    }

    return {
      items: freshItems,
      fromCache: false,
      lastSuccessSyncAt: syncTimestamp,
      warningMessage: null,
    };
  } catch {
    const cached = readCachedNewsSnapshot();
    const displayTime = cached.lastSuccessSyncAt || DEFAULT_CACHE_TIMESTAMP;
    return {
      items: cached.items,
      fromCache: true,
      lastSuccessSyncAt: displayTime,
      warningMessage: `官網資料抓取失敗，已自動載入最近一次成功更新之本地快取資料（最近更新時間：${displayTime}）`,
    };
  }
}
