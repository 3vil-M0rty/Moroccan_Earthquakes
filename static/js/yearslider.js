window.onload = function () {
    slideOne();
    slideTwo();
};

let sliderOne = document.getElementById("slider-1");
let sliderTwo = document.getElementById("slider-2");

let displayValOne = document.getElementById("range1");
let displayValTwo = document.getElementById("range2");

let minRag = 1;

let sliderTrack = document.querySelector(".yearslider");
let sliderMaxValue = document.getElementById("slider-1").max;

function slideOne() {
    if (parseInt(sliderOne.value) > parseInt(sliderTwo.value) - minRag) {
        sliderOne.value = parseInt(sliderTwo.value) - minRag;
    }

    displayValOne.textContent = sliderOne.value;
    fillColor();
}

function slideTwo() {
    if (parseInt(sliderTwo.value) < parseInt(sliderOne.value) + minRag) {
        sliderTwo.value = parseInt(sliderOne.value) + minRag;
    }
    displayValTwo.textContent = sliderTwo.value;
    fillColor();
}

function fillColor() {
    const range = 2023-2004;
    const rangeStart = parseInt(sliderOne.value)-2004;
    const rangeEnd = parseInt(sliderTwo.value)-2004;

    const startPercentage = (rangeStart / range) * 100;
    const endPercentage = (rangeEnd / range) * 100;

    sliderTrack.style.background = `
        linear-gradient(to right, black 0%, black ${startPercentage}%, #f3f3f3 ${startPercentage}%, #f3f3f3 ${endPercentage}%, black ${endPercentage}%, black 100%)`;
}