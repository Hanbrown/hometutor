<script setup>
import AuthMenu from "../components/AuthMenu.vue";
import StudentMenu from "../components/StudentMenu.vue";
import Session from "../components/Session.vue";
import NameMenu from "../components/NameMenu.vue";

const add_session = async () => {
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
    console.log(res_json);
    window.location.reload();
}
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
                <button class="btn btn-invoice" ><font-awesome-icon icon="print" /></button>
                <button class="btn btn-add-class" @click="add_session" >New Class</button>
                <span class="date-range">
                    <input type="text" id="date-start">
                    &ndash;
                    <input type="text" id="date-end">
                    <button class="btn btn-dates">Filter</button>
                    <button class="btn btn-dates">Reset</button>
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
        this.getSessions(),
        this.getStudents()
    },
    methods: {
        // TODO: Eventually send the cookie here
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
            console.log(key);
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
        }
    }
};
</script>
