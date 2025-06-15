<script setup>
import AuthMenu from "../components/AuthMenu.vue";
import StudentMenu from "../components/StudentMenu.vue";
import Session from "../components/Session.vue";
import NameMenu from "../components/NameMenu.vue";
import { format_date } from "../assets/util";

</script>

<template>
    <main id="main">
        <div class="tile">
            <header>
                <span class="header-left"
                    ><a class="screen-reader-only">Skip to Content</a
                    ><a class="nav-back btn" href="/"><font-awesome-icon icon="caret-left" />&nbsp;Back</a></span
                >
                <student-menu :current="CurrentStudent" :students="AllStudents"></student-menu>
                <auth-menu></auth-menu>
            </header>
            <div class="session-controls">
                <button class="btn btn-invoice" @click="get_invoice"><font-awesome-icon icon="print" />&nbsp;Invoice</button>
                <button class="btn btn-add-class" @click="add_session" >New Class</button>
                <span class="date-range">
                    <input type="text" id="date-start" :value="format_date(Dates.start)">
                    &ndash;
                    <input type="text" id="date-end" :value="format_date(Dates.end)">
                    <button class="btn btn-dates" @click="filterDates">Filter</button>
                    <button class="btn btn-dates" @click="resetDateFilter">Reset</button>
                </span>
            </div>
            <div id="session-table">
                <div class="table-header">
                    <span class="check-table">
                        <details>
                            <summary><font-awesome-icon icon="list-check" /></summary>
                            <div class="check-list">
                                <ul class="check-list-ul">
                                    <li class="check-list-li"><a href="#" @click="checkFiltered">Check All</a></li>
                                    <li class="check-list-li"><a href="#" @click="uncheckFiltered">Uncheck All</a></li>
                                    <li class="check-list-li"><a href="#" @click="viewAllSessions">View All</a></li>
                                    <li class="check-list-li"><a href="#" @click="viewPaidSessions">Paid</a></li>
                                    <li class="check-list-li"><a href="#" @click="viewUnpaidSessions">Unpaid</a></li>
                                </ul>
                            </div>
                        </details>
                    </span>
                    <span class="table-text id-table">#</span>
                    <span class="table-text date-table">Date</span>
                    <span class="table-text time-table">In</span>
                    <span class="table-text time-table">Out</span>
                    <span class="table-text rate-table">Rate</span>
                    <span class="table-text charge-table">Charge</span>
                    <span class="table-text btn-table"><add-student></add-student></span>
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
                </div>
            </div>
            <name-menu :fname="CurrentStudent.fname" :lname="CurrentStudent.lname" :active="CurrentStudent.active"></name-menu>
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
    },
    async mounted() {
        await this.getSessions(),
        await this.getStudents(),
        this.createDateFilter()
    },
    methods: {
        // TODO: Eventually send the cookie here
        async add_session() {
            const res = await fetch(`http://localhost:8081/api/sessions/add`, {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    student: Number(localStorage.getItem("student")),
                    in_time: Date.now()-(1000*60*60),
                    out_time: Date.now(),
                    rate: 65,
                    paid: false,
                }),
            });
            const res_json = await res.json();
            window.location.reload();
        },
        async getSessions() {
            const res = await fetch(`http://localhost:8081/api/sessions/read/${localStorage.getItem("student")}`);
            const res_json = await res.json();
            this.Sessions = res_json.data;
            this.Filtered = res_json.data;
        },
        async getStudents() {
            const res = await fetch(`http://localhost:8081/api/students/read`);
            const res_json = await res.json();
            this.AllStudents = res_json.data;
            this.CurrentStudent = res_json.data.filter(el => el.id_short === Number(localStorage.getItem("student")))[0];
        },
        async get_invoice() {
            const res = await fetch("http://localhost:8081/api/sessions/invoice", {
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
            const blob = await res.blob();
            const file = window.URL.createObjectURL(blob);
            window.open(file);
        },
        createDateFilter() {
            const start = this.Sessions[this.Sessions.length - 1].in_time;
            const end = this.Sessions[0].in_time;
            this.Dates = { start: start, end: end };
        },
        /**
         * Filter the "Filtered" list so that it only shows classes in the specified date range (inclusive)
         */
        filterDates() {
            const start = new Date(document.getElementById("date-start").value);
            let end = new Date(document.getElementById("date-end").value);

            // End defaults to 00:00, which is a problem for classes on the end date.
            end.setHours(23);
            end.setMinutes(59);

            this.Dates.start = start;
            this.Dates.end = end;

            this.Filtered = this.Filtered.filter((el) => ((new Date(el.in_time)) >= start && (new Date(el.in_time)) <= end));
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
        }
    },
    data() {
        return {
            Sessions: [],
            Filtered: [],
            AllStudents: [],
            CurrentStudent: {},
            Dates: { start: undefined, end: undefined },
        }
    }
};
</script>
