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
    const startPercent = ((sliderOne.value - sliderOne.min) / (sliderOne.max - sliderOne.min)) * 100;
    const endPercent = ((sliderTwo.value - sliderOne.min) / (sliderOne.max - sliderOne.min)) * 100;

    sliderTrack.style.background = `linear-gradient(to right, #000 0%, #000 ${startPercent}%, #fff ${startPercent}%, #fff ${endPercent}%, #000 ${endPercent}%, #000 100%)`;
}