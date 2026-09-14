import { delay } from "../../../../common-utils/src";
import { CONFIG } from "../config";
import { LOGGER } from "../logger";
import { STATE } from "../state";
import { RepoData } from "../types";

function parseRepoNode(node: HTMLElement): RepoData | null {
    // Get link conatiner
    const linkElem = node.querySelector('a[data-hovercard-type="repository"]');
    if (!linkElem) return null;

    // Cleanup URL to not be absolute or have a leading slash
    const rawHref = linkElem.getAttribute("href") || "";
    const cleanPath = rawHref
        .replace(/^https?:\/\/[^\/]+/, "") // Remove https:// url portion
        .replace(/^\//, ""); // Remove starting slashes

    // Split URL into parts and make sure that enough exist
    const parts = cleanPath.split("/");
    if (parts.length < 2) return null;
    const repoOwner = parts[0];
    const repoName = parts[1];

    // Get avatar image src
    const imgElem = node.querySelector("img.avatar, img.avatar-small");
    const avatarSrc = imgElem?.getAttribute("src") ?? "";

    // Return parsed object
    return {
        name: repoName,
        owner: repoOwner === STATE.currentUser ? "Personal" : repoOwner, // Use "Personal" label for current users's repos
        path: cleanPath,
        href: rawHref,
        avatarSrc: avatarSrc,
    };
}

function buildCategoryHtml(category: string, repos: RepoData[]): HTMLElement {
    // Create main category container
    const categoryElem = document.createElement("div");
    categoryElem.classList.add("better-gh-dash-repo-category");

    // Create details dropdown
    const detailsElem = document.createElement("details");
    if (category == "Personal") {
        detailsElem.open = true;
    }

    // Create category summary
    const summaryElem = document.createElement("summary");
    summaryElem.textContent = `${category} (${repos.length})`;
    summaryElem.dataset.category = category;

    // Build list of repos
    const listElem = document.createElement("ul");
    for (const repo of repos) {
        // Create list item element and add key for search filtering
        const itemElem = document.createElement("li");
        itemElem.dataset.repoName = repo.name.toLowerCase();
        itemElem.style.listStyle = "none";

        // Setup repo avatar image and add to list item DOM
        if (repo.avatarSrc) {
            const imgElem = document.createElement("img");
            imgElem.src = repo.avatarSrc;
            imgElem.width = 16;
            imgElem.height = 16;
            imgElem.alt = "";
            itemElem.appendChild(imgElem);
        }

        // Setup repo link element
        const linkElem = document.createElement("a");
        linkElem.href = `${repo.href}`;
        linkElem.textContent = repo.path;
        itemElem.appendChild(linkElem);

        // Add repo item to list
        listElem.appendChild(itemElem);
    }

    // Add child elements to parent elements
    detailsElem.appendChild(summaryElem);
    detailsElem.appendChild(listElem);
    categoryElem.appendChild(detailsElem);

    return categoryElem;
}

export function renderRepoCategories(): void {
    // Get the existing repo list element
    const existingList = document.querySelector(CONFIG.selectors.repoList) as HTMLElement;
    if (!existingList?.parentElement) return;

    // Get or create the new grouped repos container
    let categoriesElem = document.querySelector(CONFIG.selectors.categorizedRepoList);
    if (!categoriesElem) {
        categoriesElem = document.createElement("div");
        categoriesElem.setAttribute("id", CONFIG.selectors.categorizedRepoList.slice(1));

        // Add newly created element to DOM
        existingList.parentElement.insertBefore(categoriesElem, existingList);
    } else {
        // Clear HTML contents if it already exists
        categoriesElem.innerHTML = "";
    }

    // Convert state's flat repo list into grouped sections
    const categories = new Map<string, RepoData[]>();
    STATE.repos.forEach((repo) => {
        if (!categories.has(repo.owner)) categories.set(repo.owner, []);
        const existing = categories.get(repo.owner) ?? [];
        categories.set(repo.owner, [...existing, repo]);
    });

    // Sort the grouped sections alphabetically with current user's repos first
    const sortedCategories = Array.from(categories.keys()).sort((a, b) => {
        if (a === "Personal") return -1;
        if (b === "Personal") return 1;
        return a.localeCompare(b, undefined, { sensitivity: "base" });
    });

    // Convert each group to HTML and add to DOM
    sortedCategories.forEach((category) => {
        // Get repos and sort them alphabetically
        const repos = categories.get(category);
        if (!repos) return;
        repos.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, {
                sensitivity: "base",
            })
        );

        // Build the HTML for the repo category
        const categoryHtml = buildCategoryHtml(category, repos);
        categoriesElem.appendChild(categoryHtml);
    });
}

export async function fetchRemainingPages(): Promise<void> {
    // Don't request more repos if already being requested
    if (STATE.isFetching || STATE.paginationComplete) return;

    // Start fetch rest of the pages
    STATE.isFetching = true;

    // Loop while the form cursor exists
    let lastPage = false;
    for (let pageNum = 1; pageNum < 50 && !lastPage; pageNum++) {
        LOGGER.info(`Fetching page ${pageNum} of repos...`);

        // Send request to get next page of repos
        const url = "/dashboard/ajax_my_repositories";
        const params = new URLSearchParams({
            location: "left",
            repos_cursor: "" + pageNum,
        });
        const response = await fetch(`${url}?${params}`, {
            headers: { "X-Requested-With": "XMLHttpRequest" },
        });

        // Stop fetching if the response returns an error
        if (!response.ok) break;

        // Parse HTML from response
        const html = new DOMParser().parseFromString(await response.text(), "text/html");

        // Get all repo elements in the HTML and extract the data
        html.querySelectorAll("li").forEach((li) => {
            const data = parseRepoNode(li);
            if (data) STATE.repos.set(data.path, data);
        });

        // Check if another page of repos exists
        lastPage = !html.querySelector(CONFIG.selectors.repoPaginationNext);

        // Wait to avoid rate limiting
        await delay(CONFIG.delays.paginationFetch);
    }

    // Render the categories and open the Personal one by default
    renderRepoCategories();

    // Update fetch state flags and do one final render call
    STATE.isFetching = false;
    STATE.paginationComplete = true;
}
