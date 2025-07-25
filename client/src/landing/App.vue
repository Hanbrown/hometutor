<script setup>
import Student from "../components/Student.vue";
import RateMenu from "../components/RateMenu.vue";
import AuthMenu from "../components/AuthMenu.vue";
import NewStudent from "../components/NewStudent.vue";
import IconButton from "../components/IconButton.vue";

import { getCookie } from "../assets/util";
</script>

<template>
    <main id="main">
        <div class="tile">
            <header>
                <span class="header-left"><a class="screen-reader-only">Skip to Content</a></span>
                <h3>Students</h3>
                <auth-menu>{{ User.displayName ? User.displayName.split(" ")[0] : "Joost" }}</auth-menu>
            </header>
            <div id="student-table">
                <div class="table-header">
                    <span class="table-text student-id-header"></span>
                    <span class="table-text student-name-header">Student</span>
                    <span class="table-text student-status">All</span>
                    <span class="table-text student-del-header"></span>
                    <span class="table-text student-btn-header">
                        <icon-button classes="btn btn-add" base="plus" alt="caret-up" label="Open/close new student menu" @clicked="toggle_new_student"></icon-button>
                    </span>
                </div>
                <div class="row-container">
                        <new-student
                            id="new-student-menu" 
                            class="hidden" 
                            :default="User.rate" 
                            @cancelled="toggle_new_student" 
                            @saved="save_new_student"
                        ></new-student>
                        <student v-for="(student) in Students"
                            :key="student.id"
                            :id="student.id"
                            :fname="student.fname" 
                            :lname="student.lname" 
                            :active="student.active.toString()"
                        ></student>
                        <div :class="`student-row`" v-if="Students.length === 0">
                            <h5 class="table-text rate-table">No Students, add one!</h5>
                        </div>
                </div>
            </div>
            <rate-menu :default="User.rate" @saved="save_rate"></rate-menu>
        </div>
    </main>
</template>

<script>
export default {
    name: "app",
    components: {
        Student,
        RateMenu,
        NewStudent,
        IconButton
    },
    async mounted() {
        this.populateUser(),
        this.getStudents()
    },
    methods: {
        populateUser() {
            this.User = {
                displayName: decodeURIComponent(getCookie("displayName")),
                rate: getCookie("rate"),
            }
        },
        async getStudents() {
            const res = await fetch(`/api/students/read`);
            const res_json = await res.json();
            if (!res_json.error) {
                // Return an array with active students, sorted by first name, above inactive students, also sorted by first name
                let data_active = res_json.data.filter((datum) => datum.active);
                let data_inactive = res_json.data.filter((datum) => !datum.active);

                data_active = data_active.sort((a, b) => a.fname > b.fname);
                data_inactive = data_inactive.sort((a, b) => a.fname > b.fname);

                this.Students = data_active.concat(data_inactive);
            }
            else {
                console.log("Error");
            }
        },
        async save_new_student(payload) {    
            try {
                // Show spinner and hide save button
                document.querySelector(`.add-menu .spinner`).classList.remove("hidden");
                document.querySelector(`.add-menu .btn-add`).classList.add("hidden");

                let new_student = {
                    fname: payload.fname,
                    lname: payload.lname,
                    active: payload.active,
                    rate: payload.rate
                };

                const res = await fetch("/api/students/add", {
                    method: "post",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(new_student),
                });
                const res_json = await res.json();
                if (!res_json.error) {
                    new_student["id"] = res_json.data.id;
                    this.Students = [
                        new_student,
                        ...this.Students
                    ];
                }
                else {
                    window.alert(res_json.msg);
                }
            }
            catch (err) {
                console.log(err);
                window.alert("An error occurred");
            }
            finally {
                // Hide spinner and show save button
                document.querySelector(`.add-menu .spinner`).classList.add("hidden");
                document.querySelector(`.add-menu .btn-add`).classList.remove("hidden");
            }
        },
        async save_rate() {
            document.querySelector("#rate-menu .btn-add").classList.add("hidden");
            document.querySelector("#rate-menu .spinner").classList.remove("hidden");

            const _rate = document.getElementById("rate-field").value;
            const res = await fetch(`/api/users/update`, {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rate: _rate
                })
            });
            const res_json = await res.json();
            if (!res_json.error) {
                this.User.rate = _rate;
            }
            else {
                window.alert(res_json.msg);
            }            
            document.querySelector("#rate-menu .btn-add").classList.remove("hidden");
            document.querySelector("#rate-menu .spinner").classList.add("hidden");

        },
        toggle_new_student() {
            document.getElementById("new-student-menu").classList.toggle("hidden");
        }
    },
    data() {
        return {
            User: {},
            Students: [],
        }
    }
};
</script>