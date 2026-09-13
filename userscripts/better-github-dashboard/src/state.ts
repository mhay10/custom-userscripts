import { State } from "./types";

export const STATE: State = {
    repos: new Map(),
    isFetching: false,
    paginationComplete: false,
    copilotHidden: false,
    currentUser: "",
};
