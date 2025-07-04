/**
 * 
 * @param {Number} msec The number of milliseconds since epoch
 * @returns {String} The date formatted as mm/dd/yyyy
 */
export const format_date = (msec) => {
    if (msec === undefined) {
        return "";
    }
    let temp_date = new Date(msec);
    return `${temp_date.getMonth()+1}/${temp_date.getDate()}/${temp_date.getFullYear()}`;
}

/**
 * 
 * @param {Number} msec The number of milliseconds since epoch
 * @returns {String} The time formatted as HH:MM a/pm, or H:MM a/pm
 */
export const format_time = (msec) => {
    if (msec === undefined) {
        return "";
    }
    let temp_date = new Date(msec);
    let hrs = temp_date.getHours();
    let meridian = "am";
    if (hrs > 12) {
        hrs -= 12;
        meridian = "pm";
    }
    else if (hrs === 12) {
        meridian = "pm";
    }
    else if (hrs === 0) {
        hrs = 12;
    }
    return `${hrs}:${temp_date.getMinutes().toString().padStart(2, "0")} ${meridian}`;

}

/**
 * Find the total payable amount for this class session
 * @param {Number} start The start time of the class in milliseconds since epoch
 * @param {Number} end The finish time of the class in milliseconds since epoch
 * @param {Number} rate The hourly rate in dollars
 */
export const get_charge = (start_s, end_s, rate) => {
    const start = new Date(start_s).getTime();
    const end = new Date(end_s).getTime();
    let msec_diff = end - start;
    let hrs = Math.ceil(msec_diff / 1000 / 60 / 60);
    let charge = rate * hrs;
    return charge;
}

export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const setCookie = (key, value) => {
    document.cookie = document.cookie + `; ${key}=${value}`;
}