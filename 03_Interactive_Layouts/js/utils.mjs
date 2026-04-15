export function hasMethods(obj, methodNames) {
    if (!obj || !Array.isArray(methodNames)) {
        return false;
    }
    return methodNames.every(name => typeof obj[name] === 'function');
}

export function getTime() {
    const now = new Date();
    const sec = now.getSeconds();
    const min = now.getMinutes();
    let hrs = now.getHours();
    if (hrs >= 12) hrs -= 12;
    return {
        sec,
        min,
        hrs,
        pSec: sec.toString().padStart(2, "0"),
        pMin: min.toString().padStart(2, "0"),
        pHrs: hrs.toString().padStart(2, "0")
    };
}

