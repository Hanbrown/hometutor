<script setup>
</script>

<template>
    <details>
        <summary>{{ current.fname }}</summary>
        <div class="name-list">
            <ul class="name-list-ul">
                <li v-for="(student) in students"
                            :key="student.id"
                 class="name-list-li">
                    <a :href="`/manage:${student.id}`">{{ student.fname }}</a>
                </li>
            </ul>
        </div>
    </details>
</template>

<script>
export default {
    name: "StudentMenu",
    props: {
        students: { required: true, default: [{fname: 'Joost', id: 9999}], type: Array},
        current: { required: true, default: {fname: 'Joost', id: 9999}, type: Object}
    }
};
</script>