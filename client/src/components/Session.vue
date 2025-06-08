<script setup>
import ManageBtn from './ManageBtn.vue';

const openDetails = (class_id) => {
    document.querySelector(`#details-${class_id}`).classList.toggle("hidden");
}
</script>

<template>
    <tr :id="`row-${id}`" class="session-row">
        <!-- Show either a checked or unchecked box -->
        <td v-if="(selected === 'true')" class="class-selected"><input type="checkbox" checked /></td>
        <td v-else class="class-selected"><input type="checkbox" unchecked /></td>
        <!-- All the other fields -->
        <td class="class-id">{{ id }}</td>
        <td class="class-date">{{ format_date(time_in) }}</td>
        <td class="class-in">{{ format_time(time_in) }}</td>
        <td class="class-out">{{ format_time(time_out) }}</td>
        <td class="class-rate">${{ rate }}</td>
        <td class="class-charge">${{ getCharge(time_in, time_out, rate) }}</td>
        <td><manage-btn @clicked="openDetails(id)"></manage-btn></td>
    </tr>
    <tr :id="`details-${id}`" class="hidden class-detail">
        <td colspan="8">
            <div>

            </div>
        </td>
    </tr>
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
        id:             { required: true, default: 9999, type: Number },
        time_in:        { required: false, default: Date.now()-(1000*60*60), type: Date },
        time_out:       { required: false, default: Date.now(), type: Date },
        rate:           { required: true, default: 65, type: Number }
    },
    components: [
        ManageBtn
    ],
}
</script>