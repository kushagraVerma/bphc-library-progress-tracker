async function dropdownHTML(i,stat){
  const dropItems = Object.keys(STATUS).map(
    key => `<li><a data-id="${i}" href="#!">${STATUS[key]}</a></li>`
  );
  return `<td>
  <div class="dropdown">
  <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu${i}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
  ${stat}
    <span class="caret"></span>
  </button>
  <ul class="dropdown-menu" aria-labelledby="dropdownMenu${i}">
    ${dropItems.join('\n')}
  </ul>
  </div>
  </td>`;

}
const table = document.querySelector("table.panel-body")
if(table){
  onTable(table);
}

async function onTable(table){
  const paperCollID = getPaperCollectionId();
  const existingPapers = await getExistingPapers(paperCollID);
  let statuses = {};
  for(let key of Object.keys(existingPapers)){
    statuses[key] = existingPapers[key].status;
  }
  const rows = table.querySelectorAll("tr:not(:first-child)");
  rows.forEach(async (row,i) => {
    const stat = statuses[i]!=undefined? statuses[i] : "Status"
    const dropTxt = await dropdownHTML(i,stat);
    row.insertAdjacentHTML("beforeend",dropTxt); 
  });

  table.addEventListener("click", handleClick);
}
function handleClick({target}){
  if(isDropdownElt(target)){
    updateUIFromDropdownOpt(target);
    saveStatusFromDropdownOpt(target);
  }
}
async function saveStatusFromDropdownOpt(target){
  const name = getCollectionName();
  const paperCollID = getPaperCollectionId();
  const paperID = target.getAttribute("data-id");
  const status = target.innerText;
  const title = getPaperName(paperID);
  const existingPapers = await getExistingPapers(paperCollID);

  let papers;

  if(status==="Clear"){
    delete existingPapers[paperID];
    papers = {...existingPapers};
  }else{
    papers = {
      ...existingPapers,
      [paperID] : {
        status,
        title,
        lastUpd: Date.now()
      }
    };
  }

  chrome.storage.local.set({
    [paperCollID] : {name,papers}
  }); 
}
async function getExistingPapers(id){
  const loc = await chrome.storage.local.get(id);
  if(loc && loc[id]){
    return loc[id].papers;
  }else{
    return {};
  }
}
function updateUIFromDropdownOpt(target) {
  const id = target.getAttribute("data-id");
  const dropButt = document.getElementById(`dropdownMenu${id}`);
  dropButt.innerHTML = target.innerText + ` <span class="caret"></span>`;
}
function isDropdownElt(target){
  return target.tagName === "A" && target.hasAttribute("data-id");
}

/**
 * Get the paper (PDF) title name from corresponding row.
 * @param {number} id Dropdown id
 */
function getPaperName(id) {
  const button = document.getElementById(`dropdownMenu${id}`);
  //get parent row (tr) from button
  const row = button.parentElement.parentElement.parentElement;
  //the title is in the first child of this row
  const title = row.children[0].innerText;
  return title;
}
/**
 * Get the collection name from the page header info.
 * @returns {string}
 */
function getCollectionName() {
  const table = document.querySelector("table.itemDisplayTable");
  return table.querySelector("tbody tr:first-child td:last-child").innerText;
}

function getPaperCollectionId() {
  const pathname = (new URL(window.location.href)).pathname;
  return pathname.split("/")[4];
}
function getClass(label) {
  console.log("Getting class for", label)
  switch (label) {
    case "Clear":
    case "Status":
      return "btn-default";
    case "To solve":
      return "btn-danger";
    case "Solving":
      return "btn-warning";
    case "Done":
      return "btn-success";
    default:
      return "btn-default";
  }
}