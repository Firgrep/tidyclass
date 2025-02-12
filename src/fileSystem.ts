import fg from "fast-glob";
import fs from "node:fs";
import { sortClassesInFiles, type SortedContentsAndPath } from "./sortClasses";

export async function handleFiles(file: string | undefined) {
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

export async function getAllTsFiles(directory?: string) {
    const pattern = directory ? [`${directory}/**/*.ts`] : ["**/*.ts"];

    const files = await fg(pattern, {
        ignore: [
            "node_modules/**",
            "dist/**",
            "coverage/**",
            ".next/**",
            "out/**",
            "build/**",
            "tmp/**",
            "temp/**",
            "test/**",
            "tests/**",
            "**/*.d.ts",
        ],
    });

    if (files.length === 0) {
        throw new Error("❌ No TypeScript files found.");
    }

    return files;
}

async function writeAllSortedFiles(sortedContents: SortedContentsAndPath[]) {
    let filesModified = 0;

    for (const sortedContent of sortedContents) {
        try {
            fs.writeFileSync(sortedContent.path, sortedContent.data);
            filesModified++;
        } catch (e) {
            if (e instanceof Error) {
                console.error(
                    `Failed to write to ${sortedContent.path}`,
                    e.stack
                );
            }
        }
    }

    return filesModified;
}
