import { clamp, delay, escapeHtml, formatRelativeTime } from "@repo/common-utils";
import { CONFIG } from "../config";
import { LOGGER } from "../logger";
import { Query, QueueItem } from "../types";

export async function injectQueues(): Promise<void> {
    // const [reviewedPRs, authoredPRs, assignedIssues] = await Promise.all([
    //     loadQueueData(CONFIG.queries.reviewRequestedPRs),
    //     loadQueueData(CONFIG.queries.authoredPRs),
    //     loadQueueData(CONFIG.queries.assignedIssues),
    // ]);

    const viteIssuesQuery: Query = {
        query: "is:issue is:open repo:vitejs/vite archived:false sort:updated-desc",
        type: "issues",
    };
    const vitePRsQuery: Query = {
        query: "is:pr is:open repo:vitejs/vite archived:false sort:updated-desc",
        type: "pullrequests",
    };
    const authoredPRsQuery: Query = {
        query: "is:pr author:me sort:updated-desc",
        type: "pullrequests",
    };

    const [viteIssues, vitePRs, authoredPRs] = await Promise.all([
        fetchQueueData(viteIssuesQuery),
        fetchQueueData(vitePRsQuery),
        fetchQueueData(authoredPRsQuery),
    ]);

    if (!viteIssues || !vitePRs || !authoredPRs) {
        LOGGER.error("Failed to load queue data");
        return;
    }

    LOGGER.info("Number of vite issues:", viteIssues.length);
    LOGGER.info("Number of vite prs:", vitePRs.length);
    LOGGER.info("Number of authored prs:", authoredPRs.length);

    const authoredPRsHtml = buildQueueHtml("Review Requested Pull Requests", authoredPRs);
    const viteIssuesHtml = buildQueueHtml("Assigned Issues", viteIssues);
    const vitePRsHtml = buildQueueHtml("Assigned Pull Requests", vitePRs);

    const mainFeedElem = document.querySelector(CONFIG.selectors.mainFeed);
    if (mainFeedElem) {
        mainFeedElem.insertAdjacentElement("beforebegin", authoredPRsHtml);
        mainFeedElem.insertAdjacentElement("beforebegin", viteIssuesHtml);
        mainFeedElem.insertAdjacentElement("beforebegin", vitePRsHtml);
    }
}

function buildQueueHtml(title: string, items: QueueItem[], lastUpdated?: string): HTMLElement {
    const details = document.createElement("details");
    details.className = "better-gh-dash-queue";
    details.open = true;

    details.innerHTML = `
        <summary class="better-gh-dash-queue-header">
            <div class="better-gh-dash-queue-header-title">${title}</div>
            <div class="better-gh-dash-queue-header-info">
                <span>${items.length} item${items.length !== 1 ? "s" : ""}</span>
                ${lastUpdated ? `<span class="better-gh-dash-queue-header-updated">${lastUpdated}</span>` : ""}
            </div>
        </summary>
        <ul class="better-gh-dash-queue-list">
            ${
                items.length === 0
                    ? '<div class="better-gh-dash-queue-empty">No items</div>'
                    : items.map((item) => buildQueueItemHtml(item).outerHTML).join("")
            }
        </ul>
    `;
    return details;
}

/**
 * Builds a single queue item as a clickable link.
 * Left side: avatar, title, repo, state badge.
 * Right side (aligned right): author, timestamp, comment count.
 */
function buildQueueItemHtml(item: QueueItem): HTMLElement {
    const link = document.createElement("a");
    link.className = "better-gh-dash-queue-item";
    link.href = item.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML = `
        <img class="better-gh-dash-queue-item-avatar" src="${escapeHtml(item.authorAvatarUrl)}" alt="${escapeHtml(item.authorName)}">
        <div class="better-gh-dash-queue-item-left">
            <div class="better-gh-dash-queue-item-title">#${item.number} ${escapeHtml(item.title)}</div>
            <div class="better-gh-dash-queue-item-meta-left">
                <span class="better-gh-dash-queue-item-repo">${escapeHtml(item.repo)}</span>
                <span class="better-gh-dash-queue-item-state ${item.state.toLowerCase()}">${escapeHtml(item.state)}</span>
            </div>
        </div>
        <div class="better-gh-dash-queue-item-right">
            <span>${escapeHtml(item.authorName)}</span>
            <span>${formatRelativeTime(item.createdAt)}</span>
            ${item.numComments > 0 ? `<span>💬 ${item.numComments}</span>` : ""}
        </div>
    `;
    return link;
}

async function fetchQueueData(query: Query): Promise<QueueItem[] | null> {
    LOGGER.debug(`Fetching data for query: ${query.query}`);

    // Initialize return list and page count
    const items: QueueItem[] = [];
    let pageCount = CONFIG.search.maxPages;

    // Loop through each page of results
    for (let page = 1; page <= pageCount && page <= CONFIG.search.maxPages; page++) {
        // Send request to get query data
        const params = new URLSearchParams({
            q: query.query,
            type: query.type,
            p: "" + page,
            per_page: "5",
        });
        const response = await fetch(`${CONFIG.search.endpoint}?${params}`, {
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
        });

        // Stop fetching if response returns an error
        if (!response.ok) break;

        // Parse JSON from response
        const json = await response.json();
        const route = json?.payload?.blackbirdSearchRoute;

        // Update total page count from response
        pageCount = clamp(route?.page_count ?? 1, 1, CONFIG.search.maxPages);

        // Convert page results into standard format
        const searchResults = route?.results ?? [];
        for (const result of searchResults) {
            const owner = result.repo.repository.owner_login;
            const name = result.repo.repository.name;
            const kind = query.type === "pullrequests" ? "pull" : "issues";

            items.push({
                number: result.number,
                title: result.hl_title,
                href: `/${owner}/${name}/${kind}/${result.number}`,
                state: result.state,
                repo: `${owner}/${name}`,
                authorName: result.author_name,
                authorAvatarUrl: result.author_avatar_url,
                numComments: result.num_comments,
                createdAt: result.created,
            });
        }

        // Wait between pages to prevent rate limiting
        if (page < pageCount) await delay(CONFIG.delays.queuePaginationFetch);
    }

    return items;
}
