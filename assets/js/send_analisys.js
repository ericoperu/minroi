document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("generarInforme").addEventListener("click", async function () {
        const fileInput = document.getElementById("pdfInput");
        const file = fileInput.files[0];

        if (!file) {
            alert("Por favor, selecciona un archivo PDF.");
            return;
        }

        const formData = new FormData();
        formData.append("pdf", file);

        // Obtener datos de los inputs
        const selectedValue = document.querySelector('input[name="calculo"]:checked').value;
        
        if (selectedValue === "general") {
            const gastoGeneral = parseFloat(document.getElementById("gastoGeneralInput").value) || 0;
            formData.append("tipoCalculo", selectedValue);
            formData.append("gastoGeneral", gastoGeneral);
        } 
        else if (selectedValue === "detallado") {
            let totalGastosText = document.getElementById("totalGastos").textContent.trim();
            let totalGastos = parseFloat(totalGastosText.replace(" $/TM", "")) || 0;
            
            if (totalGastos > 0) {
                formData.append("tipoCalculo", selectedValue);
                formData.append("gastoDetallado", totalGastos);
            }
        } 
        else {
            formData.append("tipoCalculo", selectedValue);
        }

        try {
            const response = await fetch("/api/procesar-pdf", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            console.log("Respuesta del servidor:", result);
        } catch (error) {
            console.error("Error al enviar los datos:", error);
        }
    });
});
