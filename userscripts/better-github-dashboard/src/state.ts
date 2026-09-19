import { State } from "./types";

export const STATE: State = {
    repos: new Map(),
    paginationComplete: false,
    copilotHidden: false,
    currentUser: "",
};

/** Reads the logged-in username from the page meta tag into state; returns whether a user was found */
export function setCurrentUser(): boolean {
    // Don't re-set if current user has already been set
    if (STATE.currentUser) return true;

    // Try to find current user from a meta tag
    const currentUser = document
        .querySelector('meta[name="user-login"]')
        ?.getAttribute("content")
        ?.toLowerCase();

    // Set state's current user if found
    if (currentUser) {
        STATE.currentUser = currentUser;
        return true;
    }

    return false;
}
