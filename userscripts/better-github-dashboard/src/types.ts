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
    paginationFetch: number;
    personalOpenSettle: number;
}

interface Pagination {
    endpoint: string;
    location: string;
    maxPages: number;
}

interface Queries {
    reviewPRs: string;
}

export interface State {
    repos: Map<string, RepoData>;
    paginationComplete: boolean;
    copilotHidden: boolean;
    currentUser: string;
}
