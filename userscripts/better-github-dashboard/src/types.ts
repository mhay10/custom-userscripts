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
    queries: Queries;
}

interface Selectors {
    repoList: string;
    repoPaginationForm: string;
    repoPaginationNext: string;
    sideShowMoreButton: string;
    copilotElems: string;
    groupedRepoList: string;
}

interface Delays {
    mutObserverDebounce: number;
    paginationFetch: number;
}

interface Queries {
    reviewPRs: string;
}

export interface State {
    repos: Map<string, RepoData>;
    isFetching: boolean;
    paginationComplete: boolean;
    copilotHidden: boolean;
    currentUser: string;
}
