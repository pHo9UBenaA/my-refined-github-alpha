export const focusSearchBox = async (): Promise<void> => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.id || !tab?.url) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: focus,
    args: [tab.url],
  });
};

const focus = (urlString: string): void => {
  // スコープ外で定義すると`not defined`になる
  const SearchBoxId = {
    repoIssues: "repository-input",
    repoPulls: "js-issues-search",
    repoProjects: "project-search-input",
  } as const;

  const url = new URL(urlString);
  let searchBoxId: string | null = null;

  // <author>/<repository>/issues
  if (url.pathname.endsWith("/issues")) {
    searchBoxId = SearchBoxId.repoIssues;
  }

  // <author>/<repository>/pulls
  if (url.pathname.endsWith("/pulls")) {
    searchBoxId = SearchBoxId.repoPulls;
  }

  // <author>/<repository>/projects
  if (url.pathname.endsWith("/projects")) {
    searchBoxId = SearchBoxId.repoProjects;
  }

  if (!searchBoxId) {
    return;
  }

  const searchBox = document.getElementById(searchBoxId);
  searchBox?.focus();
};
