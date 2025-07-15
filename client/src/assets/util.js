const isValidDate = (d) => {
    return d instanceof Date && !isNaN(d);
}

/**
 * 
 * @param {Number} msec The number of milliseconds since epoch
 * @returns {String} The date formatted as mm/dd/yyyy
 */
export const format_date = (msec, timezone) => {
    
    let temp_date = new Date(msec);
    if (isNaN(temp_date.getTime())) {
        return "";
    }
    if (timezone === undefined || timezone === "") {
        timezone = "America/Los_Angeles";
    }

    return new Intl.DateTimeFormat("en-US", {timeZone: timezone}).format(temp_date);
}

/**
 * 
 * @param {Number} msec The number of milliseconds since epoch
 * @returns {String} The time formatted as HH:MM a/pm, or H:MM a/pm
 */
export const format_time = (msec, timezone) => {
    let temp_date = new Date(msec);

    if (isNaN(temp_date.getTime())) {
        return "";
    }
    if (timezone === undefined || timezone === "") {
        timezone = "America/Los_Angeles";
    }

    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        timeZone: timezone
    }).format(temp_date);
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