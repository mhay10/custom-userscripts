import { createLogger } from "@repo/common-utils";
import pkg from "../package.json" with { type: "json" };

export const LOGGER = createLogger(`EzAudiobook Downloader ${pkg.version}`);
