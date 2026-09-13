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
        groupedRepoList: "#better-gh-dash-repo-list",
    },
    delays: {
        mutObserverDebounce: 150,
        paginationFetch: 300,
    },
    queries: {
        reviewPRs: "is:open is:pr review-requested:@me archived:false sort:updated-desc",
    },
};
