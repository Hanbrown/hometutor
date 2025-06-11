<script setup>
import AuthMenu from "../components/AuthMenu.vue";
import StudentMenu from "../components/StudentMenu.vue";
import Session from "../components/Session.vue";
import NameMenu from "../components/NameMenu.vue";
</script>

<template>
    <main id="main">
        <div class="tile">
            <header>
                <span class="header-left"
                    ><a class="screen-reader-only">Skip to Content</a
                    ><a class="nav-back btn" href="/"><font-awesome-icon icon="caret-left" />&nbsp;Back</a></span
                >
                <student-menu></student-menu>
                <auth-menu></auth-menu>
            </header>
            <div class="session-controls">
                <button class="btn btn-invoice" ><font-awesome-icon icon="print" /></button>
                <button class="btn btn-add-class" >New Class</button>
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
                                    <li class="check-list-li"><a href="#">All</a></li>
                                    <li class="check-list-li"><a href="#">Clear</a></li>
                                    <li class="check-list-li"><a href="#">Paid</a></li>
                                    <li class="check-list-li"><a href="#">Unpaid</a></li>
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
                    <session selected="false" id="1" paid="true"></session>
                </div>
            </div>
            <name-menu @saved="console.log('saved')" :fname="fname" :lname="lname"></name-menu>
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
    props: {
        id:             { required: true, default: 9999, type: Number },
        fname:          { required: false, default: "Joost", type: String },
        lname:          { required: false, default: "Doe", type: String },
        active:         { required: true, default: true, type: Boolean }
    }
};
</script>
