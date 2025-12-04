const generatorsRegistry = {
  // ------------------ REACT ------------------
  react: {
    default: () => "",

    rafce: ({ name = "App" } = {}) =>
`import React from "react";

const ${name} = () => {
  return (
    <div>
      ${name}
    </div>
  );
};

export default ${name};
`,

    rfc: ({ name = "App" } = {}) =>
`import React from "react";

export function ${name}() {
  return (
    <div>
      ${name}
    </div>
  );
}
`,

    rcc: ({ name = "App" } = {}) =>
`import React, { Component } from "react";

class ${name} extends Component {
  render() {
    return (
      <div>
        ${name}
      </div>
    );
  }
}

export default ${name};
`
  },

  // ------------------ JAVASCRIPT ------------------
  js: {
    default: () => "",

    script: () =>
`"use strict";

(function () {

})();`,

    module: () =>
`export default function main() {

}`
  },

  // ------------------ TYPESCRIPT ------------------
  ts: {
    default: () => "",

    script: () =>
`"use strict";

((): void => {

})();`,

    module: () =>
`export default function main(): void {

}`
  },

  // ------------------ PYTHON ------------------
  python: {
    default: () => "",

    main: () =>
`def main():
    pass


if __name__ == "__main__":
    main()
`,

    module: () =>
`def func():
    pass
`
  },

  // ------------------ CPP ------------------
  cpp: {
    default: () => "",

    main: () =>
`#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`,

    header: () =>
`#pragma once
`
  },

  // ------------------ JAVA ------------------
  java: {
    default: () => "",

    main: ({ name = "Main" } = {}) =>
`public class ${name} {
    public static void main(String[] args) {

    }
}
`,

    class: ({ name = "MyClass" } = {}) =>
`public class ${name} {

}
`
  }
};

module.exports = generatorsRegistry;
