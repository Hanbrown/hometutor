<script setup>
import AuthMenu from "../components/AuthMenu.vue";
import StudentMenu from "../components/StudentMenu.vue";
import Session from "../components/Session.vue";
</script>

<template>
    <main id="main">
        <div class="tile">
            <header>
                <span class="header-left"
                    ><a class="screen-reader-only">Skip to Content</a
                    ><a class="nav-back btn" href="/">< Back</a></span
                >
                <student-menu></student-menu>
                <auth-menu></auth-menu>
            </header>
            <div class="session-controls">
                <button class="btn btn-invoice" >Print Invoice</button>
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
                <table>
                    <tbody>
                        <tr class="table-header">
                            <th>
                                <details>
                                    <summary>VV</summary>
                                    <div class="check-list">
                                        <ul class="check-list-ul">
                                            <li class="check-list-li"><a href="#">All</a></li>
                                            <li class="check-list-li"><a href="#">Clear</a></li>
                                            <li class="check-list-li"><a href="#">Paid</a></li>
                                            <li class="check-list-li"><a href="#">Unpaid</a></li>
                                        </ul>
                                    </div>
                                </details>
                            </th>
                            <th>#</th>
                            <th>Date</th>
                            <th>In</th>
                            <th>Out</th>
                            <th>Rate</th>
                            <th>Charge</th>
                            <th><add-student></add-student></th>
                        </tr>
                        <session selected="false" id="1"></session>
                    </tbody>
                </table>
            </div>
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
    },
    data() {},
};
</script>
