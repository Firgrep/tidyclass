import fg from "fast-glob";
import fs from "node:fs";
import type { SortedContentsAndPath } from "./sortClasses";

export async function getAllTsFiles(directory?: string) {
    const pattern = directory ? [`${directory}/**/*.ts`] : ["**/*.ts"];

    const files = await fg(pattern, {
        ignore: [
            "node_modules/**",
            "dist/**",
            "coverage/**",
            ".next/**",
            "**/*.d.ts",
        ],
    });

    if (files.length === 0) {
        throw new Error("❌ No TypeScript files found.");
    }

    return files;
}

export async function writeAllSortedFiles(
    sortedContents: SortedContentsAndPath[]
) {
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
