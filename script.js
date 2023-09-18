const SCROLL_SPD = 1/600;

addEventListener("DOMContentLoaded", async () => {
    container = document.getElementById("mapContainer");
    map = await (await fetch("map.svg")).text();
    container.innerHTML = map;
    biomes = await (await fetch("biomes.json")).json();

    for (color of Object.keys(biomes.groups)) {
        for (hex of biomes["groups"][color]["paths"]) {
            node = document.getElementById(hex);
            node.style["fill"] = color;
            node.setAttribute("data-biome", biomes["groups"][color]["label"]);
        }
    }
    mapNavigation(container.firstChild, container.firstChild.firstChild)
})

// Map can be navigated by dragging and scrolling
function mapNavigation(container, mapSvgGroup) {
    // warrantied to avoid pain and suffering
    mapSvgGroup.style.transformOrigin = "0 0";

    let scale = 1;
    let translationX = 0;
    let translationY = 0;

    // We don't set the viewbox anywhere because it is painful to work with. We can instead transform the <g> tag. We must scale before translating for prosperity.
    let updateTransform = () => mapSvgGroup.style.transform = `scale(${scale}) translate(${translationX}px, ${translationY}px)`;
    updateTransform();

    container.onwheel = event => {
        // Prevent page zoom with ctrl scroll
        event.preventDefault();

        // Dodgey formula to ensure that scrolling in then out lands at the same place.
        let zoomFactor = 1 + Math.abs(event.deltaY * SCROLL_SPD);
        if (event.deltaY > 0) zoomFactor = 1 / zoomFactor;
        scale *= zoomFactor;

        // Centre scroll around cursor
        const { x, y, width, height } = container.getBoundingClientRect();
        const scaledViewportWidth = width / zoomFactor;
        const scaledViewportHeight = height / zoomFactor;
        const changeInWidth = width - scaledViewportWidth;
        const changeInHeight = height - scaledViewportHeight;
        const deltaX = changeInWidth * ((event.x - x) / width);
        const deltaY = changeInHeight * ((event.y - y) / height);
        translationX -= (deltaX / scale) * zoomFactor;
        translationY -= (deltaY / scale) * zoomFactor;

        updateTransform();
    };
    container.onpointermove = event => {
        container.setPointerCapture(event.pointerId);
        // Ensure some button is clicked. Note `buttons` vs `button`.
        if (event.buttons == 0) {
            return;
        }

        // Divide by scale so that it moves by less when more zoomed in.
        translationX += event.movementX / scale;
        translationY += event.movementY / scale;

        updateTransform();
    };
}

addEventListener("mousemove", event => {
    tip = document.getElementById("tooltip");
    tip.style["top"] = event["clientY"].toString()+"px";
    tip.style["left"] = (event["clientX"]+10).toString()+"px";
    if (event.target.tagName === "path") {
        tip.hidden = false;
        let biome = {"D": "Desert", "T": "Taiga", "F": "Forest", "G": "Grassland"}[event.target.getAttribute('data-biome')]
        if (event.target.getAttribute("data-label") !== null) {
            tip.innerHTML = `${event.target.getAttribute("data-label")} (${event.target.id.replace('_', ' ')}) - ${biome}`;
        } else {
            tip.innerHTML = `${event.target.id.replace('_', ' ')} - ${biome}`;
        }
    } else {
        tip.hidden = true;
    }
})

const fileinput = document.getElementById("fileinput");

fileinput.onchange = async () => {
    let newmap = JSON.parse(await fileinput.files[0].text());
    for (child of document.getElementById("map").children) {
        if (child.tagName === "path") {
            child.style["fill"] = "rgb(209, 219, 221)";
        }
    }
    for (color of Object.keys(newmap["groups"])) {
        let fill;
        let stroke;
        if (color.startsWith("diagonal3_")) {
            console.log(color)
            fill = "#" + color.slice(10, 16);
            stroke = "#" + color.slice(17);
        } else {
            fill = color;
            stroke = null
        }
        for (hex of newmap["groups"][color]["paths"]) {
            node = document.getElementById(hex);
            if (node !== null) {
                node.style["fill"] = fill;
                if (stroke !== null) {
                    node.style["stroke"] = stroke;
                    node.style["stroke-width"] = "1px";
                }
                node.setAttribute("data-label", newmap["groups"][color]["label"]);
            }
        }
    }
}