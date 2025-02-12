import { type ClassMemberTypes, Project, Scope, SyntaxKind } from "ts-morph";

export type SortedContentsAndPath = {
    data: string;
    path: string;
};

type ClassMemberNameAndText = {
    text: string;
    name: string;
};
type ClassMemberNameTextOverload = ClassMemberNameAndText & {
    overloads: ClassMemberNameAndText[];
};
type ClassMemberContents = Array<ClassMemberNameTextOverload>;

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
        const staticPublicVars: ClassMemberContents = [];
        const staticPrivateVars: ClassMemberContents = [];
        const staticPublicFuncs: ClassMemberContents = [];
        const staticPrivateFuncs: ClassMemberContents = [];
        const publicVars: ClassMemberContents = [];
        const privateVars: ClassMemberContents = [];
        const constructorDeclarations: ClassMemberContents = [];
        const publicFuncs: ClassMemberContents = [];
        const privateFuncs: ClassMemberContents = [];

        const members = classDeclaration.getMembers();

        // Store all member information before any modifications
        for (const member of [...members]) {
            const memberInfo: ClassMemberNameTextOverload = {
                text: member.getFullText(),
                name: getNameCustom(member),
                overloads: [],
            };

            if (member.isKind(SyntaxKind.PropertyDeclaration)) {
                if (member.isStatic()) {
                    if (member.getScope() === Scope.Private) {
                        staticPrivateVars.push(memberInfo);
                    } else {
                        staticPublicVars.push(memberInfo);
                    }
                } else {
                    if (member.getScope() === Scope.Private) {
                        privateVars.push(memberInfo);
                    } else {
                        publicVars.push(memberInfo);
                    }
                }
            } else if (member.isKind(SyntaxKind.Constructor)) {
                constructorDeclarations.push(memberInfo);
            } else if (member.isKind(SyntaxKind.MethodDeclaration)) {
                const overloads = member.getOverloads();

                // Handle any overloads as part of the method
                for (const overload of overloads) {
                    const overloadContent = {
                        text: overload.getFullText(),
                        name: getNameCustom(overload),
                    };
                    memberInfo.overloads.push(overloadContent);
                }

                if (member.isStatic()) {
                    if (member.getScope() === Scope.Private) {
                        staticPrivateFuncs.push(memberInfo);
                    } else {
                        staticPublicFuncs.push(memberInfo);
                    }
                } else {
                    if (member.getScope() === Scope.Private) {
                        privateFuncs.push(memberInfo);
                    } else {
                        publicFuncs.push(memberInfo);
                    }
                }
            }
        }

        // Sort members alphabetically within their groups
        staticPublicVars.sort((a, b) => a.name.localeCompare(b.name));
        staticPrivateVars.sort((a, b) => a.name.localeCompare(b.name));
        staticPublicFuncs.sort((a, b) => a.name.localeCompare(b.name));
        staticPrivateFuncs.sort((a, b) => a.name.localeCompare(b.name));
        publicVars.sort((a, b) => a.name.localeCompare(b.name));
        privateVars.sort((a, b) => a.name.localeCompare(b.name));
        publicFuncs.sort((a, b) => a.name.localeCompare(b.name));
        privateFuncs.sort((a, b) => a.name.localeCompare(b.name));

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
        const currentOrder = members.map((m) => getNameCustom(m));
        const newOrder = sortedMembers.map((m) => m.name);

        if (JSON.stringify(currentOrder) !== JSON.stringify(newOrder)) {
            console.info(
                `⚙️ Sorting members in class: ${classDeclaration.getName()}`
            );
            modified = true;

            // Remove old members
            for (const member of classDeclaration.getMembers()) {
                member.remove();
            }

            // Add sorted members back
            let newClassStructure = "";
            for (const sortedMember of sortedMembers) {
                for (const overload of sortedMember.overloads) {
                    newClassStructure += `${overload.text}\n\n`;
                }
                newClassStructure += `${sortedMember.text}\n\n`;
            }
            classDeclaration.addMembers(newClassStructure);
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
