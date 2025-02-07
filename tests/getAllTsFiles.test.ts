import { getAllTsFiles } from "../src/fileSystem";
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const TEST_DIR = path.join(__dirname, "test-files");

beforeAll(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });
    fs.writeFileSync(
        path.join(TEST_DIR, "file1.ts"),
        "export const test = 123;"
    );
    fs.writeFileSync(
        path.join(TEST_DIR, "file2.ts"),
        "export function hello() {};"
    );
});

afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("getAllTsFiles", () => {
    it("should find all .ts files in the test directory", async () => {
        const files = await getAllTsFiles(TEST_DIR);
        expect(files.length).toBe(2);
        expect(files.some((file) => file.includes("file1.ts"))).toBe(true);
        expect(files.some((file) => file.includes("file2.ts"))).toBe(true);
    });
});
