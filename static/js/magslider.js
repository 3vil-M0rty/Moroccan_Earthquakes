const slider = document.getElementById("magnitudeSlider");
const output = document.getElementById("selectedMagnitude");

function updateSliderValue() {
    output.textContent = slider.value;
}

slider.addEventListener("input", function () {
    updateSliderValue();
});

updateSliderValue();
