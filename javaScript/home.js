const API = {
  allIssues: "https://phi-lab-server.vercel.app/api/v1/lab/issues",
  singleIssue: function (id) {
    return `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`;
  },
  searchIssue: function (searchText) {
    return `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(searchText)}`;
  }
};

const state = {
  allIssues: [],
  visibleIssues: [],
  activeTab: "all",
  searchText: ""
};

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const newIssueBtn = document.getElementById("newIssueBtn");

const allTabBtn = document.getElementById("allTabBtn");
const openTabBtn = document.getElementById("openTabBtn");
const closeTabBtn = document.getElementById("closeTabBtn");

const issuesCount = document.getElementById("issuesCount");
const openCount = document.getElementById("openCount");
const closedCount = document.getElementById("closedCount");
const allIssuesShowing = document.getElementById("allIssuesShowing");

const issueModal = document.getElementById("issueModal");
const modalTitle = document.getElementById("modalTitle");
const modalStatusBadge = document.getElementById("modalStatusBadge");
const modalAuthor = document.getElementById("modalAuthor");
const modalDate = document.getElementById("modalDate");
const modalMarks = document.getElementById("modalMarks");
const modalDescription = document.getElementById("modalDescription");
const modalAssignee = document.getElementById("modalAssignee");
const modalPriority = document.getElementById("modalPriority");

const loadingSpinner = document.getElementById("loadingSpinner");

function showLoading() {
  loadingSpinner.classList.remove("hidden");
  loadingSpinner.classList.add("flex");
}

function hideLoading() {
  loadingSpinner.classList.add("hidden");
  loadingSpinner.classList.remove("flex");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
}
/* ... */
function capitalize(text) {
  if (!text) {
    return "";
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function getPriorityBadgeClass(priority) {
  const value = String(priority).toLowerCase();

  if (value === "high") {
    return "bg-[#FEE2E2] text-[#EF4444]";
  }

  if (value === "medium") {
    return "bg-[#FEF3C7] text-[#F59E0B]";
  }

  return "bg-[#F3F4F6] text-[#9CA3AF]";
}

function getStatusTextClass(status) {
  return String(status).toLowerCase() === "open"
    ? "text-green-600"
    : "text-violet-600";
}

function getCardBorderClass(status) {
  return String(status).toLowerCase() === "open"
    ? "border-t-[3px] border-t-[#22C55E]"
    : "border-t-[3px] border-t-[#A855F7]";
}

function getStatusIcon(status) {
  return String(status).toLowerCase() === "open"
    ? "./assets/open.png"
    : "./assets/closed.png";
}

function getPriorityModalBadge(priority) {
  const value = String(priority).toLowerCase();

  if (value === "high") {
    return `<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#FEE2E2] text-[#EF4444]">HIGH</span>`;
  }

  if (value === "medium") {
    return `<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#FEF3C7] text-[#F59E0B]">MEDIUM</span>`;
  }

  return `<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#F3F4F6] text-[#9CA3AF]">LOW</span>`;
}

function updateTabUI() {
  const tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach(function (button) {
    button.classList.remove("bg-primary", "text-white", "active-tab");
    button.classList.add("bg-base-100", "text-[#64748B]");
  });

  let activeButton = allTabBtn;

  if (state.activeTab === "open") {
    activeButton = openTabBtn;
  } else if (state.activeTab === "closed") {
    activeButton = closeTabBtn;
  }

  activeButton.classList.remove("bg-base-100", "text-[#64748B]");
  activeButton.classList.add("bg-primary", "text-white", "active-tab");
}

function getFilteredIssues(issues) {
  if (state.activeTab === "open") {
    return issues.filter(function (issue) {
      return String(issue.status).toLowerCase() === "open";
    });
  }

  if (state.activeTab === "closed") {
    return issues.filter(function (issue) {
      return String(issue.status).toLowerCase() === "closed";
    });
  }

  return issues;
}

function updateCounts() {
  const source = state.searchText.trim() ? state.visibleIssues : state.allIssues;

  const openIssues = source.filter(function (issue) {
    return String(issue.status).toLowerCase() === "open";
  });

  const closedIssues = source.filter(function (issue) {
    return String(issue.status).toLowerCase() === "closed";
  });

  const filteredIssues = getFilteredIssues(source);

  issuesCount.textContent = `${filteredIssues.length} Issues`;
  openCount.textContent = openIssues.length;
  closedCount.textContent = closedIssues.length;
}

function createLabelHTML(label) {
  const labelText = String(label).toUpperCase();

  let labelClass = "bg-[#FEF2F2] text-[#EF4444]";

  if (String(label).toLowerCase() === "enhancement") {
    labelClass = "bg-[#DCFCE7] text-[#22C55E]";
  } else if (String(label).toLowerCase() === "documentation") {
    labelClass = "bg-[#DBEAFE] text-[#3B82F6]";
  } else if (String(label).toLowerCase() === "good first issue") {
    labelClass = "bg-[#EDE9FE] text-[#8B5CF6]";
  } else if (String(label).toLowerCase() === "help wanted") {
    labelClass = "bg-[#FEF3C7] text-[#F59E0B]";
  }

  return `<span class="inline-flex items-center rounded-full px-2 py-[3px] text-[10px] font-semibold ${labelClass}">${labelText}</span>`;
}

function renderIssues() {
  const source = state.searchText.trim() ? state.visibleIssues : state.allIssues;
  const filteredIssues = getFilteredIssues(source);

  updateCounts();
  updateTabUI();

  if (!filteredIssues.length) {
    allIssuesShowing.innerHTML = `
      <div class="col-span-full">
        <div class="bg-white border border-[#E5E7EB] rounded-md p-8 text-center shadow-sm">
          <h3 class="text-lg font-semibold text-neutral mb-2">No issues found</h3>
          <p class="text-sm text-[#64748B]">Try another search or switch tab.</p>
        </div>
      </div>
    `;
    return;
  }

  allIssuesShowing.innerHTML = filteredIssues
    .map(function (issue) {
      const labelsHTML = Array.isArray(issue.labels)
        ? issue.labels.map(function (label) {
            return createLabelHTML(label);
          }).join("")
        : "";

      return `
        <article
          class="bg-white border border-[#E5E7EB] ${getCardBorderClass(issue.status)} rounded-md p-3 shadow-sm hover:shadow-md transition cursor-pointer min-h-[206px] flex flex-col justify-between"
          data-id="${issue.id}"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <img
                src="${getStatusIcon(issue.status)}"
                alt="${issue.status}"
                class="w-8 h-8 object-contain shrink-0"
              />

              <span class="text-[10px] font-semibold rounded-full px-2 py-[3px] ${getPriorityBadgeClass(issue.priority)}">
                ${String(issue.priority).toUpperCase()}
              </span>
            </div>

            <h3 class="text-[13px] leading-[1.35] font-semibold text-[#111827] mb-1">
              ${issue.title}
            </h3>

            <p class="text-[11px] text-[#64748B] leading-[1.45] mb-3 line-clamp-3">
              ${issue.description}
            </p>

            <div class="flex flex-wrap gap-1.5 mb-4">
              ${labelsHTML}
            </div>
          </div>

          <div class="pt-3 border-t border-[#F1F5F9]">
            <p class="text-[10px] text-[#94A3B8] mb-1">#${issue.id} by ${issue.author}</p>
            <p class="text-[10px] text-[#94A3B8]">${formatDate(issue.createdAt)}</p>
          </div>
        </article>
      `;
    })
    .join("");

  const cards = document.querySelectorAll("[data-id]");

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      const id = card.getAttribute("data-id");
      openIssueModal(id);
    });
  });
}

async function fetchAllIssues() {
  showLoading();

  try {
    const response = await fetch(API.allIssues);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch issues.");
    }

    state.allIssues = Array.isArray(result.data) ? result.data : [];
    state.visibleIssues = [];
    renderIssues();
  } catch (error) {
    allIssuesShowing.innerHTML = `
      <div class="col-span-full">
        <div class="bg-white border border-red-200 rounded-md p-8 text-center shadow-sm">
          <h3 class="text-lg font-semibold text-red-600 mb-2">Failed to load issues</h3>
          <p class="text-sm text-[#64748B]">${error.message}</p>
        </div>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

async function searchIssues() {
  const searchText = searchInput.value.trim();
  state.searchText = searchText;

  if (!searchText) {
    state.visibleIssues = [];
    renderIssues();
    return;
  }

  showLoading();

  try {
    const response = await fetch(API.searchIssue(searchText));
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Search failed.");
    }

    state.visibleIssues = Array.isArray(result.data) ? result.data : [];
    renderIssues();
  } catch (error) {
    allIssuesShowing.innerHTML = `
      <div class="col-span-full">
        <div class="bg-white border border-red-200 rounded-md p-8 text-center shadow-sm">
          <h3 class="text-lg font-semibold text-red-600 mb-2">Search failed</h3>
          <p class="text-sm text-[#64748B]">${error.message}</p>
        </div>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

async function openIssueModal(id) {
  showLoading();

  try {
    const response = await fetch(API.singleIssue(id));
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch issue details.");
    }

    const issue = result.data;

    modalTitle.textContent = issue.title;

    modalStatusBadge.textContent = capitalize(issue.status);
    modalStatusBadge.className = `
      badge text-white px-3 py-3 border-none
      ${String(issue.status).toLowerCase() === "open" ? "bg-green-500" : "bg-violet-500"}
    `;

    modalAuthor.textContent = issue.author || "Unknown";
    modalDate.textContent = formatDate(issue.createdAt);
    modalDescription.textContent = issue.description || "No description provided.";
    modalAssignee.textContent = issue.assignee || "Unassigned";
    modalPriority.innerHTML = getPriorityModalBadge(issue.priority);

    modalMarks.innerHTML = "";

    if (Array.isArray(issue.labels) && issue.labels.length) {
      modalMarks.innerHTML = issue.labels.map(function (label) {
        return createLabelHTML(label);
      }).join("");
    }

    issueModal.showModal();
  } catch (error) {
    alert(error.message);
  } finally {
    hideLoading();
  }
}

function handleTabChange(tabName) {
  state.activeTab = tabName;
  renderIssues();
}

function addEventListeners() {
  allTabBtn.addEventListener("click", function () {
    handleTabChange("all");
  });

  openTabBtn.addEventListener("click", function () {
    handleTabChange("open");
  });

  closeTabBtn.addEventListener("click", function () {
    handleTabChange("closed");
  });

  searchBtn.addEventListener("click", function () {
    searchIssues();
  });

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchIssues();
    }
  });

  searchInput.addEventListener("input", function () {
    if (!searchInput.value.trim()) {
      state.searchText = "";
      state.visibleIssues = [];
      renderIssues();
    }
  });

  newIssueBtn.addEventListener("click", function () {
    alert("New Issue form is not connected yet.");
  });
}

function init() {
  addEventListeners();
  fetchAllIssues();
}

init();