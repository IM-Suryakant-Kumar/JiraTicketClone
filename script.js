const addBtn = document.querySelector(".add-btn");
const removeBtn = document.querySelector(".remove-btn");
const modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textareaCont = document.querySelector(".textarea-cont");
const allPriorityColors = document.querySelectorAll(".priority-color");
const toolBoxColors = document.querySelectorAll(".color");

const colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1];

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if (localStorage.getItem("jira_tickets")) {
  // Retrieve and display tickets
  ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
  ticketsArr.forEach((ticketObj, idx) => {
    createTicket(
      ticketObj.ticketColor,
      ticketObj.ticketTask,
      ticketObj.ticketID
    );
  });
}

for (let i = 0; i < toolBoxColors.length; i++) {
  toolBoxColors[i].addEventListener("click", (e) => {
    let currentToolBoxColor = toolBoxColors[i].classList[0];

    const filteredTickets = ticketsArr.filter((ticketObj, idx) => {
      return currentToolBoxColor === ticketObj.ticketColor;
    });

    // Remove previous tickets
    const allTicketsCont = document.querySelectorAll(".ticket-cont");
    for (let i = 0; i < allTicketsCont.length; i++) {
      allTicketsCont[i].remove();
    }

    // Display new fitered tickets
    filteredTickets.forEach((ticketObj, idx) => {
      createTicket(
        ticketObj.ticketColor,
        ticketObj.ticketTask,
        ticketObj.ticketID
      );
    });
  });

  toolBoxColors[i].addEventListener("dblclick", (e) => {
    // Remove previous tickets
    const allTicketsCont = document.querySelectorAll(".ticket-cont");
    for (let i = 0; i < allTicketsCont.length; i++) {
      allTicketsCont[i].remove();
    }

    ticketsArr.forEach((ticketObj, idx) => {
      createTicket(
        ticketObj.ticketColor,
        ticketObj.ticketTask,
        ticketObj.ticketID
      );
    });
  });
}

// Listenter for modal priority coloring
allPriorityColors.forEach((colorElem, idx) => {
  colorElem.addEventListener("click", (e) => {
    allPriorityColors.forEach((priorityColorElem, idx) => {
      priorityColorElem.classList.remove("boder");
    });
    colorElem.classList.add("boder");

    modalPriorityColor = colorElem.classList[0];
  });
});

addBtn.addEventListener("click", (e) => {
  // Display Modal
  // Generate Ticket

  // AddFlag = true -> Modal Display
  // AddFlag = false -> Modal none
  addFlag = !addFlag;
  if (addFlag) {
    modalCont.style.display = "flex";
  } else {
    modalCont.style.display = "none";
  }
});
removeBtn.addEventListener("click", (e) => {
  removeFlag = !removeFlag;
});

modalCont.addEventListener("keydown", (e) => {
  let key = e.key;
  console.log(key);
  if (key === "Shift") {
    createTicket(modalPriorityColor, textareaCont.value);
    addFlag = false;
    setModalToDefault();
  }
});

function createTicket(ticketColor, ticketTask, ticketID) {
  let id = ticketID || shortid();
  let ticketCont = document.createElement("div");
  ticketCont.setAttribute("class", "ticket-cont");
  ticketCont.innerHTML = `
            <div class="ticket-color ${ticketColor}"></div>
            <div class="ticket-id">#${id}</div>
            <div spellcheck="false" class="task-area">${ticketTask}</div>
            <div class="ticket-lock">
                <i class="fa-solid fa-lock"></i>
            </div>
  `;
  mainCont.appendChild(ticketCont);

  // Create obj of tickets and add to array
  if (!ticketID) {
    ticketsArr.push({ ticketColor, ticketTask, ticketID: id });
    localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
  }

  handleRemoval(ticketCont, id);
  handleLock(ticketCont, id);
  handleColor(ticketCont, id);
}

function handleRemoval(ticket, id) {
  ticket.addEventListener("click", (e) => {
    // Get ticketIdx from tickets array
    let idx = getTicketIdx(id);

    // removeFlag - true -> remove
    if (!removeFlag) return;
    ticket.remove();
    ticketsArr.splice(idx, 1);
    localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
  });
}

function handleLock(ticket, id) {
  let ticketLockElem = ticket.querySelector(".ticket-lock");
  let ticketLock = ticketLockElem.children[0];
  let ticketTaskArea = ticket.querySelector(".task-area");
  ticketLock.addEventListener("click", (e) => {
    let ticketIdx = getTicketIdx(id);

    if (ticketLock.classList.contains(lockClass)) {
      ticketLock.classList.remove(lockClass);
      ticketLock.classList.add(unlockClass);
      ticketTaskArea.setAttribute("contentEditable", "true");
    } else {
      ticketLock.classList.add(lockClass);
      ticketLock.classList.remove(unlockClass);
      ticketTaskArea.setAttribute("contentEditable", "false");
    }

    // Modify data in localStorage (Ticket Task)
    ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
    localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
  });
}

function handleColor(ticket, id) {
  let ticketColor = ticket.querySelector(".ticket-color");
  ticketColor.addEventListener("click", (e) => {
    // Get ticketIdx from tickets array
    let ticketIdx = getTicketIdx(id);

    let currentTicketColor = ticketColor.classList[1];
    // Get ticket color idx
    let currentTicketColorIdx = colors.findIndex((color) => {
      return currentTicketColor === color;
    });
    currentTicketColorIdx++;
    let newTicketColorIdx = currentTicketColorIdx % colors.length;
    let newTicketColor = colors[newTicketColorIdx];
    ticketColor.classList.remove(currentTicketColor);
    ticketColor.classList.add(newTicketColor);

    // Modify data in localStorage (PriorityColor Change)
    ticketsArr[ticketIdx].ticketColor = newTicketColor;
    localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
  });
}

function getTicketIdx(id) {
  let ticketIdx = ticketsArr.findIndex((ticketObj) => {
    return ticketObj.ticketID === id;
  });

  //   console.log(ticketIdx);
  return ticketIdx;
}

function setModalToDefault() {
  modalCont.style.display = "none";
  textareaCont.value = "";
  modalPriorityColor = colors[colors.length - 1];
  allPriorityColors.forEach((priorityColorElem, idx) => {
    priorityColorElem.classList.remove("boder");
  });
  allPriorityColors[allPriorityColors.length - 1].classList.add("boder");
}
