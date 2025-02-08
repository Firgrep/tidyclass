# TidyClass

🧹 **TidyClass** - A CLI tool to automatically sort TypeScript class members in a structured order.

## Installation

You can install TidyClass globally or use it as a local dependency in your project.

```sh
npm install -g tidyclass
```

or

```sh
npm install --save-dev tidyclass
```

## Usage

### Sorting a Specific File

To sort a single TypeScript file, run:

```sh
tidyclass path/to/file.ts
```

### Sorting All Files in the Project

If no file is specified, TidyClass will process all TypeScript files in the project:

```sh
tidyclass
```

### Running with Prettier

If you want to format the sorted files with **Prettier**, use the `-p` or `--prettier` option:

```sh
tidyclass -p
```

or

```sh
tidyclass --prettier
```

## Options

| Option           | Description                                                   |
|-----------------|---------------------------------------------------------------|
| `-p, --prettier` | Run Prettier on affected files after sorting    |    
         

## Sorting Order

TidyClass organizes class members in the following structured order:

- Static public variables
- Static private variables
- Static public methods
- Static private methods
- Public instance variables
- Private instance variables
- Constructor (remains in place)
- Public instance methods
- Private instance methods

Each category is sorted alphabetically to ensure consistency. If the class structure changes, TidyClass updates it while maintaining logical order.

## Example

Before running **TidyClass**:

```ts
class Example {
    private helper() {}
    constructor() {}
    public method() {}
}
```

After running **TidyClass**:

```ts
class Example {
    constructor() {}
    public method() {}
    private helper() {}
}
```

## License

Apache 2.0

