export interface RepoData {
    name: string;
    owner: string;
    path: string;
    href: string;
    avatarSrc: string;
}

export interface Config {
    selectors: Selectors;
    delays: Delays;
    pagination: Pagination;
    search: Search;
    queries: Queries;
}

interface Selectors {
    // Page UI selectors
    repoList: string;
    repoPaginationForm: string;
    repoPaginationNext: string;
    sideShowMoreButton: string;
    copilotElems: string;

    // Custom UI selectors
    categorizedRepoList: string;
    personalRepoList: string;
}

interface Delays {
    mutObserverDebounce: number;
    repoPaginationFetch: number;
    personalOpenSettle: number;
    queuePaginationFetch: number;
}

interface Pagination {
    endpoint: string;
    location: string;
    maxPages: number;
}

interface Search {
    endpoint: string;
    maxPages: number;
}

interface Queries {
    reviewRequestedPRs: Query;
    authoredPRs: Query;
    assignedIssues: Query;
}

export interface Query {
    query: string;
    type: "pullrequests" | "issues";
}

/** A single normalized PR or issue result rendered in a queue */
export interface QueueItem {
    number: number;
    title: string;
    href: string;
    state: string;
    repo: string;
    authorName: string;
    authorAvatarUrl: string;
    numComments: number;
    createdAt: string;
}

export interface State {
    repos: Map<string, RepoData>;
    paginationComplete: boolean;
    copilotHidden: boolean;
    currentUser: string;
}
