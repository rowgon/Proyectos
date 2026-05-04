fetch("https://ve.dolarapi.com/v1/dolares", {
    headers: { "User-Agent": "Mozilla/5.0" }
}).then(r=>r.json()).then(j => console.log(j)).catch(console.error);
