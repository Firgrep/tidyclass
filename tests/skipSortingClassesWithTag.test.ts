import { sortClassesInFiles } from "../src/sortClasses";
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const TEST_DIR = path.join(__dirname, "test-files");

beforeAll(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });

    // Create test file with the new class structure including overloads
    fs.writeFileSync(
        path.join(TEST_DIR, "skip.ts"),
        `
        /**
         * @internal_sort skip
         */
        class ShouldBeSkipped {
            public rivetingFunc() {}
            private instanceVarB = 2;
            private static staticFuncB() {}
            public instanceVarA = 1;
            private funcX() {}
            private static staticVarB = 20;
            private static staticVarA = 10;
            public static staticFuncAA() {}
            public static staticVarAB = 5;
            private funcC() {}
            public funcA() {}
            constructor() {}
            private static  staticFuncA() {}

            public process(data: string): string;
            public process(data: number): number;
            public process(data: boolean): boolean;
            public process(data: any): any {
                return data;
            }
        
            /**
             * Logging
             * @param message 
             * @param level 
             */
            log(message: string): void;
            log(message: string, level: "info" | "warn" | "error"): void;
            log(message: string, level: "info" | "warn" | "error" = "info"): void {
                /**
                 * Hello log
                 */
                console.log(\`[\${level.toUpperCase()}] \${message}\`); // Some comment
            }
        }
        `
    );
});

afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("skipSortingClassesWithTag (Complex Case)", () => {
    it("should correctly skip classes with the specified tag", () => {
        const filePaths = [path.join(TEST_DIR, "skip.ts")];

        // Run sorting
        const sortedResults = sortClassesInFiles(filePaths);

        // Expect exactly one file to be modified
        expect(sortedResults).toHaveLength(0);
    });
});
