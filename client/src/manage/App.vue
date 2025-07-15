<script setup>
import AuthMenu from "../components/AuthMenu.vue";
import StudentMenu from "../components/StudentMenu.vue";
import Session from "../components/Session.vue";
import NameMenu from "../components/NameMenu.vue";
import { format_date, getCookie } from "../assets/util";
import IconButton from "../components/IconButton.vue";

</script>

<template>
    <main id="main">
        <div class="tile">
            <header>
                <span class="header-left"
                    ><a class="screen-reader-only">Skip to Content</a
                    ><a class="nav-back btn" href="/landing"><font-awesome-icon icon="caret-left" />&nbsp;Back</a></span
                >
                <student-menu :current="CurrentStudent" :students="AllStudents"></student-menu>
                <auth-menu>{{ User.displayName ? User.displayName.split(" ")[0] : "Joost" }}</auth-menu>
            </header>
            <div class="session-controls">
                <icon-button classes="btn btn-invoice" label="Generate invoice" @clicked="get_invoice" base="print">&nbsp;Invoice</icon-button>
                <button class="btn spinner-container hidden">
                    <span class="spinner"><font-awesome-icon icon="rotate" /></span>
                    Invoice
                </button>
                <icon-button classes="btn btn-add btn-add-class" label="Add new class" @clicked="add_session">&nbsp;New Class</icon-button>
                <span class="date-range">
                    <label class="screen-reader-only" for="date-start">Date start</label>
                    <input type="text" id="date-start" :value="format_date(Dates.start)">
                    &ndash;
                    <label class="screen-reader-only" for="date-end">Date end</label>
                    <input type="text" id="date-end" :value="format_date(Dates.end)">
                    <button class="btn btn-dates" @click="filterDates">Filter</button>
                    <button class="btn btn-dates" @click="resetDateFilter">Reset</button>
                </span>
            </div>
            <div class="session-controls">
                <select id="timezone-menu">
                    <option value="" selected>-- Select Timzone for Invoice --</option>
                    <option v-for="(zone) in Timezones" :value="zone.utc[0]">{{ zone.text }}</option>
                </select>
            </div>
            <div id="session-table">
                <div class="table-header">
                    <span class="check-table">
                        <details>
                            <summary><font-awesome-icon icon="print" /><span class="screen-reader-only">Filter sessions for invoice</span></summary>
                            <div class="check-list">
                                <ul class="check-list-ul">
                                    <li class="check-list-li"><a href="#" @click="checkFiltered">Check All</a></li>
                                    <li class="check-list-li"><a href="#" @click="uncheckFiltered">Uncheck All</a></li>
                                    <li class="check-list-li"><a href="#" @click="viewAllSessions">View All</a></li>
                                    <li class="check-list-li"><a href="#" @click="viewPaidSessions">View Paid</a></li>
                                    <li class="check-list-li"><a href="#" @click="viewUnpaidSessions">View Unpaid</a></li>
                                </ul>
                                <ul class="check-list-ul">
                                    <li class="check-list-li"><a>Mark as Paid</a></li>
                                    <li class="check-list-li"><a>Mark as Unpaid</a></li>
                                </ul>
                            </div>
                        </details>
                    </span>
                    <span class="table-text id-table">&nbsp;</span>
                    <span class="table-text date-table">Date</span>
                    <span class="table-text time-table">In</span>
                    <span class="table-text time-table">Out</span>
                    <span class="table-text rate-table">Rate</span>
                    <span class="table-text charge-table">Charge</span>
                    <span class="table-text btn-table"></span>
                </div>
                <div class="row-container">
                    <session v-for="(sesh) in Filtered"
                        :key="sesh.number"
                        :selected="sesh.selected"
                        :paid="sesh.paid"
                        :id="sesh.number"
                        :time_in="sesh.in_time" 
                        :time_out="sesh.out_time" 
                        :rate="sesh.rate"
                        @edited="editSession"
                        @deleted="deleteSession"
                        @selected="updateFiltered(sesh.number)"
                    >
                    </session>
                    <div :class="`session-row`" v-if="Filtered.length === 0">
                        <h5 class="table-text rate-table">No Classes, add one!</h5>
                    </div>

                </div>
            </div>
            <name-menu
                :fname="CurrentStudent.fname" 
                :lname="CurrentStudent.lname" 
                :active="CurrentStudent.active" 
                :rate="CurrentStudent.rate"
                @saved="editStudent"
            >
            </name-menu>
        </div>
    </main>
</template>

<script>
export default {
    name: "app",
    components: {
        StudentMenu,
        AuthMenu,
        Session,
        NameMenu,
        IconButton
    },
    async mounted() {
        this.populateUser(),
        await this.getSessions(),
        await this.getStudents(),
        this.createDateFilter()
    },
    methods: {
        populateUser() {
            this.User = {
                displayName: decodeURIComponent(getCookie("displayName")),
                rate: Number(getCookie("rate")),
            }
        },
        async add_session() {
            const res = await fetch(`/api/sessions/add`, {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    student: Number(getCookie("student")),
                    in_time: Date.now()-(1000*60*60), // One hour before
                    out_time: Date.now(),
                    rate: this.CurrentStudent.rate,
                    paid: false,
                }),
            });
            const res_json = await res.json();
            if (!res_json.error) {
                // window.location.reload();
                let new_obj = res_json.data;
                new_obj["selected"] = false;
                this.Sessions = [
                    new_obj,
                    ...this.Sessions
                ];
                this.Filtered = [
                    new_obj,
                    ...this.Filtered
                ];
                this.resetDateFilter();
            }
            else {
                window.alert(res_json.msg);
            }
        },
        async getSessions() {
            const res = await fetch(`/api/sessions/read/${getCookie("student")}`);
            const res_json = await res.json();
            if (!res_json.error) {
                this.Sessions = res_json.data.sort((a, b) => (new Date(b.in_time)).getTime() - (new Date(a.in_time)).getTime());
                this.Filtered = res_json.data.sort((a, b) => (new Date(b.in_time)).getTime() - (new Date(a.in_time)).getTime());
            }
            else {
                console.log(res_json.msg);
            }
        },
        async getStudents() {
            const res = await fetch(`/api/students/read`);
            const res_json = await res.json();
            if (!res_json.error) {
                this.AllStudents = res_json.data;
                this.CurrentStudent = res_json.data.filter(el => el.id === Number(getCookie("student")))[0];
            }
            else {
                console.log(res_json.msg);
            }
        },
        async get_invoice() {
            // Show spinner and hide invoice button
            document.querySelector(".btn-invoice").classList.add("hidden");
            document.querySelector(".spinner-container").classList.remove("hidden");

            const tz = document.getElementById("timezone-menu").value;
            let selected_sessions = [];
            this.Filtered.map((el) => {
                if (el.selected) {
                    selected_sessions.push(el.number);
                }
            });
            selected_sessions = selected_sessions.sort((a, b) => a > b);
            console.log(selected_sessions);

            const res = await fetch("/api/sessions/invoice", {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    student: this.CurrentStudent,
                    sessions: selected_sessions,
                    timezone: tz
                }),
            });
            if (res.status === 200) {
                const blob = await res.blob();
                const file_url = window.URL.createObjectURL(blob);
                let link = document.createElement("a");
                link.href = file_url;
                link.download = `${this.CurrentStudent.fname}_${this.CurrentStudent.lname}.pdf`;
                link.click();
                window.URL.revokeObjectURL(file_url);
            }
            else {
                const res_json = await res.json();
                window.alert(res_json.msg);
            }
            // Hide spinner and show invoice button
            document.querySelector(".btn-invoice").classList.remove("hidden");
            document.querySelector(".spinner-container").classList.add("hidden");
        },
        async editSession(payload) {
            try {                
                // Show spinner and hide save/delete button
                document.querySelector(`#details-${payload.id} .btn-table-input .spinner`).classList.remove("hidden");
                document.querySelector(`#details-${payload.id} .btn-table-input .btn-add`).classList.add("hidden");
                document.querySelector(`#details-${payload.id} .btn-table-input .btn-del`).classList.add("hidden");

                // If anything is null, throw error
                // if (
                //     payload.id <= 0 ||
                //     payload.date === "" ||
                //     payload.in_time === "" ||
                //     payload.out_time === "" ||
                //     payload.rate <= 0
                // ) {
                //     throw new Error();
                // }

                let date = new Date(payload.date);
                let start = this.parseTime(payload.in_time);
                let end = this.parseTime(payload.out_time);

                start.setDate(date.getDate());
                start.setMonth(date.getMonth());
                start.setFullYear(date.getFullYear());

                end.setDate(date.getDate());
                end.setMonth(date.getMonth());
                end.setFullYear(date.getFullYear());

                const res = await fetch(`/api/sessions/update`, {
                    method: "post",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        student: Number(getCookie("student")),
                        number: payload.id,
                        paid: payload.paid,
                        in_time: start,
                        out_time: end,
                        rate: Number(payload.rate),
                    }),
                });

                const res_json = await res.json();
                
                if (!res_json.error) {
                    this.Sessions = this.Sessions.map((el) => {
                        if (el.number === payload.id) {
                            return {
                                ...el,
                                paid: payload.paid,
                                in_time: start,
                                out_time: end,
                                rate: payload.rate
                            }
                        }
                        else {
                            return el;
                        }
                    });
                    this.Filtered = this.Filtered.map((el) => {
                        if (el.number === payload.id) {
                            return {
                                ...el,
                                paid: payload.paid,
                                in_time: start,
                                out_time: end,
                                rate: payload.rate
                            }
                        }
                        else {
                            return el;
                        }
                    });
                }
                else {
                    window.alert(res_json.msg);
                }

                
            }
            catch {
                window.alert("Error, invalid input");
            }
            finally {
                // Hide spinner and show save button
                document.querySelector(`#details-${payload.id} .btn-table-input .spinner`).classList.add("hidden");
                document.querySelector(`#details-${payload.id} .btn-table-input .btn-add`).classList.remove("hidden");
                document.querySelector(`#details-${payload.id} .btn-table-input .btn-del`).classList.remove("hidden");
            }
        },
        async deleteSession(payload) {
            if (window.confirm("Delete this session?")) {
                // Show spinner and hide save/delete button
                document.querySelector(`#details-${payload.id} .btn-table-input .spinner`).classList.remove("hidden");
                document.querySelector(`#details-${payload.id} .btn-table-input .btn-add`).classList.add("hidden");
                document.querySelector(`#details-${payload.id} .btn-table-input .btn-del`).classList.add("hidden");

                const res = await fetch(`/api/sessions/delete`, {
                    method: "post",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        number: payload.id,
                        student: getCookie("student"),
                    }),
                });
                const res_json = await res.json();
                if (!res_json.error) {
                    this.Sessions = this.Sessions.filter((el) => (el.number !== payload.id));
                    this.Filtered = this.Filtered.filter((el) => (el.number !== payload.id));
                }
                else {
                    console.error(res_json.msg);
                }
                
                // Hide spinner and show save button
                document.querySelector(`#details-${payload.id} .btn-table-input .spinner`).classList.add("hidden");
                document.querySelector(`#details-${payload.id} .btn-table-input .btn-add`).classList.remove("hidden");
                document.querySelector(`#details-${payload.id} .btn-table-input .btn-del`).classList.remove("hidden");
            }
        },
        async editStudent(payload) {
            // Hide save button and show spinner
            document.querySelector(".edit-name .btn-add").classList.add("hidden");
            document.querySelector(".edit-name .spinner").classList.remove("hidden");

            const _id = getCookie("student");
            const response = await fetch("/api/students/update", {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: _id,
                    fname: payload.fname,
                    lname: payload.lname,
                    active: payload.active,
                    rate: payload.rate
                }),
            });
            const res_json = await response.json();

            if (!res_json.error) {
                this.CurrentStudent = {
                    ...this.CurrentStudent,
                    fname: payload.fname,
                    lname: payload.lname,
                    active: payload.active,
                    rate: payload.rate
                };
                this.AllStudents = this.AllStudents.map((el) => {
                    if (el.id === _id) {
                        return this.CurrentStudent;
                    }
                    else {
                        return el;
                    }
                });
            }
            else {
                window.alert(res_json.msg);
            }
            // Show save button and hide spinner
            document.querySelector(".edit-name .btn-add").classList.remove("hidden");
            document.querySelector(".edit-name .spinner").classList.add("hidden");
        },

        createDateFilter() {
            if (this.Sessions.length > 0) {
                const start = this.Sessions[this.Sessions.length - 1].in_time;
                const end = this.Sessions[0].in_time;
                this.Dates = { start: start, end: end };
            }
        },
        /**
         * Filter the "Filtered" list so that it only shows classes in the specified date range (inclusive)
         */
        filterDates() {

            console.log("Filtering..");
            let start_str = document.getElementById("date-start").value;
            let end_str = document.getElementById("date-end").value;

            // Format the inputs
            start_str = this.parse_date(start_str);
            end_str = this.parse_date(end_str);

            let start, end;

            if (start_str === "invalid") {
                start = this.Dates.start;
            }
            else {
                start = new Date(start_str);
            }
            if (end_str === "invalid") {
                end = this.Dates.end;
            }
            else {
                end = new Date(end_str);
            }

            // End defaults to 00:00, which is a problem for classes on the end date.
            end.setHours(23);
            end.setMinutes(59);

            // Invalidate if end is less than start
            if (end < start) {
                window.alert("End date cannot be earlier than start date");
            }
            else {
                this.Dates.start = start;
                this.Dates.end = end;

                this.Filtered = this.Sessions.filter((el) => {
                    console.log(el);
                    return (new Date(el.in_time)) >= start && (new Date(el.in_time)) <= end
                });
            }
        },
        /**
         * Show all classes and reset the date fields
         */
        resetDateFilter() {
            this.createDateFilter();
            this.viewAllSessions();
        },
        viewAllSessions() {
            this.Filtered = this.Sessions;
        },
        viewPaidSessions() {
            this.Filtered = this.Sessions.filter(el => el.paid === true);
        },
        viewUnpaidSessions() {
            this.Filtered = this.Sessions.filter(el => el.paid === false);
        },
        checkFiltered() {
            this.Filtered = this.Filtered.map((el) => {
                el.selected = true;
                return el;
            });
        },
        uncheckFiltered() {
            this.Filtered = this.Filtered.map((el) => {
                el.selected = false;
                return el;
            });
        },
        updateFiltered(key) {
            this.Filtered = this.Filtered.map((el) => {
                if (el.number === key) {
                    el.selected = !el.selected;
                }
                return el;
            });
        },
        // Take a date from MM/DD and make it MM/DD/YYYY
        // Validate the date as well
        parse_date(date_str) {
            // No year, 2-digit year, and 4-digit year are ok
            const month_only = /^\d{1,2}\/\d{1,2}$/;
            const all = /^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})$/;
            
            if (month_only.test(date_str)) {
                let comps = date_str.split("/");
                let year = new Date().getFullYear();
                comps.push(year.toString());
                return comps.join("/");
            }
            else if (all.test(date_str)) {
                return date_str;
            }
            return "invalid";
        },
        /**
         * Convert a string representation of time into a Date object. The day, month, and year are today.
         * @param time The time as a string, or current time if time is invalid
         */
        parseTime(time) {
            // Check input for validity, return current time if invalid
            const short_pat = /^\d{1,2}\s?\w{2}$/;
            const long_pat = /^\d{1,2}\W?\d{1,2}\s?(\w{2})?$/;
            if (short_pat.test(time)) {
                const delim = /\W/g; // Anything not a letter or number
                time = time.toLowerCase();
                time = time.replaceAll(delim, ""); // Remove delimiters and spaces

                let time_obj = new Date();
                if (time.substring(time.length-2) === "am") {
                    let hrs = Number(time.substring(0, time.length-2));
                    if (hrs === 12 || hrs < 0) {
                        time_obj.setHours(0);
                    }
                    else if (hrs > 12) {
                        time_obj.setHours(hrs % 12);
                    }
                    else {
                        time_obj.setHours(hrs);
                    }
                    time_obj.setMinutes(0);
                    time_obj.setSeconds(0);
                    
                    return time_obj;
                }
                else if (time.substring(time.length-2) === "pm") {
                    let hrs = Number(time.substring(0, time.length-2));
                    if (hrs > 12) {
                        time_obj.setHours((hrs % 12) + 12);
                    }
                    else if (hrs === 12 || hrs <= 0) {
                        time_obj.setHours(12);
                    }
                    else {
                        time_obj.setHours(hrs+12);
                    }
                    time_obj.setMinutes(0);
                    time_obj.setSeconds(0);
                    
                    return time_obj;
                }
                else {
                    return new Date();
                }
            }
            else if (long_pat.test(time)) {
                const delim = /\W/g; // Anything not a letter or number
                time = time.toLowerCase();
                time = time.replaceAll(delim, ""); // Remove delimiters and spaces

                let meridian = false;
                let offset = 0;
                
                // Trim am/pm if it's there and set adjustment variables
                if (time.substring(time.length-2) === "am") {
                    meridian = true;
                    offset = 0;
                    time = time.substring(0, time.length-2);
                }
                else if (time.substring(time.length-2) === "pm") {
                    meridian = true;
                    offset = 12;
                    time = time.substring(0, time.length-2);
                }

                // Get the numbers
                let mins, hrs;
                mins = Number(time.substring(time.length-2));
                hrs = Number(time.substring(0, time.length-2));

                // Ignore meridian if user wrote 25 or something
                if (hrs >= 24) {
                    meridian = false;
                }

                // Modulo so that large numbers can still be interpreted
                mins = mins % 60;
                hrs = hrs % 24;

                // Adjust hours if meridian was provided. 12:00 is a special case
                if (hrs < 12 && meridian) {
                    hrs += offset;
                }
                else if (hrs === 12 && meridian) {
                    if (offset === 0) {
                        hrs = 0;
                    }
                }

                // Hooray, we're done!
                let time_obj = new Date();
                time_obj.setHours(hrs);
                time_obj.setMinutes(mins);
                time_obj.setSeconds(0);

                return time_obj;
            }
            else {
                return new Date();
            }
        }
    },
    // Timezones copied from https://github.com/dmfilipenko/timezones.json/blob/master/timezones.json
    data() {
        return {
            Sessions: [],
            Filtered: [],
            AllStudents: [],
            CurrentStudent: {},
            Dates: { start: undefined, end: undefined },
            User: {},
            Timezones: [
                {
                    "value": "Dateline Standard Time",
                    "abbr": "DST",
                    "offset": -12,
                    "isdst": false,
                    "text": "(UTC-12:00) International Date Line West",
                    "utc": [
                    "Etc/GMT+12"
                    ]
                },
                {
                    "value": "UTC-11",
                    "abbr": "U",
                    "offset": -11,
                    "isdst": false,
                    "text": "(UTC-11:00) Coordinated Universal Time-11",
                    "utc": [
                    "Etc/GMT+11",
                    "Pacific/Midway",
                    "Pacific/Niue",
                    "Pacific/Pago_Pago"
                    ]
                },
                {
                    "value": "Hawaiian Standard Time",
                    "abbr": "HST",
                    "offset": -10,
                    "isdst": false,
                    "text": "(UTC-10:00) Hawaii",
                    "utc": [
                    "Etc/GMT+10",
                    "Pacific/Honolulu",
                    "Pacific/Johnston",
                    "Pacific/Rarotonga",
                    "Pacific/Tahiti"
                    ]
                },
                {
                    "value": "Alaskan Standard Time",
                    "abbr": "AKDT",
                    "offset": -8,
                    "isdst": true,
                    "text": "(UTC-09:00) Alaska",
                    "utc": [
                    "America/Anchorage",
                    "America/Juneau",
                    "America/Nome",
                    "America/Sitka",
                    "America/Yakutat"
                    ]
                },
                {
                    "value": "Pacific Standard Time (Mexico)",
                    "abbr": "PDT",
                    "offset": -7,
                    "isdst": true,
                    "text": "(UTC-08:00) Baja California",
                    "utc": [
                    "America/Santa_Isabel"
                    ]
                },
                {
                    "value": "Pacific Daylight Time",
                    "abbr": "PDT",
                    "offset": -7,
                    "isdst": true,
                    "text": "(UTC-07:00) Pacific Daylight Time (US & Canada)",
                    "utc": [
                    "America/Los_Angeles",
                    "America/Tijuana",
                    "America/Vancouver"
                    ]
                },
                {
                    "value": "Pacific Standard Time",
                    "abbr": "PST",
                    "offset": -8,
                    "isdst": false,
                    "text": "(UTC-08:00) Pacific Standard Time (US & Canada)",
                    "utc": [
                    "America/Los_Angeles",
                    "America/Tijuana",
                    "America/Vancouver",
                    "PST8PDT"
                    ]
                },
                {
                    "value": "US Mountain Standard Time",
                    "abbr": "UMST",
                    "offset": -7,
                    "isdst": false,
                    "text": "(UTC-07:00) Arizona",
                    "utc": [
                    "America/Creston",
                    "America/Dawson",
                    "America/Dawson_Creek",
                    "America/Hermosillo",
                    "America/Phoenix",
                    "America/Whitehorse",
                    "Etc/GMT+7"
                    ]
                },
                {
                    "value": "Mountain Standard Time (Mexico)",
                    "abbr": "MDT",
                    "offset": -6,
                    "isdst": true,
                    "text": "(UTC-07:00) Chihuahua, La Paz, Mazatlan",
                    "utc": [
                    "America/Chihuahua",
                    "America/Mazatlan"
                    ]
                },
                {
                    "value": "Mountain Standard Time",
                    "abbr": "MDT",
                    "offset": -6,
                    "isdst": true,
                    "text": "(UTC-07:00) Mountain Time (US & Canada)",
                    "utc": [
                    "America/Boise",
                    "America/Cambridge_Bay",
                    "America/Denver",
                    "America/Edmonton",
                    "America/Inuvik",
                    "America/Ojinaga",
                    "America/Yellowknife",
                    "MST7MDT"
                    ]
                },
                {
                    "value": "Central America Standard Time",
                    "abbr": "CAST",
                    "offset": -6,
                    "isdst": false,
                    "text": "(UTC-06:00) Central America",
                    "utc": [
                    "America/Belize",
                    "America/Costa_Rica",
                    "America/El_Salvador",
                    "America/Guatemala",
                    "America/Managua",
                    "America/Tegucigalpa",
                    "Etc/GMT+6",
                    "Pacific/Galapagos"
                    ]
                },
                {
                    "value": "Central Standard Time",
                    "abbr": "CDT",
                    "offset": -5,
                    "isdst": true,
                    "text": "(UTC-06:00) Central Time (US & Canada)",
                    "utc": [
                    "America/Chicago",
                    "America/Indiana/Knox",
                    "America/Indiana/Tell_City",
                    "America/Matamoros",
                    "America/Menominee",
                    "America/North_Dakota/Beulah",
                    "America/North_Dakota/Center",
                    "America/North_Dakota/New_Salem",
                    "America/Rainy_River",
                    "America/Rankin_Inlet",
                    "America/Resolute",
                    "America/Winnipeg",
                    "CST6CDT"
                    ]
                },
                {
                    "value": "Central Standard Time (Mexico)",
                    "abbr": "CDT",
                    "offset": -5,
                    "isdst": true,
                    "text": "(UTC-06:00) Guadalajara, Mexico City, Monterrey",
                    "utc": [
                    "America/Bahia_Banderas",
                    "America/Cancun",
                    "America/Merida",
                    "America/Mexico_City",
                    "America/Monterrey"
                    ]
                },
                {
                    "value": "Canada Central Standard Time",
                    "abbr": "CCST",
                    "offset": -6,
                    "isdst": false,
                    "text": "(UTC-06:00) Saskatchewan",
                    "utc": [
                    "America/Regina",
                    "America/Swift_Current"
                    ]
                },
                {
                    "value": "SA Pacific Standard Time",
                    "abbr": "SPST",
                    "offset": -5,
                    "isdst": false,
                    "text": "(UTC-05:00) Bogota, Lima, Quito",
                    "utc": [
                    "America/Bogota",
                    "America/Cayman",
                    "America/Coral_Harbour",
                    "America/Eirunepe",
                    "America/Guayaquil",
                    "America/Jamaica",
                    "America/Lima",
                    "America/Panama",
                    "America/Rio_Branco",
                    "Etc/GMT+5"
                    ]
                },
                {
                    "value": "Eastern Standard Time",
                    "abbr": "EST",
                    "offset": -5,
                    "isdst": false,
                    "text": "(UTC-05:00) Eastern Time (US & Canada)",
                    "utc": [
                    "America/Detroit",
                    "America/Havana",
                    "America/Indiana/Petersburg",
                    "America/Indiana/Vincennes",
                    "America/Indiana/Winamac",
                    "America/Iqaluit",
                    "America/Kentucky/Monticello",
                    "America/Louisville",
                    "America/Montreal",
                    "America/Nassau",
                    "America/New_York",
                    "America/Nipigon",
                    "America/Pangnirtung",
                    "America/Port-au-Prince",
                    "America/Thunder_Bay",
                    "America/Toronto"
                    ]
                },
                {
                    "value": "Eastern Daylight Time",
                    "abbr": "EDT",
                    "offset": -4,
                    "isdst": true,
                    "text": "(UTC-04:00) Eastern Daylight Time (US & Canada)",
                    "utc": [
                    "America/Detroit",
                    "America/Havana",
                    "America/Indiana/Petersburg",
                    "America/Indiana/Vincennes",
                    "America/Indiana/Winamac",
                    "America/Iqaluit",
                    "America/Kentucky/Monticello",
                    "America/Louisville",
                    "America/Montreal",
                    "America/Nassau",
                    "America/New_York",
                    "America/Nipigon",
                    "America/Pangnirtung",
                    "America/Port-au-Prince",
                    "America/Thunder_Bay",
                    "America/Toronto"
                    ]
                },
                {
                    "value": "US Eastern Standard Time",
                    "abbr": "UEDT",
                    "offset": -5,
                    "isdst": false,
                    "text": "(UTC-05:00) Indiana (East)",
                    "utc": [
                    "America/Indiana/Marengo",
                    "America/Indiana/Vevay",
                    "America/Indianapolis"
                    ]
                },
                {
                    "value": "Venezuela Standard Time",
                    "abbr": "VST",
                    "offset": -4.5,
                    "isdst": false,
                    "text": "(UTC-04:30) Caracas",
                    "utc": [
                    "America/Caracas"
                    ]
                },
                {
                    "value": "Paraguay Standard Time",
                    "abbr": "PYT",
                    "offset": -4,
                    "isdst": false,
                    "text": "(UTC-04:00) Asuncion",
                    "utc": [
                    "America/Asuncion"
                    ]
                },
                {
                    "value": "Atlantic Standard Time",
                    "abbr": "ADT",
                    "offset": -3,
                    "isdst": true,
                    "text": "(UTC-04:00) Atlantic Time (Canada)",
                    "utc": [
                    "America/Glace_Bay",
                    "America/Goose_Bay",
                    "America/Halifax",
                    "America/Moncton",
                    "America/Thule",
                    "Atlantic/Bermuda"
                    ]
                },
                {
                    "value": "Central Brazilian Standard Time",
                    "abbr": "CBST",
                    "offset": -4,
                    "isdst": false,
                    "text": "(UTC-04:00) Cuiaba",
                    "utc": [
                    "America/Campo_Grande",
                    "America/Cuiaba"
                    ]
                },
                {
                    "value": "SA Western Standard Time",
                    "abbr": "SWST",
                    "offset": -4,
                    "isdst": false,
                    "text": "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan",
                    "utc": [
                    "America/Anguilla",
                    "America/Antigua",
                    "America/Aruba",
                    "America/Barbados",
                    "America/Blanc-Sablon",
                    "America/Boa_Vista",
                    "America/Curacao",
                    "America/Dominica",
                    "America/Grand_Turk",
                    "America/Grenada",
                    "America/Guadeloupe",
                    "America/Guyana",
                    "America/Kralendijk",
                    "America/La_Paz",
                    "America/Lower_Princes",
                    "America/Manaus",
                    "America/Marigot",
                    "America/Martinique",
                    "America/Montserrat",
                    "America/Port_of_Spain",
                    "America/Porto_Velho",
                    "America/Puerto_Rico",
                    "America/Santo_Domingo",
                    "America/St_Barthelemy",
                    "America/St_Kitts",
                    "America/St_Lucia",
                    "America/St_Thomas",
                    "America/St_Vincent",
                    "America/Tortola",
                    "Etc/GMT+4"
                    ]
                },
                {
                    "value": "Pacific SA Standard Time",
                    "abbr": "PSST",
                    "offset": -4,
                    "isdst": false,
                    "text": "(UTC-04:00) Santiago",
                    "utc": [
                    "America/Santiago",
                    "Antarctica/Palmer"
                    ]
                },
                {
                    "value": "Newfoundland Standard Time",
                    "abbr": "NDT",
                    "offset": -2.5,
                    "isdst": true,
                    "text": "(UTC-03:30) Newfoundland",
                    "utc": [
                    "America/St_Johns"
                    ]
                },
                {
                    "value": "E. South America Standard Time",
                    "abbr": "ESAST",
                    "offset": -3,
                    "isdst": false,
                    "text": "(UTC-03:00) Brasilia",
                    "utc": [
                    "America/Sao_Paulo"
                    ]
                },
                {
                    "value": "Argentina Standard Time",
                    "abbr": "AST",
                    "offset": -3,
                    "isdst": false,
                    "text": "(UTC-03:00) Buenos Aires",
                    "utc": [
                    "America/Argentina/Buenos_Aires",
                    "America/Argentina/Catamarca",
                    "America/Argentina/Cordoba",
                    "America/Argentina/Jujuy",
                    "America/Argentina/La_Rioja",
                    "America/Argentina/Mendoza",
                    "America/Argentina/Rio_Gallegos",
                    "America/Argentina/Salta",
                    "America/Argentina/San_Juan",
                    "America/Argentina/San_Luis",
                    "America/Argentina/Tucuman",
                    "America/Argentina/Ushuaia",
                    "America/Buenos_Aires",
                    "America/Catamarca",
                    "America/Cordoba",
                    "America/Jujuy",
                    "America/Mendoza"
                    ]
                },
                {
                    "value": "SA Eastern Standard Time",
                    "abbr": "SEST",
                    "offset": -3,
                    "isdst": false,
                    "text": "(UTC-03:00) Cayenne, Fortaleza",
                    "utc": [
                    "America/Araguaina",
                    "America/Belem",
                    "America/Cayenne",
                    "America/Fortaleza",
                    "America/Maceio",
                    "America/Paramaribo",
                    "America/Recife",
                    "America/Santarem",
                    "Antarctica/Rothera",
                    "Atlantic/Stanley",
                    "Etc/GMT+3"
                    ]
                },
                {
                    "value": "Greenland Standard Time",
                    "abbr": "GDT",
                    "offset": -3,
                    "isdst": true,
                    "text": "(UTC-03:00) Greenland",
                    "utc": [
                    "America/Godthab"
                    ]
                },
                {
                    "value": "Montevideo Standard Time",
                    "abbr": "MST",
                    "offset": -3,
                    "isdst": false,
                    "text": "(UTC-03:00) Montevideo",
                    "utc": [
                    "America/Montevideo"
                    ]
                },
                {
                    "value": "Bahia Standard Time",
                    "abbr": "BST",
                    "offset": -3,
                    "isdst": false,
                    "text": "(UTC-03:00) Salvador",
                    "utc": [
                    "America/Bahia"
                    ]
                },
                {
                    "value": "UTC-02",
                    "abbr": "U",
                    "offset": -2,
                    "isdst": false,
                    "text": "(UTC-02:00) Coordinated Universal Time-02",
                    "utc": [
                    "America/Noronha",
                    "Atlantic/South_Georgia",
                    "Etc/GMT+2"
                    ]
                },
                {
                    "value": "Mid-Atlantic Standard Time",
                    "abbr": "MDT",
                    "offset": -1,
                    "isdst": true,
                    "text": "(UTC-02:00) Mid-Atlantic - Old",
                    "utc": []
                },
                {
                    "value": "Azores Standard Time",
                    "abbr": "ADT",
                    "offset": 0,
                    "isdst": true,
                    "text": "(UTC-01:00) Azores",
                    "utc": [
                    "America/Scoresbysund",
                    "Atlantic/Azores"
                    ]
                },
                {
                    "value": "Cape Verde Standard Time",
                    "abbr": "CVST",
                    "offset": -1,
                    "isdst": false,
                    "text": "(UTC-01:00) Cape Verde Is.",
                    "utc": [
                    "Atlantic/Cape_Verde",
                    "Etc/GMT+1"
                    ]
                },
                {
                    "value": "Morocco Standard Time",
                    "abbr": "MDT",
                    "offset": 1,
                    "isdst": true,
                    "text": "(UTC) Casablanca",
                    "utc": [
                    "Africa/Casablanca",
                    "Africa/El_Aaiun"
                    ]
                },
                {
                    "value": "UTC",
                    "abbr": "UTC",
                    "offset": 0,
                    "isdst": false,
                    "text": "(UTC) Coordinated Universal Time",
                    "utc": [
                    "America/Danmarkshavn",
                    "Etc/GMT"
                    ]
                },
                {
                    "value": "GMT Standard Time",
                    "abbr": "GMT",
                    "offset": 0,
                    "isdst": false,
                    "text": "(UTC) Edinburgh, London",
                    "utc": [
                    "Europe/Isle_of_Man",
                    "Europe/Guernsey",
                    "Europe/Jersey",
                    "Europe/London"
                    ]
                },
                {
                    "value": "British Summer Time",
                    "abbr": "BST",
                    "offset": 1,
                    "isdst": true,
                    "text": "(UTC+01:00) Edinburgh, London",
                    "utc": [
                    "Europe/Isle_of_Man",
                    "Europe/Guernsey",
                    "Europe/Jersey",
                    "Europe/London"
                    ]
                },
                {
                    "value": "GMT Standard Time",
                    "abbr": "GDT",
                    "offset": 1,
                    "isdst": true,
                    "text": "(UTC) Dublin, Lisbon",
                    "utc": [
                    "Atlantic/Canary",
                    "Atlantic/Faeroe",
                    "Atlantic/Madeira",
                    "Europe/Dublin",
                    "Europe/Lisbon"
                    ]
                },
                {
                    "value": "Greenwich Standard Time",
                    "abbr": "GST",
                    "offset": 0,
                    "isdst": false,
                    "text": "(UTC) Monrovia, Reykjavik",
                    "utc": [
                    "Africa/Abidjan",
                    "Africa/Accra",
                    "Africa/Bamako",
                    "Africa/Banjul",
                    "Africa/Bissau",
                    "Africa/Conakry",
                    "Africa/Dakar",
                    "Africa/Freetown",
                    "Africa/Lome",
                    "Africa/Monrovia",
                    "Africa/Nouakchott",
                    "Africa/Ouagadougou",
                    "Africa/Sao_Tome",
                    "Atlantic/Reykjavik",
                    "Atlantic/St_Helena"
                    ]
                },
                {
                    "value": "W. Europe Standard Time",
                    "abbr": "WEDT",
                    "offset": 2,
                    "isdst": true,
                    "text": "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
                    "utc": [
                    "Arctic/Longyearbyen",
                    "Europe/Amsterdam",
                    "Europe/Andorra",
                    "Europe/Berlin",
                    "Europe/Busingen",
                    "Europe/Gibraltar",
                    "Europe/Luxembourg",
                    "Europe/Malta",
                    "Europe/Monaco",
                    "Europe/Oslo",
                    "Europe/Rome",
                    "Europe/San_Marino",
                    "Europe/Stockholm",
                    "Europe/Vaduz",
                    "Europe/Vatican",
                    "Europe/Vienna",
                    "Europe/Zurich"
                    ]
                },
                {
                    "value": "Central Europe Standard Time",
                    "abbr": "CEDT",
                    "offset": 2,
                    "isdst": true,
                    "text": "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
                    "utc": [
                    "Europe/Belgrade",
                    "Europe/Bratislava",
                    "Europe/Budapest",
                    "Europe/Ljubljana",
                    "Europe/Podgorica",
                    "Europe/Prague",
                    "Europe/Tirane"
                    ]
                },
                {
                    "value": "Romance Standard Time",
                    "abbr": "RDT",
                    "offset": 2,
                    "isdst": true,
                    "text": "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris",
                    "utc": [
                    "Africa/Ceuta",
                    "Europe/Brussels",
                    "Europe/Copenhagen",
                    "Europe/Madrid",
                    "Europe/Paris"
                    ]
                },
                {
                    "value": "Central European Standard Time",
                    "abbr": "CEDT",
                    "offset": 2,
                    "isdst": true,
                    "text": "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb",
                    "utc": [
                    "Europe/Sarajevo",
                    "Europe/Skopje",
                    "Europe/Warsaw",
                    "Europe/Zagreb"
                    ]
                },
                {
                    "value": "W. Central Africa Standard Time",
                    "abbr": "WCAST",
                    "offset": 1,
                    "isdst": false,
                    "text": "(UTC+01:00) West Central Africa",
                    "utc": [
                    "Africa/Algiers",
                    "Africa/Bangui",
                    "Africa/Brazzaville",
                    "Africa/Douala",
                    "Africa/Kinshasa",
                    "Africa/Lagos",
                    "Africa/Libreville",
                    "Africa/Luanda",
                    "Africa/Malabo",
                    "Africa/Ndjamena",
                    "Africa/Niamey",
                    "Africa/Porto-Novo",
                    "Africa/Tunis",
                    "Etc/GMT-1"
                    ]
                },
                {
                    "value": "Namibia Standard Time",
                    "abbr": "NST",
                    "offset": 1,
                    "isdst": false,
                    "text": "(UTC+01:00) Windhoek",
                    "utc": [
                    "Africa/Windhoek"
                    ]
                },
                {
                    "value": "GTB Standard Time",
                    "abbr": "GDT",
                    "offset": 3,
                    "isdst": true,
                    "text": "(UTC+02:00) Athens, Bucharest",
                    "utc": [
                    "Asia/Nicosia",
                    "Europe/Athens",
                    "Europe/Bucharest",
                    "Europe/Chisinau"
                    ]
                },
                {
                    "value": "Middle East Standard Time",
                    "abbr": "MEDT",
                    "offset": 3,
                    "isdst": true,
                    "text": "(UTC+02:00) Beirut",
                    "utc": [
                    "Asia/Beirut"
                    ]
                },
                {
                    "value": "Egypt Standard Time",
                    "abbr": "EST",
                    "offset": 2,
                    "isdst": false,
                    "text": "(UTC+02:00) Cairo",
                    "utc": [
                    "Africa/Cairo"
                    ]
                },
                {
                    "value": "Syria Standard Time",
                    "abbr": "SDT",
                    "offset": 3,
                    "isdst": false,
                    "text": "(UTC+02:00) Damascus",
                    "utc": [
                    "Asia/Damascus"
                    ]
                },
                {
                    "value": "E. Europe Standard Time",
                    "abbr": "EEDT",
                    "offset": 3,
                    "isdst": true,
                    "text": "(UTC+02:00) E. Europe",
                    "utc": [
                    "Asia/Nicosia",
                    "Europe/Athens",
                    "Europe/Bucharest",
                    "Europe/Chisinau",
                    "Europe/Helsinki",
                    "Europe/Kyiv",
                    "Europe/Mariehamn",
                    "Europe/Nicosia",
                    "Europe/Riga",
                    "Europe/Sofia",
                    "Europe/Tallinn",
                    "Europe/Uzhhorod",
                    "Europe/Vilnius",
                    "Europe/Zaporizhzhia"

                    ]
                },
                {
                    "value": "South Africa Standard Time",
                    "abbr": "SAST",
                    "offset": 2,
                    "isdst": false,
                    "text": "(UTC+02:00) Harare, Pretoria",
                    "utc": [
                    "Africa/Blantyre",
                    "Africa/Bujumbura",
                    "Africa/Gaborone",
                    "Africa/Harare",
                    "Africa/Johannesburg",
                    "Africa/Kigali",
                    "Africa/Lubumbashi",
                    "Africa/Lusaka",
                    "Africa/Maputo",
                    "Africa/Maseru",
                    "Africa/Mbabane",
                    "Etc/GMT-2"
                    ]
                },
                {
                    "value": "FLE Standard Time",
                    "abbr": "FDT",
                    "offset": 3,
                    "isdst": true,
                    "text": "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
                    "utc": [
                    "Europe/Helsinki",
                    "Europe/Kyiv",
                    "Europe/Mariehamn",
                    "Europe/Riga",
                    "Europe/Sofia",
                    "Europe/Tallinn",
                    "Europe/Uzhhorod",
                    "Europe/Vilnius",
                    "Europe/Zaporizhzhia"
                    ]
                },
                {
                    "value": "Turkey Standard Time",
                    "abbr": "TDT",
                    "offset": 3,
                    "isdst": false,
                    "text": "(UTC+03:00) Istanbul",
                    "utc": [
                    "Europe/Istanbul"
                    ]
                },
                {
                    "value": "Israel Standard Time",
                    "abbr": "JDT",
                    "offset": 3,
                    "isdst": true,
                    "text": "(UTC+02:00) Jerusalem",
                    "utc": [
                    "Asia/Jerusalem"
                    ]
                },
                {
                    "value": "Libya Standard Time",
                    "abbr": "LST",
                    "offset": 2,
                    "isdst": false,
                    "text": "(UTC+02:00) Tripoli",
                    "utc": [
                    "Africa/Tripoli"
                    ]
                },
                {
                    "value": "Jordan Standard Time",
                    "abbr": "JST",
                    "offset": 3,
                    "isdst": false,
                    "text": "(UTC+03:00) Amman",
                    "utc": [
                    "Asia/Amman"
                    ]
                },
                {
                    "value": "Arabic Standard Time",
                    "abbr": "AST",
                    "offset": 3,
                    "isdst": false,
                    "text": "(UTC+03:00) Baghdad",
                    "utc": [
                    "Asia/Baghdad"
                    ]
                },
                {
                    "value": "Kaliningrad Standard Time",
                    "abbr": "KST",
                    "offset": 3,
                    "isdst": false,
                    "text": "(UTC+02:00) Kaliningrad",
                    "utc": [
                    "Europe/Kaliningrad"
                    ]
                },
                {
                    "value": "Arab Standard Time",
                    "abbr": "AST",
                    "offset": 3,
                    "isdst": false,
                    "text": "(UTC+03:00) Kuwait, Riyadh",
                    "utc": [
                    "Asia/Aden",
                    "Asia/Bahrain",
                    "Asia/Kuwait",
                    "Asia/Qatar",
                    "Asia/Riyadh"
                    ]
                },
                {
                    "value": "E. Africa Standard Time",
                    "abbr": "EAST",
                    "offset": 3,
                    "isdst": false,
                    "text": "(UTC+03:00) Nairobi",
                    "utc": [
                    "Africa/Addis_Ababa",
                    "Africa/Asmera",
                    "Africa/Dar_es_Salaam",
                    "Africa/Djibouti",
                    "Africa/Juba",
                    "Africa/Kampala",
                    "Africa/Khartoum",
                    "Africa/Mogadishu",
                    "Africa/Nairobi",
                    "Antarctica/Syowa",
                    "Etc/GMT-3",
                    "Indian/Antananarivo",
                    "Indian/Comoro",
                    "Indian/Mayotte"
                    ]
                },
                {
                    "value": "Moscow Standard Time",
                    "abbr": "MSK",
                    "offset": 3,
                    "isdst": false,
                    "text": "(UTC+03:00) Moscow, St. Petersburg, Volgograd, Minsk",
                    "utc": [
                        "Europe/Kirov",
                    "Europe/Moscow",
                    "Europe/Simferopol",
                    "Europe/Volgograd",
                    "Europe/Minsk"
                    ]
                },
                {
                    "value": "Samara Time",
                    "abbr": "SAMT",
                    "offset": 4,
                    "isdst": false,
                    "text": "(UTC+04:00) Samara, Ulyanovsk, Saratov",
                    "utc": [
                        "Europe/Astrakhan",
                    "Europe/Samara",
                        "Europe/Ulyanovsk"
                    ]
                },
                {
                    "value": "Iran Standard Time",
                    "abbr": "IDT",
                    "offset": 4.5,
                    "isdst": true,
                    "text": "(UTC+03:30) Tehran",
                    "utc": [
                    "Asia/Tehran"
                    ]
                },
                {
                    "value": "Arabian Standard Time",
                    "abbr": "AST",
                    "offset": 4,
                    "isdst": false,
                    "text": "(UTC+04:00) Abu Dhabi, Muscat",
                    "utc": [
                    "Asia/Dubai",
                    "Asia/Muscat",
                    "Etc/GMT-4"
                    ]
                },
                {
                    "value": "Azerbaijan Standard Time",
                    "abbr": "ADT",
                    "offset": 5,
                    "isdst": true,
                    "text": "(UTC+04:00) Baku",
                    "utc": [
                    "Asia/Baku"
                    ]
                },
                {
                    "value": "Mauritius Standard Time",
                    "abbr": "MST",
                    "offset": 4,
                    "isdst": false,
                    "text": "(UTC+04:00) Port Louis",
                    "utc": [
                    "Indian/Mahe",
                    "Indian/Mauritius",
                    "Indian/Reunion"
                    ]
                },
                {
                    "value": "Georgian Standard Time",
                    "abbr": "GET",
                    "offset": 4,
                    "isdst": false,
                    "text": "(UTC+04:00) Tbilisi",
                    "utc": [
                    "Asia/Tbilisi"
                    ]
                },
                {
                    "value": "Caucasus Standard Time",
                    "abbr": "CST",
                    "offset": 4,
                    "isdst": false,
                    "text": "(UTC+04:00) Yerevan",
                    "utc": [
                    "Asia/Yerevan"
                    ]
                },
                {
                    "value": "Afghanistan Standard Time",
                    "abbr": "AST",
                    "offset": 4.5,
                    "isdst": false,
                    "text": "(UTC+04:30) Kabul",
                    "utc": [
                    "Asia/Kabul"
                    ]
                },
                {
                    "value": "West Asia Standard Time",
                    "abbr": "WAST",
                    "offset": 5,
                    "isdst": false,
                    "text": "(UTC+05:00) Ashgabat, Tashkent",
                    "utc": [
                    "Antarctica/Mawson",
                    "Asia/Aqtau",
                    "Asia/Aqtobe",
                    "Asia/Ashgabat",
                    "Asia/Dushanbe",
                    "Asia/Oral",
                    "Asia/Samarkand",
                    "Asia/Tashkent",
                    "Etc/GMT-5",
                    "Indian/Kerguelen",
                    "Indian/Maldives"
                    ]
                },
                {
                    "value": "Yekaterinburg Time",
                    "abbr": "YEKT",
                    "offset": 5,
                    "isdst": false,
                    "text": "(UTC+05:00) Yekaterinburg",
                    "utc": [
                    "Asia/Yekaterinburg"
                    ]
                },
                {
                    "value": "Pakistan Standard Time",
                    "abbr": "PKT",
                    "offset": 5,
                    "isdst": false,
                    "text": "(UTC+05:00) Islamabad, Karachi",
                    "utc": [
                    "Asia/Karachi"
                    ]
                },
                {
                    "value": "India Standard Time",
                    "abbr": "IST",
                    "offset": 5.5,
                    "isdst": false,
                    "text": "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
                    "utc": [
                    "Asia/Kolkata",
                    "Asia/Calcutta"
                    ]
                },
                {
                    "value": "Sri Lanka Standard Time",
                    "abbr": "SLST",
                    "offset": 5.5,
                    "isdst": false,
                    "text": "(UTC+05:30) Sri Jayawardenepura",
                    "utc": [
                    "Asia/Colombo"
                    ]
                },
                {
                    "value": "Nepal Standard Time",
                    "abbr": "NST",
                    "offset": 5.75,
                    "isdst": false,
                    "text": "(UTC+05:45) Kathmandu",
                    "utc": [
                    "Asia/Kathmandu"
                    ]
                },
                {
                    "value": "Central Asia Standard Time",
                    "abbr": "CAST",
                    "offset": 6,
                    "isdst": false,
                    "text": "(UTC+06:00) Nur-Sultan (Astana)",
                    "utc": [
                    "Antarctica/Vostok",
                    "Asia/Almaty",
                    "Asia/Bishkek",
                    "Asia/Qyzylorda",
                    "Asia/Urumqi",
                    "Etc/GMT-6",
                    "Indian/Chagos"
                    ]
                },
                {
                    "value": "Bangladesh Standard Time",
                    "abbr": "BST",
                    "offset": 6,
                    "isdst": false,
                    "text": "(UTC+06:00) Dhaka",
                    "utc": [
                    "Asia/Dhaka",
                    "Asia/Thimphu"
                    ]
                },
                {
                    "value": "Myanmar Standard Time",
                    "abbr": "MST",
                    "offset": 6.5,
                    "isdst": false,
                    "text": "(UTC+06:30) Yangon (Rangoon)",
                    "utc": [
                    "Asia/Rangoon",
                    "Indian/Cocos"
                    ]
                },
                {
                    "value": "SE Asia Standard Time",
                    "abbr": "SAST",
                    "offset": 7,
                    "isdst": false,
                    "text": "(UTC+07:00) Bangkok, Hanoi, Jakarta",
                    "utc": [
                    "Antarctica/Davis",
                    "Asia/Bangkok",
                    "Asia/Hovd",
                    "Asia/Jakarta",
                    "Asia/Phnom_Penh",
                    "Asia/Pontianak",
                    "Asia/Saigon",
                    "Asia/Vientiane",
                    "Etc/GMT-7",
                    "Indian/Christmas"
                    ]
                },
                {
                    "value": "N. Central Asia Standard Time",
                    "abbr": "NCAST",
                    "offset": 7,
                    "isdst": false,
                    "text": "(UTC+07:00) Novosibirsk",
                    "utc": [
                    "Asia/Novokuznetsk",
                    "Asia/Novosibirsk",
                    "Asia/Omsk",
                    "Asia/Tomsk"
                    ]
                },
                {
                    "value": "China Standard Time",
                    "abbr": "CST",
                    "offset": 8,
                    "isdst": false,
                    "text": "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
                    "utc": [
                    "Asia/Hong_Kong",
                    "Asia/Macau",
                    "Asia/Shanghai"
                    ]
                },
                {
                    "value": "North Asia Standard Time",
                    "abbr": "NAST",
                    "offset": 8,
                    "isdst": false,
                    "text": "(UTC+08:00) Krasnoyarsk",
                    "utc": [
                    "Asia/Krasnoyarsk"
                    ]
                },
                {
                    "value": "Singapore Standard Time",
                    "abbr": "MPST",
                    "offset": 8,
                    "isdst": false,
                    "text": "(UTC+08:00) Kuala Lumpur, Singapore",
                    "utc": [
                    "Asia/Brunei",
                    "Asia/Kuala_Lumpur",
                    "Asia/Kuching",
                    "Asia/Makassar",
                    "Asia/Manila",
                    "Asia/Singapore",
                    "Etc/GMT-8"
                    ]
                },
                {
                    "value": "W. Australia Standard Time",
                    "abbr": "WAST",
                    "offset": 8,
                    "isdst": false,
                    "text": "(UTC+08:00) Perth",
                    "utc": [
                    "Antarctica/Casey",
                    "Australia/Perth"
                    ]
                },
                {
                    "value": "Taipei Standard Time",
                    "abbr": "TST",
                    "offset": 8,
                    "isdst": false,
                    "text": "(UTC+08:00) Taipei",
                    "utc": [
                    "Asia/Taipei"
                    ]
                },
                {
                    "value": "Ulaanbaatar Standard Time",
                    "abbr": "UST",
                    "offset": 8,
                    "isdst": false,
                    "text": "(UTC+08:00) Ulaanbaatar",
                    "utc": [
                    "Asia/Choibalsan",
                    "Asia/Ulaanbaatar"
                    ]
                },
                {
                    "value": "North Asia East Standard Time",
                    "abbr": "NAEST",
                    "offset": 8,
                    "isdst": false,
                    "text": "(UTC+08:00) Irkutsk",
                    "utc": [
                    "Asia/Irkutsk"
                    ]
                },
                {
                    "value": "Japan Standard Time",
                    "abbr": "JST",
                    "offset": 9,
                    "isdst": false,
                    "text": "(UTC+09:00) Osaka, Sapporo, Tokyo",
                    "utc": [
                    "Asia/Dili",
                    "Asia/Jayapura",
                    "Asia/Tokyo",
                    "Etc/GMT-9",
                    "Pacific/Palau"
                    ]
                },
                {
                    "value": "Korea Standard Time",
                    "abbr": "KST",
                    "offset": 9,
                    "isdst": false,
                    "text": "(UTC+09:00) Seoul",
                    "utc": [
                    "Asia/Pyongyang",
                    "Asia/Seoul"
                    ]
                },
                {
                    "value": "Cen. Australia Standard Time",
                    "abbr": "CAST",
                    "offset": 9.5,
                    "isdst": false,
                    "text": "(UTC+09:30) Adelaide",
                    "utc": [
                    "Australia/Adelaide",
                    "Australia/Broken_Hill"
                    ]
                },
                {
                    "value": "AUS Central Standard Time",
                    "abbr": "ACST",
                    "offset": 9.5,
                    "isdst": false,
                    "text": "(UTC+09:30) Darwin",
                    "utc": [
                    "Australia/Darwin"
                    ]
                },
                {
                    "value": "E. Australia Standard Time",
                    "abbr": "EAST",
                    "offset": 10,
                    "isdst": false,
                    "text": "(UTC+10:00) Brisbane",
                    "utc": [
                    "Australia/Brisbane",
                    "Australia/Lindeman"
                    ]
                },
                {
                    "value": "AUS Eastern Standard Time",
                    "abbr": "AEST",
                    "offset": 10,
                    "isdst": false,
                    "text": "(UTC+10:00) Canberra, Melbourne, Sydney",
                    "utc": [
                    "Australia/Melbourne",
                    "Australia/Sydney"
                    ]
                },
                {
                    "value": "West Pacific Standard Time",
                    "abbr": "WPST",
                    "offset": 10,
                    "isdst": false,
                    "text": "(UTC+10:00) Guam, Port Moresby",
                    "utc": [
                    "Antarctica/DumontDUrville",
                    "Etc/GMT-10",
                    "Pacific/Guam",
                    "Pacific/Port_Moresby",
                    "Pacific/Saipan",
                    "Pacific/Truk"
                    ]
                },
                {
                    "value": "Tasmania Standard Time",
                    "abbr": "TST",
                    "offset": 10,
                    "isdst": false,
                    "text": "(UTC+10:00) Hobart",
                    "utc": [
                    "Australia/Currie",
                    "Australia/Hobart"
                    ]
                },
                {
                    "value": "Yakutsk Standard Time",
                    "abbr": "YST",
                    "offset": 9,
                    "isdst": false,
                    "text": "(UTC+09:00) Yakutsk",
                    "utc": [
                    "Asia/Chita",
                    "Asia/Khandyga",
                    "Asia/Yakutsk"
                    ]
                },
                {
                    "value": "Central Pacific Standard Time",
                    "abbr": "CPST",
                    "offset": 11,
                    "isdst": false,
                    "text": "(UTC+11:00) Solomon Is., New Caledonia",
                    "utc": [
                    "Antarctica/Macquarie",
                    "Etc/GMT-11",
                    "Pacific/Efate",
                    "Pacific/Guadalcanal",
                    "Pacific/Kosrae",
                    "Pacific/Noumea",
                    "Pacific/Ponape"
                    ]
                },
                {
                    "value": "Vladivostok Standard Time",
                    "abbr": "VLAT",
                    "offset": 10,
                    "isdst": false,
                    "text": "(UTC+10:00) Vladivostok",
                    "utc": [
                    "Asia/Ust-Nera",
                    "Asia/Vladivostok"
                    ]
                },
                {
                    "value": "Sakhalin Standard Time",
                    "abbr": "SAKT",
                    "offset": 11,
                    "isdst": false,
                    "text": "(UTC+11:00) Sakhalin",
                    "utc": [
                    "Asia/Sakhalin"
                    ]
                },

                {
                    "value": "New Zealand Standard Time",
                    "abbr": "NZST",
                    "offset": 12,
                    "isdst": false,
                    "text": "(UTC+12:00) Auckland, Wellington",
                    "utc": [
                    "Antarctica/McMurdo",
                    "Pacific/Auckland"
                    ]
                },
                {
                    "value": "UTC+12",
                    "abbr": "U",
                    "offset": 12,
                    "isdst": false,
                    "text": "(UTC+12:00) Coordinated Universal Time+12",
                    "utc": [
                    "Etc/GMT-12",
                    "Pacific/Funafuti",
                    "Pacific/Kwajalein",
                    "Pacific/Majuro",
                    "Pacific/Nauru",
                    "Pacific/Tarawa",
                    "Pacific/Wake",
                    "Pacific/Wallis"
                    ]
                },
                {
                    "value": "Fiji Standard Time",
                    "abbr": "FST",
                    "offset": 12,
                    "isdst": false,
                    "text": "(UTC+12:00) Fiji",
                    "utc": [
                    "Pacific/Fiji"
                    ]
                },
                {
                    "value": "Magadan Standard Time",
                    "abbr": "MST",
                    "offset": 12,
                    "isdst": false,
                    "text": "(UTC+12:00) Magadan",
                    "utc": [
                    "Asia/Anadyr",
                    "Asia/Kamchatka",
                    "Asia/Magadan",
                    "Asia/Srednekolymsk"
                    ]
                },
                {
                    "value": "Kamchatka Standard Time",
                    "abbr": "KDT",
                    "offset": 13,
                    "isdst": true,
                    "text": "(UTC+12:00) Petropavlovsk-Kamchatsky - Old",
                    "utc": [
                    "Asia/Kamchatka"
                    ]
                },
                {
                    "value": "Tonga Standard Time",
                    "abbr": "TST",
                    "offset": 13,
                    "isdst": false,
                    "text": "(UTC+13:00) Nuku'alofa",
                    "utc": [
                    "Etc/GMT-13",
                    "Pacific/Enderbury",
                    "Pacific/Fakaofo",
                    "Pacific/Tongatapu"
                    ]
                },
                {
                    "value": "Samoa Standard Time",
                    "abbr": "SST",
                    "offset": 13,
                    "isdst": false,
                    "text": "(UTC+13:00) Samoa",
                    "utc": [
                    "Pacific/Apia"
                    ]
                }
            ]
        }
    },
};
</script>
