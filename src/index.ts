#!/usr/bin/env node

import { program } from "commander";
import { handleFiles } from "./fileSystem";
import fs from "node:fs";
import { formatWithBiome, formatWithPrettier } from "./format";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

program
    .version(packageJson.version)
    .description(
        "🧹 TidyClass - Sort TypeScript class members in a structured order"
    )
    .argument(
        "[file]",
        "File path to sort (optional). If not provided, sorts all files in the project."
    )
    .option(
        "-p, --prettier",
        "Run Prettier formatting on affected files after sorting"
    )
    .option(
        "-b, --biome",
        "Run Biome formatting on affected files after sorting"
    )
    .action(async (file, options) => {
        await performActions({
            file,
            isPrettier: options.prettier,
            isBiome: options.biome,
        });
    });

main().catch((error) => {
    console.error("❌ An unexpected error occurred:", error);
    process.exit(1);
});

async function main() {
    await program.parseAsync(process.argv);
}

async function performActions({
    file,
    isPrettier = false,
    isBiome = false,
}: { file: string | undefined; isPrettier: boolean; isBiome: boolean }) {
    const affectedFilesPath = await handleFiles(file);

    if (isPrettier) {
        formatWithPrettier(affectedFilesPath);
    }

    if (isBiome) {
        formatWithBiome(affectedFilesPath);
    }
}
