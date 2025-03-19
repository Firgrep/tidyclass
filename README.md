# tidyclass

🧹 **tidyclass** - A CLI tool to automatically sort TypeScript class members in a structured order.

## Installation

You can install tidyclass globally or use it as a local dependency in your project.

```sh
npm install -g tidyclass
```

or

```sh
npm install --save-dev tidyclass
```

## Usage

> [!TIP]
>
> It's recommended to commit your work before running the script.

> [!NOTE]
>
> If you installed locally to your project, use `npx tidyclass`.

To sort a single TypeScript file, run:

```sh
tidyclass path/to/file.ts
```

If no file is specified, tidyclass will process all TypeScript files in the project:

```sh
tidyclass
```

If you want to format the sorted files with **Prettier**, use the `-p` or `--prettier` option:

```sh
tidyclass -p
```


## Options

| Option           | Description                                                   |
|-----------------|---------------------------------------------------------------|
| `-p, --prettier` | Run Prettier on affected files after sorting    |    
         

## Sorting Order

Tidyclass organizes class members in the following structured order:

1. Static public variables
1. Static private variables
1. Static public methods
1. Static private methods
1. Public instance variables
1. Private instance variables
1. Constructor
1. Public instance methods
1. Private instance methods

Each category is sorted alphabetically to ensure consistency. If the class structure changes, tidyclass updates it while maintaining logical order.

## Example

Before running **tidyclass**:

```ts
class MyClass {
    public rivetingFunc() {}
    private instanceVarB = 2;
    static private staticFuncB() {}
    public instanceVarA = 1;
    private funcX() {}
    private static staticVarB = 20;
    private static staticVarA = 10;
    public static staticFuncAA() {}
    static public staticVarAB = 5;
    private funcC() {}
    public funcA() {}
    constructor() {}
    static private staticFuncA() {}
}
```

After running **tidyclass** (with formatting on):

```ts
class MyClass {
    public static staticVarAB = 5;
    private static staticVarA = 10;
    private static staticVarB = 20;

    public static staticFuncAA() {}

    private static staticFuncA() {}

    private static staticFuncB() {}

    public instanceVarA = 1;
    private instanceVarB = 2;

    constructor() {}

    public funcA() {}

    public rivetingFunc() {}

    private funcC() {}

    private funcX() {}
}
```

## License

Apache 2.0
