import { sortClassesInFiles } from "../src/sortClasses";
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const TEST_DIR = path.join(__dirname, "test-files");

beforeAll(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });

    // Create test file with the new class structure including overloads
    fs.writeFileSync(
        path.join(TEST_DIR, "complex.ts"),
        `
        class MyClass {
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

describe("sortClassesInFiles (Complex Case)", () => {
    it("should correctly sort members with proper spacing and maintain comments", () => {
        const filePaths = [path.join(TEST_DIR, "complex.ts")];

        // Run sorting
        const sortedResults = sortClassesInFiles(filePaths);

        // Expect exactly one file to be modified
        expect(sortedResults).toHaveLength(1);
        expect(sortedResults[0].path).toBe(filePaths[0]);

        const updatedCode = sortedResults[0].data;

        // Check static members ordering using full declarations
        expect(
            updatedCode.indexOf("public static staticVarAB = 5")
        ).toBeLessThan(updatedCode.indexOf("private static staticVarA = 10"));
        expect(
            updatedCode.indexOf("private static staticVarA = 10")
        ).toBeLessThan(updatedCode.indexOf("private static staticVarB = 20"));
        expect(
            updatedCode.indexOf("private static staticVarB = 20")
        ).toBeLessThan(updatedCode.indexOf("public static staticFuncAA()"));
        expect(
            updatedCode.indexOf("public static staticFuncAA()")
        ).toBeLessThan(updatedCode.indexOf("private static  staticFuncA()"));
        expect(
            updatedCode.indexOf("private static  staticFuncA()")
        ).toBeLessThan(updatedCode.indexOf("private static staticFuncB()"));

        // Check instance variables
        expect(updatedCode.indexOf("public instanceVarA = 1")).toBeLessThan(
            updatedCode.indexOf("private instanceVarB = 2")
        );
        expect(updatedCode.indexOf("private instanceVarB = 2")).toBeLessThan(
            updatedCode.indexOf("constructor()")
        );

        // Check methods ordering, including overloads
        expect(updatedCode.indexOf("constructor()")).toBeLessThan(
            updatedCode.indexOf("public funcA()")
        );
        expect(updatedCode.indexOf("public funcA()")).toBeLessThan(
            updatedCode.indexOf("log(message: string): void;")
        );

        // Check that overloads stay together and in order
        expect(
            updatedCode.indexOf("public process(data: string): string;")
        ).toBeLessThan(
            updatedCode.indexOf("public process(data: number): number;")
        );
        expect(
            updatedCode.indexOf("public process(data: number): number;")
        ).toBeLessThan(
            updatedCode.indexOf("public process(data: boolean): boolean;")
        );
        expect(
            updatedCode.indexOf("public process(data: boolean): boolean;")
        ).toBeLessThan(updatedCode.indexOf("public process(data: any): any {"));

        expect(updatedCode.indexOf("log(message: string): void;")).toBeLessThan(
            updatedCode.indexOf(
                'log(message: string, level: "info" | "warn" | "error"): void;'
            )
        );
        expect(
            updatedCode.indexOf(
                'log(message: string, level: "info" | "warn" | "error"): void;'
            )
        ).toBeLessThan(
            updatedCode.indexOf(
                'log(message: string, level: "info" | "warn" | "error" = "info"): void {'
            )
        );

        expect(updatedCode.indexOf("public rivetingFunc()")).toBeLessThan(
            updatedCode.indexOf("private funcC()")
        );
        expect(updatedCode.indexOf("private funcC()")).toBeLessThan(
            updatedCode.indexOf("private funcX()")
        );

        // Verify comments are preserved
        expect(updatedCode).toContain("* Logging");
        expect(updatedCode).toContain("* Hello log");
        expect(updatedCode).toContain("// Some comment");
    });
});
