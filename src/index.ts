#!/usr/bin/env node

import { program } from "commander";
import { getAllTsFiles, writeAllSortedFiles } from "./fileSystem";
import { sortClassesInFiles } from "./sortClasses";
import fs from "node:fs";
import { formatWithPrettier } from "./prettier";

main().catch((error) => {
    console.error("❌ An unexpected error occurred:", error);
    process.exit(1);
});

program
    .version("1.0.0")
    .description(
        "🧹 TidyClass - Sort TypeScript class members in a structured order"
    )
    .argument(
        "[file]",
        "File path to sort (optional). If not provided, sorts all files in the project."
    )
    .option("-p, --prettier", "Run Prettier on affected files after sorting")
    .action(async (file, options) => {
        await performActions({
            file,
            isPrettier: options.prettier,
        });
    });

async function main() {
    await program.parseAsync(process.argv);
}

async function performActions({
    file,
    isPrettier = false,
}: { file: string | undefined; isPrettier: boolean }) {
    const affectedFilesPath = await handleFiles(file);

    if (isPrettier) {
        formatWithPrettier(affectedFilesPath);
        console.info("Formatted affected files with prettier");
    }
}

async function handleFiles(file: string | undefined) {
    if (file) {
        return await sortSingleFile(file);
    }
    return await sortAllFiles();
}

async function sortAllFiles() {
    const files = await getAllTsFiles();
    if (files.length === 0) {
        console.warn("⚠ No TypeScript files found. Nothing to sort.");
        return [];
    }
    const sortedContents = sortClassesInFiles(files);
    const modified = await writeAllSortedFiles(sortedContents);
    console.info(`✅ Sorted methods in: ${modified} files`);
    const sortedPaths = sortedContents.map((obj) => {
        return obj.path;
    });
    return sortedPaths;
}

async function sortSingleFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: File "${filePath}" not found.`);
        process.exit(1);
    }

    const sortedContents = sortClassesInFiles([filePath]);

    if (sortedContents.length === 0) {
        console.info("✔ No changes needed.");
        return [];
    }

    await writeAllSortedFiles(sortedContents);
    console.info(`✅ Sorted and saved: ${filePath}`);
    const sortedPaths = sortedContents.map((obj) => {
        return obj.path;
    });
    return sortedPaths;
}
