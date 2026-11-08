export interface Config {
    filePrefix: string;
    fallbackZipName: string;
    pageUI: PageUIConfig;
    customUI: CustomUIConfig;
}

interface PageUIConfig {
    playerSelector: string;
    audioSelector: string;
    playlistSelector: string;
    trackSelector: string;
}

interface CustomUIConfig {
    downloadButtonSelector: string;
    instructionSelector: string;
    mainProgressSelector: string;
    currentProgressSelector: string;
    totalProgressSelector: string;
    downloadProgressContainerSelector: string;
    downloadProgressPercentSelector: string;
    downloadProgressBarSelector: string;
    downloadProgressBarRowSelector: string;
}
