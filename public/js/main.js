// DOM ELEMENTS =============================================
const tradeButtons = document.getElementsByClassName("trade-button");
const acceptButtons = document.getElementsByClassName("accept-button");
const rejectButtons = document.getElementsByClassName("reject-button");
const deleteTradeButtons = document.getElementsByClassName("delete-trade-button");
const deleteItemButtons = document.getElementsByClassName("delete-item-button");
const commentForms = document.getElementsByClassName("comment-form");

// SEND TRADE =============================================
Array.from(tradeButtons).forEach(function(element) {
  element.addEventListener("click", async function() {
    const requestedItemId = this.dataset.request;
    const message = prompt("Message to the owner:", "Want to trade?");
    const offeredItemId = prompt("Enter the ID of an item you want to offer (optional):");

    try {
      const res = await fetch("/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedItemId, offeredItemId, message })
      });
      const data = await res.json();
      alert(data.success ? "Trade sent!" : data.error);
    } catch (err) {
      console.error(err);
    }
  });
});

// ACCEPT TRADE =============================================
Array.from(acceptButtons).forEach(function(element) {
  element.addEventListener("click", async function() {
    const id = this.dataset.id;
    try {
      await fetch(`/trades/${id}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  });
});

// REJECT TRADE =============================================
Array.from(rejectButtons).forEach(function(element) {
  element.addEventListener("click", async function() {
    const id = this.dataset.id;
    try {
      await fetch(`/trades/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  });
});

// DELETE TRADE =============================================
Array.from(deleteTradeButtons).forEach(function(element) {
  element.addEventListener("click", async function() {
    const id = this.dataset.id;

    if (!confirm("Delete this trade? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/trades/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        alert("Trade deleted");
        window.location.reload();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  });
});

// DELETE ITEM =============================================
Array.from(deleteItemButtons).forEach(function(element) {
  element.addEventListener("click", function() {
    const card = this.closest(".market-card");
    const id = card.dataset.id;

    if (!confirm("Are you sure you want to delete this item?")) return;

    fetch("/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        card.remove();
      } else {
        alert(data.error || "Failed to delete item");
      }
    })
    .catch(err => console.error(err));
  });
});

// COMMENT SUBMISSION =============================================
Array.from(commentForms).forEach(function(form) {
  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const id = this.dataset.id;
    const message = this.message.value;

    try {
      const res = await fetch(`/item/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (data.success) {
        const ul = this.closest(".market-card").querySelector(".comments-list");
        const li = document.createElement("li");
        li.innerHTML = `<strong>${data.user}</strong>: ${data.message}`;
        ul.appendChild(li);
        this.reset();
      }
    } catch (err) {
      console.error(err);
    }
  });
});

// Citations:
// Modified code from youtube tutorial: https://www.youtube.com/watch?v=z5UgtXOxEEk
// Reference code from https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial#setting-up-the-project
// Use of dotenv package to hide sensitive info: https://www.npmjs.com/package/dotenv
// Use of Learning Mode on AI tools to help with code structure, syntax, and debugging
