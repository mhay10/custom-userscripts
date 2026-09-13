import { RepoData } from "../types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        owner: repoOwner,
        path: cleanPath,
        href: rawHref,
        avatarSrc: avatarSrc,
    };
}
