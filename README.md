# Custom Userscripts

A collection of custom userscripts that I occasionally use.

## Installation

1. Install a userscript manager such as Tampermonkey or Violentmonkey.
2. Install the desired `.user.js` script from this repository.
3. Visit a supported website for that script.
4. Follow any script-specific instructions below.

## Scripts

- **EzAudiobooksForSoul Downloader**
    - Downloads every chapter from supported audiobook pages into a single ZIP archive.
    - Supports:
        - https://ezaudiobookforsoul.com
        - https://audiobooks4soul.com
    - Features:
        - One-click audiobook downloads
        - Automatic ZIP creation
        - Concurrent downloads
        - Download progress tracking
        - Automatic archive naming

- **GoldenAudiobook Downloader**
    - Injects a custom download interface into supported audiobook sites to fetch all audio tracks into a ZIP archive.
    - Supports:
        - https://goldenaudiobooks.com/*
        - https://appaudiobooks.com/*
        - https://bookaudiobooks.com/*
        - https://fulllengthaudiobooks.com/*
        - https://hotaudiobooks.com/*
    - Features:
        - One-click multi-track downloads into uncompressed ZIP archives
        - Concurrent downloading limited to 3 streams simultaneously
        - Overall job and per-file progress tracking bars
        - Automatic folder/archive naming based on source URL patterns
        - Injected Bootstrap-styled interface

- **Google Docs - Remove Gemini Bar**
    - Automatically hides the floating Gemini prompt bar at the bottom of Google Docs documents.
    - Supports:
        - https://docs.google.com/document/*
    - Features:
        - Automatically hidden when the element loads. 
        - Zero manual interaction required
