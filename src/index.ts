#!/usr/bin/env node

import { program } from "commander";
import { getAllTsFiles, writeAllSortedFiles } from "./fileSystem";
import { sortClassesInFiles } from "./sortClasses";
import fs from "node:fs";

async function sortAllFiles() {
    const files = await getAllTsFiles();
    if (files.length === 0) {
        console.warn("⚠ No TypeScript files found. Nothing to sort.");
        return;
    }

    const sortedContents = sortClassesInFiles(files);
    const modified = await writeAllSortedFiles(sortedContents);

    console.info(`✅ Sorted methods in: ${modified} files`);
}

async function sortSingleFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: File "${filePath}" not found.`);
        process.exit(1);
    }

    const sortedContents = sortClassesInFiles([filePath]);

    if (sortedContents.length === 0) {
        console.info("✔ No changes needed.");
        return;
    }

    await writeAllSortedFiles(sortedContents);
    console.info(`✅ Sorted and saved: ${filePath}`);
}

program
    .version("1.0.0")
    .description(
        "🧹 TidyClass - Sort TypeScript class members in a structured order"
    )
    .argument(
        "[file]",
        "File path to sort (optional). If not provided, sorts all files in the project."
    )
    .action(async (file) => {
        if (file) {
            await sortSingleFile(file);
        } else {
            await sortAllFiles();
        }
    });

async function main() {
    await program.parseAsync(process.argv);
}

main().catch((error) => {
    console.error("❌ An unexpected error occurred:", error);
    process.exit(1);
});
