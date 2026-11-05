// Lab 7: frontend navigation and BERT API request

// Set this after deploying the Python backend.
// Example: "https://your-app-name.onrender.com/answer"
const API_URL = "YOUR_BACKEND_URL/answer";

const bodyPage = document.querySelector(".body-grid");
const qaPage = document.getElementById("qaPage");
const navLinks = document.querySelectorAll(".nav-link");

const contextInput = document.getElementById("contextInput");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const clearButton = document.getElementById("clearButton");
const qaStatus = document.getElementById("qaStatus");
const answerOutput = document.getElementById("answerOutput");
const confidenceOutput = document.getElementById("confidenceOutput");

// Switch between the original dashboard and the QA page.
navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        const page = link.dataset.page;
        const showQA = page === "qa";

        bodyPage.classList.toggle("qa-mode", showQA);
        qaPage.hidden = !showQA;

        navLinks.forEach((item) => item.classList.toggle("active", item === link));
    });
});

// Send context and question to the FastAPI backend.
askButton.addEventListener("click", async () => {
    const context = contextInput.value.trim();
    const question = questionInput.value.trim();

    if (!context || !question) {
        qaStatus.textContent = "Please enter both a passage and a question.";
        return;
    }

    if (API_URL.startsWith("YOUR_BACKEND_URL")) {
        qaStatus.textContent = "The interface is ready. Deploy the Python backend and set API_URL in script.js to activate BERT.";
        return;
    }

    askButton.disabled = true;
    qaStatus.textContent = "BERT is reading the passage...";
    answerOutput.textContent = "Processing...";
    confidenceOutput.textContent = "";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ context, question })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "The server could not process the question.");
        }

        answerOutput.textContent = data.answer || "No answer found in the supplied context.";
        confidenceOutput.textContent = data.score == null
            ? ""
            : "Model score: " + Number(data.score).toFixed(4);
        qaStatus.textContent = "Answer received.";
    } catch (error) {
        qaStatus.textContent = "Request failed: " + error.message;
    } finally {
        askButton.disabled = false;
    }
});

// Reset the inputs and result.
clearButton.addEventListener("click", () => {
    contextInput.value = "";
    questionInput.value = "";
    answerOutput.textContent = "Your answer will appear here.";
    confidenceOutput.textContent = "";
    qaStatus.textContent = "Enter a passage and a question to begin.";
});
