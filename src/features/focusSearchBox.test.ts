/// <reference lib="deno.ns" />
/// <reference types="@types/chrome" />

import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertSpyCalls, type Spy, spy } from "@std/testing/mock";

import { __test__focus as focus } from "./focusSearchBox.ts";
import { ElementIds } from "../constants/focusSearchBox.ts";

type ElementId = (typeof ElementIds)[keyof typeof ElementIds];

const getUniqueElementIds = (): ElementId[] => {
  return [...new Set(Object.values(ElementIds))];
};

class MockElement {
  focus = () => {};
}

class MockDocument {
  private elements: Record<string, MockElement> = Object.fromEntries(
    getUniqueElementIds().map((id) => [id, new MockElement()]),
  );

  getElementById(id: ElementId): MockElement | null {
    return this.elements[id] || null;
  }
}

const mockDocument = new MockDocument();
globalThis.document = mockDocument as unknown as Document;

describe("focus function", () => {
  let elementSpies: Record<string, Spy> = {};

  const getElementSpy = (id: ElementId): Disposable & { elementSpy: Spy } => {
    const elementSpy = spy(mockDocument.getElementById(id)!, "focus");

    return {
      elementSpy,
      [Symbol.dispose]: () => {
        elementSpy.restore();
      },
    };
  };

  beforeEach(() => {
    elementSpies = Object.fromEntries(
      getUniqueElementIds().map((id) => {
        return [id, getElementSpy(id).elementSpy];
      }),
    );
  });

  afterEach(() => {
    // テスト後のクリーンアップ
    Object.values(elementSpies).forEach((spy) => spy?.restore());
  });

  const assertOnlyElementFocused = (expectedElementId: string | null) => {
    Object.values(ElementIds).forEach((elementId) => {
      assertSpyCalls(
        elementSpies[elementId],
        elementId === expectedElementId ? 1 : 0,
      );
    });
  };

  describe("<author>/<repository>", () => {
    it("issues pageで正しいIDの要素にフォーカスする", () => {
      focus("https://github.com/user/repo/issues");
      assertOnlyElementFocused(ElementIds.authorRepositoryIssues);
    });

    it("pulls pageで正しいIDの要素にフォーカスする", () => {
      focus("https://github.com/user/repo/pulls");
      assertOnlyElementFocused(ElementIds.authorRepositoryPulls);
    });

    it("projects pageで正しいIDの要素にフォーカスする", () => {
      focus("https://github.com/user/repo/projects");
      assertOnlyElementFocused(ElementIds.authorRepositoryProjects);
    });
  });

  describe("<author>?params", () => {
    it("repositories tabで正しいIDの要素にフォーカスする", () => {
      focus("https://github.com/user?tab=repositories");
      assertOnlyElementFocused(ElementIds.authorRepositories);
    });

    it("projects tabで正しいIDの要素にフォーカスする", () => {
      focus("https://github.com/user?tab=projects");
      assertOnlyElementFocused(ElementIds.authorProjects);
    });

    it("stars tabで正しいIDの要素にフォーカスする", () => {
      focus("https://github.com/user?tab=stars");
      assertOnlyElementFocused(ElementIds.authorStars);
    });
  });

  describe("動作しないURLパターン", () => {
    it("不正なURLの場合", () => {
      focus("https://github.com/invalid/path");
      assertOnlyElementFocused(null);
    });

    it("要素が存在しない場合", () => {
      globalThis.document = {
        getElementById: () => null,
      } as unknown as Document;
      focus("https://github.com/user/repo/issues");
      assertOnlyElementFocused(null);
    });
  });
});
