const tilForm = document.querySelector("#til-form");
const tilList = document.querySelector("#til-list");
const tilDateInput = document.querySelector("#til-date");
const tilTitleInput = document.querySelector("#til-title");
const tilContentInput = document.querySelector("#til-content");

function formatDateLabel(dateValue) {
  return dateValue;
}

function createTilItem(date, title, content) {
  const tilItem = document.createElement("article");
  tilItem.className = "til-item";

  const time = document.createElement("time");
  time.setAttribute("datetime", date);
  time.textContent = formatDateLabel(date);

  const heading = document.createElement("h3");
  heading.textContent = `학습 주제: ${title}`;

  const paragraph = document.createElement("p");
  paragraph.textContent = content;

  tilItem.append(time, heading, paragraph);

  return tilItem;
}

if (tilDateInput) {
  tilDateInput.value = new Date().toISOString().split("T")[0];
}

if (tilForm && tilList && tilDateInput && tilTitleInput && tilContentInput) {
  tilForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const date = tilDateInput.value;
    const title = tilTitleInput.value.trim();
    const content = tilContentInput.value.trim();

    if (!date || !title || !content) {
      return;
    }

    const newTilItem = createTilItem(date, title, content);
    tilList.prepend(newTilItem);
    tilForm.reset();
    tilDateInput.value = new Date().toISOString().split("T")[0];
    tilTitleInput.focus();
  });
}
