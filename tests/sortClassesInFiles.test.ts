import { sortClassesInFiles } from "../src/sortClasses";
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const TEST_DIR = path.join(__dirname, "test-files");

beforeAll(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });

    // Create an unsorted test file
    fs.writeFileSync(
        path.join(TEST_DIR, "unsorted.ts"),
        `
        class Example {
            beta() {}
            alpha() {}
        }
        `
    );

    // Create an already sorted test file
    fs.writeFileSync(
        path.join(TEST_DIR, "sorted.ts"),
        `
        class Example {
            alpha() {}
            beta() {}
        }
        `
    );
});

afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("sortClassesInFiles", () => {
    it("should return sorted content and correct file path", () => {
        const filePaths = [path.join(TEST_DIR, "unsorted.ts")];

        // Run sorting
        const sortedResults = sortClassesInFiles(filePaths);

        // Expect exactly one file to be modified
        expect(sortedResults).toHaveLength(1);
        expect(sortedResults[0].path).toBe(filePaths[0]);

        // Verify that 'alpha()' comes before 'beta()' in the sorted data
        const updatedCode = sortedResults[0].data;
        expect(updatedCode).toContain("alpha()");
        expect(updatedCode).toContain("beta()");
        expect(updatedCode.indexOf("alpha()")).toBeLessThan(
            updatedCode.indexOf("beta()")
        );
    });

    it("should return an empty array if no changes are needed", () => {
        const filePaths = [path.join(TEST_DIR, "sorted.ts")];

        // Run sorting
        const sortedResults = sortClassesInFiles(filePaths);

        // Expect no changes (empty array)
        expect(sortedResults).toHaveLength(0);
    });
});
