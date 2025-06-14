/**
 * 
 * @param {Number} msec The number of milliseconds since epoch
 * @returns {String} The date formatted as mm/dd/yyyy
 */
export const format_date = (msec) => {
    let temp_date = new Date(msec);
    return `${temp_date.getMonth()+1}/${temp_date.getDate()}/${temp_date.getFullYear()}`;
}

/**
 * 
 * @param {Number} msec The number of milliseconds since epoch
 * @returns {String} The time formatted as HH:MM
 */
export const format_time = (msec) => {
    let temp_date = new Date(msec);
    return `${temp_date.getHours().toString().padStart(2, "0")}:${temp_date.getMinutes().toString().padStart(2, "0")}`;
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