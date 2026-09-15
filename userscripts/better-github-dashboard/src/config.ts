import { Config } from "./types";

export const CONFIG: Config = {
    selectors: {
        // Page UI selectors
        repoList: "ul.js-dashboard-repos-list",
        repoPaginationForm: "form.js-ajax-pagination, form.js-more-repos-form",
        repoPaginationNext: 'input[name="repos_cursor"]',
        sideShowMoreButton: 'button[data-disable-with="Loading more..."]',
        copilotElems: '.copilotPreview__container, react-partial[partial-name*="copilot"]',

        // Custom UI selectors
        categorizedRepoList: "#better-gh-dash-repos-list",
        personalRepoList: 'details:has(> summary[data-category="Personal"])',
    },
    delays: {
        mutObserverDebounce: 150,
        paginationFetch: 300,
        personalOpenSettle: 100,
    },
    pagination: {
        endpoint: "/dashboard/ajax_my_repositories",
        location: "left",
        maxPages: 50,
    },
    queries: {
        reviewRequestedPRs: "is:open is:pr review-requested:@me archived:false sort:updated-desc",
        authoredPRs: "is:open is:pr author:@me archived:false sort:updated-desc",
        assignedIssues: "is:open is:issue assignee:@me archived:false sort:updated-desc",
    },
};
