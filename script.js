addEventListener("DOMContentLoaded", async () => {
    container = document.getElementById("mapContainer");
    map = await (await fetch("map.svg")).text();
    container.innerHTML = map;
    container.children[0].setAttribute("height", "auto");
    container.children[0].setAttribute("width", "auto");
    biomes = await (await fetch("biomes.json")).json();

    for (color of Object.keys(biomes.groups)) {
        for (hex of biomes["groups"][color]["paths"]) {
            node = document.getElementById(hex);
            node.style["fill"] = color;
            node.setAttribute("data-biome", biomes["groups"][color]["label"]);
        }
    }
})

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
        console.log(color);
        for (hex of newmap["groups"][color]["paths"]) {
            node = document.getElementById(hex);
            if (node !== null) {
                node.style["fill"] = color;
                node.setAttribute("data-label", newmap["groups"][color]["label"]);
            }
        }
    }
}