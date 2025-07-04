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
                <icon-button classes="btn btn-add-class" label="Add new class" @clicked="add_session">&nbsp;New Class</icon-button>
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
                        @selected="updateFiltered(sesh.number)"
                    >
                    </session>
                    <div :class="`session-row`" v-if="Filtered.length === 0">
                        <h5 class="table-text rate-table">No Classes, add one!</h5>
                    </div>

                </div>
            </div>
            <name-menu :fname="CurrentStudent.fname" :lname="CurrentStudent.lname" :active="CurrentStudent.active" :rate="CurrentStudent.rate"></name-menu>
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
                rate: getCookie("rate"),
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
            }
            else {
                window.alert(res_json.msg);
            }
        },
        async getSessions() {
            const res = await fetch(`/api/sessions/read/${getCookie("student")}`);
            const res_json = await res.json();
            if (!res_json.error) {
                this.Sessions = res_json.data;
                this.Filtered = res_json.data;
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
                this.CurrentStudent = res_json.data.filter(el => el.id_short === Number(getCookie("student")))[0];
            }
            else {
                console.log(res_json.msg);
            }
        },
        async get_invoice() {
            const res = await fetch("/api/sessions/invoice", {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    student: this.CurrentStudent,
                    sessions: this.Filtered.filter((el) => el.selected).sort((a, b) => a.number > b.number),
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

                this.Filtered = this.Filtered.filter((el) => ((new Date(el.in_time)) >= start && (new Date(el.in_time)) <= end));
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
        }
    },
    data() {
        return {
            Sessions: [],
            Filtered: [],
            AllStudents: [],
            CurrentStudent: {},
            Dates: { start: undefined, end: undefined },
            User: {}
        }
    }
};
</script>
