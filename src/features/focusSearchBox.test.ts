/// <reference lib="deno.ns" />
/// <reference types="@types/chrome" />

import { describe, it } from "@std/testing/bdd";
import { assertSpyCalls, type Spy, spy } from "@std/testing/mock";

import { ClassNames, ElementIds } from "../constants/focusSearchBox.ts";
import { __test__focus as focus } from "./focusSearchBox.ts";

type ElementId = (typeof ElementIds)[keyof typeof ElementIds];
type ClassName = (typeof ClassNames)[keyof typeof ClassNames];

const getUniqueElementIds = (): ElementId[] => {
  return [...new Set(Object.values(ElementIds))];
};

const getUniqueClassNames = (): ClassName[] => {
  return [...new Set(Object.values(ClassNames))];
};

const createMockElement = () => ({
  focus: () => {},
});

const createMockDocument = () => {
  const elements: Record<string, ReturnType<typeof createMockElement>> = Object.fromEntries(
    getUniqueElementIds().map((id) => [id, createMockElement()]),
  );
  const classByElements: Record<string, ReturnType<typeof createMockElement>> = Object.fromEntries(
    getUniqueClassNames().map((className) => [className, createMockElement()]),
  );

  return {
    getElementById: (id: ElementId) => elements[id] || null,
    querySelector: (selector: string) => {
      const className = selector.replace(".", "");
      return classByElements[className] || null;
    },
  };
};

const createTestContext = (): Disposable & {
  assertOnlyElementFocused: (
    expectedElementId: string | null,
    expectedClassName?: string | null,
  ) => void;
} => {
  const mockDocument = createMockDocument();
  const originalDocument = globalThis.document;
  globalThis.document = mockDocument as unknown as Document;

  const elementSpies: Record<string, Spy> = Object.fromEntries(
    getUniqueElementIds().map((id) => {
      const element = mockDocument.getElementById(id);
      return [id, spy(element!, "focus")];
    }),
  );
  
  const classSpies: Record<string, Spy> = Object.fromEntries(
    getUniqueClassNames().map((className) => {
      const element = mockDocument.querySelector(`.${className}`);
      return [className, spy(element!, "focus")];
    }),
  );

  const assertOnlyElementFocused = (
    expectedElementId: string | null,
    expectedClassName: string | null = null,
  ) => {
    Object.values(ElementIds).forEach((elementId) => {
      assertSpyCalls(
        elementSpies[elementId],
        elementId === expectedElementId ? 1 : 0,
      );
    });
    Object.values(ClassNames).forEach((className) => {
      assertSpyCalls(
        classSpies[className],
        className === expectedClassName ? 1 : 0,
      );
    });
  };

  return {
    assertOnlyElementFocused,
    [Symbol.dispose]: () => {
      Object.values(elementSpies).forEach((spy) => spy?.restore());
      Object.values(classSpies).forEach((spy) => spy?.restore());
      globalThis.document = originalDocument;
    },
  };
};

describe("repository pages", () => {
  it("should focus issues search box", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/user/repo/issues");
    
    // Assert
    ctx.assertOnlyElementFocused(ElementIds.authorRepositoryIssues);
  });

  it("should focus pull requests search box", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/user/repo/pulls");
    
    // Assert
    ctx.assertOnlyElementFocused(ElementIds.authorRepositoryPulls);
  });

  it("should focus projects search box", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/user/repo/projects");
    
    // Assert
    ctx.assertOnlyElementFocused(ElementIds.authorRepositoryProjects);
  });
});

describe("author profile tabs", () => {
  it("should focus repositories tab search box", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/user?tab=repositories");
    
    // Assert
    ctx.assertOnlyElementFocused(ElementIds.authorRepositories);
  });

  it("should focus projects tab search box", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/user?tab=projects");
    
    // Assert
    ctx.assertOnlyElementFocused(ElementIds.authorProjects);
  });

  it("should focus stars tab search box", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/user?tab=stars");
    
    // Assert
    ctx.assertOnlyElementFocused(ElementIds.authorStars);
  });
});

describe("organization pages", () => {
  it("should focus repository search in org repositories page", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/orgs/myorg/repositories");
    
    // Assert
    ctx.assertOnlyElementFocused(ElementIds.orgRepositories);
  });

  it("should focus security overview search box", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/orgs/myorg/security/overview");
    
    // Assert
    ctx.assertOnlyElementFocused(ElementIds.orgSecurityOverview);
  });
});

describe("organization subnav pages", () => {
  it("should focus subnav search for teams page", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/orgs/myorg/teams");
    
    // Assert
    ctx.assertOnlyElementFocused(null, ClassNames.subnavSearch);
  });

  it("should focus subnav search for people page", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/orgs/myorg/people");
    
    // Assert
    ctx.assertOnlyElementFocused(null, ClassNames.subnavSearch);
  });

  it("should focus subnav search for insights/dependencies page", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/orgs/myorg/insights/dependencies");
    
    // Assert
    ctx.assertOnlyElementFocused(null, ClassNames.subnavSearch);
  });
});

describe("error handling", () => {
  it("should handle invalid URL patterns gracefully", () => {
    // Arrange
    using ctx = createTestContext();
    
    // Act
    focus("https://example.com/invalid/path");
    
    // Assert
    ctx.assertOnlyElementFocused(null);
  });

  it("should handle missing DOM elements gracefully", () => {
    // Arrange
    const originalDocument = globalThis.document;
    try {
      globalThis.document = {
        getElementById: () => null,
        querySelector: () => null,
      } as unknown as Document;

      // Act
      focus("https://example.com/user/repo/issues");
      
      // Assert
      // No assertions needed - just ensure no errors are thrown
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
