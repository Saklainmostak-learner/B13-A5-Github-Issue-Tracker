const API={
    allIssues:"https://phi-lab-server.vercel.app/api/v1/lab/issues",
    singleIssue:(id) =>`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`,
    searchIssue:(text)=>`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`
}
const issues={
    allIssues:[],
    visibleIssues:[],
    activeTab: "all",
    search: "",
};
 const searchInput=document.getElementById("searchInput");
 const allTabBtn=document.getElementById("allTabBtn");
 const openTabBtn=document.getElementById("openTabBtn");
