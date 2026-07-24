function startRelayControl() {
    if (!window.firebase) {
        setTimeout(startRelayControl, 50);
        return;
    }

    const database = firebase.database();
    const devices = [
        { key: "lamp", path: "/thietbi/DenLED", card: "lamp-card", state: "lamp-state", on: "lamp-on", off: "lamp-off" },
        { key: "pump", path: "/thietbi/MayBom", card: "pump-card", state: "pump-state", on: "pump-on", off: "pump-off" }
    ];



}

startRelayControl();
const byId = (id) => document.getElementById(id);

async function request(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(response.status);
    return response.json().catch(() => null);
}

function setRelay(device, state) {
    request(`/api/relay?device=${device}&state=${state ? 1 : 0}`).catch(showOffline);
}

function applyStatus(status) {
    ["temperature", "humidity", "soil", "light"].forEach((key) => {
        const value = Number(status[key]);
        byId(key).textContent = Number.isFinite(value) ? value.toFixed(1) : "--";
    });
    byId("pump").checked = Number(status.pump) === 1;
    byId("led").checked = Number(status.led) === 1;
    byId("mode").checked = Number(status.mode) === 0;
    byId("modeText").textContent = Number(status.mode) === 0 ? "MANUAL" : "AUTO";
    byId("updated").textContent = new Date().toLocaleTimeString("vi-VN");
}

function showOffline() {
    byId("updated").textContent = "mất kết nối ESP32";
}

byId("pump").addEventListener("change", (event) => setRelay("pump", event.target.checked));
byId("led").addEventListener("change", (event) => setRelay("led", event.target.checked));
byId("mode").addEventListener("change", (event) => {
    const manual = event.target.checked;
    fetch(`/api/mode?manual=${manual ? 1 : 0}`).catch(showOffline);
    byId("modeText").textContent = manual ? "MANUAL" : "AUTO";
});
byId("alarm").addEventListener("change", () => {});

async function refresh() {
    try {
        applyStatus(await request("/api/status"));
    } catch (error) {
        showOffline();
    }
}

refresh();
setInterval(refresh, 2000);