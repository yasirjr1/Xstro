import { Innertube, UniversalCache } from "youtubei.js";
import type { DownloadOptions } from "youtubei.js/dist/src/types/index.js";
import * as prop from "youtubei.js";
import { Boom } from "@hapi/boom";
import { streamToBuffer } from "#core";

const Client = async () => {
    return await Innertube.create({
        lang: "en",
        location: "US",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        enable_safety_mode: true,
        generate_session_locally: true,
        enable_session_cache: true,
        device_category: "desktop",
        timezone: "America/New_York",
        cache: new UniversalCache(true, "./cache"),
        cookie: "SIDCC=AKEyXzWQdmugeZJG5nTXIERpG6ksiRA8clndF_qpe-GH3920TpBUjDwkliXjARImx3sfUlqfijI; expires=Mon, 02-Mar-2026 06:29:15 GMT; path=/; domain=.youtube.com; priority=high",
    });
};

export const YTSearch = async (query: string) => {
    const innertube = await Client();
    innertube.session.on("auth", ({ credentials }) => {
        console.log("Sign in successful:", credentials);
    });
    try {
        const results = (await innertube.search(query, { type: "video" })).videos;
        return results
            .filter((video): video is prop.YTNodes.Video => "description" in video && !!video.title && !!video.description)
            .map((video) => ({
                title: video.title.text,
                url: `https://www.youtube.com/watch?v=${video.id}`,
            }));
    } catch (error) {
        throw new Boom(error.message as Error);
    }
};

export const YTDL = async (url: string, options?: DownloadOptions) => {
    if (!isYTUrl(url)) {
        throw new Error("Invalid URL");
    }
    const innertube = await Client();
    innertube.session.on("auth", ({ credentials }) => {
        console.log("Sign in successful:", credentials);
    });
    try {
        const stream = await innertube.download(extractYouTubeId(url)!, options);
        return await streamToBuffer(stream!);
    } catch (error) {
        throw new Boom(error.message as Error);
    }
};

export const searchYTDL = async (query: string, options?: DownloadOptions) => {
    if (!query) {
        throw new Error("No query provided");
    }
    const results = await YTSearch(query);
    if (!results.length) {
        throw new Error("No results found");
    }
    return await YTDL(extractYouTubeId(results[0].url)!, { ...options });
};

function extractYouTubeId(url: string): string | null {
    if (!isYTUrl(url)) {
        return null;
    }

    const patterns = [
        { regex: /(?:youtube\.com\/watch\?v=|youtube\.com\/v\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i, group: 1 },
        { regex: /youtu\.be\/([a-zA-Z0-9_-]{11})/i, group: 1 },
        { regex: /youtube\.com\/watch\?.*?&v=([a-zA-Z0-9_-]{11})/i, group: 1 },
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern.regex);
        if (match && match[pattern.group]) {
            return match[pattern.group];
        }
    }

    return null;
}

export function isYTUrl(url: string): boolean {
    const patterns = [
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com|music\.youtube\.com|kids\.youtube\.com)/i,
        /^(https?:\/\/)?(www\.)?youtu\.be\//i,
        /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=/i,
        /^(https?:\/\/)?(www\.)?youtube\.com\/embed\//i,
        /^(https?:\/\/)?(www\.)?youtube\.com\/v\//i,
        /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\//i,
    ];

    return patterns.some((pattern) => pattern.test(url));
}
