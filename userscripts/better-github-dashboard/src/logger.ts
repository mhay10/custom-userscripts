import { createLogger } from "@repo/common-utils";
import pkg from "../package.json" with { type: "json" };

export const LOGGER = createLogger(`Better GH Dashboard ${pkg.version}`);
