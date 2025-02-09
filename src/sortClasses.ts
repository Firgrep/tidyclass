import {
    type ClassMemberTypes,
    type ConstructorDeclaration,
    type MethodDeclaration,
    Project,
    type PropertyDeclaration,
    Scope,
    StructureKind,
    SyntaxKind,
} from "ts-morph";

const OVERLOADS_ERR = "Overloads are currently not supported. Aborting.";

export type SortedContentsAndPath = {
    data: string;
    path: string;
};

export function sortClassesInFiles(filePaths: string[]) {
    const sortedContents: SortedContentsAndPath[] = [];
    for (const filePath of filePaths) {
        const sortedContent = sortClasses(filePath);
        if (sortedContent) {
            const payload = {
                data: sortedContent,
                path: filePath,
            };
            sortedContents.push(payload);
        }
    }
    return sortedContents;
}

function sortClasses(filePath: string): string | null {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(filePath);

    let modified = false;

    const classes = sourceFile.getClasses();

    for (const classDeclaration of classes) {
        const staticPublicVars: PropertyDeclaration[] = [];
        const staticPrivateVars: PropertyDeclaration[] = [];
        const staticPublicFuncs: MethodDeclaration[] = [];
        const staticPrivateFuncs: MethodDeclaration[] = [];
        const publicVars: PropertyDeclaration[] = [];
        const privateVars: PropertyDeclaration[] = [];
        const constructorDeclarations: ConstructorDeclaration[] = [];
        const publicFuncs: MethodDeclaration[] = [];
        const privateFuncs: MethodDeclaration[] = [];

        for (const member of classDeclaration.getMembers()) {
            if (member.isKind(SyntaxKind.PropertyDeclaration)) {
                if (member.isStatic()) {
                    if (member.getScope() === Scope.Private) {
                        staticPrivateVars.push(member);
                    } else {
                        staticPublicVars.push(member);
                    }
                } else {
                    if (member.getScope() === Scope.Private) {
                        privateVars.push(member);
                    } else {
                        publicVars.push(member);
                    }
                }
            } else if (member.isKind(SyntaxKind.Constructor)) {
                constructorDeclarations.push(member);
            } else if (member.isKind(SyntaxKind.MethodDeclaration)) {
                const overloads = member.getOverloads();
                if (overloads.length > 0) {
                    throw new Error(OVERLOADS_ERR);
                }
                if (member.isStatic()) {
                    if (member.getScope() === Scope.Private) {
                        staticPrivateFuncs.push(member);
                    } else {
                        staticPublicFuncs.push(member);
                    }
                } else {
                    if (member.getScope() === Scope.Private) {
                        privateFuncs.push(member);
                    } else {
                        publicFuncs.push(member);
                    }
                }
            }
        }

        // Sort members alphabetically within their groups
        staticPublicVars.sort((a, b) => a.getName().localeCompare(b.getName()));
        staticPrivateVars.sort((a, b) =>
            a.getName().localeCompare(b.getName())
        );
        staticPublicFuncs.sort((a, b) =>
            a.getName().localeCompare(b.getName())
        );
        staticPrivateFuncs.sort((a, b) =>
            a.getName().localeCompare(b.getName())
        );

        publicVars.sort((a, b) => a.getName().localeCompare(b.getName()));
        privateVars.sort((a, b) => a.getName().localeCompare(b.getName()));
        publicFuncs.sort((a, b) => a.getName().localeCompare(b.getName()));
        privateFuncs.sort((a, b) => a.getName().localeCompare(b.getName()));

        // Combine everything in the correct order
        const sortedMembers = [
            ...staticPublicVars,
            ...staticPrivateVars,
            ...staticPublicFuncs,
            ...staticPrivateFuncs,
            ...publicVars,
            ...privateVars,
            ...constructorDeclarations,
            ...publicFuncs,
            ...privateFuncs,
        ];

        // If the order has changed, update the file
        if (
            JSON.stringify(
                classDeclaration.getMembers().map((m) => getNameCustom(m))
            ) !== JSON.stringify(sortedMembers.map((m) => getNameCustom(m)))
        ) {
            console.info(
                `Sorting members in class: ${classDeclaration.getName()}`
            );
            modified = true;

            // Get structures before removing
            const sortedStructures = sortedMembers.map((member) =>
                member.getStructure()
            );

            // Remove old members
            for (const member of classDeclaration.getMembers()) {
                member.remove();
            }

            // Add sorted members back
            for (const structure of sortedStructures) {
                if (structure.kind === StructureKind.Constructor) {
                    classDeclaration.addConstructor(structure);
                } else if (
                    structure.kind !== StructureKind.MethodOverload &&
                    structure.kind !== StructureKind.ConstructorOverload
                ) {
                    classDeclaration.addMember(structure);
                } else {
                    throw new Error(OVERLOADS_ERR);
                }
            }
        }
    }

    if (modified) {
        return sourceFile.getFullText();
    }

    return null;
}

function getNameCustom(m: ClassMemberTypes) {
    if (m.isKind(SyntaxKind.Constructor)) {
        return "Constructor";
    }
    return m.getName();
}
