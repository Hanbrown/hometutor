<script setup>
import ManageBtn from './ManageBtn.vue';
import DeleteStudent from './DeleteStudent.vue';

const openDetails = (class_id) => {
    document.querySelector(`#details-${class_id}`).classList.toggle("hidden");
}
</script>

<template>
    <div :id="`row-${id}`" :class="`session-row ${(paid === 'true') ? '' : 'unpaid'}`">
        <div class="row-top">
            <!-- Show either a checked or unchecked box -->
            <span v-if="(selected === 'true')" class="table-text check-table"><input type="checkbox" checked /></span>
            <span v-else class="table-text check-table"><input type="checkbox" unchecked /></span>
            <!-- All the other fields -->
            <span class="table-text id-table">{{ id }}</span>
            <span class="table-text date-table">{{ format_date(time_in) }}</span>
            <span class="table-text time-table class-in">{{ format_time(time_in) }}</span>
            <span class="table-text time-table class-in">{{ format_time(time_out) }}</span>
            <span class="table-text rate-table">${{ rate }}</span>
            <span class="table-text charge-table">${{ getCharge(time_in, time_out, rate) }}</span>
            <span class="table-text btn-table"><manage-btn @clicked="openDetails(id)" should_switch=true></manage-btn></span>
        </div>
        <div :id="`details-${id}`" class="row-bottom hidden">
            <!-- Show either a checked or unchecked box -->
            <span class="table-input check-table-input">
                <input v-if="(paid === 'true')" type="checkbox" :id="`${id}-paid`" checked />
                <input v-else type="checkbox" :id="`${id}-paid`" unchecked />
                <label :for="`${id}-paid`">Paid</label>
            </span>
            <!-- All the other fields -->
            <span class="table-input date-table"><input type="text"></span>
            <span class="table-input time-table class-in"><input type="text"></span>
            <span class="table-input time-table class-in"><input type="text"></span>
            <span class="table-input rate-table"><input type="text"></span>
            <span class="table-input btn-table-input">
                <button class="btn btn-add"><font-awesome-icon icon="save" /></button>&nbsp;&nbsp;
                <delete-student></delete-student>
            </span>
        </div>
    </div>
</template>

<script>
const format_date = (msec) => {
    let temp_date = new Date(msec);
    return `${temp_date.getMonth()+1}/${temp_date.getDate()}/${temp_date.getFullYear()}`;
}

const format_time = (msec) => {
    let temp_date = new Date(msec);
    return `${temp_date.getHours().toString().padStart(2, "0")}:${temp_date.getMinutes().toString().padStart(2, "0")}`;
}

/**
 * Find the total payable amount for this class
 * @param start The start time of the class
 * @param end The finish time of the class
 * @param rate The hourly rate in dollars
 */
const getCharge = (start, end, rate) => {
    let msec_diff = end - start;
    let hrs = Math.ceil(msec_diff / 1000 / 60 / 60);
    let charge = rate * hrs;
    return charge;
}

export default {
    name: "Session",
    props: {
        selected:       { required: false, default: "false", type: String },
        paid:           { required: false, default: "false", type: String },
        id:             { required: true, default: 9999, unique: true, type: Number },
        time_in:        { required: false, default: Date.now()-(1000*60*60), type: Date },
        time_out:       { required: false, default: Date.now(), type: Date },
        rate:           { required: true, default: 65, type: Number },
    },
    components: [
        ManageBtn,
        DeleteStudent
    ],
}
</script>