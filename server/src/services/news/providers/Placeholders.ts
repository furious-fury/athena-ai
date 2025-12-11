import { BaseNewsProvider, type NewsItem } from "./BaseProvider.js";

export class TwitterProvider extends BaseNewsProvider {
    name = "TwitterProvider";
    async fetchNews(limit?: number): Promise<NewsItem[]> { return []; }
}

export class RedditProvider extends BaseNewsProvider {
    name = "RedditProvider";
    async fetchNews(limit?: number): Promise<NewsItem[]> { return []; }
}

export class GoogleTrendsProvider extends BaseNewsProvider {
    name = "GoogleTrendsProvider";
    async fetchNews(limit?: number): Promise<NewsItem[]> { return []; }
}

export class SECFilingProvider extends BaseNewsProvider {
    name = "SECFilingProvider";
    async fetchNews(limit?: number): Promise<NewsItem[]> { return []; }
}

export class GovDataProvider extends BaseNewsProvider {
    name = "GovDataProvider";
    async fetchNews(limit?: number): Promise<NewsItem[]> { return []; }
}
