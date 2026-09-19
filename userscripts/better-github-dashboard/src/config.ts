import { Config } from "./types";

export const CONFIG: Config = {
    selectors: {
        // Dashboard selectors
        mainFeed: '#dashboard > div[class="news"]',

        // Copilot selectors
        copilotElems: '.copilotPreview__container, react-partial[partial-name*="copilot"]',

        // Sidebar Repo selectors
        repoList: "ul.js-dashboard-repos-list",
        repoPaginationForm: "form.js-ajax-pagination, form.js-more-repos-form",
        repoPaginationNext: 'input[name="repos_cursor"]',
        sideShowMoreButton: 'button[data-disable-with="Loading more..."]',

        // Custom UI selectors
        categorizedRepoList: "#better-gh-dash-repos-list",
        personalRepoList: 'details:has(> summary[data-category="Personal"])',
    },
    delays: {
        mutObserverDebounce: 150,
        repoPaginationFetch: 300,
        personalOpenSettle: 100,
        queuePaginationFetch: 100,
    },
    pagination: {
        endpoint: "/dashboard/ajax_my_repositories",
        location: "left",
        maxPages: 50,
    },
    search: {
        endpoint: "/search",
        maxPages: 3,
    },
    queries: {
        reviewRequestedPRs: {
            query: "is:open is:pr review-requested:@me archived:false sort:updated-desc",
            type: "pullrequests",
        },
        authoredPRs: {
            query: "is:open is:pr author:@me archived:false sort:updated-desc",
            type: "pullrequests",
        },
        assignedIssues: {
            query: "is:open is:issue assignee:@me archived:false sort:updated-desc",
            type: "issues",
        },
    },
};
