
// Select specific elements
const theme = document.body;
const toggleButton = document.getElementById("toggle-button");
const addButton = document.getElementById("add-book");
const text = document.querySelector(".themeToggle");
const newId = document.getElementById("new-id");
const title = document.querySelectorAll(".bookTitle");
const newColor = document.querySelectorAll(".newColor");
const yellowLink = document.querySelectorAll(".yellow");
const sort = document.querySelector(".sort-by");

// Save colors to local storage
localStorage.setItem("darkTheme", "#1f242d");
localStorage.setItem("white", "#fff");
localStorage.setItem("lightTheme", "#f5f5f5");
localStorage.setItem("black", "#000");
localStorage.setItem("gray", "#555");
localStorage.setItem("deepBlue", "#483d8b");
localStorage.setItem("green", "#3cb371");
localStorage.setItem("lightGray", "#d3d3d3");
localStorage.setItem("yellow", "#ffff00");
localStorage.setItem("teal", "#008080");

// Retrieve saved colors from local storage
const darkTheme = localStorage.getItem("darkTheme");
const white = localStorage.getItem("white");
const lightTheme = localStorage.getItem("lightTheme");
const black = localStorage.getItem("black");
const gray = localStorage.getItem("gray");
const deepBlue = localStorage.getItem("deepBlue");
const green = localStorage.getItem("green");
const lightGray = localStorage.getItem("lightGray");
const yellow = localStorage.getItem("yellow");
const teal = localStorage.getItem("teal");



// Function to apply theme
function applyTheme (themeMode) {
    if (themeMode === "dark") {
        toggleButton.classList.remove("bx-toggle-left");
        toggleButton.classList.add("bx-toggle-right");
        
        theme.style.backgroundColor = darkTheme;
        theme.style.color = white;
        title.forEach(book => {
            book.style.color = green;
        });
        newColor.forEach(link => {
            link.style.color = lightGray;
        });
        yellowLink.forEach(l => {
            l.style.color = yellow;
        });
        sort.style.color = teal;
    } else {
        toggleButton.classList.remove("bx-toggle-right");
        toggleButton.classList.add("bx-toggle-left");

        theme.style.backgroundColor = lightTheme;
        theme.style.color = black;
        title.forEach(book => {
            book.style.color = deepBlue;
        });
        newColor.forEach(link => {
            link.style.color = gray;
        });
        yellowLink.forEach(l => {
            l.style.color = deepBlue;
        });
        sort.style.color = black;
    }
}

// Toggle button
toggleButton.addEventListener("click", () => {
    let currentTheme = localStorage.getItem("selectedTheme") || "light"; //Sets the default to Light Mode
    let newTheme = currentTheme === "light" ? "dark" : "light"; //Toggles the Theme modes

    localStorage.setItem("selectedTheme", newTheme); // Save new theme
    applyTheme(newTheme); // Apply the new theme
});




// Back to Top button
const button = document.getElementById("back-to-top");

window.onscroll = function() { scrollFunction() };

button.addEventListener("click", () => {
    topButton();
});

//Function to display or remove button based on condition.
function scrollFunction() {

    if (document.body.scrollTop > 800 || document.documentElement.scrollTop > 800) {
        // button.classList.add("active");
        button.style.display = "block";
    } else {
        // button.classList.remove("active");
        button.style.display = "none";
    }
}

//Function to go back to the top
function topButton() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// Check local storage for saved theme on page load
const savedTheme = localStorage.getItem("selectedTheme");
if (savedTheme) {
    applyTheme (savedTheme);
};




// function isValidDate (dateString) {
//     const [year, month, day] = dateString.split('/').map(Number);
//     const date = new Date(year, month - 1, day);

//     return (
//         date.getFullYear() === year &&
//         date.getMonth() + 1 === month &&
//         date.getDate() === day
//     );
// }

// function validateDate() {
//     const dateInput = document.getElementById('dateInput').value;
//     const errorMessage = document.getElementById('errorMessage');

//     const datePattern = /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;

//     if (!datePattern.test(dateInput)) {
//         errorMessage.textContent = "Please enter a valid date in the required format!";
//         return false;
//     } else if (!isValidDate(dateInput)) {
//         errorMessage.textContent = "Please enter a valid Calender date!";
//         return false;
//     } else {
//         errorMessage.textContent = "";
//         return true;
//     }
// }