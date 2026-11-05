// Lab 7: browser-based BERT question answering (no Python server needed)

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

// Load the model only once; the browser can cache it for later visits.
let answerer = null;

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        const showQA = link.dataset.page === "qa";
        bodyPage.classList.toggle("qa-mode", showQA);
        qaPage.hidden = !showQA;
        navLinks.forEach((item) => item.classList.toggle("active", item === link));
    });
});

askButton.addEventListener("click", async () => {
    const context = contextInput.value.trim();
    const question = questionInput.value.trim();

    if (!context || !question) {
        qaStatus.textContent = "Please enter both a passage and a question.";
        return;
    }

    askButton.disabled = true;
    answerOutput.textContent = "Loading model...";
    confidenceOutput.textContent = "";

    try {
        if (!answerer) {
            qaStatus.textContent = "Downloading the question-answering model. The first load may take a few minutes...";
            const { pipeline } = await import(
                "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2"
            );
            answerer = await pipeline(
                "question-answering",
                "Xenova/distilbert-base-cased-distilled-squad",
                { dtype: "q8" }
            );
        }

        qaStatus.textContent = "The model is reading your passage...";
        const result = await answerer(question, context);

        answerOutput.textContent = result.answer || "No clear answer found in the supplied passage.";
        confidenceOutput.textContent = result.score == null
            ? ""
            : "Model confidence score: " + Number(result.score).toFixed(4);
        qaStatus.textContent = "Answer generated successfully in your browser.";
    } catch (error) {
        console.error(error);
        qaStatus.textContent = "Could not load or run the model: " + error.message;
        answerOutput.textContent = "Please check your internet connection and try again.";
    } finally {
        askButton.disabled = false;
    }
});

clearButton.addEventListener("click", () => {
    contextInput.value = "";
    questionInput.value = "";
    answerOutput.textContent = "Your answer will appear here.";
    confidenceOutput.textContent = "";
    qaStatus.textContent = "Enter a passage and a question to begin.";
});
