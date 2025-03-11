document.getElementById("analyzeBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("pdfInput");
    if (!fileInput.files.length) return alert("Выберите PDF-файл");

    const formData = new FormData();
    formData.append("pdf", fileInput.files[0]);

    const response = await fetch("/api/analyze-pdf", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    document.getElementById("result").innerText = data.result;
    document.getElementById("result").classList.remove("hidden");
});
