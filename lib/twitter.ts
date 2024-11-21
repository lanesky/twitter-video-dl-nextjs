import axios from 'axios';

interface VideoVariant {
    bitrate: number;
    url: string;
    content_type: string;
}

interface TweetVideoInfo {
    variants: {
        bitrate?: number;
        url: string;
        content_type: string;
    }[];
}

interface TweetMedia {
    video_info?: TweetVideoInfo;
}

interface TweetLegacy {
    entities: {
        media: TweetMedia[];
    };
}

interface TweetResult {
    result: {
        legacy: TweetLegacy;
    };
}

interface TweetData {
    data: {
        tweetResult: TweetResult;
    };
}

class TwitterAPIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TwitterAPIError';
    }
}

export class TwitterAPIClient {
    private static readonly BASE_URL = 'https://api.x.com/graphql/OoJd6A50cv8GsifjoOHGfg';
    private static readonly ACTIVATE_URL = 'https://api.twitter.com/1.1/guest/activate.json';
    private static readonly MAINJS_URL = 'https://abs.twimg.com/responsive-web/client-web/main.165ee22a.js';

    private bearerToken: string | null = null;
    private guestToken: string | null = null;

    constructor() {
        this.setupHeaders();
    }

    private setupHeaders() {
        axios.defaults.headers.common['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 Firefox/84.0';
        axios.defaults.headers.common['accept'] = '*/*';
        axios.defaults.headers.common['accept-language'] = 'en-US,en;q=0.5';
    }

    private async getBearerToken(): Promise<string> {
        try {
            const response = await axios.get(TwitterAPIClient.MAINJS_URL);
            const bearerTokenMatch = response.data.match(/AAAAAAAAA[^"]+/);
            
            if (!bearerTokenMatch) {
                throw new TwitterAPIError('Could not find bearer token');
            }

            return bearerTokenMatch[0];
        } catch (error) {
            throw new TwitterAPIError(`Failed to get bearer token: ${error}`);
        }
    }

    private async getGuestToken(bearerToken: string): Promise<string> {
        try {
            const response = await axios.post(
                TwitterAPIClient.ACTIVATE_URL,
                {},
                {
                    headers: {
                        'authorization': `Bearer ${bearerToken}`
                    }
                }
            );
            return response.data.guest_token;
        } catch (error) {
            throw new TwitterAPIError(`Failed to get guest token: ${error}`);
        }
    }

    async authenticate(): Promise<void> {
        this.bearerToken = await this.getBearerToken();
        this.guestToken = await this.getGuestToken(this.bearerToken);

        axios.defaults.headers.common['authorization'] = `Bearer ${this.bearerToken}`;
        axios.defaults.headers.common['x-guest-token'] = this.guestToken;
    }

    private extractTweetId(tweetUrl: string): string {
        const match = tweetUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
        if (!match) {
            throw new TwitterAPIError('Invalid tweet URL');
        }
        return match[1];
    }

    private buildTweetDetailUrl(tweetId: string): string {
        const variables = {
            tweetId: tweetId,
            withCommunity: false,
            includePromotedContent: false,
            withVoice: false
        };

        const features = {
            creator_subscriptions_tweet_preview_api_enabled: true,
            communities_web_enable_tweet_community_results_fetch: true,
            c9s_tweet_anatomy_moderator_badge_enabled: true,
            articles_preview_enabled: true,
            responsive_web_edit_tweet_api_enabled: true,
            graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
            view_counts_everywhere_api_enabled: true,
            longform_notetweets_consumption_enabled: true,
            responsive_web_twitter_article_tweet_consumption_enabled: true,
            tweet_awards_web_tipping_enabled: false,
            creator_subscriptions_quote_tweet_preview_enabled: false,
            freedom_of_speech_not_reach_fetch_enabled: true,
            standardized_nudges_misinfo: true,
            tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
            rweb_video_timestamps_enabled: true,
            longform_notetweets_rich_text_read_enabled: true,
            longform_notetweets_inline_media_enabled: true,
            rweb_tipjar_consumption_enabled: true,
            responsive_web_graphql_exclude_directive_enabled: true,
            verified_phone_label_enabled: false,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            responsive_web_graphql_timeline_navigation_enabled: true,
            responsive_web_enhance_cards_enabled: false
        };

        const fieldToggles = {
            withArticleRichContentState: true,
            withArticlePlainText: false,
            withGrokAnalyze: false,
            withDisallowedReplyControls: false
        };

        return `${TwitterAPIClient.BASE_URL}/TweetResultByRestId?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}&fieldToggles=${encodeURIComponent(JSON.stringify(fieldToggles))}`;
    }

    async getTweetDetails(tweetUrl: string): Promise<VideoVariant[]> {
        const tweetId = this.extractTweetId(tweetUrl);
        
        try {
            if (!this.bearerToken || !this.guestToken) {
                await this.authenticate();
            }

            const url = this.buildTweetDetailUrl(tweetId);
            const response = await axios.get(url);

            return this.extractVideoVariants(response.data);
        } catch (error) {
            throw new TwitterAPIError(`Failed to get tweet details: ${error}`);
        }
    }

    private extractVideoVariants(tweetData: TweetData): VideoVariant[] {
        const media = tweetData.data.tweetResult.result.legacy.entities.media[0];
        if (!media || !media.video_info) {
            throw new TwitterAPIError('No video found in tweet');
        }

        return media.video_info.variants
            .filter((variant) => variant.content_type === 'video/mp4')
            .map((variant) => ({
                bitrate: variant.bitrate || 0,
                url: variant.url,
                content_type: variant.content_type
            }));
    }

    getBestVideoVariant(variants: VideoVariant[]): VideoVariant {
        return variants.reduce((best, current) => 
            current.bitrate > best.bitrate ? current : best
        );
    }
}
