import { sortClassesInFiles } from "../src/sortClasses";
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const TEST_DIR = path.join(__dirname, "test-files");

beforeAll(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });

    // Create a more complex unsorted test file
    fs.writeFileSync(
        path.join(TEST_DIR, "complex.ts"),
        `
        class ComplexClass {
            public rivetingFunc() {}
            private instanceVarB = 2;
            static private staticFuncB() {}
            public instanceVarA = 1;
            private funcX() {}
            private static staticVarB = 20;
            private static staticVarA = 10;
            public static staticFuncA() {}
            static public staticVarA = 5;
            private funcC() {}
            public funcA() {}
            constructor() {}
            static private staticFuncA() {}
        }
        `
    );
});

afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("sortClassesInFiles (Complex Case)", () => {
    it("should correctly sort static members first, then variables, constructor, and methods", () => {
        const filePaths = [path.join(TEST_DIR, "complex.ts")];

        // Run sorting
        const sortedResults = sortClassesInFiles(filePaths);

        // Expect exactly one file to be modified
        expect(sortedResults).toHaveLength(1);
        expect(sortedResults[0].path).toBe(filePaths[0]);

        // Verify that the sorted output respects the correct ordering
        const updatedCode = sortedResults[0].data;

        // Ensure static variables appear before static functions
        expect(updatedCode.indexOf("staticVarA")).toBeLessThan(
            updatedCode.indexOf("staticFuncA")
        );
        expect(updatedCode.indexOf("staticVarB")).toBeLessThan(
            updatedCode.indexOf("staticFuncB")
        );

        // Ensure public static variables come before private static variables
        expect(updatedCode.indexOf("staticVarA")).toBeLessThan(
            updatedCode.indexOf("staticVarB")
        );

        // Ensure public static functions come before private static functions
        expect(updatedCode.indexOf("staticFuncA")).toBeLessThan(
            updatedCode.indexOf("staticFuncB")
        );

        // Ensure instance variables appear before the constructor
        expect(updatedCode.indexOf("instanceVarA")).toBeLessThan(
            updatedCode.indexOf("constructor()")
        );
        expect(updatedCode.indexOf("instanceVarB")).toBeLessThan(
            updatedCode.indexOf("constructor()")
        );

        // Ensure constructor appears before methods
        expect(updatedCode.indexOf("constructor()")).toBeLessThan(
            updatedCode.indexOf("funcA")
        );

        // Ensure public instance methods come before private instance methods
        expect(updatedCode.indexOf("funcA")).toBeLessThan(
            updatedCode.indexOf("funcC")
        );
    });
});
